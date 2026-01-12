package com.dream11.app.dao.featuredao;

import static com.dream11.core.constant.Constants.*;
import static com.dream11.core.constant.query.CassandraQuery.*;
import static com.dream11.core.util.CassandraDataTypeUtils.setBoundStatementValue;
import static com.dream11.core.util.CassandraDataTypeUtils.setBoundStatementValueWithSize;

import com.datastax.driver.core.BatchStatement;
import com.datastax.driver.core.BoundStatement;
import com.datastax.driver.core.CodecRegistry;
import com.datastax.driver.core.PreparedStatement;
import com.datastax.driver.core.ProtocolVersion;
import com.dream11.caffeine.CaffeineCacheFactory;
import com.dream11.common.app.AppContext;
import com.dream11.core.config.ApplicationConfig;
import com.dream11.core.dto.featurecolumn.CassandraFeatureColumn;
import com.dream11.core.dto.featuredata.CassandraFeatureData;
import com.dream11.core.dto.featuredata.CassandraPartitionData;
import com.dream11.core.dto.featurevalue.interfaces.FeatureValue;
import com.dream11.core.dto.helper.BatchStatementWithSize;
import com.dream11.core.dto.helper.BoundStatementWithSize;
import com.dream11.core.dto.helper.CassandraFeatureVectorAndPrimaryKeyPair;
import com.dream11.core.dto.helper.CassandraFetchRowWithMetadata;
import com.dream11.core.dto.helper.CassandraStatementPrimaryKeyMap;
import com.dream11.core.util.CassandraRowUtils;
import com.github.benmanes.caffeine.cache.AsyncLoadingCache;
import io.reactivex.Completable;
import io.reactivex.Observable;
import io.reactivex.Single;
import io.vertx.reactivex.cassandra.CassandraClient;
import io.vertx.reactivex.core.Vertx;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;

// TODO: Batch size calculation logic in getBatchWriteStatementBySize is complex - extract to dedicated BatchBuilder class.
@Slf4j
public class CassandraFeatureDao implements FeatureDao {
  private static final ProtocolVersion PROTOCOL_VERSION = ProtocolVersion.V4;

  private final AsyncLoadingCache<String, PreparedStatement> preparedStatementCache;

  @Getter private final CassandraClient cassandraClient;
  private final ApplicationConfig applicationConfig =
      AppContext.getInstance(ApplicationConfig.class);

  public CassandraFeatureDao(CassandraClient client, String key) {
    this.cassandraClient = client;
    preparedStatementCache =
        CaffeineCacheFactory.createAsyncLoadingCache(
            AppContext.getInstance(Vertx.class),
            PREPARED_STATEMENT_CAFFEINE_CACHE_NAME
                + (Objects.equals(key, DEFAULT_TENANT_NAME) ? "" : "_" + key),
            this::prepareStmt);
  }

  private Single<PreparedStatement> prepareStmt(String query) {
    return cassandraClient.rxPrepare(query);
  }

  private Single<PreparedStatement> prepareStmtOrGetFromCache(String query) {
    return Single.create(
        emitter ->
            preparedStatementCache
                .get(query)
                .whenComplete(
                    (result, throwable) -> {
                      if (throwable != null) {
                        emitter.onError(throwable);
                      } else {
                        emitter.onSuccess(result);
                      }
                    }));
  }

  // returns payload size written
  public Single<List<Long>> writeFeatures(
      String entityName,
      Set<String> entityFeatures,
      Map<String, CassandraFeatureColumn.CassandraDataType> featureMap,
      String featureGroupName,
      String featureGroupVersion,
      Boolean versionEnabled,
      CassandraFeatureData featuresToWrite,
      List<List<Object>> successfulRows,
      List<List<Object>> failedRows) {

    return prepareStmtOrGetFromCache(
            getInsertFeaturesQuery(
                applicationConfig.getCassandraOfsKeySpace(),
                entityName,
                entityFeatures,
                featureGroupName,
                featureGroupVersion,
                versionEnabled,
                featuresToWrite.getNames()))
        .map(
            preparedStatement ->
                getBatchWriteStatementBySize(
                    preparedStatement, featureMap, featuresToWrite, successfulRows, failedRows))
        .flattenAsObservable(r -> r)
        .flatMap(
            batchStatementWithSize ->
                cassandraClient
                    .rxExecute(batchStatementWithSize.getStatement())
                    .map(ignore -> batchStatementWithSize.getPayloadSizes())
                    .flattenAsObservable(r -> r))
        .toList();
  }



  private List<BatchStatementWithSize> getBatchWriteStatementBySize(
      PreparedStatement preparedStatement,
      Map<String, CassandraFeatureColumn.CassandraDataType> featureMap,
      CassandraFeatureData featuresToWrite,
      List<List<Object>> successfulRows,
      List<List<Object>> failedRows) {
    List<BatchStatementWithSize> batches = new ArrayList<>();

    BatchStatement batchStatements = new BatchStatement(BatchStatement.Type.UNLOGGED);
    List<Long> payloadSize = new ArrayList<>();
    int maxBatchSize = applicationConfig.getCassandraMaxBatchSizeBytes();

    for (List<Object> row : featuresToWrite.getValues()) {
      long rowSize = 0;
      BoundStatement boundStatement = preparedStatement.bind();
      try {
        for (int i = 0; i < row.size(); i++) {
          CassandraFeatureColumn.CassandraDataType dataType =
              featureMap.get(featuresToWrite.getNames().get(i));
          rowSize += setBoundStatementValueWithSize(boundStatement, i, row.get(i), dataType);
        }

        int boundStatementSize =
            getBoundStatementSize(
                boundStatement, PROTOCOL_VERSION, preparedStatement.getCodecRegistry());
        int batchStatementSize =
            getBatchStatementSize(
                batchStatements, PROTOCOL_VERSION, preparedStatement.getCodecRegistry());

        // Check if adding this bound statement exceeds the batch size limit or chunk size limit
        if (batchStatements.size() < applicationConfig.getCassandraBatchChunkSize()
            && boundStatementSize + batchStatementSize < maxBatchSize) {
          batchStatements.add(boundStatement);
          payloadSize.add(rowSize); // Accumulate payload size for this batch
        } else {
          // Add the current batch and reset for a new one
          batches.add(
              BatchStatementWithSize.builder()
                  .statement(batchStatements)
                  .payloadSizes(payloadSize)
                  .build());
          batchStatements = new BatchStatement(BatchStatement.Type.UNLOGGED);
          payloadSize.add(rowSize); // Reset and add the current row's size for the new batch
          batchStatements.add(boundStatement); // Add the bound statement to the new batch
        }

        successfulRows.add(row);
      } catch (Exception e) {
        log.error(
            "Error: {} while binding row: {} to query: {}",
            e.getMessage(),
            row,
            preparedStatement.getQueryString());
        failedRows.add(row);
      }
    }

    // Add the final batch if it has any statements
    if (!batchStatements.getStatements().isEmpty()) {
      batches.add(
          BatchStatementWithSize.builder()
              .statement(batchStatements)
              .payloadSizes(payloadSize)
              .build());
    }

    return batches;
  }

  private BoundStatementWithSize getWriteStatementWithSize(
      PreparedStatement preparedStatement,
      Map<String, CassandraFeatureColumn.CassandraDataType> featureMap,
      List<String> names,
      List<Object> values,
      List<List<Object>> successfulRows,
      List<List<Object>> failedRows) {

    long rowSize = 0;
    BoundStatement boundStatement = preparedStatement.bind();
    try {
      for (int i = 0; i < values.size(); i++) {
        CassandraFeatureColumn.CassandraDataType dataType = featureMap.get(names.get(i));
        rowSize += setBoundStatementValueWithSize(boundStatement, i, values.get(i), dataType);
      }
      successfulRows.add(values);
    } catch (Exception e) {
      log.error(
          "Error: {} while binding row: {} to query: {}",
          e.getMessage(),
          values,
          preparedStatement.getQueryString());
      failedRows.add(values);
    }
    return BoundStatementWithSize.builder().statement(boundStatement).payloadSize(rowSize).build();
  }

  private static Integer getBatchStatementSize(
      BatchStatement batchStatement, ProtocolVersion protocolVersion, CodecRegistry codecRegistry) {
    return batchStatement.requestSizeInBytes(protocolVersion, codecRegistry);
  }

  private static Integer getBoundStatementSize(
      BoundStatement boundStatement, ProtocolVersion protocolVersion, CodecRegistry codecRegistry) {
    return boundStatement.requestSizeInBytes(protocolVersion, codecRegistry);
  }

  private List<CassandraStatementPrimaryKeyMap> getBulkReadStatements(
      PreparedStatement preparedStatement,
      Map<String, CassandraFeatureColumn.CassandraDataType> featureMap,
      CassandraFeatureData primaryKeys,
      List<List<Object>> failedKeys) {
    List<CassandraStatementPrimaryKeyMap> statements = new ArrayList<>();
    for (List<Object> row : primaryKeys.getValues()) {
      BoundStatement boundStatement = preparedStatement.bind();
      try {
        for (int i = 0; i < row.size(); i++) {
          CassandraFeatureColumn.CassandraDataType dataType =
              featureMap.get(primaryKeys.getNames().get(i));
          boundStatement = setBoundStatementValue(boundStatement, i, row.get(i), dataType);
        }
        statements.add(
            CassandraStatementPrimaryKeyMap.builder()
                .statement(boundStatement)
                .primaryKey(row)
                .build());
      } catch (Exception e) {
        log.error(
            "Error: {} while binding row: {} to query: {}",
            e.getMessage(),
            row,
            preparedStatement.getQueryString());
        failedKeys.add(row);
      }
    }
    return statements;
  }

  private CassandraStatementPrimaryKeyMap getPartitionReadStatement(
      PreparedStatement preparedStatement,
      Map<String, CassandraFeatureColumn.CassandraDataType> featureMap,
      CassandraPartitionData partitionKey) {

    CassandraStatementPrimaryKeyMap statement = EMPTY_STATEMENT_PRIMARY_KEY_MAP;
    List<Object> row = partitionKey.getValues();
    BoundStatement boundStatement = preparedStatement.bind();
    try {
      for (int i = 0; i < row.size(); i++) {
        CassandraFeatureColumn.CassandraDataType dataType =
            featureMap.get(partitionKey.getNames().get(i));
        boundStatement = setBoundStatementValue(boundStatement, i, row.get(i), dataType);
      }

      statement =
          CassandraStatementPrimaryKeyMap.builder()
              .statement(boundStatement)
              .primaryKey(row)
              .build();
    } catch (Exception e) {
      log.error(
          "Error: {} while binding row: {} to query: {}",
          e.getMessage(),
          row,
          preparedStatement.getQueryString());
    }
    return statement;
  }

  // TODO: Per-key read queries are zipped sequentially - consider parallel execution for better latency.
  // TODO: failedKeys is a mutable list parameter - return failures as part of response object instead.
  // TODO: e.printStackTrace() don't have structured logging context.
  public Observable<CassandraFeatureVectorAndPrimaryKeyPair> readFeatures(
      String entityName,
      Set<String> entityFeatures,
      String featureGroupName,
      String featureGroupVersion,
      Boolean versionEnabled,
      List<String> featureColumns,
      Map<String, CassandraFeatureColumn.CassandraDataType> featureMap,
      CassandraFeatureData primaryKeys,
      List<List<Object>> failedKeys) {

    return prepareStmtOrGetFromCache(
            getReadFeaturesQuery(
                applicationConfig.getCassandraOfsKeySpace(),
                entityName,
                entityFeatures,
                featureGroupName,
                featureGroupVersion,
                versionEnabled,
                featureColumns,
                primaryKeys.getNames()))
        .map(
            preparedStatement ->
                getBulkReadStatements(preparedStatement, featureMap, primaryKeys, failedKeys))
        .filter(r -> !r.isEmpty())
        .switchIfEmpty(Single.just(new ArrayList<>()))
        .flatMap(this::zipReadQueries)
        .flattenAsObservable(r -> r)
        .onErrorResumeNext(
            e -> {
              e.printStackTrace();
              return Observable.error(e);
            });
  }

  public Observable<CassandraFetchRowWithMetadata> readPartition(
      String entityName,
      Set<String> entityFeatures,
      String featureGroupName,
      String featureGroupVersion,
      Boolean versionEnabled,
      List<String> featureColumns,
      Map<String, CassandraFeatureColumn.CassandraDataType> featureMap,
      CassandraPartitionData partitionKey) {

    return prepareStmtOrGetFromCache(
            getReadFeaturesQuery(
                applicationConfig.getCassandraOfsKeySpace(),
                entityName,
                entityFeatures,
                featureGroupName,
                featureGroupVersion,
                versionEnabled,
                featureColumns,
                partitionKey.getNames()))
        .map(preparedStatement ->
                getPartitionReadStatement(preparedStatement, featureMap, partitionKey))
        .filter(r -> !Objects.equals(r, EMPTY_STATEMENT_PRIMARY_KEY_MAP))
        .toObservable()
        .flatMap(this::executeGetPartitionQuery)
        .onErrorResumeNext(
            e -> {
              e.printStackTrace();
              return Observable.error(e);
            });
  }

  private Single<List<CassandraFeatureVectorAndPrimaryKeyPair>> zipReadQueries(
      List<CassandraStatementPrimaryKeyMap> cassandraStatementPrimaryKeyMaps) {
    List<Single<CassandraFeatureVectorAndPrimaryKeyPair>> li =
        cassandraStatementPrimaryKeyMaps.stream()
            .map(this::executeGetQuery)
            .collect(Collectors.toList());

    if (li.isEmpty()) return Single.just(new ArrayList<>());

    return Single.zip(
        li,
        res -> {
          List<CassandraFeatureVectorAndPrimaryKeyPair> pairList = new ArrayList<>();
          for (Object r : res) {
            pairList.add((CassandraFeatureVectorAndPrimaryKeyPair) r);
          }
          return pairList;
        });
  }

  private Single<List<Long>> zipWriteQueries(List<BoundStatementWithSize> boundStatementWithSizes) {
    List<Completable> li =
        boundStatementWithSizes.stream()
            .map(r -> cassandraClient.rxExecute(r.getStatement()).ignoreElement())
            .collect(Collectors.toList());

    if (li.isEmpty()) return Single.just(new ArrayList<>());

    return Completable.merge(li)
        .andThen(
            Observable.fromIterable(boundStatementWithSizes)
                .map(BoundStatementWithSize::getPayloadSize)
                .toList());
  }

  private Single<CassandraFeatureVectorAndPrimaryKeyPair> executeGetQuery(
      CassandraStatementPrimaryKeyMap statementPrimaryKeyMap) {
    return cassandraClient
        .rxExecuteWithFullFetch(statementPrimaryKeyMap.getStatement())
        .flattenAsObservable(r -> r)
        .map(CassandraRowUtils::convertCassandraRowToJsonWithMetadata)
        .firstElement()
        .switchIfEmpty(
            Single.just(
                CassandraFetchRowWithMetadata.builder().row(EMPTY_JSON_OBJECT).size(0L).build()))
        .map(
            cassandraFetchRowWithMetadata ->
                CassandraFeatureVectorAndPrimaryKeyPair.builder()
                    .failed(cassandraFetchRowWithMetadata.getRow().isEmpty())
                    .featureVector(cassandraFetchRowWithMetadata.getRow())
                    .primaryKey(statementPrimaryKeyMap.getPrimaryKey())
                    .size(cassandraFetchRowWithMetadata.getSize())
                    .build());
  }

  private Observable<CassandraFetchRowWithMetadata> executeGetPartitionQuery(
      CassandraStatementPrimaryKeyMap statementPrimaryKeyMap) {
    return cassandraClient
        .rxExecuteWithFullFetch(statementPrimaryKeyMap.getStatement())
        .flattenAsObservable(r -> r)
        .map(CassandraRowUtils::convertCassandraRowToJsonWithMetadata);
  }

  public FeatureValue getFeatures() {
    return null;
  }
}
