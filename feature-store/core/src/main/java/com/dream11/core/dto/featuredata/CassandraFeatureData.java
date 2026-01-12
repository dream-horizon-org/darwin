package com.dream11.core.dto.featuredata;

import java.util.List;

import com.dream11.core.dto.featuredata.interfaces.FeatureData;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// TODO: No validation that values inner lists match names length - mismatch causes runtime errors.
// TODO: List<Object> loses type safety - consider generic type parameter or typed value wrapper.
// TODO: Mutable lists allow modification after construction - consider immutable collections.
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CassandraFeatureData implements FeatureData {
  private List<String> names;
  private List<List<Object>> values;
}
