package com.dream11.populator.service;

import com.dream11.populator.deltareader.RowSerDe;
import com.dream11.populator.util.DataTypeUtils;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.inject.Inject;
import io.delta.kernel.data.Row;
import io.delta.kernel.types.StructType;
import io.reactivex.Completable;
import io.vertx.core.shareddata.Shareable;
import io.vertx.reactivex.kafka.client.producer.KafkaHeader;
import io.vertx.reactivex.kafka.client.producer.KafkaProducer;
import io.vertx.reactivex.kafka.client.producer.KafkaProducerRecord;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import java.nio.charset.StandardCharsets;
import java.util.Map;

import static com.dream11.core.constant.Constants.FEATURE_GROUP_HEADER_NAME;
import static com.dream11.core.constant.Constants.FEATURE_GROUP_RUN_ID_HEADER_NAME;
import static com.dream11.core.constant.Constants.FEATURE_GROUP_VERSION_HEADER_NAME;
import static com.dream11.core.constant.Constants.SDK_V2_HEADER_VALUE;
import static com.dream11.core.constant.Constants.SDK_VERSION_HEADER_NAME;
import static com.dream11.core.constant.Constants.WRITE_REPLICATION_HEADER_NAME;

// TODO: Per-row Kafka send is inefficient for bulk ingestion - batch messages before sending.
// TODO: Error handling in catch block silently swallows exception details - log the actual error.
// TODO: No backpressure handling - fast Delta reader can overwhelm Kafka producer.
@Slf4j
@RequiredArgsConstructor(onConstructor = @__({@Inject}))
public class OfsKafkaWriterService implements Shareable {
  private final KafkaProducer<String, String> producer;
  private final ObjectMapper objectMapper;
  private final WorkerMetricService workerMetricService;

  public Completable sendRecordToKafka(
      Row row,
      StructType readSchema,
      String featureGroupName,
      String featureGroupVersion,
      String topicName,
      String runId,
      Boolean replicateWrites,
      String workerId,
      String tableName) {
    String value = null;
    try{
      Map<String, Object> map = DataTypeUtils.convertRowToJsonObject(row, readSchema);
      value = objectMapper.writeValueAsString(map);
      KafkaProducerRecord<String, String> record = KafkaProducerRecord.create(topicName, value);
      record.addHeader(KafkaHeader.header(FEATURE_GROUP_HEADER_NAME, featureGroupName));
      if(featureGroupVersion != null)
        record.addHeader(KafkaHeader.header(FEATURE_GROUP_VERSION_HEADER_NAME, featureGroupVersion));
      record.addHeader(SDK_VERSION_HEADER_NAME, SDK_V2_HEADER_VALUE);
      record.addHeader(FEATURE_GROUP_RUN_ID_HEADER_NAME, runId);
      record.addHeader(WRITE_REPLICATION_HEADER_NAME, replicateWrites.toString());
      return producer.rxWrite(record)
          .doOnComplete(() -> workerMetricService.processWriteMetrics(1, 0, workerId, tableName))
          .onErrorResumeNext(e -> {
            workerMetricService.processWriteMetrics(0, 1, workerId, tableName);
            return Completable.complete();
          });
    }
    catch (Exception e){
      // error processing update metric
      return Completable.create(emitter -> {
        try{
          workerMetricService.processWriteMetrics(0, 1, workerId, tableName);
        }
        catch (Exception ignore){}
        emitter.onComplete();
      });
    }
  }
}