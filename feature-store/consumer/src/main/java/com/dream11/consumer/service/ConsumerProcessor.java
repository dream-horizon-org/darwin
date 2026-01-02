package com.dream11.consumer.service;

import static com.dream11.core.constant.Constants.FEATURE_GROUP_HEADER_NAME;
import static com.dream11.core.constant.Constants.FEATURE_GROUP_RUN_ID_HEADER_NAME;
import static com.dream11.core.constant.Constants.FEATURE_GROUP_VERSION_HEADER_NAME;
import static com.dream11.core.constant.Constants.SDK_V1_HEADER_VALUE;
import static com.dream11.core.constant.Constants.SDK_V2_HEADER_VALUE;
import static com.dream11.core.constant.Constants.SDK_VERSION_HEADER_NAME;
import static com.dream11.core.constant.Constants.WRITE_REPLICATION_HEADER_NAME;
import static com.dream11.core.error.ServiceError.OFS_V2_SERVICE_UNKNOWN_EXCEPTION;
import static com.dream11.core.util.HttpResponseUtils.checkStatusAndConvert;
import static com.dream11.core.util.HttpResponseUtils.checkStatusAndConvertLegacyResponse;

import com.dream11.consumer.util.KafkaMessageUtils;
import com.dream11.core.config.ApplicationConfig;
import com.dream11.core.dto.featuredata.CassandraFeatureData;
import com.dream11.core.dto.helper.Data;
import com.dream11.core.dto.helper.LegacyBatchWriteFailedRecords;
import com.dream11.core.dto.helper.LegacyFeatureStoreResponse;
import com.dream11.core.dto.helper.WriteRequestWithReplicationFlag;
import com.dream11.core.dto.helper.cachekeys.ConsumerCacheKey;
import com.dream11.core.dto.request.WriteCassandraFeaturesBatchRequest;
import com.dream11.core.dto.request.WriteCassandraFeaturesRequest;
import com.dream11.core.dto.request.legacystack.LegacyBatchWriteFeaturesRequest;
import com.dream11.core.dto.request.legacystack.LegacyWriteFeaturesKafkaMessage;
import com.dream11.core.dto.request.legacystack.LegacyWriteFeaturesRequest;
import com.dream11.core.dto.response.LegacyBatchWriteResponse;
import com.dream11.core.dto.response.WriteBulkCassandraFeaturesResponse;
import com.dream11.core.dto.response.WriteCassandraFeaturesFailedBatchResponse;
import com.dream11.core.dto.response.WriteCassandraFeaturesResponse;
import com.dream11.core.util.ApiHandler;
import com.dream11.core.util.DlqUtils;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.inject.Inject;
import io.reactivex.Completable;
import io.reactivex.Flowable;
import io.reactivex.Observable;
import io.reactivex.Single;
import io.reactivex.observables.GroupedObservable;
import io.vertx.core.json.JsonObject;
import io.vertx.reactivex.core.Vertx;
import io.vertx.reactivex.kafka.client.consumer.KafkaConsumer;
import io.vertx.reactivex.kafka.client.consumer.KafkaConsumerRecord;
import io.vertx.reactivex.kafka.client.consumer.KafkaConsumerRecords;
import io.vertx.reactivex.kafka.client.producer.KafkaHeader;
import io.vertx.reactivex.kafka.client.producer.KafkaProducer;
import io.vertx.reactivex.kafka.client.producer.KafkaProducerRecord;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;

// TODO: This class is ~580 lines - split into MessageParser, BatchProcessor, DlqHandler for better testability.
// TODO: SDK version handling (V1 vs V2) has duplicated parsing logic - extract to VersionedMessageHandler interface.
// TODO: Retry logic uses Math.pow(2, counter) - extract to configurable exponential backoff utility.
@Slf4j
@RequiredArgsConstructor(onConstructor = @__({@Inject}))
public class ConsumerProcessor {
  private static final String DLQ_NAME = DlqUtils.getDlqTopicNameAsPerEnv();

  private final ApiHandler apiHandler;
  private final ObjectMapper objectMapper;
  private final Vertx vertx;
  private final ApplicationConfig applicationConfig;
  private final ConsumerMetricService consumerMetricService;

  // TODO: consumerId initialization via setter is fragile - refactor to use factory pattern or builder.
  @Setter @Getter private String consumerId = null;

  private Boolean paused = false;

  private final KafkaConsumer<String, String> consumer;

  private final KafkaProducer<String, String> producer;

  public Completable rxStart(Set<String> topics) {
    producer.exceptionHandler(e -> log.error("producer error handler invoked ", e));

    consumer.handler(r -> {});
    consumer
        .pause()
        .batchHandler(
            records ->
                this.batchHandler(records)
                    .subscribe(() -> {}, e -> log.error("error processing batch", e)));
    return consumer.rxSubscribe(topics).doOnComplete(() -> consumer.fetch(getDefaultFetchSize()));
  }

  public Completable batchHandler(KafkaConsumerRecords<String, String> consumerRecords) {
    if (consumerRecords == null || consumerRecords.isEmpty()) {
      log.warn("No records to process for consumer {}", consumerId);
      return Completable.complete();
    }

    return getRecordStream(consumerRecords)
        .groupBy(KafkaConsumerRecord::topic)
        .flatMapCompletable(this::processBatch)
        .andThen(
            consumer
                .rxCommit()
                .doOnError(
                    e -> log.error("error committing offset for consumer {}", consumerId, e)))
        .doFinally(() -> consumer.fetch(getDefaultFetchSize()))
        .doOnError(e -> log.error("error processing batch for consumer {}", consumerId, e));
  }

  private Completable processBatch(
      GroupedObservable<String, KafkaConsumerRecord<String, String>> topicGroup) {
    return topicGroup
        .groupBy(r -> parseHeaders(r).getOrDefault(SDK_VERSION_HEADER_NAME, SDK_V1_HEADER_VALUE))
        .flatMapCompletable(
            versionedGroup -> {
              if (versionedGroup.getKey().equals(SDK_V1_HEADER_VALUE))
                return versionedGroup
                    .toList()
                    .flatMapCompletable(
                        records ->
                            processRecords(records)
                                .flatMapCompletable(
                                    legacyRequest ->
                                        processLegacyBatch(legacyRequest, topicGroup.getKey())));
              else if (versionedGroup.getKey().equals(SDK_V2_HEADER_VALUE))
                return versionedGroup
                    .toList()
                    .flatMapCompletable(
                        records ->
                            processRecordsV2(records)
                                .flatMapCompletable(
                                    legacyRequest ->
                                        processV2Batch(legacyRequest, topicGroup.getKey())));
              return Completable.error(
                  new Throwable(
                      String.format(
                          "bad value for sdk version header %s", versionedGroup.getKey())));
            });
  }

  private static Map<String, String> parseHeaders(KafkaConsumerRecord<String, String> record) {
    Map<String, String> headers = new HashMap<>();
    for (KafkaHeader header : record.headers()) {
      headers.put(header.key(), header.value().getString(0, header.value().length()));
    }
    return headers;
  }

  private Completable processLegacyBatch(LegacyBatchWriteFeaturesRequest request, String topic) {
    if (!request.getBatches().isEmpty()) {
      return writeDataToOfs(request, topic)
          .filter(r -> !r.getData().getFailedRecords().isEmpty())
          .flattenAsObservable(r -> r.getData().getFailedRecords())
          .map(LegacyBatchWriteFailedRecords::getRecord)
          .flatMapCompletable(
              r ->
                  sendFailedRecordsToDlq(
                      LegacyWriteFeaturesKafkaMessage.create(objectMapper, r), DLQ_NAME));
    }
    return Completable.complete();
  }

  private Completable processV2Batch(WriteRequestWithReplicationFlag request, String topic) {
    if (!request.getRequest().getBatches().isEmpty()) {
      return writeDataToOfsV2(request, topic)
          .map(this::processFailedMessagesForWriteResponse)
          .filter(r -> !r.isEmpty())
          .flattenAsObservable(r -> r)
          .flatMapCompletable(this::sendFailedRecordsToDlq);
    }
    return Completable.complete();
  }

  private List<KafkaProducerRecord<String, String>> processFailedMessagesForWriteResponse(
      WriteBulkCassandraFeaturesResponse responses) {
    List<KafkaProducerRecord<String, String>> recordList = new ArrayList<>();
    recordList.addAll(parseProcessedBatchWithFailedRows(responses));
    recordList.addAll(parseFailedToProcessBatch(responses));
    return recordList;
  }

  private List<KafkaProducerRecord<String, String>> parseProcessedBatchWithFailedRows(
      WriteBulkCassandraFeaturesResponse responses) {
    List<KafkaProducerRecord<String, String>> recordList = new ArrayList<>();
    for (WriteCassandraFeaturesResponse response : responses.getBatches()) {
      try {
        CassandraFeatureData featureData =
            CassandraFeatureData.builder()
                .names(response.getFeatureColumns())
                .values(response.getFailedRows())
                .build();
        List<String> messages =
            KafkaMessageUtils.createFeatureDataMessages(objectMapper, featureData);
        for (String message : messages) {
          KafkaProducerRecord<String, String> record =
              KafkaProducerRecord.create(DLQ_NAME, message);
          record.addHeader(
              KafkaHeader.header(SDK_VERSION_HEADER_NAME, SDK_V2_HEADER_VALUE));
          record.addHeader(
              KafkaHeader.header(FEATURE_GROUP_HEADER_NAME, response.getFeatureGroupName()));
          if (response.getFeatureGroupVersion() != null)
            record.addHeader(
                KafkaHeader.header(
                    FEATURE_GROUP_VERSION_HEADER_NAME, response.getFeatureGroupVersion()));
          recordList.add(record);
        }
      } catch (Throwable e) {
        log.error("error processing failed message", e);
      }
    }
    return recordList;
  }

  private List<KafkaProducerRecord<String, String>> parseFailedToProcessBatch(
      WriteBulkCassandraFeaturesResponse responses) {
    List<KafkaProducerRecord<String, String>> recordList = new ArrayList<>();

    for (WriteCassandraFeaturesFailedBatchResponse response : responses.getFailedBatches()) {
      try {
        List<String> messages =
            KafkaMessageUtils.createFeatureDataMessages(
                objectMapper, response.getBatch().getFeatures());
        for (String message : messages) {
          KafkaProducerRecord<String, String> record =
              KafkaProducerRecord.create(DLQ_NAME, message);
          record.addHeader(
              KafkaHeader.header(SDK_VERSION_HEADER_NAME, SDK_V2_HEADER_VALUE));
          record.addHeader(
              KafkaHeader.header(
                  FEATURE_GROUP_HEADER_NAME, response.getBatch().getFeatureGroupName()));
          if (response.getBatch().getFeatureGroupVersion() != null)
            record.addHeader(
                KafkaHeader.header(
                    FEATURE_GROUP_VERSION_HEADER_NAME,
                    response.getBatch().getFeatureGroupVersion()));

          record.addHeader(KafkaHeader.header("error", response.getError()));
          recordList.add(record);
        }
      } catch (Throwable e) {
        log.error("error processing failed message", e);
      }
    }
    return recordList;
  }

  private static <K, V> Observable<KafkaConsumerRecord<K, V>> getRecordStream(
      KafkaConsumerRecords<K, V> records) {
    return Observable.range(0, records.size()).map(records::recordAt);
  }

  public Completable reSubscribe(Set<String> topics) {
    return consumer.rxSubscribe(topics);
  }

  private Observable<LegacyBatchWriteFeaturesRequest> processRecords(
      List<KafkaConsumerRecord<String, String>> records) {
    List<KafkaConsumerRecord<String, String>> failedRecords = new ArrayList<>();
    List<List<LegacyWriteFeaturesRequest>> successFullRecordBatches = new ArrayList<>();
    long currentSize = 0L;
    List<LegacyWriteFeaturesRequest> currentBatch = new ArrayList<>();
    for (int i = 0; i < records.size(); i++) {
      try {
        LegacyWriteFeaturesKafkaMessage legacyWriteFeaturesKafkaMessage =
            objectMapper.readValue(records.get(i).value(), LegacyWriteFeaturesKafkaMessage.class);
        LegacyWriteFeaturesRequest writeFeaturesRequest =
            LegacyWriteFeaturesKafkaMessage.getWriteFeaturesRequest(
                objectMapper, legacyWriteFeaturesKafkaMessage);

        // check if this record can be added to current batch
        if (currentSize + records.get(i).value().length()
            <= applicationConfig.getOfsWriterMaxBatchSize()) currentBatch.add(writeFeaturesRequest);
        else {
          currentSize = records.get(i).value().length();
          successFullRecordBatches.add(currentBatch);
          currentBatch = new ArrayList<>();
          currentBatch.add(writeFeaturesRequest);
        }
      } catch (Exception e) {
        log.error("error parsing message: " + e.getMessage());
        failedRecords.add(records.get(i));
      }
    }
    // check if last batch was added
    if (!currentBatch.isEmpty()) successFullRecordBatches.add(currentBatch);

    if (failedRecords.isEmpty())
      return Observable.fromIterable(successFullRecordBatches)
          .map(batch -> LegacyBatchWriteFeaturesRequest.builder().batches(batch).build());

    return Observable.fromIterable(failedRecords)
        .flatMapCompletable(r -> sendUnprocessableRecordsToDlq(r, DLQ_NAME))
        .andThen(
            Observable.fromIterable(successFullRecordBatches)
                .map(batch -> LegacyBatchWriteFeaturesRequest.builder().batches(batch).build()));
  }

  private Observable<WriteRequestWithReplicationFlag> processRecordsV2(
      List<KafkaConsumerRecord<String, String>> records) {
    List<KafkaConsumerRecord<String, String>> failedRecords = new ArrayList<>();
    List<List<WriteCassandraFeaturesRequest>> successFullRecordBatches = new ArrayList<>();
    List<List<WriteCassandraFeaturesRequest>> successFullRecordBatchesWithoutReplication =
        new ArrayList<>();

    long currentSize = 0L;
    long currentSizeWithoutReplication = 0L;
    List<WriteCassandraFeaturesRequest> currentBatch = new ArrayList<>();
    List<WriteCassandraFeaturesRequest> currentBatchWithoutReplication = new ArrayList<>();
    for (int i = 0; i < records.size(); i++) {
      try {
        Map<String, String> headers = parseHeaders(records.get(i));
        String name = headers.get(FEATURE_GROUP_HEADER_NAME);
        if (name == null) throw new RuntimeException("feature group name cannot be null");

        String version = null;
        if (headers.get(FEATURE_GROUP_VERSION_HEADER_NAME) != null) {
          version = headers.get(FEATURE_GROUP_VERSION_HEADER_NAME);
        }

        String runId = null;
        if (headers.get(FEATURE_GROUP_RUN_ID_HEADER_NAME) != null) {
          runId = headers.get(FEATURE_GROUP_RUN_ID_HEADER_NAME);
        }

        boolean replicateWrites = Boolean.TRUE;
        if (headers.get(WRITE_REPLICATION_HEADER_NAME) != null) {
          replicateWrites = Boolean.parseBoolean(headers.get(WRITE_REPLICATION_HEADER_NAME));
        }

        CassandraFeatureData featureData = parseFeatures(objectMapper, records.get(i).value());
        WriteCassandraFeaturesRequest.WriteCassandraFeaturesRequestBuilder writeFeaturesRequest =
            WriteCassandraFeaturesRequest.builder().featureGroupName(name).features(featureData);
        if (version != null) writeFeaturesRequest.featureGroupVersion(version);
        if (runId != null) writeFeaturesRequest.runId(runId);

        if (replicateWrites) {
          // check if this record can be added to current batch
          currentSize =
              checkCurrentBatchOrFlush(
                  currentSize,
                  records.get(i),
                  currentBatch,
                  writeFeaturesRequest.build(),
                  successFullRecordBatches);
        } else {
          // check if this record can be added to current batch
          currentSizeWithoutReplication =
              checkCurrentBatchOrFlush(
                  currentSizeWithoutReplication,
                  records.get(i),
                  currentBatchWithoutReplication,
                  writeFeaturesRequest.build(),
                  successFullRecordBatchesWithoutReplication);
        }
      } catch (Throwable e) {
        log.error("error parsing message: " + e.getMessage());
        failedRecords.add(records.get(i));
      }
    }
    // check if last batch was added
    if (!currentBatch.isEmpty()) successFullRecordBatches.add(currentBatch);
    if (!currentBatchWithoutReplication.isEmpty())
      successFullRecordBatchesWithoutReplication.add(currentBatchWithoutReplication);

    Observable<WriteRequestWithReplicationFlag> requests =
        Observable.merge(
            createRequestsFromBatches(successFullRecordBatches, Boolean.TRUE),
            createRequestsFromBatches(successFullRecordBatchesWithoutReplication, Boolean.FALSE));

    if (failedRecords.isEmpty()) return requests;

    return Observable.fromIterable(failedRecords)
        .flatMapCompletable(r -> sendUnprocessableRecordsToDlq(r, DLQ_NAME))
        .andThen(requests);
  }

  private Long checkCurrentBatchOrFlush(
      Long currentSize,
      KafkaConsumerRecord<String, String> record,
      List<WriteCassandraFeaturesRequest> currentBatch,
      WriteCassandraFeaturesRequest request,
      List<List<WriteCassandraFeaturesRequest>> successFullRecordBatches) {
    long newSize = currentSize;
    if (currentSize + record.value().length() <= applicationConfig.getOfsWriterMaxBatchSize()) {
      currentBatch.add(request);
      newSize += record.value().length();
    } else {
      newSize = record.value().length();
      successFullRecordBatches.add(new ArrayList<>(currentBatch));
      currentBatch.clear();
      currentBatch.add(request);
    }
    return newSize;
  }

  private Observable<WriteRequestWithReplicationFlag> createRequestsFromBatches(
      List<List<WriteCassandraFeaturesRequest>> batches, Boolean replicateWrites) {
    return Observable.fromIterable(batches)
        .map(
            batch ->
                WriteRequestWithReplicationFlag.builder()
                    .request(WriteCassandraFeaturesBatchRequest.builder().batches(batch).build())
                    .replicateWrites(replicateWrites)
                    .build());
  }

  // TODO: Feature ordering depends on Map iteration order - use LinkedHashMap or explicit ordering for determinism.
  // TODO: No schema validation during parsing - malformed messages will fail at write time instead of parse time.
  // TODO: throws Throwable is too broad - use specific exception types for better error handling.
  private static CassandraFeatureData parseFeatures(ObjectMapper objectMapper, String message)
      throws Throwable {
    Map<String, Object> map = objectMapper.readValue(message, new TypeReference<>() {});
    List<String> names = new ArrayList<>();
    List<Object> values = new ArrayList<>();
    for (Map.Entry<String, Object> entry : map.entrySet()) {
      names.add(entry.getKey());
      values.add(entry.getValue());
    }
    return CassandraFeatureData.builder().names(names).values(List.of(values)).build();
  }

  @SneakyThrows
  private Single<LegacyFeatureStoreResponse<LegacyBatchWriteResponse>> writeDataToOfs(
      LegacyBatchWriteFeaturesRequest featuresRequests, String topic) {
    return writeDataToOfs(featuresRequests)
        .retryWhen(errors -> {
          AtomicInteger counter = new AtomicInteger();
          return errors
              .takeWhile(e -> counter.incrementAndGet() <= 3)
              .flatMap(e -> Flowable.timer((long) Math.pow(2, counter.get()), TimeUnit.SECONDS));
        })
        .doOnSuccess(
            r -> {
              if (!System.getProperty("app.environment").equals("test")) {
                consumerMetricService.processWriteMetrics(
                    r.getData().getSuccessfulRecords(),
                    r.getData().getFailedRecords().size(),
                    consumerId,
                    topic);
              }
            });
  }

  // TODO: Hardcoded retry count (3) and backoff base (2) should be configurable.
  // TODO: onErrorResumeNext converts all errors to failed batches - distinguish retryable vs non-retryable errors.
  @SneakyThrows
  private Single<WriteBulkCassandraFeaturesResponse> writeDataToOfsV2(
      WriteRequestWithReplicationFlag featuresRequests, String topic) {
    return writeDataToOfsV2(featuresRequests.getRequest(), featuresRequests.getReplicateWrites())
        .retryWhen(errors -> {
        AtomicInteger counter = new AtomicInteger();
        return errors
            .takeWhile(e -> counter.incrementAndGet() <= 3)
            .flatMap(e -> Flowable.timer((long) Math.pow(2, counter.get()), TimeUnit.SECONDS));
        })
        .doOnSuccess(
            r -> {
              if (!System.getProperty("app.environment").equals("test")) {
                int success = 0;
                int fail = 0;
                for (WriteCassandraFeaturesResponse batch : r.getBatches()) {
                  success += batch.getSuccessfulRows().size();
                  fail += batch.getFailedRows().size();
                }

                for (WriteCassandraFeaturesFailedBatchResponse batch : r.getFailedBatches()) {
                  fail += batch.getBatch().getFeatures().getValues().size();
                }
                consumerMetricService.processWriteMetrics(success, fail, consumerId, topic);
              }
            })
        .onErrorResumeNext(
            e -> {
              log.error(String.format("error sending batch to ofs: %s", e.getMessage()), e);
              return Single.just(
                  WriteBulkCassandraFeaturesResponse.builder()
                      .batches(new ArrayList<>())
                      .failedBatches(
                          featuresRequests.getRequest().getBatches().stream()
                              .map(
                                  batch ->
                                      WriteCassandraFeaturesFailedBatchResponse.builder()
                                          .batch(batch)
                                          .error(e.getMessage())
                                          .build())
                              .collect(Collectors.toList()))
                      .build());
            });
  }

  @SneakyThrows
  private Single<LegacyFeatureStoreResponse<LegacyBatchWriteResponse>> writeDataToOfs(
      LegacyBatchWriteFeaturesRequest featuresRequests) {
    JsonObject body = new JsonObject(objectMapper.writeValueAsString(featuresRequests));
    return apiHandler
        .call(
            applicationConfig.getOfsWriterHost(),
            applicationConfig.getOfsAsyncBatchWriteEndpoint(),
            ApiHandler.RequestType.POST,
            body,
            new HashMap<>())
        .flatMap(
            res ->
                checkStatusAndConvertLegacyResponse(
                    res,
                    new TypeReference<LegacyFeatureStoreResponse<LegacyBatchWriteResponse>>() {},
                    objectMapper,
                    OFS_V2_SERVICE_UNKNOWN_EXCEPTION))
        .onErrorResumeNext(
            e -> {
              e.printStackTrace();
              return Single.error(e);
            });
  }

  @SneakyThrows
  private Single<WriteBulkCassandraFeaturesResponse> writeDataToOfsV2(
      WriteCassandraFeaturesBatchRequest featuresRequests, Boolean replicateWrites) {
    JsonObject body = new JsonObject(objectMapper.writeValueAsString(featuresRequests));
    return apiHandler
        .call(
            applicationConfig.getOfsWriterHost(),
            applicationConfig.getOfsBatchWriteV1Endpoint(),
            ApiHandler.RequestType.POST,
            body,
            Map.of("replicate-write", replicateWrites.toString()))
        .flatMap(
            res ->
                checkStatusAndConvert(
                    res,
                    new TypeReference<Data<WriteBulkCassandraFeaturesResponse>>() {},
                    objectMapper,
                    OFS_V2_SERVICE_UNKNOWN_EXCEPTION))
        .onErrorResumeNext(
            e -> {
              e.printStackTrace();
              return Single.error(e);
            });
  }

  @SneakyThrows
  private Completable sendFailedRecordsToDlq(KafkaProducerRecord<String, String> record) {
    return producer
        .rxWrite(record)
        .doOnError(e -> log.error("error sending records to dlq for consumer {}", consumerId, e));
  }

  @SneakyThrows
  private Completable sendFailedRecordsToDlq(
      LegacyWriteFeaturesKafkaMessage record, String dlqTopicName) {
    return producer
        .rxWrite(KafkaProducerRecord.create(dlqTopicName, objectMapper.writeValueAsString(record)))
        .doOnError(e -> log.error("error sending records to dlq for consumer {}", consumerId, e));
  }

  // for unprocessable records
  @SneakyThrows
  private Completable sendUnprocessableRecordsToDlq(
      KafkaConsumerRecord<String, String> record, String dlqTopicName) {
    KafkaProducerRecord<String, String> dlqRecord =
        KafkaProducerRecord.create(dlqTopicName, record.value());
    dlqRecord.addHeaders(record.headers());
    return producer
        .rxWrite(dlqRecord)
        .doOnComplete(
            () -> {
              if (!System.getProperty("app.environment").equals("test")) {
                consumerMetricService.incrementDlqFailedMessageCounters(
                    ConsumerCacheKey.builder()
                        .consumerId(consumerId)
                        .topicName(record.topic())
                        .build());
              }
            })
        .doOnError(e -> log.error("error sending records to dlq for consumer {}", consumerId, e));
  }

  private Integer getDefaultFetchSize() {
    return applicationConfig.getDefaultConsumerRecordFetchSize();
  }
}
