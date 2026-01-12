package com.dream11.app.service;

import static com.dream11.core.error.ServiceError.*;
import static com.dream11.core.util.CassandraDataTypeUtils.getFeatureDataTypeMap;
import static com.dream11.core.util.FeatureNameUtils.getCassandraEntityFeatureSet;
import static com.dream11.core.util.JsonConversionUtils.convertJsonSingle;

import com.dream11.app.dao.CassandraDaoFactory;
import com.dream11.app.dao.featuredao.CassandraFeatureDao;
import com.dream11.app.service.featurestoreinterface.FeatureStoreServiceInterface;
import com.dream11.core.dto.featurecolumn.CassandraFeatureColumn;
import com.dream11.core.dto.featuredata.CassandraFeatureData;
import com.dream11.core.dto.featuredata.CassandraPartitionData;
import com.dream11.core.dto.helper.BulkWriteCassandraFeaturesHelper;
import com.dream11.core.dto.helper.CassandraFeatureGroupEntityPair;
import com.dream11.core.dto.helper.CassandraFeatureVectorAndPrimaryKeyPair;
import com.dream11.core.dto.helper.CassandraFetchRowWithMetadata;
import com.dream11.core.dto.helper.LegacyBatchWriteFailedRecords;
import com.dream11.core.dto.helper.LegacyBulkWriteFeatureHelper;
import com.dream11.core.dto.helper.SuccessfulReadKey;
import com.dream11.core.dto.request.*;
import com.dream11.core.dto.request.legacystack.LegacyBatchWriteFeaturesRequest;
import com.dream11.core.dto.request.legacystack.LegacyWriteFeaturesRequest;
import com.dream11.core.dto.response.GetCassandraFeatureGroupSchemaResponse;
import com.dream11.core.dto.response.LegacyBatchWriteResponse;
import com.dream11.core.dto.response.ReadCassandraFeaturesResponse;
import com.dream11.core.dto.response.ReadCassandraPartitionResponse;
import com.dream11.core.dto.response.WriteBulkCassandraFeaturesResponse;
import com.dream11.core.dto.response.WriteCassandraFeaturesFailedBatchResponse;
import com.dream11.core.dto.response.WriteCassandraFeaturesResponse;
import com.dream11.core.dto.response.interfaces.ReadFeaturesResponse;
import com.dream11.core.dto.response.interfaces.WriteBulkFeaturesResponse;
import com.dream11.core.dto.response.interfaces.WriteFeaturesResponse;
import com.dream11.core.error.ApiRestException;
import com.dream11.core.error.ServiceError;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.inject.Inject;
import io.reactivex.Observable;
import io.reactivex.Single;
import io.vertx.core.json.JsonObject;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

// TODO: This class is ~800 lines - split into ReadService and WriteService for better separation of concerns.
// TODO: Validation logic (validateFeatureNamesAndValues*) is duplicated for read/write/partition - extract to shared validator.
// TODO: lowercaseSchema parameter threaded through many methods - consider a RequestContext object instead.
@Slf4j
@RequiredArgsConstructor(onConstructor = @__({@Inject}))
public class CassandraFeatureStoreService implements FeatureStoreServiceInterface {
  private final CassandraDaoFactory cassandraClientFactory;

  private final CassandraMetaStoreService cassandraMetaStoreService;
  private final ObjectMapper objectMapper;
  private final FeatureGroupMetricService featureGroupMetricService;

  public Single<WriteFeaturesResponse> writeFeatures(
      Boolean replicationEnabled, JsonObject writeFeaturesRequest) {
    return convertJsonSingle(
            writeFeaturesRequest,
            WriteCassandraFeaturesRequest.class,
            objectMapper,
            WRITE_FEATURE_GROUP_INVALID_REQUEST_EXCEPTION)
        .flatMap(r -> writeFeatures(replicationEnabled, r));
  }

  public Single<WriteCassandraFeaturesResponse> writeFeatures(
      Boolean replicationEnabled, WriteCassandraFeaturesRequest writeCassandraFeaturesRequest) {
    return writeFeatures(replicationEnabled, writeCassandraFeaturesRequest, false);
  }

  public Single<WriteCassandraFeaturesResponse> writeFeatures(
      Boolean replicationEnabled,
      WriteCassandraFeaturesRequest writeCassandraFeaturesRequest,
      Boolean lowercaseSchema) {
    return Single.just(WriteCassandraFeaturesRequest.validate(writeCassandraFeaturesRequest))
        .filter(r -> r)
        .switchIfEmpty(
            Single.error(
                new ApiRestException(ServiceError.WRITE_FEATURE_GROUP_INVALID_REQUEST_EXCEPTION)))
        .flatMap(
            ignore1 ->
                cassandraMetaStoreService
                    .getCassandraFeatureGroupEntityPair(
                        writeCassandraFeaturesRequest.getFeatureGroupName(),
                        writeCassandraFeaturesRequest.getFeatureGroupVersion())
                    .flatMap(
                        pair ->
                            Single.just(cassandraMetaStoreService.getSchemaFromPair(pair))
                                .map(
                                    schemaResponse ->
                                        validateFeatureNamesAndValuesForWrite(
                                            schemaResponse.getSchema(),
                                            schemaResponse.getPrimaryKeys(),
                                            writeCassandraFeaturesRequest,
                                            lowercaseSchema))
                                .filter(r -> r)
                                .switchIfEmpty(
                                    Single.error(
                                        new ApiRestException(
                                            ServiceError
                                                .FEATURE_GROUP_SCHEMA_VALIDATION_EXCEPTION)))
                                .flatMap(
                                    ignore ->
                                        writeFeatures(
                                            replicationEnabled,
                                            pair,
                                            writeCassandraFeaturesRequest.getFeatures(),
                                            lowercaseSchema))))
        .doOnSuccess(
            response -> {
              if (writeCassandraFeaturesRequest.getRunId() != null)
                featureGroupMetricService.processCassandraFeatureGroupWriteResponseWithRunId(
                    response, writeCassandraFeaturesRequest.getRunId());
              featureGroupMetricService.processCassandraFeatureGroupWriteResponse(response);
            });
  }

  private Single<WriteCassandraFeaturesResponse> writeFeatures(
      Boolean replicationEnabled,
      CassandraFeatureGroupEntityPair cassandraFeatureGroupEntityPair,
      CassandraFeatureData features,
      Boolean lowercaseSchema) {
    // replicate in case of different reader and writer
    if (replicationEnabled
        && !Objects.equals(
            cassandraFeatureGroupEntityPair.getFeatureGroupMetadata().getTenant().getWriterTenant(),
            cassandraFeatureGroupEntityPair
                .getFeatureGroupMetadata()
                .getTenant()
                .getReaderTenant())) {
      Single<WriteCassandraFeaturesResponse> readerWrite =
          cassandraClientFactory
              .getDao(
                  cassandraFeatureGroupEntityPair
                      .getFeatureGroupMetadata()
                      .getTenant()
                      .getReaderTenant())
              .flatMap(
                  dao ->
                      writeFeatures(
                          cassandraFeatureGroupEntityPair, features, lowercaseSchema, dao));

      Single<WriteCassandraFeaturesResponse> writerWrite =
          cassandraClientFactory
              .getDao(
                  cassandraFeatureGroupEntityPair
                      .getFeatureGroupMetadata()
                      .getTenant()
                      .getWriterTenant())
              .flatMap(
                  dao ->
                      writeFeatures(
                          cassandraFeatureGroupEntityPair, features, lowercaseSchema, dao));

      // return writers response to not pollute metrics
      return Single.zip(readerWrite, writerWrite, (r, w) -> w);
    }

    return cassandraClientFactory
        .getDao(
            cassandraFeatureGroupEntityPair.getFeatureGroupMetadata().getTenant().getWriterTenant())
        .flatMap(
            dao -> writeFeatures(cassandraFeatureGroupEntityPair, features, lowercaseSchema, dao));
  }

  // TODO: successfulRows and failedRows are mutable lists passed through - use immutable return types instead.
  // TODO: e.printStackTrace() on line 205 swallows context - use proper structured logging with exception.
  private Single<WriteCassandraFeaturesResponse> writeFeatures(
      CassandraFeatureGroupEntityPair cassandraFeatureGroupEntityPair,
      CassandraFeatureData features,
      Boolean lowercaseSchema,
      CassandraFeatureDao dao) {
    List<List<Object>> successfulRows = new ArrayList<>();
    List<List<Object>> failedRows = new ArrayList<>();
    return dao.writeFeatures(
            cassandraFeatureGroupEntityPair.getEntityMetadata().getEntity().getTableName(),
            getCassandraEntityFeatureSet(
                cassandraFeatureGroupEntityPair.getEntityMetadata().getEntity(), lowercaseSchema),
            getFeatureDataTypeMap(
                cassandraMetaStoreService
                    .getSchemaFromPair(cassandraFeatureGroupEntityPair)
                    .getSchema(),
                lowercaseSchema),
            cassandraFeatureGroupEntityPair.getFeatureGroupMetadata().getName(),
            cassandraFeatureGroupEntityPair.getFeatureGroupMetadata().getVersion(),
            cassandraFeatureGroupEntityPair.getFeatureGroupMetadata().getVersionEnabled(),
            features,
            successfulRows,
            failedRows)
        .map(
            payloadSize ->
                WriteCassandraFeaturesResponse.builder()
                    .featureGroupName(
                        cassandraFeatureGroupEntityPair.getFeatureGroupMetadata().getName())
                    .featureGroupVersion(
                        cassandraFeatureGroupEntityPair.getFeatureGroupMetadata().getVersion())
                    .featureColumns(features.getNames())
                    .successfulRows(successfulRows)
                    .failedRows(failedRows)
                    .payloadSizes(payloadSize)
                    .build())
        .onErrorResumeNext(
            e -> {
              e.printStackTrace();
              return Single.error(e);
            });
  }

  private Boolean validateFeatureNamesAndValuesForWrite(
      List<CassandraFeatureColumn> schemaColNames,
      List<String> schemaPrimaryColNames,
      WriteCassandraFeaturesRequest writeCassandraFeaturesRequest,
      Boolean lowercaseSchema) {
    Set<String> schemaColSet = new HashSet<>();
    Set<String> schemaPrimaryColSet =
        lowercaseSchema
            ? new HashSet<>(
                schemaPrimaryColNames.stream()
                    .map(String::toLowerCase)
                    .collect(Collectors.toList()))
            : new HashSet<>(schemaPrimaryColNames);

    for (CassandraFeatureColumn col : schemaColNames) {
      boolean ignore =
          lowercaseSchema
              ? schemaColSet.add(col.getFeatureName().toLowerCase())
              : schemaColSet.add(col.getFeatureName());
    }

    // feature col and duplicates validation
    Set<String> requestColSet = new HashSet<>();
    for (String col : writeCassandraFeaturesRequest.getFeatures().getNames()) {
      if (!lowercaseSchema) {
        if (requestColSet.contains(col) || !schemaColSet.contains(col)) {
          return Boolean.FALSE;
        }
        requestColSet.add(col);
      } else {
        if (requestColSet.contains(col) || !schemaColSet.contains(col.toLowerCase())) {
          return Boolean.FALSE;
        }
        requestColSet.add(col.toLowerCase());
      }
    }

    // primary column validation
    if (!requestColSet.containsAll(schemaPrimaryColSet)) {
      return Boolean.FALSE;
    }

    // feature vector size validation
    int featureLength = writeCassandraFeaturesRequest.getFeatures().getNames().size();
    for (List<Object> featureVector : writeCassandraFeaturesRequest.getFeatures().getValues()) {
      if (featureVector.size() != featureLength) {
        return Boolean.FALSE;
      }
    }
    return Boolean.TRUE;
  }

  public Single<ReadCassandraFeaturesResponse> readFeatures(JsonObject readCassandraFeaturesRequest) {
    return convertJsonSingle(
            readCassandraFeaturesRequest,
            ReadCassandraFeaturesRequest.class,
            objectMapper,
            READ_FEATURE_GROUP_INVALID_REQUEST_EXCEPTION)
        .flatMap(
            r -> {
              if (!ReadCassandraFeaturesRequest.validate(r)) {
                return Single.error(
                    new ApiRestException(READ_FEATURE_GROUP_INVALID_REQUEST_EXCEPTION));
              }
              return Single.just(r);
            })
        .flatMap(this::readFeatures);
  }

  public Single<ReadCassandraPartitionResponse> readPartition(
      JsonObject readCassandraPartitionRequest) {
    return convertJsonSingle(
            readCassandraPartitionRequest,
            ReadCassandraPartitionRequest.class,
            objectMapper,
            READ_FEATURE_GROUP_PARTITION_INVALID_REQUEST_EXCEPTION)
        .flatMap(
            r -> {
              if (!ReadCassandraPartitionRequest.validate(r)) {
                return Single.error(
                    new ApiRestException(READ_FEATURE_GROUP_PARTITION_INVALID_REQUEST_EXCEPTION));
              }
              return Single.just(r);
            })
        .flatMap(this::readPartition);
  }

  public Single<List<ReadFeaturesResponse>> multiReadFeatures(
      JsonObject readCassandraFeaturesRequest) {
    return convertJsonSingle(
            readCassandraFeaturesRequest,
            MultiReadCassandraFeaturesRequest.class,
            objectMapper,
            MULTI_READ_FEATURE_GROUP_INVALID_REQUEST_EXCEPTION)
        .flatMap(
            r -> {
              if (!MultiReadCassandraFeaturesRequest.validate(r)) {
                return Single.error(
                    new ApiRestException(MULTI_READ_FEATURE_GROUP_INVALID_REQUEST_EXCEPTION));
              }
              return Single.just(r);
            })
        .map(MultiReadCassandraFeaturesRequest::getBatches)
        .flattenAsObservable(r -> r)
        .flatMapSingle(
            r ->
                readFeatures(r)
                    .onErrorResumeNext(
                        e ->
                            Single.just(
                                ReadCassandraFeaturesResponse.builder()
                                    .featureGroupName(r.getFeatureGroupName())
                                    .featureGroupVersion(r.getFeatureGroupVersion())
                                    .error(e.getMessage())
                                    .build())))
        .map(r -> (ReadFeaturesResponse) r)
        .toList();
  }

  public Single<ReadCassandraFeaturesResponse> readFeatures(
      ReadCassandraFeaturesRequest readCassandraFeaturesRequest) {
    return readFeatures(readCassandraFeaturesRequest, false);
  }

  public Single<ReadCassandraPartitionResponse> readPartition(
      ReadCassandraPartitionRequest readCassandraPartitionRequest) {
    return readPartition(readCassandraPartitionRequest, false);
  }

  public Single<ReadCassandraFeaturesResponse> readFeatures(
      ReadCassandraFeaturesRequest readCassandraFeaturesRequest, Boolean lowercaseSchema) {

    return cassandraMetaStoreService
        .getCassandraFeatureGroupEntityPair(
            readCassandraFeaturesRequest.getFeatureGroupName(),
            readCassandraFeaturesRequest.getFeatureGroupVersion())
        .flatMap(
            pair ->
                Single.just(cassandraMetaStoreService.getSchemaFromPair(pair))
                    .map(
                        schemaResponse ->
                            validateFeatureNamesAndValuesForRead(
                                schemaResponse.getSchema(),
                                schemaResponse.getPrimaryKeys(),
                                readCassandraFeaturesRequest,
                                lowercaseSchema))
                    .filter(r -> r)
                    .switchIfEmpty(
                        Single.error(
                            new ApiRestException(
                                ServiceError.FEATURE_GROUP_SCHEMA_VALIDATION_EXCEPTION)))
                    .flatMap(
                        ignore ->
                            readFeatures(
                                pair,
                                readCassandraFeaturesRequest.getPrimaryKeys(),
                                readCassandraFeaturesRequest.getFeatureColumns(),
                                lowercaseSchema)))
        .doOnSuccess(featureGroupMetricService::processCassandraFeatureGroupReadResponse);
  }

  public Single<ReadCassandraPartitionResponse> readPartition(
      ReadCassandraPartitionRequest readCassandraPartitionRequest, Boolean lowercaseSchema) {

    return cassandraMetaStoreService
        .getCassandraFeatureGroupEntityPair(
            readCassandraPartitionRequest.getFeatureGroupName(),
            readCassandraPartitionRequest.getFeatureGroupVersion())
        .flatMap(
            pair ->
                Single.just(cassandraMetaStoreService.getSchemaFromPair(pair))
                    .map(
                        schemaResponse ->
                            validateFeatureNamesAndValuesForPartitionRead(
                                schemaResponse.getSchema(),
                                schemaResponse.getPrimaryKeys(),
                                readCassandraPartitionRequest,
                                lowercaseSchema))
                    .filter(r -> r)
                    .switchIfEmpty(
                        Single.error(
                            new ApiRestException(
                                ServiceError.FEATURE_GROUP_SCHEMA_VALIDATION_EXCEPTION)))
                    .flatMap(
                        ignore ->
                            readPartition(
                                pair,
                                readCassandraPartitionRequest.getPartitionKey(),
                                readCassandraPartitionRequest.getFeatureColumns(),
                                lowercaseSchema)))
        .doOnSuccess(featureGroupMetricService::processCassandraFeatureGroupPartitionReadResponse);
  }

  private Single<ReadCassandraFeaturesResponse> readFeatures(
      CassandraFeatureGroupEntityPair cassandraFeatureGroupEntityPair,
      CassandraFeatureData primaryKeys,
      List<String> featureColumns,
      Boolean lowercaseSchema) {
    List<List<Object>> failedKeys = new ArrayList<>();
    GetCassandraFeatureGroupSchemaResponse featureGroupSchemaResponse =
        cassandraMetaStoreService.getSchemaFromPair(cassandraFeatureGroupEntityPair);

    return cassandraClientFactory
        .getDao(
            cassandraFeatureGroupEntityPair.getFeatureGroupMetadata().getTenant().getReaderTenant())
        .flatMap(
            dao ->
                dao.readFeatures(
                        cassandraFeatureGroupEntityPair
                            .getEntityMetadata()
                            .getEntity()
                            .getTableName(),
                        getCassandraEntityFeatureSet(
                            cassandraFeatureGroupEntityPair.getEntityMetadata().getEntity(),
                            lowercaseSchema),
                        cassandraFeatureGroupEntityPair.getFeatureGroupMetadata().getName(),
                        cassandraFeatureGroupEntityPair.getFeatureGroupMetadata().getVersion(),
                        cassandraFeatureGroupEntityPair
                            .getFeatureGroupMetadata()
                            .getVersionEnabled(),
                        featureColumns,
                        getFeatureDataTypeMap(
                            featureGroupSchemaResponse.getSchema(), lowercaseSchema),
                        primaryKeys,
                        failedKeys)
                    .toList()
                    .map(
                        r ->
                            convertJsonToFeatureVectorResponse(
                                cassandraFeatureGroupEntityPair.getFeatureGroupMetadata().getName(),
                                cassandraFeatureGroupEntityPair
                                    .getFeatureGroupMetadata()
                                    .getVersion(),
                                r,
                                featureColumns,
                                featureGroupSchemaResponse.getPrimaryKeys(),
                                failedKeys)));
  }

  private Single<ReadCassandraPartitionResponse> readPartition(
      CassandraFeatureGroupEntityPair cassandraFeatureGroupEntityPair,
      CassandraPartitionData partitionKey,
      List<String> featureColumns,
      Boolean lowercaseSchema) {
    GetCassandraFeatureGroupSchemaResponse featureGroupSchemaResponse =
        cassandraMetaStoreService.getSchemaFromPair(cassandraFeatureGroupEntityPair);

    return cassandraClientFactory
        .getDao(
            cassandraFeatureGroupEntityPair.getFeatureGroupMetadata().getTenant().getReaderTenant())
        .flatMap(
            dao ->
                dao.readPartition(
                        cassandraFeatureGroupEntityPair
                            .getEntityMetadata()
                            .getEntity()
                            .getTableName(),
                        getCassandraEntityFeatureSet(
                            cassandraFeatureGroupEntityPair.getEntityMetadata().getEntity(),
                            lowercaseSchema),
                        cassandraFeatureGroupEntityPair.getFeatureGroupMetadata().getName(),
                        cassandraFeatureGroupEntityPair.getFeatureGroupMetadata().getVersion(),
                        cassandraFeatureGroupEntityPair
                            .getFeatureGroupMetadata()
                            .getVersionEnabled(),
                        featureColumns,
                        getFeatureDataTypeMap(
                            featureGroupSchemaResponse.getSchema(), lowercaseSchema),
                        partitionKey)
                    .toList()
                    .map(
                        r ->
                            convertJsonToPartitionFeatureVectorResponse(
                                cassandraFeatureGroupEntityPair.getFeatureGroupMetadata().getName(),
                                cassandraFeatureGroupEntityPair
                                    .getFeatureGroupMetadata()
                                    .getVersion(),
                                r,
                                featureColumns,
                                featureGroupSchemaResponse.getPrimaryKeys())));
  }

  private ReadCassandraFeaturesResponse convertJsonToFeatureVectorResponse(
      String featureGroupName,
      String featureGroupVersion,
      List<CassandraFeatureVectorAndPrimaryKeyPair> pairs,
      List<String> features,
      List<String> primaryKeys,
      List<List<Object>> failedKeys) {
    List<SuccessfulReadKey> successfulReadKeys = new ArrayList<>();
    Set<String> primaryKeysSet = new HashSet<>(primaryKeys);
    List<Long> payloadSizes = new ArrayList<>();
    for (CassandraFeatureVectorAndPrimaryKeyPair pair : pairs) {
      if (pair.getFailed()) {
        failedKeys.add(pair.getPrimaryKey());
        continue;
      }
      payloadSizes.add(pair.getSize());
      List<Object> featureVector = new ArrayList<>();
      List<Object> featureVectorExceptPrimary = new ArrayList<>();
      boolean failed = false;
      for (String key : features) {
        try {
          if (!primaryKeysSet.contains(key)) {
            featureVectorExceptPrimary.add(pair.getFeatureVector().getValue(key));
          }
          featureVector.add(pair.getFeatureVector().getValue(key));
        } catch (Exception e) {
          failed = true;
          log.error(e.getMessage());
          break;
        }
      }

      // fail if all fg col values except primary are null
      failed = failed || featureVectorExceptPrimary.stream().allMatch(Objects::isNull);

      if (!failed) {
        successfulReadKeys.add(
            SuccessfulReadKey.builder().key(pair.getPrimaryKey()).features(featureVector).build());
      } else {
        failedKeys.add(pair.getPrimaryKey());
      }
    }
    return ReadCassandraFeaturesResponse.builder()
        .featureGroupName(featureGroupName)
        .featureGroupVersion(featureGroupVersion)
        .successfulKeys(successfulReadKeys)
        .failedKeys(failedKeys)
        .payloadSizes(payloadSizes)
        .build();
  }

  private ReadCassandraPartitionResponse convertJsonToPartitionFeatureVectorResponse(
      String featureGroupName,
      String featureGroupVersion,
      List<CassandraFetchRowWithMetadata> rows,
      List<String> features,
      List<String> primaryKeys) {
    List<List<Object>> successfulRows = new ArrayList<>();
    Set<String> primaryKeysSet = new HashSet<>(primaryKeys);
    List<Long> payloadSizes = new ArrayList<>();
    for (CassandraFetchRowWithMetadata row : rows) {
      payloadSizes.add(row.getSize());
      List<Object> featureVector = new ArrayList<>();
      List<Object> featureVectorExceptPrimary = new ArrayList<>();
      boolean failed = false;
      for (String key : features) {
        try {
          if (!primaryKeysSet.contains(key)) {
            featureVectorExceptPrimary.add(row.getRow().getValue(key));
          }
          featureVector.add(row.getRow().getValue(key));
        } catch (Exception e) {
          failed = true;
          log.error(e.getMessage());
          break;
        }
      }

      // fail if all fg col values except primary are null
      failed = failed || featureVectorExceptPrimary.stream().allMatch(Objects::isNull);

      if (!failed) {
        successfulRows.add(featureVector);
      }
    }
    return ReadCassandraPartitionResponse.builder()
        .featureGroupName(featureGroupName)
        .featureGroupVersion(featureGroupVersion)
        .features(successfulRows)
        .payloadSizes(payloadSizes)
        .build();
  }

  List<Object> convertJsonToFeatureVector(
      CassandraFeatureVectorAndPrimaryKeyPair pair,
      List<String> features,
      List<List<Object>> failedKeys) {
    List<Object> featureVector = new ArrayList<>();
    if (pair.getFailed()) {
      failedKeys.add(pair.getPrimaryKey());
      return featureVector;
    }
    for (String key : features) {
      try {
        featureVector.add(pair.getFeatureVector().getValue(key));
      } catch (Exception e) {
        log.error(e.getMessage());
        failedKeys.add(pair.getPrimaryKey());
      }
    }
    return featureVector;
  }

  private Boolean validateFeatureNamesAndValuesForRead(
      List<CassandraFeatureColumn> schemaColNames,
      List<String> primaryKeys,
      ReadCassandraFeaturesRequest readCassandraFeaturesRequest,
      Boolean lowercaseSchema) {

    Set<String> schemaColSet = new HashSet<>();

    Set<String> pkColSet =
        lowercaseSchema
            ? new HashSet<>(
                primaryKeys.stream().map(String::toLowerCase).collect(Collectors.toList()))
            : new HashSet<>(primaryKeys);

    Set<String> featureColSet = new HashSet<>(readCassandraFeaturesRequest.getFeatureColumns());

    if (featureColSet.size() != readCassandraFeaturesRequest.getFeatureColumns().size()) {
      return Boolean.FALSE;
    }

    for (CassandraFeatureColumn col : schemaColNames) {
      boolean ignore =
          lowercaseSchema
              ? schemaColSet.add(col.getFeatureName().toLowerCase())
              : schemaColSet.add(col.getFeatureName());
    }

    for (String col : readCassandraFeaturesRequest.getPrimaryKeys().getNames()) {
      if (!schemaColSet.contains(col) || !pkColSet.contains(col)) {
        return Boolean.FALSE;
      }
    }

    for (String col : readCassandraFeaturesRequest.getFeatureColumns()) {
      if (!schemaColSet.contains(col)) {
        return Boolean.FALSE;
      }
    }

    int pkLength = readCassandraFeaturesRequest.getPrimaryKeys().getNames().size();

    for (List<Object> featureVector : readCassandraFeaturesRequest.getPrimaryKeys().getValues()) {
      if (featureVector.size() != pkLength) {
        return Boolean.FALSE;
      }
    }
    return Boolean.TRUE;
  }

  private Boolean validateFeatureNamesAndValuesForPartitionRead(
      List<CassandraFeatureColumn> schemaColNames,
      List<String> primaryKeys,
      ReadCassandraPartitionRequest readCassandraPartitionRequest,
      Boolean lowercaseSchema) {

    Set<String> schemaColSet = new HashSet<>();

    Set<String> pkColSet =
        lowercaseSchema
            ? new HashSet<>(
                primaryKeys.stream().map(String::toLowerCase).collect(Collectors.toList()))
            : new HashSet<>(primaryKeys);

    Set<String> featureColSet = new HashSet<>(readCassandraPartitionRequest.getFeatureColumns());

    if (featureColSet.size() != readCassandraPartitionRequest.getFeatureColumns().size()) {
      return Boolean.FALSE;
    }

    for (CassandraFeatureColumn col : schemaColNames) {
      boolean ignore =
          lowercaseSchema
              ? schemaColSet.add(col.getFeatureName().toLowerCase())
              : schemaColSet.add(col.getFeatureName());
    }

    for (String col : readCassandraPartitionRequest.getPartitionKey().getNames()) {
      if (!schemaColSet.contains(col) || !pkColSet.contains(col)) {
        return Boolean.FALSE;
      }
    }

    for (String col : readCassandraPartitionRequest.getFeatureColumns()) {
      if (!schemaColSet.contains(col)) {
        return Boolean.FALSE;
      }
    }

    int pkLength = readCassandraPartitionRequest.getPartitionKey().getNames().size();
    int pkValuesLength = readCassandraPartitionRequest.getPartitionKey().getValues().size();

    if (pkValuesLength != pkLength) {
      return Boolean.FALSE;
    }

    return Boolean.TRUE;
  }

  public Single<WriteBulkFeaturesResponse> writeFeaturesBulk(
      Boolean replicationEnabled, JsonObject writeFeaturesRequest) {
    return convertJsonSingle(
            writeFeaturesRequest,
            WriteCassandraFeaturesBatchRequest.class,
            objectMapper,
            WRITE_FEATURE_GROUP_INVALID_REQUEST_EXCEPTION)
        .flatMap(
            r -> {
              if (!WriteCassandraFeaturesBatchRequest.validate(r)) {
                return Single.error(
                    new ApiRestException(WRITE_FEATURE_GROUP_INVALID_REQUEST_EXCEPTION));
              }
              return Single.just(r);
            })
        .map(WriteCassandraFeaturesBatchRequest::getBatches)
        .flattenAsObservable(r -> r)
        .flatMap(
            r ->
                writeFeatures(replicationEnabled, r)
                    .toObservable()
                    .map(
                        r1 ->
                            BulkWriteCassandraFeaturesHelper.builder()
                                .success(true)
                                .successBatch(r1)
                                .build())
                    .onErrorResumeNext(
                        e -> {
                          log.error(e.toString());
                          return Observable.just(
                              BulkWriteCassandraFeaturesHelper.builder()
                                  .success(false)
                                  .failedBatch(
                                      WriteCassandraFeaturesFailedBatchResponse.builder()
                                          .batch(r)
                                          .error(e.getMessage())
                                          .build())
                                  .build());
                        }))
        .toList()
        .map(
            r -> {
              List<WriteCassandraFeaturesResponse> batches = new ArrayList<>();
              List<WriteCassandraFeaturesFailedBatchResponse> failedBatches = new ArrayList<>();
              for (BulkWriteCassandraFeaturesHelper res : r) {
                if (res.getSuccess()) {
                  batches.add(res.getSuccessBatch());
                } else {
                  failedBatches.add(res.getFailedBatch());
                }
              }
              return WriteBulkCassandraFeaturesResponse.builder()
                  .batches(batches)
                  .failedBatches(failedBatches)
                  .build();
            });
  }

  public Single<LegacyBatchWriteResponse> legacyBatchWriteFeatures(
      LegacyBatchWriteFeaturesRequest legacyBatchWriteFeaturesRequest) {
    return Observable.fromIterable(legacyBatchWriteFeaturesRequest.getBatches())
        .flatMap(
            r ->
                writeFeatures(true, LegacyWriteFeaturesRequest.getWriteFeaturesRequest(r), true)
                    .map(
                        res -> {
                          if (!res.getFailedRows().isEmpty()) {
                            return LegacyBulkWriteFeatureHelper.builder()
                                .failedBatch(
                                    LegacyBatchWriteFailedRecords.builder().record(r).build())
                                .build();
                          }
                          return LegacyBulkWriteFeatureHelper.builder()
                              .successfulBatch(res)
                              .build();
                        })
                    .toObservable()
                    .onErrorResumeNext(
                        e -> {
                          log.error(e.toString());
                          return Observable.just(
                              LegacyBulkWriteFeatureHelper.builder()
                                  .failedBatch(
                                      LegacyBatchWriteFailedRecords.builder()
                                          .error(e.getMessage())
                                          .record(r)
                                          .build())
                                  .build());
                        }))
        .toList()
        .map(
            r ->
                LegacyBatchWriteResponse.builder()
                    .success(true)
                    .message(
                        "Total successfulRecords: "
                            + (LegacyBulkWriteFeatureHelper.getSuccessfulRecords(r)).size())
                    .successfulRecords(
                        (LegacyBulkWriteFeatureHelper.getSuccessfulRecords(r)).size())
                    .failedRecords(LegacyBulkWriteFeatureHelper.getFailedRecords(r))
                    .build());
  }
}
