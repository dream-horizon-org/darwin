import * as R from "ramda";

export const updateFeatureJob = (io) => (current, args, request) => {
  const newArgs: any = R.prop("input")(args);
  const data = newArgs.createFeatureJob;
  return request.HTTP.put(
    `/mlp/feature-job/v0/?featureJobId=${newArgs.featureJobId}&version=${newArgs.version}`,
    R.merge({ service: "FEATURE_STORE" }, request.headers),
    data
  );
};
