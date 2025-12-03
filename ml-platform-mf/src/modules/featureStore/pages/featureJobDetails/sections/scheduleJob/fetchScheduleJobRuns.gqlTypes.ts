import * as t from 'io-ts'

export const FetchScheduleJobRunsInputSchema = t.partial({
  featureJobId: t.union([t.undefined, t.null, t.string]),
  version: t.union([t.undefined, t.null, t.number]),
  limit: t.union([t.undefined, t.null, t.number]),
  offset: t.union([t.undefined, t.null, t.number]),
})

export const SelectionOnSchedulerJobRunDetailsSchema = t.type({
  backfillId: t.union([t.null, t.number]),
  queryRunType: t.union([t.null, t.string]),
  jobStatusRun: t.union([t.null, t.string]),
  yarnUrl: t.union([t.null, t.string]),
  resourceTier: t.union([t.null, t.string]),
  comment: t.union([t.null, t.string]),
  createdAt: t.union([t.null, t.string]),
  updatedAt: t.union([t.null, t.string]),
})

export const SelectionOnResponseSchema = t.type({
  schedulerJobRunDetails: t.union([
    t.null,
    t.array(
      t.union([
        t.null,
        t.type({
          backfillId: t.union([t.null, t.number]),
          queryRunType: t.union([t.null, t.string]),
          jobStatusRun: t.union([t.null, t.string]),
          yarnUrl: t.union([t.null, t.string]),
          resourceTier: t.union([t.null, t.string]),
          comment: t.union([t.null, t.string]),
          createdAt: t.union([t.null, t.string]),
          updatedAt: t.union([t.null, t.string]),
        }),
      ])
    ),
  ]),
})

export const SelectionOnFetchScheduleJobRunsSchema = t.type({
  message: t.union([t.null, t.string]),
  comments: t.union([t.null, t.array(t.union([t.null, t.string]))]),
  response: t.union([
    t.null,
    t.type({
      schedulerJobRunDetails: t.union([
        t.null,
        t.array(
          t.union([
            t.null,
            t.type({
              backfillId: t.union([t.null, t.number]),
              queryRunType: t.union([t.null, t.string]),
              jobStatusRun: t.union([t.null, t.string]),
              yarnUrl: t.union([t.null, t.string]),
              resourceTier: t.union([t.null, t.string]),
              comment: t.union([t.null, t.string]),
              createdAt: t.union([t.null, t.string]),
              updatedAt: t.union([t.null, t.string]),
            }),
          ])
        ),
      ]),
    }),
  ]),
})

export const FetchScheduleJobRunsSchema = t.type({
  fetchScheduleJobRuns: t.union([
    t.null,
    t.type({
      message: t.union([t.null, t.string]),
      comments: t.union([t.null, t.array(t.union([t.null, t.string]))]),
      response: t.union([
        t.null,
        t.type({
          schedulerJobRunDetails: t.union([
            t.null,
            t.array(
              t.union([
                t.null,
                t.type({
                  backfillId: t.union([t.null, t.number]),
                  queryRunType: t.union([t.null, t.string]),
                  jobStatusRun: t.union([t.null, t.string]),
                  yarnUrl: t.union([t.null, t.string]),
                  resourceTier: t.union([t.null, t.string]),
                  comment: t.union([t.null, t.string]),
                  createdAt: t.union([t.null, t.string]),
                  updatedAt: t.union([t.null, t.string]),
                }),
              ])
            ),
          ]),
        }),
      ]),
    }),
  ]),
})

export const GraphQLWrapperSchema = t.type({
  query: t.string,
  name: t.string,
  operation: t.keyof({query: null, mutation: null, subscription: null}),
})

export const GQLSchema = t.type({
  query: t.string,
  name: t.string,
  operation: t.keyof({query: null, mutation: null, subscription: null}),
})
