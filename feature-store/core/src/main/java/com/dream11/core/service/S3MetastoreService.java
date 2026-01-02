package com.dream11.core.service;

import com.dream11.core.config.ApplicationConfig;
import com.dream11.core.dto.consumer.AllConsumerGroupMetadataResponse;
import com.dream11.core.dto.kafka.AllKafkaTopicConfigResponse;
import com.dream11.core.dto.metastore.CassandraEntityMetadata;
import com.dream11.core.dto.metastore.CassandraFeatureGroupMetadata;
import com.dream11.core.dto.metastore.VersionMetadata;
import com.dream11.core.dto.response.AllCassandraEntityResponse;
import com.dream11.core.dto.response.AllCassandraFeatureGroupResponse;
import com.dream11.core.dto.response.AllCassandraFeatureGroupVersionResponse;
import com.dream11.core.dto.response.GetCassandraFeatureGroupSchemaResponse;
import com.dream11.core.dto.response.GetTopicResponse;
import com.dream11.core.error.ApiRestException;
import com.dream11.core.error.ServiceError;
import com.dream11.core.util.S3ClientUtils;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.inject.Inject;
import io.reactivex.Completable;
import io.reactivex.CompletableEmitter;
import io.reactivex.Single;
import io.vertx.core.json.JsonObject;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import software.amazon.awssdk.core.async.AsyncRequestBody;
import software.amazon.awssdk.core.async.AsyncResponseTransformer;
import software.amazon.awssdk.services.s3.S3AsyncClient;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.NoSuchKeyException;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

// TODO: S3 path construction logic is duplicated across multiple methods - extract to a single PathBuilder utility.
// TODO: No retry logic for S3 operations - transient failures will propagate to callers.
// TODO: Error handling conflates different error types (e.g., FEATURE_GROUP_NOT_FOUND vs FEATURE_GROUP_VERSION_NOT_FOUND).
@Slf4j
@RequiredArgsConstructor(onConstructor = @__({@Inject}))
public class S3MetastoreService {
  private static final String FILE_EXT = ".json";
  private static final String ALL_METADATA_FILE_NAME = "metadata.json";
  private final S3AsyncClient client;
  private final ApplicationConfig applicationConfig;
  private final ObjectMapper objectMapper;

  // checks base object and bucket exists
  public Completable init() {
    return Completable.create(
        emitter ->
            client
                .getObject(
                    GetObjectRequest.builder()
                        .bucket(applicationConfig.getMetastoreS3Bucket())
                        .key(applicationConfig.getMetastoreS3BucketBasePath())
                        .build(),
                    AsyncResponseTransformer.toBytes())
                .whenComplete(
                    (r, e) -> {
                      if (e != null) {
                        if (!(e instanceof NoSuchKeyException)) {
                          createBasePath(emitter);
                        } else {
                          log.error("error in metastore init", e);
                          emitter.onError(e);
                        }
                      } else {
                        emitter.onComplete();
                      }
                    }));
  }

  private void createBasePath(CompletableEmitter emitter) {
    client
        .putObject(
            PutObjectRequest.builder()
                .bucket(applicationConfig.getMetastoreS3Bucket())
                .key(applicationConfig.getMetastoreS3BucketBasePath())
                .build(),
            AsyncRequestBody.empty())
        .whenComplete(
            (r, e) -> {
              if (e != null) {
                log.error("error in metastore init", e);
                emitter.onError(e);
              } else {
                emitter.onComplete();
              }
            });
  }

  private String getEntityMetadataPath(String name) {
    return applicationConfig.getMetastoreS3BucketBasePath()
        + applicationConfig.getMetastoreS3EntityBasePath()
        + name
        + FILE_EXT;
  }

  private String getFgMetadataPath(String name, String version) {
    return applicationConfig.getMetastoreS3BucketBasePath()
        + applicationConfig.getMetastoreS3FeatureGroupBasePath()
        + name
        + "__"
        + version
        + FILE_EXT;
  }

  private String getFgVersionMetadataPath(String name) {
    return applicationConfig.getMetastoreS3BucketBasePath()
        + applicationConfig.getMetastoreS3FeatureGroupVersionBasePath()
        + name
        + FILE_EXT;
  }

  private String getFgSchemaPath(String name, String version) {
    return applicationConfig.getMetastoreS3BucketBasePath()
        + applicationConfig.getMetastoreS3FeatureGroupSchemaBasePath()
        + name
        + "__"
        + version
        + FILE_EXT;
  }

  private String getFgTopicPath(String name) {
    return applicationConfig.getMetastoreS3BucketBasePath()
        + applicationConfig.getMetastoreS3FeatureGroupTopicBasePath()
        + name
        + FILE_EXT;
  }

  private String getAllEntityMetadataPath() {
    return applicationConfig.getMetastoreS3BucketBasePath()
        + applicationConfig.getMetastoreS3EntityBasePath()
        + applicationConfig.getMetastoreS3FullMetadataBasePath()
        + ALL_METADATA_FILE_NAME;
  }

  private String getAllFgMetadataPath() {
    return applicationConfig.getMetastoreS3BucketBasePath()
        + applicationConfig.getMetastoreS3FeatureGroupBasePath()
        + applicationConfig.getMetastoreS3FullMetadataBasePath()
        + ALL_METADATA_FILE_NAME;
  }

  private String getAllFgVersionMetadataPath() {
    return applicationConfig.getMetastoreS3BucketBasePath()
        + applicationConfig.getMetastoreS3FeatureGroupVersionBasePath()
        + applicationConfig.getMetastoreS3FullMetadataBasePath()
        + ALL_METADATA_FILE_NAME;
  }

  private String getConsumerConfigMetadataPath() {
    return applicationConfig.getMetastoreS3BucketBasePath()
        + applicationConfig.getMetastoreS3ConsumerConfigBasePath()
        + applicationConfig.getMetastoreS3FullMetadataBasePath()
        + ALL_METADATA_FILE_NAME;
  }

  private String getKafkaConfigMetadataPath() {
    return applicationConfig.getMetastoreS3BucketBasePath()
        + applicationConfig.getMetastoreS3KafkaConfigBasePath()
        + applicationConfig.getMetastoreS3FullMetadataBasePath()
        + ALL_METADATA_FILE_NAME;
  }

  // entities
  @SneakyThrows
  public Completable putEntityMetadata(CassandraEntityMetadata metadata) {
    String path = this.getEntityMetadataPath(metadata.getName());
    JsonObject data = new JsonObject(objectMapper.writeValueAsString(metadata));
    return S3ClientUtils.putObject(client, applicationConfig.getMetastoreS3Bucket(), path, data);
  }

  @SneakyThrows
  public Single<CassandraEntityMetadata> getEntityMetadata(String name) {
    String path = this.getEntityMetadataPath(name);
    return S3ClientUtils.getObject(client, applicationConfig.getMetastoreS3Bucket(), path)
        .onErrorResumeNext(e -> this.handleNotFoundS3Error(e, ServiceError.ENTITY_NOT_FOUND_EXCEPTION))
        .map(r -> objectMapper.readValue(r.toString(), CassandraEntityMetadata.class));
  }

  @SneakyThrows
  public Completable putAllEntityMetadata(AllCassandraEntityResponse metadata) {
    String path = this.getAllEntityMetadataPath();
    JsonObject data = new JsonObject(objectMapper.writeValueAsString(metadata));
    return S3ClientUtils.putObject(client, applicationConfig.getMetastoreS3Bucket(), path, data);
  }

  @SneakyThrows
  public Single<AllCassandraEntityResponse> getAllEntityMetadata() {
    String path = this.getAllEntityMetadataPath();
    return S3ClientUtils.getObject(client, applicationConfig.getMetastoreS3Bucket(), path)
        .map(r -> objectMapper.readValue(r.toString(), AllCassandraEntityResponse.class));
  }

  // feature-groups
  @SneakyThrows
  public Completable putFeatureGroupMetadata(CassandraFeatureGroupMetadata metadata) {
    String path = this.getFgMetadataPath(metadata.getName(), metadata.getVersion());
    JsonObject data = new JsonObject(objectMapper.writeValueAsString(metadata));
    return S3ClientUtils.putObject(client, applicationConfig.getMetastoreS3Bucket(), path, data);
  }

  @SneakyThrows
  public Single<CassandraFeatureGroupMetadata> getFeatureGroupMetadata(
      String name, String version) {
    String path = this.getFgMetadataPath(name, version);
    return S3ClientUtils.getObject(client, applicationConfig.getMetastoreS3Bucket(), path)
        .onErrorResumeNext(e -> this.handleNotFoundS3Error(e, ServiceError.FEATURE_GROUP_NOT_FOUND_EXCEPTION))
        // admin throws FEATURE_GROUP_NOT_FOUND_EXCEPTION instead of FEATURE_GROUP_VERSION_NOT_FOUND_EXCEPTION
        .map(r -> objectMapper.readValue(r.toString(), CassandraFeatureGroupMetadata.class));
  }

  @SneakyThrows
  public Completable putAllFeatureGroupMetadata(AllCassandraFeatureGroupResponse metadata) {
    String path = this.getAllFgMetadataPath();
    JsonObject data = new JsonObject(objectMapper.writeValueAsString(metadata));
    return S3ClientUtils.putObject(client, applicationConfig.getMetastoreS3Bucket(), path, data);
  }

  @SneakyThrows
  public Single<AllCassandraFeatureGroupResponse> getAllFeatureGroupMetadata() {
    String path = this.getAllFgMetadataPath();
    return S3ClientUtils.getObject(client, applicationConfig.getMetastoreS3Bucket(), path)
        .map(r -> objectMapper.readValue(r.toString(), AllCassandraFeatureGroupResponse.class));
  }

  // feature-group-versions
  @SneakyThrows
  public Completable putFeatureGroupVersionMetadata(VersionMetadata metadata) {
    String path = this.getFgVersionMetadataPath(metadata.getName());
    JsonObject data = new JsonObject(objectMapper.writeValueAsString(metadata));
    return S3ClientUtils.putObject(client, applicationConfig.getMetastoreS3Bucket(), path, data);
  }

  @SneakyThrows
  public Single<VersionMetadata> getFeatureGroupVersionMetadata(String name) {
    String path = this.getFgVersionMetadataPath(name);
    return S3ClientUtils.getObject(client, applicationConfig.getMetastoreS3Bucket(), path)
        .onErrorResumeNext(e -> this.handleNotFoundS3Error(e, ServiceError.FEATURE_GROUP_NOT_FOUND_EXCEPTION))
        // admin throws FEATURE_GROUP_NOT_FOUND_EXCEPTION instead of FEATURE_GROUP_VERSION_NOT_FOUND_EXCEPTION
        .map(r -> objectMapper.readValue(r.toString(), VersionMetadata.class));
  }

  @SneakyThrows
  public Completable putAllFeatureGroupVersionMetadata(
      AllCassandraFeatureGroupVersionResponse metadata) {
    String path = this.getAllFgVersionMetadataPath();
    JsonObject data = new JsonObject(objectMapper.writeValueAsString(metadata));
    return S3ClientUtils.putObject(client, applicationConfig.getMetastoreS3Bucket(), path, data);
  }

  @SneakyThrows
  public Single<AllCassandraFeatureGroupVersionResponse> getAllFeatureGroupVersionMetadata() {
    String path = this.getAllFgVersionMetadataPath();
    return S3ClientUtils.getObject(client, applicationConfig.getMetastoreS3Bucket(), path)
        .map(
            r ->
                objectMapper.readValue(
                    r.toString(), AllCassandraFeatureGroupVersionResponse.class));
  }

  // feature-group-schema
  @SneakyThrows
  public Completable putFeatureGroupSchema(String name, String version, GetCassandraFeatureGroupSchemaResponse schema) {
    String path = this.getFgSchemaPath(name, version);
    JsonObject data = new JsonObject(objectMapper.writeValueAsString(schema));
    return S3ClientUtils.putObject(client, applicationConfig.getMetastoreS3Bucket(), path, data);
  }

  @SneakyThrows
  public Single<GetCassandraFeatureGroupSchemaResponse> getFeatureGroupSchema(String name, String version) {
    String path = this.getFgSchemaPath(name, version);
    return S3ClientUtils.getObject(client, applicationConfig.getMetastoreS3Bucket(), path)
        .onErrorResumeNext(e -> this.handleNotFoundS3Error(e, ServiceError.FEATURE_GROUP_NOT_FOUND_EXCEPTION))
        // admin throws FEATURE_GROUP_NOT_FOUND_EXCEPTION instead of FEATURE_GROUP_VERSION_NOT_FOUND_EXCEPTION
        .map(r -> objectMapper.readValue(r.toString(), GetCassandraFeatureGroupSchemaResponse.class));
  }

  // feature-group-topic
  @SneakyThrows
  public Completable putFeatureGroupTopic(String name, GetTopicResponse schema) {
    String path = this.getFgTopicPath(name);
    JsonObject data = new JsonObject(objectMapper.writeValueAsString(schema));
    return S3ClientUtils.putObject(client, applicationConfig.getMetastoreS3Bucket(), path, data);
  }

  @SneakyThrows
  public Single<GetTopicResponse> getFeatureGroupTopic(String name) {
    String path = this.getFgTopicPath(name);
    return S3ClientUtils.getObject(client, applicationConfig.getMetastoreS3Bucket(), path)
        .onErrorResumeNext(e -> this.handleNotFoundS3Error(e, ServiceError.FEATURE_GROUP_NOT_FOUND_EXCEPTION))
        .map(r -> objectMapper.readValue(r.toString(), GetTopicResponse.class));
  }

  // Consumer Configs
  @SneakyThrows
  public Completable putConsumerGroupConfig(AllConsumerGroupMetadataResponse allConsumerGroupMetadataResponse
  ) {
    String path = this.getConsumerConfigMetadataPath();
    JsonObject data = new JsonObject(objectMapper.writeValueAsString(allConsumerGroupMetadataResponse));
    return S3ClientUtils.putObject(client, applicationConfig.getMetastoreS3Bucket(), path, data);
  }

  public Single<AllConsumerGroupMetadataResponse> getConsumerGroupConfig() {
    String path = this.getConsumerConfigMetadataPath();
    return S3ClientUtils.getObject(client, applicationConfig.getMetastoreS3Bucket(), path).onErrorResumeNext(e -> handleNotFoundS3Error(e
            , ServiceError.CONSUMER_CONFIG_NOT_FOUND_EXCEPTION))
        .map(r -> objectMapper.readValue(r.toString(), AllConsumerGroupMetadataResponse.class));

  }

  @SneakyThrows
  public Completable putKafkaTopicConfig(AllKafkaTopicConfigResponse allKafkaTopicMetadataResponse) {
    String path = this.getKafkaConfigMetadataPath();
    JsonObject data = new JsonObject(objectMapper.writeValueAsString(allKafkaTopicMetadataResponse));
    return S3ClientUtils.putObject(client, applicationConfig.getMetastoreS3Bucket(), path, data);
  }

  public Single<AllKafkaTopicConfigResponse> getKafkaTopicConfig() {
    String path = this.getKafkaConfigMetadataPath();
    return S3ClientUtils.getObject(client, applicationConfig.getMetastoreS3Bucket(), path)
        .onErrorResumeNext(e -> handleNotFoundS3Error(e
            , ServiceError.OFS_V2_KAFKA_CONFIG_NOT_FOUND_EXCEPTION))
        .map(r -> objectMapper.readValue(r.toString(), AllKafkaTopicConfigResponse.class));

  }

  private Single<JsonObject> handleNotFoundS3Error(Throwable e, ServiceError serviceError) {
    {
      if (e instanceof java.util.concurrent.CompletionException
          && e.getCause() instanceof S3Exception
          && (((S3Exception) e.getCause()).statusCode() == 404)) {
        return Single.error(
            new ApiRestException(serviceError));
      }
      return Single.error(e);
    }
  }
}
