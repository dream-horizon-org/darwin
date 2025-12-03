const {SpanStatusCode} = require('@opentelemetry/api')
const {NodeSDK} = require('@opentelemetry/sdk-node')
const {
  getNodeAutoInstrumentations,
} = require('@opentelemetry/auto-instrumentations-node')
const {OTLPTraceExporter} = require('@opentelemetry/exporter-trace-otlp-http')
const {BatchSpanProcessor} = require('@opentelemetry/sdk-trace-node')

// Enable local logging based on environment variable
const enableLocalLogging =
  process.env.OTEL_LOG_LOCALLY === 'true' ||
  process.env.NODE_ENV === 'development'

// Additional instrumentations not in auto-instrumentations
const additionalInstrumentations: any[] = []

// Add GraphQL instrumentation if available with responseHook
try {
  const {
    GraphQLInstrumentation,
  } = require('@opentelemetry/instrumentation-graphql')
  
  const graphqlInstrumentation = new GraphQLInstrumentation({
    allowValues: true,
    depth: -1,
    mergeItems: true,
    responseHook: (span: any, info: any) => {
      // Extract operation details from span attributes
      const spanAttributes = span.attributes || {}
      const spanName = span.name || ''
      const operationType = spanAttributes['graphql.operation.type']
      const operationName = spanAttributes['graphql.operation.name']
      const fieldName = spanAttributes['graphql.field.name']
      
      // Only log for actual operations (queries/mutations/resolvers), not schema parsing
      const isOperation = operationType || spanName.startsWith('query') || spanName.startsWith('mutation')
      const isResolver = fieldName || spanName.includes('resolve')
      
      if (!isOperation && !isResolver) {
        return
      }
      
      const raw =
        info?.errors ??
        info?.result?.errors ??
        info?.response?.errors ??
        info?.data?.errors ??
        null
      const errs = Array.isArray(raw) ? raw : raw ? [raw] : []
      const hasErr = errs.length > 0
      
      span.setAttribute('graphql.execute.error', hasErr ? 'true' : 'false')
      if (hasErr) {
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: 'GraphQL operation failed',
        })
      }

      // Log locally if enabled
      if (enableLocalLogging) {
        const opName = operationName || 'anonymous'
        const opType = operationType || (fieldName ? 'field' : 'operation')
        const operationLabel = fieldName 
          ? `${opType}.${fieldName}`
          : `${opType} ${opName}`
        
        // Skip logging introspection queries to reduce noise
        if (opName === 'IntrospectionQuery') {
          return
        }
        
        console.log(
          `[OTEL Metric] GraphQL ${operationLabel} - Status: ${hasErr ? 'ERROR' : 'SUCCESS'}`
        )
        
        if (hasErr) {
          console.log('[OTEL Metric] Errors:', JSON.stringify(errs, null, 2))
        }
      }
    },
  })
  
  additionalInstrumentations.push(graphqlInstrumentation)
  console.log('[OTEL] GraphQL instrumentation initialized' + (enableLocalLogging ? ' with local logging' : ''))
} catch (e) {
  console.log('[OTEL Debug] GraphQL instrumentation not available:', e)
}

// Configure trace exporters
const traceExporters: any[] = []

// Always add OTLP exporter
const otlpExporter = new OTLPTraceExporter({
  url:
    process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT ||
    'http://localhost:4318/v1/traces',
})
traceExporters.push(otlpExporter)

// Note: ConsoleSpanExporter disabled to avoid verbose output
// Clean metric logs are available via responseHook instead
if (enableLocalLogging) {
  console.log('[OTEL] Local metrics logging enabled (clean logs via responseHook)')
}

const sdk = new NodeSDK({
  serviceName: process.env.SERVICE_NAME || 'ml-platform-graphql',
  spanProcessors: traceExporters.map(
    exporter => new BatchSpanProcessor(exporter) // Use BatchSpanProcessor for better performance
  ),
  instrumentations: [
    getNodeAutoInstrumentations({
      // Disable GraphQL from auto-instrumentations as we configure it separately
      '@opentelemetry/instrumentation-graphql': {enabled: false},
      '@opentelemetry/instrumentation-fs': {enabled: false},
      '@opentelemetry/instrumentation-dns': {enabled: false},
    }),
    ...additionalInstrumentations,
  ],
})

sdk.start()
console.log(
  `OpenTelemetry tracing initialized for ${
    process.env.SERVICE_NAME || 'ml-platform-graphql'
  }`
)
