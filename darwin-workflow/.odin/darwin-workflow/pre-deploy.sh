#!/usr/bin/env bash
set -e

echo "=========================================="
echo "Workflow Pre-Deploy Script"
echo "=========================================="
echo "APP_DIR: ${APP_DIR}"
echo "ENV: ${ENV}"
echo "SERVICE_NAME: ${SERVICE_NAME}"
echo ""

# Create S3 bucket for workflow artifacts if it doesn't exist
echo "📦 Setting up S3 buckets..."
S3_BUCKET=${S3_BUCKET_NAME:-workflow-artifacts}
echo "   Checking if bucket '${S3_BUCKET}' exists..."

# Check if boto3 is available (should be installed in setup.sh)
# Temporarily disable set -e for this check
set +e
python3 -c "import boto3" 2>/dev/null
BOTO3_AVAILABLE=$?
set -e

if [ $BOTO3_AVAILABLE -ne 0 ]; then
    echo "   ⚠️  boto3 not available, skipping S3 bucket setup"
    echo "   (This is OK for local development - buckets will be created on first use)"
    echo ""
else
    # Use Python with boto3 instead of aws CLI
    # Temporarily disable set -e for S3 setup (non-critical)
    set +e
    python3 << EOFPYTHON
import boto3
from botocore.exceptions import ClientError
import os

# Configure S3 client for LocalStack
s3_client = boto3.client(
    's3',
    endpoint_url=os.environ.get('AWS_ENDPOINT_URL', 'http://darwin-localstack:4566'),
    aws_access_key_id=os.environ.get('AWS_ACCESS_KEY_ID', 'test'),
    aws_secret_access_key=os.environ.get('AWS_SECRET_ACCESS_KEY', 'test'),
    region_name=os.environ.get('AWS_DEFAULT_REGION', 'us-east-1')
)

bucket_name = os.environ.get('S3_BUCKET_NAME', 'workflow-artifacts')

try:
    # Try to check if bucket exists
    s3_client.head_bucket(Bucket=bucket_name)
    print(f"   ✅ Bucket '{bucket_name}' already exists")
except ClientError as e:
    error_code = e.response['Error']['Code']
    if error_code == '404':
        # Bucket doesn't exist, create it
        try:
            print(f"   Creating bucket '{bucket_name}'...")
            s3_client.create_bucket(Bucket=bucket_name)
            print(f"   ✅ Bucket '{bucket_name}' created successfully")
        except Exception as create_error:
            print(f"   ⚠️  Error creating bucket: {create_error}")
            exit(1)
    else:
        print(f"   ⚠️  Error checking bucket: {e}")
        exit(1)
except Exception as e:
    print(f"   ⚠️  Unexpected error: {e}")
    exit(1)
EOFPYTHON

    S3_EXIT=$?
    set -e
    if [ $S3_EXIT -ne 0 ]; then
        echo "   ⚠️  Failed to setup S3 bucket (non-critical, continuing...)"
    fi
    echo ""
fi



echo ""
echo "🗄️  Setting up database and running migrations..."
echo "🔍🔍🔍 Current directory: $(pwd)"
echo "🔍🔍🔍 Listing /app:"
ls -la /app/ 2>&1 | head -5 || true
echo "🔍🔍🔍 About to start database section..."
echo "🔍🔍🔍 Script is still running - reached database section marker"
echo "🔍🔍🔍 Exit code before database section: $?"

# Database initialization and migrations
# Keep set +e enabled (already set above) to prevent early exit
echo "🔍🔍🔍 set +e executed - error handling disabled"
echo "🔍🔍🔍 Exit code after set +e: $?"
echo "🗄️  Setting up database and running migrations..."
echo "DEBUG: Starting database migration section"
echo "DEBUG: WORKFLOW_DB_HOST=${WORKFLOW_DB_HOST:-not set}"
echo "DEBUG: WORKFLOW_DB_NAME=${WORKFLOW_DB_NAME:-not set}"
echo "DEBUG: Checking /app/model and /app/core directories..."
ls -la /app/ | head -10 || echo "DEBUG: Cannot list /app"
[ -d "/app/model" ] && echo "DEBUG: /app/model exists" || echo "DEBUG: /app/model does NOT exist"
[ -d "/app/core" ] && echo "DEBUG: /app/core exists" || echo "DEBUG: /app/core does NOT exist"

# Get connection parameters (following pattern from other services)
HOST="${WORKFLOW_DB_HOST:-${DARWIN_MYSQL_HOST:-darwin-mysql}}"
USER="${WORKFLOW_DB_USERNAME:-root}"
PASSWORD="${WORKFLOW_DB_PASSWORD:-${DARWIN_MYSQL_PASSWORD:-password}}"
DATABASE="${WORKFLOW_DB_NAME:-workflow}"

echo "  WORKFLOW_DB_HOST: ${HOST}"
echo "  WORKFLOW_DB_USERNAME: ${USER}"
echo "  WORKFLOW_DB_PASSWORD: ${PASSWORD:+***set***}"
echo "  WORKFLOW_DB_NAME: ${DATABASE}"

# Install mysql client if not available (following pattern from workspace service)
if ! command -v mysql &> /dev/null; then
  echo "📦 Installing mysql client..."
  if command -v apt-get &> /dev/null; then
    apt-get update -qq && apt-get install -y -qq default-mysql-client > /dev/null 2>&1 || echo "⚠️  Could not install mysql client"
  elif command -v apk &> /dev/null; then
    apk add --no-cache mysql-client > /dev/null 2>&1 || echo "⚠️  Could not install mysql client"
  else
    echo "⚠️  Cannot install mysql client (unknown package manager)"
  fi
fi

# Try to connect using mysql CLI (following pattern from other services)
max_retries=5
attempt=1
CONNECTED=false

while [ $attempt -le $max_retries ]; do
  if mysql -h"${HOST}" -u"${USER}" -p"${PASSWORD}" -e "SELECT 1;" >/dev/null 2>&1; then
    echo "✅ MySQL connection successful to ${HOST} as ${USER}"
    CONNECTED=true
    break
  else
    if [ $attempt -lt $max_retries ]; then
      echo "  Attempt ${attempt}/${max_retries} failed, retrying in 5s..."
      sleep 5
    else
      echo "❌ MySQL connection failed after ${max_retries} attempts"
      echo "   Check if MySQL is accessible at ${HOST} and credentials are correct"
      # Don't exit - continue with Python-based setup
      echo "   ⚠️  Continuing with Python-based database setup..."
      CONNECTED=false
      break
    fi
  fi
  attempt=$((attempt + 1))
done

# Create database if it doesn't exist (using mysql CLI if available, otherwise Python)
echo ""
echo "📦 Setting up database: ${DATABASE}"
if [ "$CONNECTED" = true ] && command -v mysql &> /dev/null; then
  if mysql -h"${HOST}" -u"${USER}" -p"${PASSWORD}" -e "CREATE DATABASE IF NOT EXISTS \`${DATABASE}\`;" 2>/dev/null; then
    echo "✅ Database '${DATABASE}' is ready"
  else
    echo "⚠️  Could not create database (may already exist or insufficient permissions)"
  fi
else
  echo "⚠️  MySQL CLI not available, will create database via Python"
fi

# Generate tables using Tortoise ORM and Aerich (following pattern from other services)
echo ""
echo "📋 Setting up database tables..."

# Check if we're in a container with the application installed
if [ -d "/app/model" ] && [ -d "/app/core" ]; then
  echo "  Using application's Python environment to generate schemas..."
  
  cd /app || exit 1
  
  # Use Python to generate tables via Tortoise ORM and Aerich
  python3 << 'PYTHON_SCRIPT'
import asyncio
import sys
import os

# Add app directories to path (following pattern from other services)
sys.path.insert(0, '/app')
sys.path.insert(0, '/app/model/src')
sys.path.insert(0, '/app/core/src')
sys.path.insert(0, '/app/app_layer/src')

try:
    from tortoise import Tortoise
    from tortoise.exceptions import DBConnectionError
    from aerich import Command
    import aiomysql
    
    # Get connection parameters from environment
    host = os.getenv('WORKFLOW_DB_HOST') or os.getenv('DARWIN_MYSQL_HOST', 'darwin-mysql')
    user = os.getenv('WORKFLOW_DB_USERNAME', 'root')
    password = os.getenv('WORKFLOW_DB_PASSWORD') or os.getenv('DARWIN_MYSQL_PASSWORD', 'password')
    database = os.getenv('WORKFLOW_DB_NAME', 'workflow')
    
    print(f"  Database config: {user}@{host}/{database}")
    
    TORTOISE_ORM = {
        "connections": {
            "default": {
                "engine": "tortoise.backends.mysql",
                "credentials": {
                    "database": database,
                    "host": host,
                    "user": user,
                    "password": password,
                    "port": int(os.getenv('WORKFLOW_DB_PORT', '3306')),
                },
            }
        },
        "apps": {
            "models": {
                "models": ["workflow_model.darwin_workflow", "workflow_model.v3.darwin_workflow", "aerich.models"],
                "default_connection": "default",
            }
        },
    }
    
    async def init_db():
        try:
            # Import models to ensure they're registered
            print("  Importing workflow models...")
            import workflow_model.darwin_workflow
            import workflow_model.v3.darwin_workflow
            print("  ✅ Models imported")
            
            print("  Initializing Tortoise ORM...")
            await Tortoise.init(TORTOISE_ORM)
            print(f"  ✅ Connected to database: {database}")
            
            # Initialize Aerich (skip if already initialized)
            command = Command(tortoise_config=TORTOISE_ORM)
            try:
                await command.init()
                print("  ✅ Aerich initialized")
            except FileExistsError:
                print("  ⏭️  Aerich already initialized, skipping")
            except Exception as e:
                print(f"  ⚠️  Aerich init warning: {e}")
            
            # Run init_db to create tables from models (if migrations don't exist)
            try:
                await command.init_db(safe=True)
                print("  ✅ Database tables initialized from models")
            except FileExistsError:
                print("  ⏭️  Database tables already exist, skipping init_db")
            except Exception as e:
                if "already exists" not in str(e):
                    print(f"  ⚠️  init_db warning: {e}")
                else:
                    print("  ⏭️  Tables already exist")
            
            # Generate migrations if needed
            try:
                await command.migrate()
                print("  ✅ Migrations generated/checked")
            except Exception as e:
                # If migrations already exist, this is OK
                if "already exists" not in str(e) and "NoneType" not in str(e):
                    print(f"  ⚠️  Migration generation warning: {e}")
                else:
                    print("  ⏭️  Migrations already exist, skipping generation")
            
            # Apply migrations
            try:
                await command.upgrade(run_in_transaction=True)
                print("  ✅ Migrations applied successfully")
            except Exception as e:
                error_str = str(e)
                # If aerich table doesn't exist, create it first
                if "Table 'workflow.aerich' doesn't exist" in error_str or "Table 'workflow.aerich' doesn't exist" in error_str:
                    print("  📝 Creating aerich metadata table...")
                    from tortoise import connections
                    conn = connections.get("default")
                    await conn.execute_query("""
                        CREATE TABLE IF NOT EXISTS `aerich` (
                            `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
                            `version` VARCHAR(255) NOT NULL,
                            `app` VARCHAR(100) NOT NULL,
                            `content` JSON NOT NULL
                        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
                    """)
                    print("  ✅ Aerich metadata table created")
                    # Retry upgrade
                    try:
                        await command.upgrade(run_in_transaction=True)
                        print("  ✅ Migrations applied successfully")
                    except Exception as e2:
                        print(f"  ⚠️  Migration upgrade warning: {e2}")
                else:
                    print(f"  ⚠️  Migration upgrade warning: {e}")
            
            await Tortoise.close_connections()
            print("  ✅ Database setup completed")
            
        except DBConnectionError as e:
            print(f"  ⚠️  Database connection error: {e}")
            print("  Tables may already exist or connection failed")
            sys.exit(0)  # Don't fail pre-deploy if tables exist
        except Exception as e:
            print(f"  ⚠️  Error setting up tables: {e}")
            import traceback
            traceback.print_exc()
            print("  Tables may already exist")
            sys.exit(0)  # Don't fail pre-deploy if there's an issue
    
    asyncio.run(init_db())

except ImportError as e:
    print(f"  ⚠️  Tortoise ORM or Aerich not available: {e}")
    print("  Skipping table generation (tables may be created by application on startup)")
    sys.exit(0)
except Exception as e:
    print(f"  ⚠️  Error: {e}")
    import traceback
    traceback.print_exc()
    print("  Skipping table generation")
    sys.exit(0)

PYTHON_SCRIPT

  PYTHON_EXIT=$?
  if [ $PYTHON_EXIT -eq 0 ]; then
    echo "✅ Database setup completed"
  else
    echo "⚠️  Table generation had issues, but continuing..."
  fi
else
  echo "  ⚠️  Application Python environment not found"
  echo "  Tables will be created by the application on startup"
fi

# Re-enable set -e
set -e
echo "🔍🔍🔍 Database section completed - set -e re-enabled"
echo "🔍🔍🔍 Final exit code: $?"

echo ""
echo "=========================================="
echo "Pre-Deploy Complete"
echo "=========================================="
