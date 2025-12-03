import { ApolloServer } from "apollo-server-express";
import { makeExecutableSchema } from "graphql-tools";
import * as R from "ramda";
import { formatError } from "./errorHandler";
import { http } from "./src/lib/http-client";
import {
  mutation as mutationString,
  query as queryString,
  schema as schemaString,
  loaderJson as loaderJsonString,
} from "./src/index";
import { config } from "./src/lib/config";
import { DateResolver } from "./src/resolvers/dateResolver";

const createLoaders = (request, response, loaderJson) => {
  const newHttp = {
    get: http.get(request, response),
    post: http.post(request, response),
    put: http.put(request, response),
    patch: http.patch(request, response),
    getWithoutDecode: http.getWithoutDecode(request, response),
    delete: http.delete(request, response),
  };
  return R.applySpec(loaderJsonString)({ HTTP: newHttp }, request);
};

// Create standard GraphQL schema (not a subgraph)
// Note: Auth directives bypassed in Phase 1 - hardcoded user has all permissions
const schema = makeExecutableSchema({
  typeDefs: schemaString,
  resolvers: {
    Query: R.applySpec(R.mergeAll([queryString]))({ HTTP: {} }),
    Mutation: R.applySpec(R.mergeAll([mutationString]))({}),
    Date: DateResolver,
    // Removed type resolvers not in schema (GetExperiment, ExperimentsOutput, GetOwnersOutput, GiveAwayDetails)
    // These were likely from old subgraph federation or removed features
  },
});

const plugin = config.ENABLE_TRACING
  ? [require("apollo-tracing").plugin()]
  : [];

export const ModuleGraphQl = new ApolloServer({
  schema: schema,
  introspection: config.ENABLE_INTROSPECTION,
  context: (ctx) => {
    const newHttp = {
      get: http.get(ctx.req, ctx.res),
      post: http.post(ctx.req, ctx.res),
      put: http.put(ctx.req, ctx.res),
      patch: http.patch(ctx.req, ctx.res),
      getWithoutDecode: http.getWithoutDecode(ctx.req, ctx.res),
      delete: http.delete(ctx.req, ctx.res),
    };
    const loadersJson = R.mergeAll([loaderJsonString]);
    const loader = createLoaders(ctx.req, ctx.res, loadersJson);
    const _request = R.merge({ loader: loader, headers: ctx.req.headers }, ctx);
    return {
      formatError: formatError,
      ..._request,
      request: _request.req,
      response: _request.res,
      HTTP: newHttp,
    };
  },
  plugins: plugin,
});
