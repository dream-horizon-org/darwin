package com.dream11.consumer.util;

import com.dream11.core.dto.featuredata.CassandraFeatureData;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;

// TODO: Similar message serialization logic exists in spark module (MessageUtils) - consolidate into core module.
// TODO: throws Throwable is too broad - use JsonProcessingException for better error handling.
@Slf4j
public class KafkaMessageUtils {

  public static List<String> createFeatureDataMessages(ObjectMapper objectMapper, CassandraFeatureData featureData)
      throws Throwable {
    List<String> messageList = new ArrayList<>();
    for (int i = 0; i < featureData.getValues().size(); i++) {
      Map<String, Object> map = new HashMap<>();
      for (int j = 0; j < featureData.getNames().size(); j++) {
        String featureName = featureData.getNames().get(j);
        map.put(featureName, featureData.getValues().get(i).get(j));
      }
      messageList.add(objectMapper.writeValueAsString(map));
    }
    return messageList;
  }
}
