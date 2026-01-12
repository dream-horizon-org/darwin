package com.dream11.spark.writer;

import com.dream11.spark.utils.KafkaProducerUtils;
import com.dream11.spark.utils.MessageUtils;
import com.dream11.spark.utils.SchemaUtils;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import org.apache.kafka.clients.producer.KafkaProducer;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.spark.sql.catalyst.InternalRow;
import org.apache.spark.sql.connector.write.DataWriter;
import org.apache.spark.sql.connector.write.WriterCommitMessage;
import org.apache.spark.sql.types.StructField;
import org.apache.spark.sql.types.StructType;

// TODO: KafkaProducer created per partition - consider shared producer pool for better resource utilization.
// TODO: Synchronous send with callback that throws - consider async batching for better throughput.
// TODO: abort() is empty - should handle partial write cleanup if task fails mid-execution.
public class OfsDataWriter implements DataWriter<InternalRow> {
  private final Integer partitionId;
  private final Long taskId;
  private final StructType schema;
  private final String featureGroupName;
  private final String featureGroupVersion;
  private final String kafkaTopic;
  private final String runId;
  private final KafkaProducer<String, String> producer;

  public OfsDataWriter(
      Integer partitionId,
      Long taskId,
      StructType schema,
      String featureGroupName,
      String featureGroupVersion,
      String kafkaHost,
      String kafkaTopic,
      String runId) {
    this.partitionId = partitionId;
    this.taskId = taskId;
    this.schema = schema;
    this.featureGroupName = featureGroupName;
    this.featureGroupVersion = featureGroupVersion;
    this.kafkaTopic = kafkaTopic;
    this.producer = KafkaProducerUtils.create(kafkaHost);
    this.runId = runId;
  }

  @Override
  public void write(InternalRow row) {
    Map<String, Object> featureMap = MessageUtils.parseSparkRow(row, schema);
    String message;
    try {
      message = MessageUtils.parseMap(featureMap);
    } catch (Throwable e) {
      throw new RuntimeException("error processing row", e);
    }
    ProducerRecord<String, String> producerRecord = new ProducerRecord<>(kafkaTopic, message);

    producerRecord
        .headers()
        .add("sdk-version", "v2".getBytes(StandardCharsets.UTF_8))
        .add("run-id", runId.getBytes(StandardCharsets.UTF_8))
        .add("feature-group-name", featureGroupName.getBytes(StandardCharsets.UTF_8));
    if (featureGroupVersion != null)
      producerRecord
          .headers()
          .add("feature-group-version", featureGroupVersion.getBytes(StandardCharsets.UTF_8));

    producer.send(producerRecord, (metadata, exception) -> {
      if (exception != null) {
        throw new RuntimeException("Error sending Kafka message", exception);
      }
    });
  }

  @Override
  public WriterCommitMessage commit() {
    producer.flush();
    return null;
  }

  @Override
  public void abort() {}

  @Override
  public void close() {
    producer.flush();
    producer.close();
  }
}
