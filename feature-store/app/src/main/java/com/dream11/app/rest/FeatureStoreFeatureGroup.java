package com.dream11.app.rest;

import static com.dream11.core.constant.Constants.FeatureStoreType.cassandra;

import com.dream11.core.constant.Constants;
import com.dream11.core.dto.request.interfaces.UpdateFeatureGroupRequest;
import com.dream11.core.dto.response.ReadCassandraFeaturesResponse;
import com.dream11.core.dto.response.ReadCassandraPartitionResponse;
import com.dream11.core.dto.response.WriteBulkCassandraFeaturesResponse;
import com.dream11.core.dto.response.interfaces.*;
import com.dream11.app.service.FeatureGroupService;
import com.dream11.rest.io.Response;
import com.dream11.rest.io.RestResponse;
import com.google.inject.Inject;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.vertx.core.json.JsonObject;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletionStage;
import javax.validation.constraints.NotNull;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

// TODO: featureStoreType defaults to cassandra inline - extract default handling to configuration.
// TODO: replicationEnabled defaults to true inline - document why and make configurable.
@Slf4j
@RequiredArgsConstructor(onConstructor = @__({@Inject}))
@Path("/feature-group")
public class FeatureStoreFeatureGroup {
  // TODO: Add request validation (schema, size limits, required fields) before processing.

  private final FeatureGroupService featureGroupService;

  @POST
  @Path("/write-features-v2")
  @Consumes(MediaType.WILDCARD)
  @Produces(MediaType.APPLICATION_JSON)
  public CompletionStage<Response<WriteFeaturesResponse>> writeFeaturesV2(
      @RequestBody @NotNull Map<String, Object> writeFeaturesRequest,
      @HeaderParam(value = "feature-store-type") Constants.FeatureStoreType featureStoreType,
      @HeaderParam(value = "replicate-write") Boolean replicationEnabled) {
    if (featureStoreType == null) featureStoreType = cassandra;
    if (replicationEnabled == null) replicationEnabled = true;
    return featureGroupService
        .writeFeaturesV2(new JsonObject(writeFeaturesRequest), featureStoreType, replicationEnabled)
        .to(RestResponse.jaxrsRestHandler());
  }

  @POST
  @Path("/write-features-v1")
  @Consumes(MediaType.WILDCARD)
  @Produces(MediaType.APPLICATION_JSON)
  public CompletionStage<Response<WriteBulkFeaturesResponse>> writeFeaturesV1(
      @RequestBody @NotNull Map<String, Object> writeFeaturesRequest,
      @HeaderParam(value = "feature-store-type") Constants.FeatureStoreType featureStoreType,
      @HeaderParam(value = "replicate-write") Boolean replicationEnabled) {
    if (featureStoreType == null) featureStoreType = cassandra;
    if (replicationEnabled == null) replicationEnabled = true;
    return featureGroupService
        .writeFeaturesV1(new JsonObject(writeFeaturesRequest), featureStoreType, replicationEnabled)
        .to(RestResponse.jaxrsRestHandler());
  }

  @GET
  @Path("/read-features")
  @Consumes(MediaType.WILDCARD)
  @Produces(MediaType.APPLICATION_JSON)
  public CompletionStage<Response<ReadFeaturesResponse>> readFeatures(
      @RequestBody @NotNull Map<String, Object> readFeaturesRequest,
      @HeaderParam(value = "feature-store-type") Constants.FeatureStoreType featureStoreType) {
    if (featureStoreType == null) featureStoreType = cassandra;
    return featureGroupService
        .readFeatures(new JsonObject(readFeaturesRequest), featureStoreType)
        .to(RestResponse.jaxrsRestHandler());
  }

  @GET
  @Path("/multi-read-features")
  @Consumes(MediaType.WILDCARD)
  @Produces(MediaType.APPLICATION_JSON)
  public CompletionStage<Response<List<ReadFeaturesResponse>>> multiReadFeatures(
      @RequestBody @NotNull Map<String, Object> readFeaturesRequest,
      @HeaderParam(value = "feature-store-type") Constants.FeatureStoreType featureStoreType) {
    if (featureStoreType == null) featureStoreType = cassandra;
    return featureGroupService
        .multiReadFeatures(new JsonObject(readFeaturesRequest), featureStoreType)
        .to(RestResponse.jaxrsRestHandler());
  }

  @GET
  @Path("/read-partition")
  @Consumes(MediaType.WILDCARD)
  @Produces(MediaType.APPLICATION_JSON)
  public CompletionStage<Response<ReadCassandraPartitionResponse>> readFeaturePartition(
      @RequestBody @NotNull Map<String, Object> readPartitionRequest,
      @HeaderParam(value = "feature-store-type") Constants.FeatureStoreType featureStoreType) {
    if (featureStoreType == null) featureStoreType = cassandra;
    return featureGroupService
        .readFeaturePartition(new JsonObject(readPartitionRequest), featureStoreType)
        .to(RestResponse.jaxrsRestHandler());
  }
}
