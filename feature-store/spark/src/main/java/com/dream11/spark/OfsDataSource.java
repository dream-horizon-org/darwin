package com.dream11.spark;

import com.dream11.spark.dto.GetCassandraFeatureGroupSchemaResponse;
import com.dream11.spark.service.OfsAdminService;
import com.dream11.spark.utils.SchemaUtils;
import com.dream11.spark.writer.OfsTable;
import java.util.Map;
import org.apache.spark.sql.connector.catalog.*;
import org.apache.spark.sql.connector.expressions.Transform;
import org.apache.spark.sql.sources.DataSourceRegister;
import org.apache.spark.sql.types.StructType;
import org.apache.spark.sql.util.CaseInsensitiveStringMap;

import static com.dream11.spark.constant.Constants.FEATURE_GROUP_NAME_KEY;
import static com.dream11.spark.constant.Constants.FEATURE_GROUP_VERSION_KEY;
import static com.dream11.spark.constant.Constants.TEAM_SUFFIX_KEY;
import static com.dream11.spark.constant.Constants.VPC_SUFFIX_KEY;

// TODO: adminService is mutable instance variable set in inferSchema - not thread-safe for concurrent schema inference.
// TODO: No caching of schema - each write job fetches schema from admin service.
// TODO: Error messages ("feature-group-name cannot be null") should include context about valid options.
public class OfsDataSource implements DataSourceRegister, TableProvider {
  private OfsAdminService adminService;

  @Override
  public String shortName() {
    return "ofs";
  }

  @Override
  public StructType inferSchema(CaseInsensitiveStringMap options) {
    String teamSuffix = options.getOrDefault(TEAM_SUFFIX_KEY, "");
    String vpcSuffix = options.getOrDefault(VPC_SUFFIX_KEY, "");
    String featureGroupName = options.get(FEATURE_GROUP_NAME_KEY);
    if (featureGroupName == null || featureGroupName.isEmpty())
      throw new RuntimeException("feature-group-name cannot be null or empty");
    String featureGroupVersion = options.get(FEATURE_GROUP_VERSION_KEY);

    this.adminService = new OfsAdminService(options, teamSuffix, vpcSuffix);
    GetCassandraFeatureGroupSchemaResponse response;
    response = adminService.getSchemaFromAdmin(featureGroupName, featureGroupVersion);
    return SchemaUtils.getSparkSchemaForFg(response);
  }

  @Override
  public Table getTable(
      StructType schema, Transform[] partitioning, Map<String, String> properties) {
    return new OfsTable(schema, properties, adminService);
  }
}
