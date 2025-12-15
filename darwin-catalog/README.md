# Darwin Catalog

[![CI](https://github.com/dream-horizon-org/darwin/actions/workflows/ci.yml/badge.svg)](https://github.com/dream-horizon-org/darwin/actions/workflows/ci.yml)

APIs for Data Asset Management and Metric Submission

## Features

- Data asset registration and management
- Schema management
- Lineage tracking
- Metric submission
- Search and discovery

## Prerequisites

- **Java 11** or higher
- **Maven 3.6+**
- **Docker** and **Docker Compose** (for quick start)

## Quick Start

The easiest way to get started is using the provided quick start script:

```bash
./quick-start.sh
```

This will:
1. Build the Docker image
2. Start MySQL database
3. Start the application
4. Wait for services to be ready

The service will be available at:
- API: http://localhost:8080
- API Documentation: http://localhost:8080/swagger-ui.html

## Building from Source

### Build the Project

```bash
# Clean, compile, and package
mvn clean compile package

# Or with tests
mvn clean verify
```

### Generate OpenAPI Sources

The project uses OpenAPI code generation. To generate sources:

```bash
mvn clean compile
```

### Code Formatting

Format code using Spotless:

```bash
mvn spotless:apply
```

## Running Locally

### Using Docker Compose

```bash
docker-compose up -d
```

### Manual Setup

1. Start MySQL container:
```bash
docker run --name=darwin-catalog-mysql \
  -e MYSQL_ROOT_PASSWORD=rootpassword \
  -e MYSQL_DATABASE=darwin_catalog \
  -e MYSQL_USER=darwin-catalog \
  -e MYSQL_PASSWORD=darwin-catalog \
  -d -p 3306:3306 \
  mysql:8.0
```

2. Update `application.properties` or `application-local.properties` with your database configuration

3. Run the application:
```bash
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

### IntelliJ IDEA Setup

1. Import as Maven project
2. Set JDK to 11
3. Enable annotation processing (for Lombok and MapStruct)
4. Run `mvn clean compile` to generate sources
5. Sync Maven project: Right-click `pom.xml` → `Maven` → `Sync project`
6. Select `Generate Sources and update folders`

Entry point: `DarwinCatalogService`

Swagger UI will be available at `http://localhost:8080/swagger-ui/index.html`

## Testing

### Unit Tests

```bash
mvn test
```

### Integration Tests

Integration tests use Testcontainers to start a MySQL instance:

```bash
mvn verify -Pintegration-tests
```

## Database Migrations

### Running Flyway Repair

```bash
MYSQL_URL=jdbc:mysql://localhost:3306/darwin_catalog \
MYSQL_USERNAME=darwin-catalog \
MYSQL_PASSWORD=darwin-catalog \
mvn flyway:repair
```

## Configuration

This Spring Boot application uses environment variables to configure various aspects of the system. The configuration is defined in `application.properties` and can be overridden using environment variables.

### Configuration Variables

#### 1. Database Configuration (Required)

```bash
MYSQL_URL                 # MySQL JDBC connection URL
MYSQL_USERNAME            # MySQL database username  
MYSQL_PASSWORD            # MySQL database password
```

Example:

```bash
export MYSQL_URL="jdbc:mysql://localhost:3306/darwin_catalog?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
export MYSQL_USERNAME="darwin-catalog"
export MYSQL_PASSWORD="darwin-catalog"
```

#### 2. Datadog Integration (Optional)

```bash
DATADOG_APP_KEY                      # Datadog application key
DATADOG_API_KEY                      # Datadog API key
DATADOG_MONITOR_ENABLED              # Enable/disable Datadog monitoring (true/false)
DATADOG_MONITOR_ENV                  # Monitor environment (e.g., dev, uat, prod)
DATADOG_MONITOR_ENVIRONMENT          # Environment name
DATADOG_MONITOR_SLACK_WEBHOOKS       # Slack webhook for alerts
DATADOG_MONITOR_CUSTOM_WEBHOOKS      # Custom webhook URLs
```

#### 3. AWS Glue DDL Listener (Optional)

```bash
GLUE_LISTENER_ENABLED          # Enable/disable Glue DDL listener (true/false)
GLUE_LISTENER_QUEUE_LINK       # AWS SQS queue URL for Glue DDL events
```

#### 4. Consumer Token Configuration (Optional)

```bash
# Token expiries (in milliseconds)
CONSUMER_TOKEN_EXPIRIES_CONTRACTCENTRAL
CONSUMER_TOKEN_EXPIRIES_DATADOG
CONSUMER_TOKEN_EXPIRIES_DATABEAM
CONSUMER_TOKEN_EXPIRIES_DATAHIGHWAY
CONSUMER_TOKEN_EXPIRIES_DATASTITCH
CONSUMER_TOKEN_EXPIRIES_NEXUS

# Token identity
CONSUMER_TOKEN_SELF

# Token names (comma-separated)
CONSUMER_TOKEN_NAMES_DATABEAM
CONSUMER_TOKEN_NAMES_DATASTITCH
CONSUMER_TOKEN_NAMES_DATAHIGHWAY
CONSUMER_TOKEN_NAMES_CONTRACTCENTRAL
CONSUMER_TOKEN_NAMES_NEXUS
```

#### 5. AWS Redshift Configuration (Optional)

```bash
REDSHIFT_USERNAME              # Redshift username
REDSHIFT_PASSWORD              # Redshift password
```

#### 6. Application Environment

```bash
SPRING_PROFILES_ACTIVE         # Spring profile (e.g., local, dev, uat, prod)
```

### How to Override Configuration

#### Method 1: Using Docker Compose

Edit `docker-compose.yaml` to set environment variables:

```yaml
services:
  darwin-catalog:
    environment:
      MYSQL_URL: "jdbc:mysql://mysql:3306/darwin_catalog"
      MYSQL_USERNAME: "darwin-catalog"
      MYSQL_PASSWORD: "darwin-catalog"
      DATADOG_MONITOR_ENABLED: "false"
      # Add other variables as needed
```

Or use a `.env` file in the same directory as `docker-compose.yaml`:

```bash
# .env file
DATADOG_APP_KEY=your-app-key
DATADOG_API_KEY=your-api-key
DATADOG_MONITOR_ENABLED=true
```

Then run:

```bash
docker-compose up
```

#### Method 2: Export Environment Variables

Set environment variables before running the application:

```bash
export MYSQL_URL="jdbc:mysql://localhost:3306/darwin_catalog"
export MYSQL_USERNAME="root"
export MYSQL_PASSWORD="password"
export DATADOG_MONITOR_ENABLED="false"
export GLUE_LISTENER_ENABLED="false"

# Then run the application
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

#### Method 3: Command Line Arguments

Pass environment variables directly when running:

```bash
MYSQL_URL="jdbc:mysql://localhost:3306/darwin_catalog" \
MYSQL_USERNAME="root" \
MYSQL_PASSWORD="password" \
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

#### Method 4: Using the Start Script

The `.odin/darwin-catalog/start.sh` script supports additional environment variables:

```bash
export ENV="local"                    # Environment name
export VPC_SUFFIX=""                   # VPC suffix
export TEAM_SUFFIX=""                  # Team suffix
export SERVICE_NAME="darwin-catalog"   # Service name
export DEPLOYMENT_TYPE="local"         # Deployment type (local/container)
export BACKGROUND="false"              # Run in background (true/false)

# OpenTelemetry configuration
export OTEL_INSTRUMENTATION_COMMON_DEFAULT_ENABLED="true"
export OTEL_INSTRUMENTATION_VERTX_SQL_CLIENT_ENABLED="true"
export OTEL_EXPORTER_OTLP_ENDPOINT="http://localhost:4318"
```

### Configuration Priority

Spring Boot resolves configuration in the following order (higher overrides lower):

1. Environment variables (highest priority)
2. Command-line arguments
3. `application-{profile}.properties` (e.g., `application-local.properties`)
4. `application.properties` (lowest priority)

### Example: Full Configuration for Local Development

```bash
# Database
export MYSQL_URL="jdbc:mysql://localhost:3307/asset?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
export MYSQL_USERNAME="root"
export MYSQL_PASSWORD="root"

# Disable optional features
export DATADOG_MONITOR_ENABLED="false"
export GLUE_LISTENER_ENABLED="false"

# Set Spring profile
export SPRING_PROFILES_ACTIVE="local"

# Run the application
mvn spring-boot:run
```

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

- Read our [Code of Conduct](CODE_OF_CONDUCT.md)
- Check out our [Contributing Guide](CONTRIBUTING.md)
- Report security issues to [SECURITY.md](SECURITY.md)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For questions and support, please open an issue on GitHub.
