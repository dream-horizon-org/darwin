package com.dream11.admin.service;

import com.datastax.driver.core.SimpleStatement;
import com.dream11.admin.dao.ConsumersManagerDao;
import com.dream11.admin.dao.featuredao.CassandraFeatureDao;
import com.dream11.admin.dao.metastore.MetaStoreDao;
import com.dream11.admin.dao.metastore.MetaStoreRunsV2Dao;
import com.dream11.admin.dao.metastore.MetaStoreTagDao;
import com.dream11.admin.dao.metastore.MetaStoreVersionDao;
import com.dream11.admin.dto.esproxy.GetEntityResponse;
import com.dream11.admin.dto.esproxy.GetFeatureGroupResponse;
import com.dream11.caffeine.CaffeineCacheFactory;
import com.dream11.common.app.AppContext;
import com.dream11.common.util.CompletableFutureUtils;
import com.dream11.core.config.ApplicationConfig;
import com.dream11.core.dto.consumer.FeatureGroupConsumerMap;
import com.dream11.core.dto.entity.CassandraEntity;
import com.dream11.core.dto.featurecolumn.CassandraFeatureColumn;
import com.dream11.core.dto.featuregroup.CassandraFeatureGroup;
import com.dream11.core.dto.featuregroup.interfaces.FeatureGroup;
import com.dream11.core.dto.helper.CassandraFeatureGroupEntityPair;
import com.dream11.core.dto.helper.cachekeys.CassandraEntityCacheKey;
import com.dream11.core.dto.helper.cachekeys.CassandraFeatureGroupCacheKey;
import com.dream11.core.dto.metastore.CassandraEntityMetadata;
import com.dream11.core.dto.metastore.CassandraFeatureGroupMetadata;
import com.dream11.core.dto.metastore.TenantConfig;
import com.dream11.core.dto.metastore.VersionMetadata;
import com.dream11.core.dto.request.*;
import com.dream11.core.dto.response.*;
import com.dream11.core.dto.response.interfaces.CreateEntityResponse;
import com.dream11.core.dto.response.interfaces.CreateFeatureGroupResponse;
import com.dream11.core.dto.tenant.GetAllTenantResponse;
import com.dream11.core.dto.tenant.TenantDto;
import com.dream11.core.dto.tenant.TenantForTypeResponse;
import com.dream11.core.dto.tenant.UpdateTenantRequest;
import com.dream11.core.error.ApiRestException;
import com.dream11.core.error.ServiceError;
import com.dream11.core.util.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.benmanes.caffeine.cache.AsyncLoadingCache;
import com.google.inject.Inject;
import io.reactivex.Completable;
import io.reactivex.Maybe;
import io.reactivex.Observable;
import io.reactivex.Single;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.reactivex.cassandra.CassandraClient;
import io.vertx.reactivex.core.Vertx;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;

import java.util.*;
import java.util.function.BiFunction;
import java.util.function.Function;
import java.util.stream.Collectors;

import static com.dream11.core.constant.Constants.*;
import static com.dream11.core.constant.query.CassandraQuery.*;
import static com.dream11.core.error.ServiceError.*;
import static com.dream11.core.util.CacheUtils.getAllFromCache;
import static com.dream11.core.util.JsonConversionUtils.convertJsonSingle;
import static com.dream11.core.util.LegacyStackUtils.getLegacyTypesFromCassandraTypes;

// TODO: This class is ~1150 lines - split into EntityMetaStoreService, FeatureGroupMetaStoreService, TenantService.
// TODO: Multiple caches (featureGroupMetaDataCache, entityMetaDataCache, featureGroupVersionCache) - consider unified cache strategy.
// TODO: Cache refresh methods (loadCassandra*Cache, refreshUpdated*) have duplicated patterns - extract to generic method.
@Slf4j
@RequiredArgsConstructor(onConstructor = @__({@Inject}))
public class CassandraMetaStoreService {
    private final MetaStoreDao metaStoreDao;
    private final MetaStoreVersionDao metaStoreVersionDao;
    private final MetaStoreTagDao metaStoreTagDao;
    private final ConsumersManagerDao consumersManagerDao;
    private final ObjectMapper objectMapper;
    private final ApplicationConfig applicationConfig;
    private final MetaStoreRunsV2Dao metaStoreRunsV2Dao;
    private final Vertx vertx = AppContext.getInstance(Vertx.class);

    private final AsyncLoadingCache<CassandraFeatureGroupCacheKey, CassandraFeatureGroupMetadata>
            featureGroupMetaDataCache =
            CaffeineCacheFactory.createAsyncLoadingCache(
                    AppContext.getInstance(Vertx.class),
                    FEATURE_GROUP_METADATA_CACHE,
                    this::getCassandraFeatureGroupMetaDataFromDb);

    private final AsyncLoadingCache<String, VersionMetadata> featureGroupVersionCache =
            CaffeineCacheFactory.createAsyncLoadingCache(
                    AppContext.getInstance(Vertx.class),
                    FEATURE_GROUP_VERSION_CACHE,
                    this::getCassandraFeatureGroupVersionFromDb);

    private final AsyncLoadingCache<CassandraEntityCacheKey, CassandraEntityMetadata>
            entityMetaDataCache =
            CaffeineCacheFactory.createAsyncLoadingCache(
                    AppContext.getInstance(Vertx.class),
                    ENTITY_METADATA_CACHE,
                    this::getCassandraEntityMetaDataFromDb);

    public Single<CassandraFeatureGroupMetadata> getCassandraFeatureGroupMetaData(
            String name, String version) {
        return getCassandraFeatureGroupMetaDataFromCache(name, version);
    }

    private Single<CassandraFeatureGroupMetadata> getCassandraFeatureGroupMetaDataFromCache(
            String name, String version) {
        Single<VersionMetadata> versionSingle;
        if (version == null) {
            versionSingle = getCassandraFeatureGroupVersion(name);
        } else {
            versionSingle = Single.just(VersionMetadata.builder().latestVersion(version).build());
        }

        return versionSingle.flatMap(
                versionToGet ->
                        CompletableFutureUtils.toSingle(
                                featureGroupMetaDataCache.get(
                                        CassandraFeatureGroupCacheKey.builder()
                                                .name(name)
                                                .version(versionToGet.getLatestVersion())
                                                .build())));
    }

    public Single<VersionMetadata> getCassandraFeatureGroupVersion(String name) {
        return getCassandraFeatureGroupVersionFromCache(name);
    }

    private Single<VersionMetadata> getCassandraFeatureGroupVersionFromCache(String name) {
        return CompletableFutureUtils.toSingle(featureGroupVersionCache.get(name));
    }

    private Single<VersionMetadata> getCassandraFeatureGroupVersionFromDb(String name) {
        return metaStoreVersionDao
                .getLatestFeatureGroupVersion(name)
                .switchIfEmpty(Single.error(new ApiRestException(FEATURE_GROUP_NOT_FOUND_EXCEPTION)));
    }

    public Single<CassandraEntityMetadata> getCassandraEntityMetaData(String name) {
        return getCassandraEntityMetaDataFromCache(name);
    }

    private Single<CassandraEntityMetadata> getCassandraEntityMetaDataFromCache(String name) {
        return CompletableFutureUtils.toSingle(
                entityMetaDataCache.get(CassandraEntityCacheKey.builder().name(name).build()));
    }

    private Single<CassandraEntityMetadata> getCassandraEntityMetaDataFromDb(
            CassandraEntityCacheKey key) {

        return getCassandraEntityMetaDataFromDb(key.getName());
    }

    public Single<CassandraEntityMetadata> getCassandraEntityMetaDataFromDb(String name) {

        return metaStoreDao
                .getCassandraEntityMetadata(name)
                .flatMap(
                        r ->
                                convertJsonSingle(
                                        r, CassandraEntityMetadata.class, objectMapper, SERVICE_UNKNOWN_EXCEPTION));
    }

    private Single<CassandraFeatureGroupMetadata> getCassandraFeatureGroupMetaDataFromDb(
            CassandraFeatureGroupCacheKey key) {
        return getCassandraFeatureGroupMetaDataFromDb(key.getName(), key.getVersion());
    }

    public Single<CassandraFeatureGroupMetadata> getCassandraFeatureGroupMetaDataFromDb(
            String name, String version) {
        Single<String> versionSingle;
        if (version == null) {
            versionSingle =
                    metaStoreVersionDao
                            .getLatestFeatureGroupVersion(name)
                            .map(VersionMetadata::getLatestVersion)
                            .switchIfEmpty(Single.just(DEFAULT_VERSION));
        } else {
            versionSingle = Single.just(version);
        }

        return versionSingle.flatMap(
                versionToGet ->
                        metaStoreDao
                                .getCassandraFeatureGroupMetadata(name, versionToGet)
                                .flatMap(
                                        r ->
                                                convertJsonSingle(
                                                        r,
                                                        CassandraFeatureGroupMetadata.class,
                                                        objectMapper,
                                                        SERVICE_UNKNOWN_EXCEPTION)));
    }

    public Observable<GetCassandraFeatureGroupSchemaResponseMetadataPair>
    getAllCassandraFeatureGroupSchema() {
        return getAllFeatureGroupsFromCache()
                .flatMapSingle(
                        fg ->
                                getCassandraEntityMetaData(fg.getFeatureGroup().getEntityName())
                                        .map(
                                                entity ->
                                                        getSchemaFromPair(
                                                                CassandraFeatureGroupEntityPair.builder()
                                                                        .featureGroupMetadata(fg)
                                                                        .entityMetadata(entity)
                                                                        .build()))
                                        .map(
                                                schema ->
                                                        GetCassandraFeatureGroupSchemaResponseMetadataPair.builder()
                                                                .name(fg.getName())
                                                                .version(fg.getVersion())
                                                                .schema(schema)
                                                                .build()));
    }

    public Single<GetCassandraFeatureGroupSchemaResponse> getCassandraFeatureGroupSchema(
            String name, String version) {

        return getCassandraFeatureGroupEntityPair(name, version).map(this::getSchemaFromPair);
    }

    public GetCassandraFeatureGroupSchemaResponse getSchemaFromPair(
            CassandraFeatureGroupEntityPair cassandraFeatureGroupEntityPair) {
        List<CassandraFeatureColumn> features =
                new ArrayList<>(
                        cassandraFeatureGroupEntityPair.getEntityMetadata().getEntity().getFeatures());
        features.addAll(
                cassandraFeatureGroupEntityPair.getFeatureGroupMetadata().getFeatureGroup().getFeatures());
        return GetCassandraFeatureGroupSchemaResponse.builder()
                .schema(features)
                .primaryKeys(
                        cassandraFeatureGroupEntityPair.getEntityMetadata().getEntity().getPrimaryKeys())
                .version(cassandraFeatureGroupEntityPair.getFeatureGroupMetadata().getVersion())
                .featureGroupType(
                        cassandraFeatureGroupEntityPair.getFeatureGroupMetadata().getFeatureGroupType())
                .build();
    }

    public Single<CassandraFeatureGroupEntityPair> getCassandraFeatureGroupEntityPair(
            String name, String version) {

        return getCassandraFeatureGroupMetaData(name, version)
                .flatMap(
                        cassandraFeatureGroupMetadata -> {
                            if (cassandraFeatureGroupMetadata
                                    .getState()
                                    .equals(CassandraFeatureGroupMetadata.State.ARCHIVED)) {
                                return Single.error(new ApiRestException(FEATURE_GROUP_STATE_INVALID_EXCEPTION));
                            }

                            return getCassandraEntityMetaData(
                                    cassandraFeatureGroupMetadata.getFeatureGroup().getEntityName())
                                    .map(
                                            cassandraEntityMetadata ->
                                                    CassandraFeatureGroupEntityPair.builder()
                                                            .featureGroupMetadata(cassandraFeatureGroupMetadata)
                                                            .entityMetadata(cassandraEntityMetadata)
                                                            .build());
                        });
    }

    public Observable<CassandraFeatureGroupEntityPair>
    getAllCassandraFeatureGroupEntityPairForFeatureGroup(String name) {
        return getAllFeatureGroups()
                .filter(r -> Objects.equals(r.getFeatureGroup().getFeatureGroupName(), name))
                .flatMap(
                        cassandraFeatureGroupMetadata ->
                                getCassandraEntityMetaData(
                                        cassandraFeatureGroupMetadata.getFeatureGroup().getEntityName())
                                        .map(
                                                cassandraEntityMetadata ->
                                                        CassandraFeatureGroupEntityPair.builder()
                                                                .featureGroupMetadata(cassandraFeatureGroupMetadata)
                                                                .entityMetadata(cassandraEntityMetadata)
                                                                .build())
                                        .toObservable());
    }

    public Single<CassandraEntity> getCassandraEntity(String name) {
        return getCassandraEntityMetaData(name).map(CassandraEntityMetadata::getEntity);
    }

    public Single<CassandraFeatureGroupMetadata> getCassandraFeatureGroup(
            String name, String version) {
        return getCassandraFeatureGroupMetaData(name, version);
    }

    private Completable updateCassandraFeatureGroupInCache(String name, String version) {
        return Completable.create(
                emitter -> {
                    try {
                        featureGroupMetaDataCache
                                .synchronous()
                                .refresh(
                                        CassandraFeatureGroupCacheKey.builder().name(name).version(version).build());
                    } catch (Exception e) {
                        e.printStackTrace();
                        emitter.onError(e);
                    }
                    emitter.onComplete();
                });
    }

    private Completable updateCassandraEntityInCache(String name) {
        return Completable.create(
                emitter -> {
                    try {
                        entityMetaDataCache
                                .synchronous()
                                .refresh(CassandraEntityCacheKey.builder().name(name).build());
                    } catch (Exception e) {
                        e.printStackTrace();
                        emitter.onError(e);
                    }
                    emitter.onComplete();
                });
    }

    public Single<UpdateCassandraFeatureGroupRequest> updateCassandraFeatureGroup(
            String name, String version, JsonObject updateCassandraFeatureGroupRequest) {
        return getCassandraFeatureGroup(name, version)
                .flatMap(
                        ignore ->
                                convertJsonSingle(
                                        updateCassandraFeatureGroupRequest,
                                        UpdateCassandraFeatureGroupRequest.class,
                                        objectMapper,
                                        SERVICE_UNKNOWN_EXCEPTION)
                                        .flatMap(
                                                r ->
                                                        metaStoreDao
                                                                .updateCassandraFeatureGroupMetadata(name, version, r.getState())
                                                                .andThen(Single.just(r))));
    }

    public Single<UpdateCassandraEntityRequest> updateCassandraEntity(
            String name, JsonObject updateCassandraEntityRequest) {
        return getCassandraEntity(name)
                .flatMap(
                        ignore ->
                                convertJsonSingle(
                                        updateCassandraEntityRequest,
                                        UpdateCassandraEntityRequest.class,
                                        objectMapper,
                                        SERVICE_UNKNOWN_EXCEPTION)
                                        .flatMap(
                                                r ->
                                                        getAllFeatureGroupsForAnEntity(name)
                                                                .filter(List::isEmpty)
                                                                .switchIfEmpty(
                                                                        Single.error(
                                                                                new ApiRestException(
                                                                                        ENTITY_UPDATE_INVALID_REQUEST_EXCEPTION)))
                                                                .flatMap(
                                                                        ignore1 ->
                                                                                metaStoreDao
                                                                                        .updateCassandraEntityMetadata(name, r.getState())
                                                                                        .andThen(Single.just(r)))));
    }

    public Single<CreateCassandraFeatureGroupRequest> validateFeatureGroupAndEntity(
            CreateCassandraFeatureGroupRequest createCassandraFeatureGroupRequest) {

        return getCassandraEntityMetaData(
                createCassandraFeatureGroupRequest.getFeatureGroup().getEntityName())
                .flatMap(
                        r -> {
                            if (r.getState().equals(CassandraEntityMetadata.State.ARCHIVED)) {
                                return Single.error(new ApiRestException(ENTITY_STATE_INVALID_EXCEPTION));
                            }
                            return Single.just(r);
                        })
                .map(
                        cassandraEntityMetadata ->
                                CreateCassandraFeatureGroupRequest.validateFgAndEntity(
                                        createCassandraFeatureGroupRequest.getFeatureGroup(),
                                        cassandraEntityMetadata.getEntity()))
                .filter(r -> r)
                .switchIfEmpty(
                        Single.error(
                                new ApiRestException(FEATURE_GROUP_REGISTRATION_INVALID_COLUMN_NAMES_EXCEPTION)))
                .map(ignore -> createCassandraFeatureGroupRequest);
    }

    public Single<List<CassandraFeatureGroup>> getAllFeatureGroupsForAnEntity(String entityName) {
        return metaStoreDao
                .getAllFeatureGroupsRegisteredWithAnEntity(entityName)
                .flatMapObservable(Observable::fromIterable)
                .flatMap(
                        r -> {
                            CassandraFeatureGroupMetadata cassandraFeatureGroupMetadata;
                            try {
                                cassandraFeatureGroupMetadata =
                                        objectMapper.readValue(r.toString(), CassandraFeatureGroupMetadata.class);
                            } catch (Exception e) {
                                return Observable.just(EMPTY_FEATURE_GROUP_METADATA);
                            }
                            return Observable.just(cassandraFeatureGroupMetadata);
                        })
                .filter(r -> r.getFeatureGroup() != null)
                .map(CassandraFeatureGroupMetadata::getFeatureGroup)
                .toList();
    }

    // TODO: Transaction rollback only happens on error - consider explicit savepoints for partial failure recovery.
    // TODO: Multiple operations (metadata, features, tags, version) in single transaction - document ordering dependencies.
    // TODO: onlyRegister flag creates two code paths - consider separate methods for clarity.
    public Single<CreateFeatureGroupResponse> atomicAddFeatureGroupToMetaStoreAndCassandra(
            CreateCassandraFeatureGroupRequest createCassandraFeatureGroupRequest,
            String version,
            BiFunction<FeatureGroup, String, Completable> createFgInCassandra,
            Boolean onlyRegister) {
        return metaStoreDao
                .getMysqlTransaction()
                .flatMapCompletable(
                        tx -> {
                            CassandraFeatureGroup cassandraFeatureGroup =
                                    createCassandraFeatureGroupRequest.getFeatureGroup();
                            JsonObject featureGroupJson =
                                    new JsonObject(objectMapper.writeValueAsString(cassandraFeatureGroup));
                            JsonArray tags = new JsonArray(createCassandraFeatureGroupRequest.getTags());

                            return metaStoreDao
                                    .addCassandraFeatureGroupMetadata(
                                            cassandraFeatureGroup.getFeatureGroupName(),
                                            version,
                                            cassandraFeatureGroup.getVersionEnabled(),
                                            cassandraFeatureGroup.getFeatureGroupType(),
                                            featureGroupJson,
                                            cassandraFeatureGroup.getEntityName(),
                                            createCassandraFeatureGroupRequest.getOwner(),
                                            tags,
                                            createCassandraFeatureGroupRequest.getDescription(),
                                            tx)
                                    .andThen(
                                            Single.just(onlyRegister)
                                                    .flatMapCompletable(
                                                            r -> {
                                                                if (r) {
                                                                    return Completable.complete();
                                                                }
                                                                return createFgInCassandra.apply(cassandraFeatureGroup, version);
                                                            }))
                                    .andThen(
                                            metaStoreVersionDao.updateFeatureGroupVersion(
                                                    cassandraFeatureGroup.getFeatureGroupName(), version))
                                    .andThen(
                                            metaStoreDao.addCassandraFeatureGroupFeaturesMetadata(
                                                    cassandraFeatureGroup.getFeatureGroupName(),
                                                    version,
                                                    cassandraFeatureGroup.getFeatures(),
                                                    tx))
                                    .andThen(
                                            metaStoreTagDao.insertFeatureGroupTags(
                                                    createCassandraFeatureGroupRequest.getTags(),
                                                    createCassandraFeatureGroupRequest
                                                            .getFeatureGroup()
                                                            .getFeatureGroupName(),
                                                    version))
                                    .onErrorResumeNext(
                                            e ->
                                                    tx.rxRollback()
                                                            .andThen(
                                                                    Completable.error(
                                                                            new ApiRestException(
                                                                                    e, FEATURE_GROUP_REGISTRATION_EXCEPTION))))
                                    .andThen(tx.rxCommit());
                        })
                .andThen(
                        Single.just(
                                CreateCassandraFeatureGroupResponse.builder()
                                        .featureGroup(createCassandraFeatureGroupRequest.getFeatureGroup())
                                        .version(version)
                                        .build()));
    }

    public Single<CreateEntityResponse> atomicAddEntityToMetaStoreAndCassandra(
            CreateCassandraEntityRequest createCassandraEntityRequest,
            Function<CassandraEntity, Completable> createEntityInCassandra,
            Boolean onlyRegister) {
        return metaStoreDao
                .getMysqlTransaction()
                .flatMapCompletable(
                        tx -> {
                            CassandraEntity cassandraEntity = createCassandraEntityRequest.getEntity();
                            JsonObject entityJson =
                                    new JsonObject(objectMapper.writeValueAsString(cassandraEntity));
                            JsonArray tags = new JsonArray(createCassandraEntityRequest.getTags());

                            return metaStoreDao
                                    .addCassandraEntityMetadata(
                                            cassandraEntity.getTableName(),
                                            entityJson,
                                            createCassandraEntityRequest.getOwner(),
                                            tags,
                                            createCassandraEntityRequest.getDescription(),
                                            tx)
                                    .andThen(
                                            Single.just(onlyRegister)
                                                    .flatMapCompletable(
                                                            r -> {
                                                                if (r) {
                                                                    return Completable.complete();
                                                                }
                                                                return createEntityInCassandra.apply(cassandraEntity);
                                                            }))
                                    .andThen(
                                            metaStoreDao.addCassandraEntityFeaturesMetadata(
                                                    cassandraEntity.getTableName(), cassandraEntity.getFeatures(), tx))
                                    .andThen(
                                            metaStoreTagDao.insertEntityTags(
                                                    createCassandraEntityRequest.getTags(),
                                                    createCassandraEntityRequest.getEntity().getTableName()))
                                    .onErrorResumeNext(
                                            e ->
                                                    tx.rxRollback()
                                                            .andThen(
                                                                    Completable.error(
                                                                            new ApiRestException(e, ENTITY_REGISTRATION_EXCEPTION))))
                                    .andThen(tx.rxCommit());
                        })
                .andThen(
                        Single.just(
                                CreateCassandraEntityResponse.builder()
                                        .entity(createCassandraEntityRequest.getEntity())
                                        .build()));
    }

    public Single<String> getFeatureGroupLatestVersion(
            CreateCassandraFeatureGroupRequest createCassandraFeatureGroupRequest) {
        return metaStoreVersionDao
                .getLatestFeatureGroupVersion(
                        createCassandraFeatureGroupRequest.getFeatureGroup().getFeatureGroupName())
                .map(VersionMetadata::getLatestVersion)
                .switchIfEmpty(Single.just(DEFAULT_VERSION));
    }

    public Single<CreateCassandraEntityRequest> checkEntityExists(
            CreateCassandraEntityRequest createCassandraEntityRequest) {
        return metaStoreDao
                .checkCassandraEntityMetadataExists(createCassandraEntityRequest.getEntity().getTableName())
                .filter(r -> !r)
                .switchIfEmpty(Single.error(new ApiRestException(ENTITY_ALREADY_EXISTS_EXCEPTION)))
                .map(ignore -> createCassandraEntityRequest);
    }

    public Single<CreateCassandraFeatureGroupRequest> checkFeatureGroupExists(
            CreateCassandraFeatureGroupRequest createCassandraFeatureGroupRequest, String version) {
        return metaStoreDao
                .checkCassandraFeatureGroupMetadataExists(
                        createCassandraFeatureGroupRequest.getFeatureGroup().getFeatureGroupName(), version)
                .filter(r -> !r)
                .switchIfEmpty(Single.error(new ApiRestException(FEATURE_GROUP_ALREADY_EXISTS_EXCEPTION)))
                .map(ignore -> createCassandraFeatureGroupRequest);
    }

    public Observable<CassandraEntityMetadata> getAllEntities() {
        return metaStoreDao
                .getAllEntities()
                .flatMap(
                        jsonObject ->
                                JsonConversionUtils.convertJsonObservable(
                                        jsonObject,
                                        CassandraEntityMetadata.class,
                                        objectMapper,
                                        ServiceError.SERVICE_UNKNOWN_EXCEPTION));
    }

    public Observable<CassandraEntityMetadata> getAllEntitiesFromCache() {
        return getAllFromCache(entityMetaDataCache, k -> getAllEntities());
    }

    @SneakyThrows
    public Single<String> getAllEntitiesFromCacheCompressed(Boolean compressedResponse) {
        return getAllFromCache(entityMetaDataCache, k -> getAllEntities())
                .toList()
                .map(r -> AllCassandraEntityResponse.builder().entities(r).build())
                .flatMap(
                        r -> {
                            if (!compressedResponse) return Single.just(objectMapper.writeValueAsString(r));

                            return CompressionUtils.compressNonBlocking(
                                    vertx, objectMapper.writeValueAsString(r));
                        });
    }

    public Observable<CassandraFeatureGroupMetadata> getAllFeatureGroups() {
        return metaStoreDao
                .getAllFeatureGroups()
                .flatMap(
                        jsonObject ->
                                JsonConversionUtils.convertJsonObservable(
                                        jsonObject,
                                        CassandraFeatureGroupMetadata.class,
                                        objectMapper,
                                        ServiceError.SERVICE_UNKNOWN_EXCEPTION));
    }

    public Observable<CassandraFeatureGroupMetadata> getAllFeatureGroupsFromCache() {
        return getAllFromCache(featureGroupMetaDataCache, k -> getAllFeatureGroups());
    }

    public Single<String> getAllFeatureGroupsFromCacheCompressed(Boolean compressedResponse) {
        return getAllFeatureGroupsFromCache()
                .toList()
                .map(r -> AllCassandraFeatureGroupResponse.builder().featureGroups(r).build())
                .flatMap(
                        r -> {
                            if (!compressedResponse) return Single.just(objectMapper.writeValueAsString(r));
                            return CompressionUtils.compressNonBlocking(
                                    vertx, objectMapper.writeValueAsString(r));
                        });
    }

    public Observable<CassandraFeatureGroupMetadata> getAllFeatureGroupsForTenant(
            String name, FeatureStoreTenantType type) {
        return getAllFeatureGroups()
                .compose(featureGroups -> filterFeatureGroupsOnTenant(featureGroups, name, type));
    }

    private Observable<CassandraFeatureGroupMetadata> filterFeatureGroupsOnTenant(
            Observable<CassandraFeatureGroupMetadata> featureGroups,
            String name,
            FeatureStoreTenantType type) {
        return featureGroups.filter(
                r -> {
                    String readerTenant = r.getTenant().getReaderTenant();
                    String writerTenant = r.getTenant().getWriterTenant();
                    String consumerTenant = r.getTenant().getConsumerTenant();

                    switch (type) {
                        case READER:
                            return Objects.equals(readerTenant, name);
                        case WRITER:
                            return Objects.equals(writerTenant, name);
                        case CONSUMER:
                            return Objects.equals(consumerTenant, name);
                        default:
                            return Objects.equals(readerTenant, name)
                                    || Objects.equals(writerTenant, name)
                                    || Objects.equals(consumerTenant, name);
                    }
                });
    }

    public Completable updateAllFeatureGroupsForTenant(UpdateTenantRequest request) {
        if (request.getTenantType() == FeatureStoreTenantType.ALL) {
            return Completable.error(
                    new ApiRestException(
                            "tenant type must be not be ALL", OFS_V2_TENANT_ONBOARDING_EXCEPTION));
        }
        return getAllFeatureGroupsForTenant(request.getCurrentTenant(), request.getTenantType())
                .toList()
                .flatMapCompletable(
                        li -> {
                            List<Completable> updates = new ArrayList<>();
                            for (CassandraFeatureGroupMetadata metadata : li) {
                                String name = metadata.getFeatureGroup().getFeatureGroupName();
                                TenantConfig config =
                                        TenantConfig.builder()
                                                .readerTenant(metadata.getTenant().getReaderTenant())
                                                .writerTenant(metadata.getTenant().getWriterTenant())
                                                .consumerTenant(metadata.getTenant().getConsumerTenant())
                                                .build();
                                switch (request.getTenantType()) {
                                    case READER:
                                        config.setReaderTenant(request.getNewTenant());
                                        break;
                                    case WRITER:
                                        config.setWriterTenant(request.getNewTenant());
                                        break;
                                    case CONSUMER:
                                        config.setConsumerTenant(request.getNewTenant());
                                        break;
                                }
                                updates.add(this.addTenant(name, config));
                            }
                            return Completable.merge(updates);
                        });
    }

    public Single<GetAllTenantResponse> getAllTenants() {
        return getAllFeatureGroupsFromCache()
                .map(CassandraFeatureGroupMetadata::getTenant)
                .toList()
                .map(
                        tenants -> {
                            Set<String> readers = new HashSet<>();
                            Set<String> writers = new HashSet<>();
                            Set<String> consumers = new HashSet<>();

                            for (TenantConfig config : tenants) {
                                readers.add(config.getReaderTenant());
                                writers.add(config.getWriterTenant());
                                consumers.add(config.getConsumerTenant());
                            }
                            TenantForTypeResponse readerTenants =
                                    TenantForTypeResponse.builder()
                                            .tenantType(FeatureStoreTenantType.READER)
                                            .names(new ArrayList<>(readers))
                                            .build();
                            TenantForTypeResponse writerTenants =
                                    TenantForTypeResponse.builder()
                                            .tenantType(FeatureStoreTenantType.WRITER)
                                            .names(new ArrayList<>(writers))
                                            .build();
                            TenantForTypeResponse consumerTenants =
                                    TenantForTypeResponse.builder()
                                            .tenantType(FeatureStoreTenantType.CONSUMER)
                                            .names(new ArrayList<>(consumers))
                                            .build();
                            return GetAllTenantResponse.builder()
                                    .tenants(List.of(readerTenants, writerTenants, consumerTenants))
                                    .build();
                        });
    }

    public Observable<VersionMetadata> getAllFeatureGroupVersion() {
        return metaStoreVersionDao.getAllFeatureGroupVersion();
    }

    public Observable<VersionMetadata> getAllFeatureGroupVersionFromCache() {
        return getAllFromCache(featureGroupVersionCache, k -> getAllFeatureGroupVersion());
    }

    public Single<String> getAllFeatureGroupVersionFromCacheCompressed(Boolean compressedResponse) {
        return getAllFeatureGroupVersionFromCache()
                .toList()
                .map(r -> AllCassandraFeatureGroupVersionResponse.builder().versions(r).build())
                .flatMap(
                        r -> {
                            if (!compressedResponse) return Single.just(objectMapper.writeValueAsString(r));
                            return CompressionUtils.compressNonBlocking(
                                    vertx, objectMapper.writeValueAsString(r));
                        });
    }

    public Completable loadCassandraEntityCache() {
        return getAllEntities()
                .flatMapCompletable(
                        r -> {
                            entityMetaDataCache.put(
                                    CassandraEntityCacheKey.builder().name(r.getName()).build(),
                                    CompletableFutureUtils.fromSingle(Single.just(r)));
                            return Completable.complete();
                        });
    }

    public Completable loadCassandraFeatureGroupCache() {
        return getAllFeatureGroups()
                .flatMapCompletable(
                        r -> {
                            featureGroupMetaDataCache.put(
                                    CassandraFeatureGroupCacheKey.builder()
                                            .name(r.getName())
                                            .version(r.getVersion())
                                            .build(),
                                    CompletableFutureUtils.fromSingle(Single.just(r)));
                            return Completable.complete();
                        });
    }

    public Completable loadCassandraFeatureGroupVersionCache() {
        return getAllFeatureGroupVersion()
                .flatMapCompletable(
                        r -> {
                            featureGroupVersionCache.put(
                                    r.getName(), CompletableFutureUtils.fromSingle(Single.just(r)));
                            return Completable.complete();
                        });
    }

    public Completable refreshUpdatedCassandraEntities(Long timestamp) {
        return getUpdatedCassandraEntities(timestamp)
                .flatMapCompletable(
                        r -> {
                            entityMetaDataCache.put(
                                    CassandraEntityCacheKey.builder().name(r.getName()).build(),
                                    CompletableFutureUtils.fromSingle(Single.just(r)));
                            return Completable.complete();
                        });
    }

    public Observable<CassandraEntityMetadata> getUpdatedCassandraEntities(Long timestamp) {
        return metaStoreDao
                .getUpdatedEntities(timestamp)
                .flatMap(
                        r ->
                                JsonConversionUtils.convertJsonObservable(
                                        r,
                                        CassandraEntityMetadata.class,
                                        objectMapper,
                                        ServiceError.SERVICE_UNKNOWN_EXCEPTION));
    }

    public Observable<CassandraEntityMetadata> getUpdatedCassandraEntitiesFromCache(Long timestamp) {
        return getAllEntitiesFromCache().filter(r -> r.getUpdatedAt().getTime() >= timestamp);
    }

    @SneakyThrows
    public Single<String> getUpdatedCassandraEntitiesFromCacheCompressed(
            Long timestamp, Boolean compressedResponse) {
        return getUpdatedCassandraEntitiesFromCache(timestamp)
                .toList()
                .map(r -> AllCassandraEntityResponse.builder().entities(r).build())
                .flatMap(
                        r -> {
                            if (!compressedResponse) return Single.just(objectMapper.writeValueAsString(r));
                            return CompressionUtils.compressNonBlocking(
                                    vertx, objectMapper.writeValueAsString(r));
                        });
    }

    public Completable refreshUpdatedCassandraFeatureGroups(Long timestamp) {
        return getUpdatedCassandraFeatureGroups(timestamp)
                .flatMapCompletable(
                        r -> {
                            featureGroupMetaDataCache.put(
                                    CassandraFeatureGroupCacheKey.builder()
                                            .name(r.getName())
                                            .version(r.getVersion())
                                            .build(),
                                    CompletableFutureUtils.fromSingle(Single.just(r)));
                            return Completable.complete();
                        });
    }

    public Observable<CassandraFeatureGroupMetadata> getUpdatedCassandraFeatureGroups(
            Long timestamp) {
        return metaStoreDao
                .getUpdatedFeatureGroups(timestamp)
                .flatMap(
                        r ->
                                JsonConversionUtils.convertJsonObservable(
                                        r,
                                        CassandraFeatureGroupMetadata.class,
                                        objectMapper,
                                        ServiceError.SERVICE_UNKNOWN_EXCEPTION));
    }

    public Observable<GetCassandraFeatureGroupSchemaResponseMetadataPair>
    getUpdatedCassandraFeatureGroupSchemas(Long timestamp) {
        return getUpdatedCassandraFeatureGroups(timestamp)
                .flatMapSingle(
                        fg ->
                                getCassandraEntityMetaData(fg.getFeatureGroup().getEntityName())
                                        .map(
                                                entity ->
                                                        getSchemaFromPair(
                                                                CassandraFeatureGroupEntityPair.builder()
                                                                        .featureGroupMetadata(fg)
                                                                        .entityMetadata(entity)
                                                                        .build()))
                                        .map(
                                                schema ->
                                                        GetCassandraFeatureGroupSchemaResponseMetadataPair.builder()
                                                                .name(fg.getName())
                                                                .version(fg.getVersion())
                                                                .schema(schema)
                                                                .build()));
    }

    public Observable<CassandraFeatureGroupMetadata> getUpdatedCassandraFeatureGroupsFromCache(
            Long timestamp) {
        return getAllFeatureGroupsFromCache().filter(r -> r.getUpdatedAt().getTime() >= timestamp);
    }

    public Single<String> getUpdatedCassandraFeatureGroupsFromCacheCompressed(
            Long timestamp, Boolean compressedResponse) {
        return getUpdatedCassandraFeatureGroupsFromCache(timestamp)
                .toList()
                .map(r -> AllCassandraFeatureGroupResponse.builder().featureGroups(r).build())
                .flatMap(
                        r -> {
                            if (!compressedResponse) return Single.just(objectMapper.writeValueAsString(r));
                            return CompressionUtils.compressNonBlocking(
                                    vertx, objectMapper.writeValueAsString(r));
                        });
    }

    public Completable refreshUpdatedCassandraFeatureGroupVersions(Long timestamp) {
        return getUpdatedCassandraFeatureGroupVersions(timestamp)
                .flatMapCompletable(
                        r -> {
                            featureGroupVersionCache.put(
                                    r.getName(), CompletableFutureUtils.fromSingle(Single.just(r)));
                            return Completable.complete();
                        });
    }

    public Observable<VersionMetadata> getUpdatedCassandraFeatureGroupVersions(Long timestamp) {
        return metaStoreDao
                .getUpdatedFeatureGroupVersions(timestamp)
                .flatMap(
                        r ->
                                JsonConversionUtils.convertJsonObservable(
                                        r,
                                        VersionMetadata.class,
                                        objectMapper,
                                        ServiceError.SERVICE_UNKNOWN_EXCEPTION));
    }

    public Observable<VersionMetadata> getUpdatedCassandraFeatureGroupVersionFromCache(
            Long timestamp) {
        return getAllFeatureGroupVersionFromCache()
                .filter(r -> r.getUpdatedAt().getTime() >= timestamp);
    }

    public Single<String> getUpdatedCassandraFeatureGroupVersionFromCacheCompressed(
            Long timestamp, Boolean compressedResponse) {
        return getUpdatedCassandraFeatureGroupVersionFromCache(timestamp)
                .toList()
                .map(r -> AllCassandraFeatureGroupVersionResponse.builder().versions(r).build())
                .flatMap(
                        r -> {
                            if (!compressedResponse) return Single.just(objectMapper.writeValueAsString(r));
                            return CompressionUtils.compressNonBlocking(
                                    vertx, objectMapper.writeValueAsString(r));
                        });
    }

    // TODO: Tenant migration creates tables in target cluster but doesn't validate schema compatibility.
    // TODO: No rollback mechanism if migration fails after partial table creation.
    // TODO: CassandraClient created inline and closed in doFinally - use try-with-resources pattern.
    public Completable addTenant(String fgName, TenantConfig tenantConfig) {
        return getAllCassandraFeatureGroupEntityPairForFeatureGroup(fgName)
                .flatMapCompletable(
                        featureGroupEntityPair -> {
                            Completable migration;
                            if (Objects.equals(tenantConfig.getReaderTenant(), tenantConfig.getWriterTenant())) {
                                migration =
                                        checkAndAddTenant(featureGroupEntityPair, tenantConfig.getWriterTenant());
                            } else {
                                Completable readerTenant =
                                        checkAndAddTenant(featureGroupEntityPair, tenantConfig.getReaderTenant());
                                Completable writerTenant =
                                        checkAndAddTenant(featureGroupEntityPair, tenantConfig.getWriterTenant());
                                migration = Completable.merge(List.of(readerTenant, writerTenant));
                            }

                            JsonObject tenantConfigJson =
                                    new JsonObject(objectMapper.writeValueAsString(tenantConfig));
                            return migration
                                    .andThen(
                                            metaStoreDao.addTenant(
                                                    tenantConfigJson,
                                                    featureGroupEntityPair.getFeatureGroupMetadata().getName()))
                                    .onErrorResumeNext(
                                            e ->
                                                    Completable.error(
                                                            new ApiRestException(
                                                                    e.getMessage(), OFS_V2_TENANT_ONBOARDING_EXCEPTION)));
                        });
    }

    public Completable checkAndAddTenant(
            CassandraFeatureGroupEntityPair featureGroupEntityPair, String tenantName) {
        CassandraClient client =
                CassandraClientUtils.createClient(
                        vertx, applicationConfig.getGenericCassandraHost(), tenantName);

        return checkClusterHealth(client)
                .andThen(migrateFeatureGroup(client, featureGroupEntityPair))
                .doFinally(() -> client.rxClose().subscribe());
    }

    private Completable checkClusterHealth(CassandraClient client) {
        return client.rxExecute(new SimpleStatement(CASSANDRA_HEALTH_CHECK)).ignoreElement();
    }

    private Completable migrateFeatureGroup(
            CassandraClient client, CassandraFeatureGroupEntityPair featureGroupEntityPair) {
        return client
                .rxExecute(new SimpleStatement(getCreateKeyspaceQuery()))
                .ignoreElement()
                .andThen(
                        CassandraFeatureDao.migrateEntity(
                                client,
                                featureGroupEntityPair.getEntityMetadata().getEntity(),
                                applicationConfig.getCassandraOfsKeySpace()))
                .andThen(
                        CassandraFeatureDao.migrateFeatureGroup(
                                client,
                                featureGroupEntityPair.getFeatureGroupMetadata().getFeatureGroup(),
                                featureGroupEntityPair.getFeatureGroupMetadata().getVersion(),
                                applicationConfig.getCassandraOfsKeySpace()));
    }

    public Single<TenantDto> getTenant(String fgName) {
        return getCassandraFeatureGroupMetaData(fgName, null)
                .map(
                        metadata ->
                                TenantDto.builder()
                                        .tenantConfig(metadata.getTenant())
                                        .featureGroupName(metadata.getName())
                                        .build());
    }

    public Single<String> getFeatureGroupTenantTopic(String fgName) {
        return getTenant(fgName)
                .map(TenantDto::getTenantConfig)
                .flatMap(
                        tenantName ->
                                getConsumerMetadata(tenantName.getConsumerTenant())
                                        .map(FeatureGroupConsumerMap::getTopicName)
                                        .switchIfEmpty(
                                                getConsumerMetadata(DEFAULT_TENANT_NAME)
                                                        .map(
                                                                r -> {
                                                                    log.warn(
                                                                            String.format(
                                                                                    "consumer config not found for %s failover to %s",
                                                                                    tenantName, DEFAULT_TENANT_NAME));
                                                                    return r.getTopicName();
                                                                })
                                                        .switchIfEmpty(
                                                                Single.error(
                                                                        new ApiRestException(
                                                                                String.format(
                                                                                        "consumer config not found for %s and failover tenant %s",
                                                                                        tenantName, DEFAULT_TENANT_NAME),
                                                                                CONSUMER_CONFIG_NOT_FOUND_EXCEPTION)))));
    }

    public Maybe<FeatureGroupConsumerMap> getConsumerMetadata(String tenantName) {
        return consumersManagerDao.getConsumerMetadata(tenantName);
    }

    public Completable updateTtl(UpdateFeatureGroupTtlRequest request) {
        return getCassandraFeatureGroupMetaData(request.getName(), request.getVersion())
                .flatMapCompletable(
                        fg ->
                                getCassandraEntityMetaData(fg.getFeatureGroup().getEntityName())
                                        .flatMapCompletable(r -> updateTtl(r, request.getTtl(), fg.getTenant())));
    }

    @SneakyThrows
    public Completable updateTtl(
            CassandraEntityMetadata entity, Long ttl, TenantConfig tenantConfig) {
        Completable update;
        if (Objects.equals(tenantConfig.getReaderTenant(), tenantConfig.getWriterTenant())) {
            update = updateTtlForTenant(entity.getName(), tenantConfig.getWriterTenant(), ttl);
        } else {
            Completable readerTenant =
                    updateTtlForTenant(entity.getName(), tenantConfig.getReaderTenant(), ttl);
            Completable writerTenant =
                    updateTtlForTenant(entity.getName(), tenantConfig.getWriterTenant(), ttl);
            update = Completable.merge(List.of(readerTenant, writerTenant));
        }

        CassandraEntity newEntity = entity.getEntity();
        newEntity.setTtl(ttl);

        return update
                .andThen(
                        metaStoreDao.updateEntityTtl(
                                newEntity.getTableName(),
                                new JsonObject(objectMapper.writeValueAsString(newEntity))))
                .onErrorResumeNext(
                        e ->
                                Completable.error(
                                        new ApiRestException(e.getMessage(), OFS_V2_TTL_UPDATE_EXCEPTION)));
    }

    public Completable updateTtlForTenant(String tableName, String tenantName, Long ttl) {
        CassandraClient client =
                CassandraClientUtils.createClient(
                        vertx, applicationConfig.getGenericCassandraHost(), tenantName);

        // not using prepared statement with '?' because `Bind variables cannot be used for table names`
        return client
                .rxExecuteWithFullFetch(
                        String.format(
                                CASSANDRA_UPDATE_TTL_QUERY,
                                applicationConfig.getCassandraOfsKeySpace(),
                                tableName,
                                ttl))
                .ignoreElement()
                .onErrorResumeNext(
                        e -> {
                            log.error(String.format("error updating ttl for table %s", tableName), e);
                            return Completable.error(e);
                        });
    }

    public Completable putRunData(FeatureGroupRunDataRequest featureGroupRunDataRequest) {
        return metaStoreRunsV2Dao
                .createMetaStoreRun(featureGroupRunDataRequest)
                .onErrorResumeNext(
                        e -> Completable.error(new ApiRestException(e, METASTORE_RUN_EXCEPTION)));
    }

    public Single<List<FeatureGroupRunDataResponse>> getRunData(String name, String version) {
        return getCassandraFeatureGroupMetaData(name, version)
                .flatMapObservable(r -> metaStoreRunsV2Dao.getMetaStoreRuns(name, r.getVersion()))
                .toList();
    }

    public Single<GetFeatureGroupResponse> getFeatureGroupFromCacheWithLegacyResponse(String name, String version) {
        return getCassandraFeatureGroupMetaDataFromCache(name, version)
                .flatMap(featureGroupMetaData ->
                        getCassandraFeatureGroupSchema(name, version)
                                .map(schemaResponse ->
                                        GetFeatureGroupResponse.FeatureGroup
                                                .builder()
                                                .name(featureGroupMetaData.getFeatureGroup().getFeatureGroupName())
                                                .description(featureGroupMetaData.getDescription())
                                                .tags(featureGroupMetaData.getTags())
                                                .user(featureGroupMetaData.getOwner())
                                                .status(featureGroupMetaData.getState().name())
                                                .version(VersionUtils.getVersionInteger(featureGroupMetaData.getVersion()))
                                                .createdAt(featureGroupMetaData.getCreatedAt().toString())
                                                .isOnlineEnabled(featureGroupMetaData.getFeatureGroup().getFeatureGroupType() == CassandraFeatureGroup.FeatureGroupType.ONLINE)
                                                .sinks(List.of(com.dream11.admin.dto.fctapplayer.response.GetFeatureGroupResponse.Sinks.builder().location("").type("").build()))
                                                .entities(List.of(featureGroupMetaData.getFeatureGroup().getEntityName()))
                                                .schema(
                                                        schemaResponse.getSchema()
                                                                .stream()
                                                                .map(feature ->
                                                                        GetFeatureGroupResponse.FeatureGroup.SubSchema
                                                                                .builder()
                                                                                .description(feature.getDescription())
                                                                                .name(feature.getFeatureName())
                                                                                .tags(feature.getTags())
                                                                                .type(getLegacyTypesFromCassandraTypes(feature.getFeatureDataType()))
                                                                                .build())
                                                                .collect(Collectors.toList()))
                                                .build()
                                ))
                .map(r -> GetFeatureGroupResponse
                        .builder()
                        .featureGroup(r)
                        .build())
                .onErrorResumeNext(e -> {
                    log.error(String.format("error in getting fg from cache %s", e));
                    return Single.error(e);
                });
    }

    public Single<GetEntityResponse> getEntityFromCacheWithLegacyResponse(String name) {
        return getCassandraEntityMetaDataFromCache(name)
                .map(entityMetaData -> {
                    GetEntityResponse.Entity entity = GetEntityResponse.Entity
                            .builder()
                            .name(entityMetaData.getName())
                            .description(entityMetaData.getDescription())
                            .joinKeys(entityMetaData.getEntity().getPrimaryKeys())
                            .valueType(
                                    entityMetaData
                                            .getEntity()
                                            .getFeatures()
                                            .stream()
                                            .map(feature -> LegacyStackUtils.getLegacyTypesFromCassandraTypes(feature.getFeatureDataType()))
                                            .collect(Collectors.toList()))
                            .build();

                    return GetEntityResponse
                            .builder()
                            .entity(entity)
                            .ttl(entityMetaData.getEntity().getTtl() != null ? entityMetaData.getEntity().getTtl() : 0)
                            .build();
                });
    }
}
