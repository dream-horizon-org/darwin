# Feature Store — Architecture Documentation

This document provides a comprehensive architectural overview of the Darwin Feature Store (OFS v2), a high-performance online feature serving system designed for ML feature management at scale.

---

## Table of Contents

- [System Overview](#system-overview)
- [Architecture Diagram](#architecture-diagram)
- [Module Structure](#module-structure)
- [Component Deep Dive](#component-deep-dive)
- [Data Flow](#data-flow)
- [Performance at Scale: 200M+ RPM](#performance-at-scale-200m-rpm)
- [Deployment Patterns](#deployment-patterns)
- [Operational Guidance](#operational-guidance)

---

## System Overview

The Darwin Feature Store is a distributed feature management platform that provides:

- **Online Feature Serving**: Single digit millisecond reads from Cassandra/ScyllaDB clusters
- **Streaming Ingestion**: Kafka-based async writes with exactly-once semantics
- **Batch Ingestion**: Spark and Delta Lake integration for bulk feature materialization
- **Multi-Tenancy**: Isolated tenant clusters with configurable reader/writer/consumer routing
- **Schema Management**: Versioned feature groups with entity-based organization

### Key Capabilities

| Capability | Description |
|------------|-------------|
| Read Latency | P99 < 4ms at 200M+ RPM |
| Write Throughput | Millions of feature updates per minute via Kafka |
| Storage | Cassandra/ScyllaDB with configurable TTL |
| Metadata | MySQL-backed with S3 backup |
| SDK Support | Python (sync/async), Spark, REST API |

---

## Architecture Diagram

![Feature Store Architecture](docs/architecture.png)

*Diagram created with draw.io — credit: draw.io.*

The architecture follows a layered design:

1. **Admin Layer**: Metadata management, schema registry, tenant configuration
2. **User-Facing App Layer**: Online feature reads/writes via REST API
3. **Consumer Fleet**: Kafka consumers for async materialization
4. **Scylla Clusters Fleet**: Distributed storage with tenant-based partitioning
5. **Delta Tables**: Offline feature storage for batch access

---

## Module Structure

```
feature-store/
├── core/               # Shared DTOs, utilities, configs
├── app/                # Online Feature Serving API (darwin-ofs-v2)
├── admin/              # Metadata & Admin Service (darwin-ofs-v2-admin)
├── consumer/           # Kafka Consumer Service (darwin-ofs-v2-consumer)
├── populator/          # Bulk Ingestion via Delta Tables (darwin-ofs-v2-populator)
├── spark/              # Spark DataSource for batch writes
├── python/             # Python SDK (darwin_fs)
├── config/             # Environment-specific configurations
├── .odin/              # Build & deployment scripts
└── pom.xml             # Maven parent POM
```

### Module Dependencies

```
                    ┌─────────────┐
                    │    core     │
                    └──────┬──────┘
           ┌───────────────┼───────────────┐
           │               │               │
     ┌─────▼─────┐   ┌─────▼─────┐   ┌─────▼─────┐
     │    app    │   │   admin   │   │  consumer │
     └───────────┘   └───────────┘   └───────────┘
           │               │               │
           └───────────────┼───────────────┘
                           │
                    ┌──────▼──────┐
                    │  populator  │
                    └─────────────┘
                           │
                    ┌──────▼──────┐
                    │    spark    │
                    └─────────────┘
```

---

## Component Deep Dive

### 1. Core Module (`core/`)

**Purpose**: Shared library containing DTOs, utilities, and configurations used across all services.

**Key Packages**:
- `dto/` — Data transfer objects for features, entities, requests/responses
- `config/` — Application configuration classes (Cassandra, Kafka, MySQL)
- `util/` — Utilities for Cassandra operations, compression, caching
- `constant/` — System constants and query templates
- `error/` — Custom exceptions and error handling

**Key Classes**:
- `CassandraFeatureGroup` — Feature group definition with schema
- `CassandraEntity` — Entity definition with primary keys and TTL
- `CassandraFeatureData` — Feature vector data structure
- `ApplicationConfig` — Centralized configuration holder

---

### 2. Online Feature Serving (`app/`)

**Service Name**: `darwin-ofs-v2`  
**Deployment**: Vert.x-based microservice with horizontal scaling  
**Port**: 8080

**Purpose**: High-performance REST API for online feature reads and writes.

**Key Endpoints**:
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/feature-group/read` | POST | Read features by primary keys |
| `/v1/feature-group/write` | POST | Write features synchronously |
| `/v1/feature-group/batch-write` | POST | Batch write multiple feature groups |
| `/v1/feature-group/partition/read` | POST | Read entire partition |
| `/health` | GET | Health check |
| `/metrics` | GET | Prometheus metrics |

**Architecture**:
```
┌─────────────────────────────────────────────────────────┐
│                    RestVerticle                         │
│  (Event Loop Pool - N-1 instances)                      │
└─────────────────────┬───────────────────────────────────┘
                      │
         ┌────────────▼────────────┐
         │  CassandraFeatureStore  │
         │       Service           │
         └────────────┬────────────┘
                      │
    ┌─────────────────┼─────────────────┐
    │                 │                 │
┌───▼───┐      ┌──────▼──────┐    ┌─────▼─────┐
│ Cache │      │ MetaStore   │    │ Cassandra │
│(Caffeine)    │  Service    │    │   DAO     │
└───────┘      └─────────────┘    └───────────┘
```

**Key Features**:
- **Caffeine Cache**: In-memory caching for metadata and prepared statements
- **Reactive I/O**: RxJava-based async processing
- **Multi-Tenant**: Routes reads/writes to appropriate Cassandra clusters
- **Replication**: Optional dual-write to reader and writer clusters

---

### 3. Admin Service (`admin/`)

**Service Name**: `darwin-ofs-v2-admin`  
**Deployment**: Single instance (can be scaled for HA)  
**Port**: 8080

**Purpose**: Metadata management, schema registry, and administrative operations.

**Key Endpoints**:
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/entity` | POST | Create entity |
| `/v1/entity/{name}` | GET | Get entity metadata |
| `/v1/feature-group` | POST | Create feature group |
| `/v1/feature-group/{name}` | GET | Get feature group metadata |
| `/v1/feature-group/{name}/schema` | GET | Get feature group schema |
| `/v1/tenant` | POST/GET | Manage tenant configurations |
| `/v1/search` | GET | Search entities/feature groups |

**Responsibilities**:
- Entity and Feature Group CRUD operations
- Schema versioning and validation
- Tenant configuration management
- Metadata backup to S3
- Consumer group management
- Kafka topic administration

**Data Model**:
```
┌─────────────────┐     ┌─────────────────────┐
│     Entity      │     │    Feature Group    │
├─────────────────┤     ├─────────────────────┤
│ name            │◄────│ entity_name         │
│ primary_keys[]  │     │ name                │
│ features[]      │     │ version             │
│ ttl             │     │ features[]          │
│ tags[]          │     │ type (ONLINE/OFFLINE)│
│ owner           │     │ tenant_config       │
└─────────────────┘     │ tags[], owner       │
                        └─────────────────────┘
```

---

### 4. Consumer Service (`consumer/`)

**Service Name**: `darwin-ofs-v2-consumer`  
**Deployment**: Horizontally scaled Kafka consumers  
**Coordination**: Apache Helix for partition assignment

**Purpose**: Async feature materialization from Kafka to Cassandra.

**Architecture**:
```
┌────────────────────────────────────────────────────┐
│              Helix Controller                       │
│  (Partition assignment & rebalancing)              │
└──────────────────────┬─────────────────────────────┘
                       │
    ┌──────────────────┼──────────────────┐
    │                  │                  │
┌───▼───┐         ┌────▼────┐        ┌────▼────┐
│Consumer│         │Consumer │        │Consumer │
│  Pod 1 │         │  Pod 2  │        │  Pod N  │
└───┬────┘         └────┬────┘        └────┬────┘
    │                   │                  │
    └───────────────────┼──────────────────┘
                        │
                ┌───────▼───────┐
                │ Kafka Topics  │
                │ (per tenant)  │
                └───────┬───────┘
                        │
                ┌───────▼───────┐
                │ OFS Writer    │
                │ (HTTP calls)  │
                └───────────────┘
```

**Key Features**:
- **Batch Processing**: Groups messages by feature group for efficient writes
- **SDK Version Support**: Handles v1 (legacy) and v2 message formats
- **DLQ Handling**: Failed messages routed to Dead Letter Queue
- **Backpressure**: Controlled fetch size and commit intervals
- **Auto-Scaling**: AWS-based resource auto-scaler integration

**Message Flow**:
1. Consumer polls Kafka topic (tenant-specific)
2. Messages grouped by SDK version and feature group
3. Batched write to OFS Writer service
4. Failed records sent to DLQ
5. Offset committed on success

---

### 5. Populator Service (`populator/`)

**Service Name**: `darwin-ofs-v2-populator`  
**Deployment**: Helix-coordinated workers  
**Purpose**: Bulk ingestion from Delta Tables to Kafka

**Architecture**:
```
┌─────────────────────────────────────────┐
│           Helix Controller              │
└─────────────────┬───────────────────────┘
                  │
    ┌─────────────┼─────────────┐
    │             │             │
┌───▼───┐    ┌────▼────┐   ┌────▼────┐
│Worker │    │ Worker  │   │ Worker  │
│  1    │    │   2     │   │   N     │
└───┬───┘    └────┬────┘   └────┬────┘
    │             │             │
    └─────────────┼─────────────┘
                  │
          ┌───────▼───────┐
          │ Delta Tables  │
          │    (S3)       │
          └───────┬───────┘
                  │
          ┌───────▼───────┐
          │ Kafka Topics  │
          └───────────────┘
```

**Key Components**:
- `TableReader` — Reads Delta Table files from S3
- `RowSerDe` — Serializes rows to Kafka messages
- `OfsKafkaWriterService` — Produces messages to tenant topics

---

### 6. Spark Integration (`spark/`)

**Purpose**: Spark DataSource for batch feature writes.

**Key Classes**:
- `OfsDataSource` — Spark DataSourceV2 implementation
- `OfsDataWriter` — Writes DataFrame rows to Kafka
- `OfsWriteBuilder` — Configures write operations

**Usage**:
```python
df.write \
  .format("com.dream11.spark.OfsDataSource") \
  .option("feature-group-name", "user_features") \
  .option("feature-group-version", "v1") \
  .mode("overwrite") \
  .save()
```

---

### 7. Python SDK (`python/darwin_fs/`)

**Package**: `darwin_fs`  
**Purpose**: Client library for feature store operations

**Key Functions**:
```python
# Entity & Feature Group Management
darwin_fs.create_entity(request)
darwin_fs.create_feature_group(request)
darwin_fs.get_entity(name)
darwin_fs.get_feature_group(name, version)

# Online Operations
darwin_fs.read_features(request)           # Sync read
darwin_fs.write_features_sync(request)     # Sync write
await darwin_fs.read_features_async(...)   # Async read
await darwin_fs.write_features_async(...)  # Async write

# Spark Operations
darwin_fs.write_features(df, feature_group_name)
darwin_fs.read_offline_features(spark, feature_group_name)
```

**Installation**:
```bash
pip install darwin_fs              # Core
pip install darwin_fs[async]       # With aiohttp
pip install darwin_fs[all]         # With PySpark
```

---

## Data Flow

### Online Read Flow

```
┌────────┐    ┌─────────┐    ┌───────────┐    ┌──────────┐
│ Client │───►│ OFS App │───►│ MetaStore │───►│ Cassandra│
│  SDK   │    │         │    │  Cache    │    │  Cluster │
└────────┘    └─────────┘    └───────────┘    └──────────┘
     │              │              │               │
     │   1. POST    │              │               │
     │   /read      │              │               │
     │─────────────►│              │               │
     │              │ 2. Get FG    │               │
     │              │    metadata  │               │
     │              │─────────────►│               │
     │              │◄─────────────│               │
     │              │              │               │
     │              │ 3. Execute   │               │
     │              │    CQL query │               │
     │              │──────────────────────────────►
     │              │◄──────────────────────────────
     │              │              │               │
     │ 4. Response  │              │               │
     │◄─────────────│              │               │
```

### Async Write Flow (via Kafka)

```
┌────────┐    ┌───────┐    ┌──────────┐    ┌─────────┐    ┌──────────┐
│ Client │───►│ Kafka │───►│ Consumer │───►│OFS Writer│───►│ Cassandra│
│  SDK   │    │       │    │          │    │         │    │          │
└────────┘    └───────┘    └──────────┘    └─────────┘    └──────────┘
     │            │             │              │               │
     │ 1. Produce │             │              │               │
     │   message  │             │              │               │
     │───────────►│             │              │               │
     │            │ 2. Poll     │              │               │
     │            │   batch     │              │               │
     │            │────────────►│              │               │
     │            │             │ 3. HTTP POST │               │
     │            │             │   batch-write│               │
     │            │             │─────────────►│               │
     │            │             │              │ 4. CQL write  │
     │            │             │              │──────────────►│
     │            │             │              │◄──────────────│
     │            │             │◄─────────────│               │
     │            │ 5. Commit   │              │               │
     │            │◄────────────│              │               │
```

### Batch Write Flow (Spark)

```
┌───────────┐    ┌──────────┐    ┌───────┐    ┌──────────┐    ┌──────────┐
│ Spark Job │───►│OfsDataSrc│───►│ Kafka │───►│ Consumer │───►│ Cassandra│
└───────────┘    └──────────┘    └───────┘    └──────────┘    └──────────┘
      │               │              │             │               │
      │ 1. df.write() │              │             │               │
      │──────────────►│              │             │               │
      │               │ 2. Serialize │             │               │
      │               │    & produce │             │               │
      │               │─────────────►│             │               │
      │               │              │ (async)     │               │
      │               │              │────────────►│               │
      │               │              │             │──────────────►│
      │               │              │             │◄──────────────│
      │◄──────────────│              │             │               │
```

---

## Performance at Scale: 200M+ RPM

The Darwin Feature Store was load-tested at **200+ million requests per minute** with **P99 latency under 4ms**. This section documents the architectural decisions that enabled this performance.

### Key Performance Enablers

#### 1. Tenant-Based Partitioning
- Cassandra clusters isolated by tenant
- Separate reader/writer/consumer tenants for workload isolation
- Configurable routing at feature group level

#### 2. Async I/O Throughout
- Vert.x event loop for non-blocking HTTP handling
- RxJava reactive streams for database operations
- Kafka for decoupled write path

#### 3. Aggressive Caching
- **Caffeine** in-memory cache for:
  - Feature group metadata
  - Entity metadata
  - Prepared statements
  - Version information
- Cache refresh via background jobs (configurable interval)

#### 4. Batching & Compression
- Consumer batches messages before writes
- Configurable batch size limits
- GZIP compression for large payloads

#### 5. Connection Pooling
- Cassandra driver connection pooling per tenant
- HTTP client connection reuse
- Kafka producer batching

#### 6. Horizontal Scaling
- Stateless app tier scales horizontally
- Helix-coordinated consumer partitioning

### Service Dependencies

| Service | Depends On |
|---------|------------|
| `darwin-ofs-v2` | MySQL, Cassandra, `darwin-ofs-v2-admin` |
| `darwin-ofs-v2-admin` | MySQL, Cassandra, Kafka |
| `darwin-ofs-v2-consumer` | Kafka, `darwin-ofs-v2` (writer) |
| `darwin-ofs-v2-populator` | S3, Kafka |

---

## Operational Guidance

### Startup Order

1. **Datastores**: MySQL → Cassandra → Kafka
2. **Admin Service**: Runs schema migrations
3. **App Service**: Loads metadata cache
4. **Consumer Service**: Joins Helix cluster

### Health Checks

| Service | Endpoint | Expected |
|---------|----------|----------|
| OFS App | `GET /health` | `{"status": "UP"}` |
| Admin | `GET /health` | `{"status": "UP"}` |
| Consumer | `GET /health` | `{"status": "UP"}` |

### Monitoring

**Prometheus Endpoints**:
- All services expose `/metrics` for Prometheus scraping

---

