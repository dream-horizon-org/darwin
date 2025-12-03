import {z} from 'zod'

export type FeatureComputeSchemaType = z.infer<typeof featureComputeSchema>
export type TestDataSchemaType = z.infer<typeof testDataSchema>

const tempTableSchema = z.object({
  name: z.string(),
  id: z.string(),
  query: z.string()
})

const fcInputSchema = z.object({
  name: z.string(),
  queries: z.array(z.string()),
  shape: z.array(z.number()),
  dataType: z.number(),
  tt_id: z.array(z.string())
})

const fcOutputSchema = z.object({
  name: z.string(),
  shape: z.array(z.number()),
  dataType: z.number(),
  tableName: z.string().optional(),
  createTableQuery: z.string().optional(),
  postProcessing: z.object({
    tt_id: z.array(z.string()),
    queries: z.array(z.string())
  })
})

const featureComputeSchema = z.object({
  inputs: z.array(fcInputSchema),
  tempTables: z.array(tempTableSchema),
  outputs: z.array(fcOutputSchema)
})

const schema = z.record(z.array(z.any()))

const nestedNumberArraySchema: z.ZodType<unknown> = z.lazy(() =>
  z.union([z.number(), z.array(nestedNumberArraySchema)])
)

const ouputSchema = z.object({
  name: z.string().min(1),
  shape: z.array(z.number()),
  delta: z.number(),
  desiredOutputs: nestedNumberArraySchema
})

const tdInputSchema = z.object({
  inputsToModel: nestedNumberArraySchema
})

const _predictSchema = z.object({
  input: tdInputSchema,
  output: z.array(ouputSchema)
})

const testDataSchema = z.object({
  gql: schema, // could be optional: not supported in CI
  events: schema,
  featureGroups: schema.optional(),
  predict: _predictSchema
})

export const validateFCSchema = (
  featureCompute: any
): FeatureComputeSchemaType | null => {
  const result = featureComputeSchema.safeParse(featureCompute)
  if (result.success) {
    return result.data
  } else {
    return null
  }
}

export const validateTDSchema = (testData: any): TestDataSchemaType | null => {
  const result = testDataSchema.safeParse(testData)
  if (result.success) {
    return result.data
  } else {
    return null
  }
}
