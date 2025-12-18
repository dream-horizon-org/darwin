#!/usr/bin/env bash
set -e

echo "🔧 Darwin Feature Store - Pre-Deploy Setup"
echo "==========================================="

echo "APP_DIR: ${APP_DIR}"
echo "ENV: ${ENV}"
echo "VPC_SUFFIX: ${VPC_SUFFIX}"
echo "TEAM_SUFFIX: ${TEAM_SUFFIX}"
echo "SERVICE_NAME: ${SERVICE_NAME}"

# Skip everything for non-darwin-local environments (use existing config)
if [[ "$ENV" != darwin-local ]] ; then
  mvn com.dream11:config-maven-plugin:1.3.2:init
  source ./.config
  
  # For production-like environments, skip migrations
  if [[ "$ENV" == prod* ]] || [[ "$ENV" == uat* ]]; then
    echo 'Not using migrations in production'
    exit 0
  fi
  
  # For other non-local environments, use Maven migrations
  runMigrationsCmd="mvn com.dream11.migrations:migrations-maven-plugin:2.5.0:bootstrap -Dapp.environment=${ENV} -Dd11.resources.path=./resources/; mvn com.dream11.migrations:migrations-maven-plugin:2.5.0:up -Dapp.environment=${ENV} -Dd11.resources.path=./resources/; mvn com.dream11.migrations:migrations-maven-plugin:2.5.0:reset-seed -Dapp.environment=${ENV} -Dd11.resources.path=./resources/; "
  (eval "${runMigrationsCmd}")
  exit 0
fi

# =====================================================
# darwin-local environment: Use Flyway for migrations
# =====================================================

# Default values for darwin-local
MYSQL_HOST=${DARWIN_MYSQL_HOST:-darwin-mysql}
MYSQL_PORT=${MYSQL_PORT:-3306}
MYSQL_ROOT_USER=${MYSQL_ROOT_USER:-root}
MYSQL_ROOT_PASSWORD=${DARWIN_MYSQL_PASSWORD:-password}
MYSQL_DATABASE=${MYSQL_DATABASE:-darwin_ofs}
MYSQL_USER=${MYSQL_USERNAME:-darwin}
MYSQL_PASSWORD=${MYSQL_PASSWORD:-password}

# Resolve LOAD_TEST_DATA from env
LOAD_TEST_DATA=${LOAD_TEST_DATA:-true}

# Construct JDBC URL
MYSQL_URL=${MYSQL_URL:-jdbc:mysql://${MYSQL_HOST}:${MYSQL_PORT}/${MYSQL_DATABASE}?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC}

echo "📊 Configuration:"
echo "  MySQL Host: ${MYSQL_HOST}:${MYSQL_PORT}"
echo "  Database: ${MYSQL_DATABASE}"
echo "  User: ${MYSQL_USER}"
echo "  Load Test Data: ${LOAD_TEST_DATA}"
echo ""

# Install mysql client if not available
if ! command -v mysql &> /dev/null; then
    echo "📦 Installing mysql client..."
    if command -v apt-get &> /dev/null; then
        echo "   Using apt-get to install default-mysql-client..."
        if apt-get update -qq 2>&1 && apt-get install -y -qq default-mysql-client 2>&1; then
            echo "✅ mysql client installed successfully"
        else
            echo "⚠️  Warning: Could not install mysql client via apt-get"
        fi
    elif command -v apk &> /dev/null; then
        echo "   Using apk to install mysql-client..."
        if apk add --no-cache mysql-client 2>&1; then
            echo "✅ mysql client installed successfully"
        else
            echo "⚠️  Warning: Could not install mysql client via apk"
        fi
    elif command -v yum &> /dev/null; then
        echo "   Using yum to install mysql..."
        if yum install -y mysql 2>&1; then
            echo "✅ mysql client installed successfully"
        else
            echo "⚠️  Warning: Could not install mysql client via yum"
        fi
    else
        echo "⚠️  Warning: Could not install mysql client (unknown package manager)"
    fi
else
    echo "✅ mysql client already available"
fi

echo ""

# Check MySQL connection and setup database
if command -v mysql &> /dev/null; then
    echo "🔍 Checking MySQL connection..."
    max_attempts=30
    attempt=1
    while [ $attempt -le $max_attempts ]; do
        if mysql -h"${MYSQL_HOST}" -P"${MYSQL_PORT}" -u"${MYSQL_ROOT_USER}" -p"${MYSQL_ROOT_PASSWORD}" -e "SELECT 1;" &> /dev/null; then
            echo "✅ MySQL connection successful"
            break
        fi
        echo "⏳ Waiting for MySQL... (attempt $attempt/$max_attempts)"
        sleep 2
        attempt=$((attempt + 1))
    done

    if [ $attempt -le $max_attempts ]; then
        # Clear database if loading test data (for clean test environment)
        if [ "${LOAD_TEST_DATA}" = "true" ]; then
            echo "🗑️  Dropping and recreating database for fresh test data..."
            mysql -h"${MYSQL_HOST}" -P"${MYSQL_PORT}" -u"${MYSQL_ROOT_USER}" -p"${MYSQL_ROOT_PASSWORD}" <<EOF
DROP DATABASE IF EXISTS ${MYSQL_DATABASE};
CREATE DATABASE ${MYSQL_DATABASE};
EOF
            echo "✅ Database cleared and recreated"
        else
            echo "📦 Creating database '${MYSQL_DATABASE}' if it doesn't exist..."
            mysql -h"${MYSQL_HOST}" -P"${MYSQL_PORT}" -u"${MYSQL_ROOT_USER}" -p"${MYSQL_ROOT_PASSWORD}" <<EOF
CREATE DATABASE IF NOT EXISTS ${MYSQL_DATABASE};
EOF
        fi
        
        # Grant permissions to user
        echo "🔑 Granting permissions to user '${MYSQL_USER}'..."
        mysql -h"${MYSQL_HOST}" -P"${MYSQL_PORT}" -u"${MYSQL_ROOT_USER}" -p"${MYSQL_ROOT_PASSWORD}" <<EOF
CREATE USER IF NOT EXISTS '${MYSQL_USER}'@'%' IDENTIFIED BY '${MYSQL_PASSWORD}';
GRANT ALL PRIVILEGES ON ${MYSQL_DATABASE}.* TO '${MYSQL_USER}'@'%';
FLUSH PRIVILEGES;
EOF
        echo "✅ Permissions granted to user '${MYSQL_USER}'"
    else
        echo "⚠️  Warning: Could not connect to MySQL after $max_attempts attempts"
        echo "   Continuing anyway - Flyway will handle database setup"
    fi
else
    echo "ℹ️  mysql client not found - will use Flyway for database setup"
fi

echo ""

# Run Flyway migrations
echo "🔧 Running Flyway migrations for feature store schema..."

# Install Flyway CLI if not available
if ! command -v flyway &> /dev/null; then
    echo "📦 Installing Flyway CLI..."
    
    # Install wget if not available
    if ! command -v wget &> /dev/null; then
        if command -v apt-get &> /dev/null; then
            apt-get install -y -qq wget 2>&1 > /dev/null
        fi
    fi
    
    # Download and install Flyway
    FLYWAY_VERSION="9.22.3"
    cd /tmp
    wget -q "https://repo1.maven.org/maven2/org/flywaydb/flyway-commandline/${FLYWAY_VERSION}/flyway-commandline-${FLYWAY_VERSION}.tar.gz"
    tar -xzf flyway-commandline-${FLYWAY_VERSION}.tar.gz
    ln -s /tmp/flyway-${FLYWAY_VERSION}/flyway /usr/local/bin/flyway
    chmod +x /usr/local/bin/flyway
    echo "✅ Flyway CLI installed successfully"
else
    echo "✅ Flyway CLI already available"
fi

# Look for migration files
MIGRATION_DIR=""
# Try standard locations
for dir in "/app/resources/db/mysql/migrations" "/app/db/mysql/migrations" "/app/classes/db/mysql/migrations"; do
    if [ -d "$dir" ]; then
        MIGRATION_DIR="$dir"
        break
    fi
done

# If not found, try to extract from JAR
if [ -z "${MIGRATION_DIR}" ] || [ ! -d "${MIGRATION_DIR}" ]; then
    echo "⚠️  Migration directory not found, searching..."
    MIGRATION_DIR=$(find /app -type d -path "*/db/mysql/migrations" 2>/dev/null | head -1)
    
    if [ -z "${MIGRATION_DIR}" ]; then
        echo "   Attempting to extract from JAR..."
        JAR_FILE=$(find /app -name "*-fat.jar" 2>/dev/null | head -1)
        if [ -n "$JAR_FILE" ] && [ -f "$JAR_FILE" ]; then
            mkdir -p /tmp/migrations
            cd /tmp/migrations
            jar xf "$JAR_FILE" db/mysql/migrations/ 2>/dev/null || true
            if [ -d "db/mysql/migrations" ]; then
                MIGRATION_DIR="/tmp/migrations/db/mysql/migrations"
                echo "✅ Extracted migrations from JAR"
            fi
        fi
    fi
fi

if [ -n "${MIGRATION_DIR}" ] && [ -d "${MIGRATION_DIR}" ]; then
    echo "📁 Using migration directory: ${MIGRATION_DIR}"
    echo "📊 Running Flyway migrations..."
    
    # Rename SQL files to Flyway naming convention if needed (V1__, V2__, etc.)
    # Flyway expects files like V1__description.sql
    cd "${MIGRATION_DIR}"
    counter=1
    for file in *.sql; do
        if [ -f "$file" ] && [[ ! "$file" =~ ^V[0-9]+ ]]; then
            new_name="V${counter}__${file}"
            mv "$file" "$new_name" 2>/dev/null || true
            counter=$((counter + 1))
        fi
    done
    
    # Run Flyway migrate
    flyway -url="${MYSQL_URL}" \
           -user="${MYSQL_ROOT_USER}" \
           -password="${MYSQL_ROOT_PASSWORD}" \
           -locations="filesystem:${MIGRATION_DIR}" \
           -baselineOnMigrate=true \
           migrate 2>&1 | head -50
    
    echo "✅ Flyway migrations completed"
else
    echo "⚠️  Could not find migration files, skipping Flyway"
fi

echo ""

# Load seed data if requested
if [ "${LOAD_TEST_DATA}" = "true" ]; then
    echo "📊 Loading seed data..."
    
    SEED_DIR=""
    for dir in "/app/resources/db/mysql/seed" "/app/db/mysql/seed" "/app/classes/db/mysql/seed"; do
        if [ -d "$dir" ]; then
            SEED_DIR="$dir"
            break
        fi
    done
    
    # Try to find seed directory
    if [ -z "${SEED_DIR}" ] || [ ! -d "${SEED_DIR}" ]; then
        SEED_DIR=$(find /app -type d -path "*/db/mysql/seed" 2>/dev/null | head -1)
    fi
    
    if [ -n "${SEED_DIR}" ] && [ -d "${SEED_DIR}" ] && command -v mysql &> /dev/null; then
        echo "📁 Using seed directory: ${SEED_DIR}"
        for seed_file in "${SEED_DIR}"/*.sql; do
            if [ -f "$seed_file" ]; then
                echo "   Loading: $(basename $seed_file)"
                mysql -h"${MYSQL_HOST}" -P"${MYSQL_PORT}" -u"${MYSQL_ROOT_USER}" -p"${MYSQL_ROOT_PASSWORD}" "${MYSQL_DATABASE}" < "$seed_file" 2>&1 || true
            fi
        done
        echo "✅ Seed data loaded"
    else
        echo "⚠️  Seed directory not found or mysql client unavailable"
    fi
    echo ""
fi

echo "🎉 Pre-deploy setup completed successfully!"
echo "   Database: ${MYSQL_DATABASE}"
echo "   Migrations: Executed"
echo "   Test Data: ${LOAD_TEST_DATA}"
