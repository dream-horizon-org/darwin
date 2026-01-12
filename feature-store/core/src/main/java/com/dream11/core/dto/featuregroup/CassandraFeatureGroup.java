package com.dream11.core.dto.featuregroup;

import com.dream11.core.dto.featurecolumn.CassandraFeatureColumn;
import com.dream11.core.dto.featuregroup.interfaces.FeatureGroup;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

// TODO: Default values (versionEnabled=TRUE, featureGroupType=ONLINE) may be overwritten by builder - use @Builder.Default.
// TODO: No validation that entityName references existing entity - foreign key constraint only enforced at runtime.
// TODO: FeatureGroupType enum nested inside class - consider moving to separate file for reuse.
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CassandraFeatureGroup implements FeatureGroup {
    private String featureGroupName;
    private Boolean versionEnabled = Boolean.TRUE;
    private FeatureGroupType featureGroupType = FeatureGroupType.ONLINE;
    private String entityName;
    private List<CassandraFeatureColumn> features;

    public static Boolean searchSubString(CassandraFeatureGroup cassandraFeatureGroup, String searchPattern){
        if(cassandraFeatureGroup.getFeatureGroupName().contains(searchPattern))
            return Boolean.TRUE;
        for (CassandraFeatureColumn feature : cassandraFeatureGroup.getFeatures()) {
            if(feature.getFeatureName().contains(searchPattern))
                return Boolean.TRUE;
        }
        return Boolean.FALSE;
    }

    public static List<String> getFeatureNames(CassandraFeatureGroup cassandraFeatureGroup){
        List<String> li = new ArrayList<>();
        for (CassandraFeatureColumn feature : cassandraFeatureGroup.getFeatures()) {
            li.add(feature.getFeatureName());
        }
        return li;
    }

    public enum FeatureGroupType  {
        ONLINE, OFFLINE}
}
