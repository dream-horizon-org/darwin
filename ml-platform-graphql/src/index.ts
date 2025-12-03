import { loadFilesSync } from "@graphql-tools/load-files";
import { mergeTypeDefs } from "@graphql-tools/merge";
import * as path from "path";
import * as R from "ramda";

import { loaders } from "./loaders";
import { mutations, queries } from "./resolvers";

const schemaString = loadFilesSync(path.join(__dirname, "schema"));
const computeSchemaString = loadFilesSync(
  path.join(__dirname, "schema/compute")
);
const bringYourOwnRuntimeSchemaString = loadFilesSync(
  path.join(__dirname, "schema/bring-your-own-runtime")
);
const modelDeploymentsSchemaString = loadFilesSync(
  path.join(__dirname, "schema/model-deployments")
);

export const schema = mergeTypeDefs([
  schemaString,
  bringYourOwnRuntimeSchemaString,
  computeSchemaString,
  modelDeploymentsSchemaString,
]);
export const query = R.mergeAll([queries]);
export const mutation = R.mergeAll([mutations]);
export const loaderJson = R.mergeAll([loaders]);
