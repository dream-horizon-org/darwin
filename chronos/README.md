# Chronos - Event Processing System

Chronos is an event processing platform that ingests raw events from multiple sources, transforms them using configurable transformers, and produces processed events with entities and relationships.

## 📖 API Documentation

- **Swagger UI**: [http://localhost/chronos/docs](http://localhost/chronos/docs)
## 🏗️ Architecture 

```
Raw Events (API) → Queue (SQS/Kafka) → Consumer → Transformers → Processed Events
                                                  
```

### Components

1. **API Server** (`main.py`) - Receives raw events and manages configuration
2. **Consumer Service** (`start_consumer.py`) - Processes events from queue using transformers
3. **Sources** - Define event origins (e.g., compute-service, aws, k8s)
4. **Transformers** - Convert raw events to processed events with entities/links
5. **Queue** - Message broker (SQS or Kafka) for async processing

## 📝 Core Concepts

### 1. Sources

Sources represent event origins with specific content types. Create a source before sending events.

**Example:**
```bash
curl -X POST "http://localhost/chronos/api/v1/sources/" \
  -H "Content-Type: application/json" \
  -d '{
    "SourceName": "compute-service",
    "EventFormatType": "application/json"
  }'
```

**Supported Content Types:** `application/json`, `text/plain`, `application/octet-stream`

### 2. Transformers

Transformers process raw events and generate:
- **Processed Events** - Enriched events with type, severity, and context
- **Entities** - Objects like clusters, users, workspaces
- **Links** - Relationships between entities

**Types:**
- **PythonTransformer** - Custom Python code for complex transformations
- **JSONTransformer** - JSONPath-based transformations for simple mappings

**Create Python Transformer:**
```bash
curl -X POST "http://localhost/chronos/api/v1/transformers/" \
  -H "Content-Type: application/json" \
  -d '{
    "TransformerName": "compute-events-transformer",
    "TransformerType": "PythonTransformer",
    "SourceID": 1,
    "ScriptPath": "src.transformers.python_transformers.compute_app_layer_transformer",
    "IsActive": true
  }'
```

**Python Transformer Example:**
```python
from src.transformers.base_python_transformer import BasePythonTransformer
from src.dto.schema.base_transformers import TransformerOutput

class ComputeEventsTransformer(BasePythonTransformer):
    async def transform(self, event_data: RawEvent) -> TransformerOutput:
        raw_data = json.loads(event_data.EventData)
        
        return TransformerOutput(
            processed_events=[{
                'EventType': 'CLUSTER_CREATED',
                'EntityID': raw_data['cluster_id'],
                'EventData': raw_data,
                'Severity': 'INFO'
            }],
            entities=[{
                'EntityID': raw_data['cluster_id'],
                'EntityType': 'Cluster'
            }],
            links=[{
                'SourceEntityID': raw_data['cluster_id'],
                'DestinationEntityID': raw_data['cluster_name']
            }]
        )
```

### 3. Raw Events

Raw events are ingested via API and queued for processing.

**Create Event:**
```bash
curl -X POST "http://localhost/chronos/api/v1/event" \
  -H "x-event-source: compute-service" \
  -H "Content-Type: application/json" \
  -d '{
    "cluster_id": "cluster-123",
    "cluster_name": "prod-cluster",
    "event_type": "CLUSTER_CREATED",
    "message": "Cluster created successfully"
  }'
```

**Headers:**
- `x-event-source` (required) - Source name matching a registered source
- `Content-Type` (required) - Must match source's EventFormatType
- `x-event-timestamp` (optional) - Event timestamp (defaults to current time)

### 4. Event Processing Flow

1. **Ingestion**: Raw event posted to `/event` endpoint
2. **Storage**: Event saved to `raw_events` table
3. **Queue**: Event ID sent to SQS/Kafka queue
4. **Consumer**: Picks up event from queue
5. **Source Lookup**: Finds source by name and content type
6. **Transformer Discovery**: Gets all active transformers for source
7. **Transformation**: Each transformer processes the event
8. **Persistence**: Saves processed events, entities, and links to database

### 5. Processed Events

Processed events contain enriched data with typing, severity, and entity associations.

**Query Processed Events:**
```bash
# Get all processed events
curl "http://localhost/chronos/api/v1/processed_events/"

# Filter by entity
curl "http://localhost/chronos/api/v1/processed_events/?entity_id=cluster-123"

# Filter by event type
curl "http://localhost/chronos/api/v1/processed_events/?event_type=CLUSTER_CREATED"
```

## 🗂️ Project Structure

```
chronos/
├── src/
│   ├── main.py                     # API server entry point
│   ├── start_consumer.py           # Consumer service entry point
│   ├── rest/                       # API endpoints
│   │   ├── raw_event.py           # Raw event APIs
│   │   ├── processed_event.py     # Processed event APIs
│   │   ├── source.py              # Source management
│   │   └── transformer.py         # Transformer management
│   ├── service/                    # Business logic
│   │   ├── event_processor_service.py  # Core event processing
│   │   ├── raw_events.py
│   │   ├── processed_events.py
│   │   ├── sources.py
│   │   └── transformers.py
│   ├── transformers/               # Transformation logic
│   │   ├── python_transformers/   # Custom Python transformers
│   │   ├── base_python_transformer.py
│   │   ├── json_transformer.py
│   │   └── registry.py            # Transformer registry
│   ├── consumers/                  # Queue consumers
│   │   ├── consumer_worker.py     # Kafka consumer
│   │   └── sqs_consumer_worker.py # SQS consumer
│   ├── dao/                        # Data access layer
│   ├── dto/                        # Data transfer objects
│   ├── models/                     # Database models
│   └── util/                       # Utilities (OTEL, logging)
├── resources/
│   └── db/mysql/migrations/        # Database migrations
├── tests/                          # Test files
└── pytest.ini                      # Pytest configuration
```

## 📊 Database Schema

### Key Tables
- **raw_events** - Incoming events from sources
- **processed_events_v2** - Transformed events with types and severity
- **sources** - Event source configurations
- **transformers** / **python_transformers** / **json_transformers** - Transformation rules
- **entities** - Objects extracted from events (clusters, users, etc.)
- **links** - Relationships between entities

## 🔧 Configuration Files

- **resources/db/mysql/connection-*.conf** - MySQL connection configs

### Health Check
```bash
curl http://localhost/chronos/healthcheck
curl http://localhost/chronos-consumer/healthcheck
```

## 🤝 Contributing

1. Create a new transformer in `src/transformers/python_transformers/`
2. Extend `BasePythonTransformer` class
3. Implement `transform()` method
4. Register transformer via API
5. Test with sample events

## 📚 Additional Documentation

- [Transformers README](src/transformers/README.md) - Detailed transformer development guide
- [Consumers README](src/consumers/README.md) - Queue consumer configuration