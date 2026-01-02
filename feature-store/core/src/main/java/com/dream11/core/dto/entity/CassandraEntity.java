package com.dream11.core.dto.entity;

import com.dream11.core.dto.entity.interfaces.Entity;
import com.dream11.core.dto.featurecolumn.CassandraFeatureColumn;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

// TODO: No validation that primaryKeys are subset of features - invalid entities can be created.
// TODO: ttl can be null - document default behavior when TTL is not specified.
// TODO: searchSubString is a utility method that doesn't belong on the data class - move to EntityUtils.
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CassandraEntity implements Entity {
    private String tableName;
    private List<CassandraFeatureColumn> features;
    private List<String> primaryKeys;
    private Long ttl;

    public static Boolean searchSubString(CassandraEntity cassandraEntity, String searchPattern){
        if(cassandraEntity.getTableName().contains(searchPattern))
            return Boolean.TRUE;
        for (CassandraFeatureColumn feature : cassandraEntity.getFeatures()) {
            if(feature.getFeatureName().contains(searchPattern))
                return Boolean.TRUE;
        }
        return Boolean.FALSE;
    }
}
