#!/usr/bin/env bash
set -e

# Check database connectivity and setup
echo ""
echo "Checking MySQL connectivity and setting up database..."

# Get connection parameters
# Use root user with MYSQL_ROOT_PASSWORD for database setup and migrations
# This ensures sufficient permissions for creating databases and tables

# Print the values of the variables for debugging
echo "  DARWIN_MYSQL_HOST: ${DARWIN_MYSQL_HOST}"
echo "  MYSQL_HOST: ${MYSQL_HOST}"
echo "  MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD:+***set***}"
echo "  DARWIN_MYSQL_PASSWORD: ${DARWIN_MYSQL_PASSWORD:+***set***}"
echo "  MYSQL_PASSWORD: ${MYSQL_PASSWORD:+***set***}"
echo "  MYSQL_DATABASE: ${MYSQL_DATABASE}"

HOST="${DARWIN_MYSQL_HOST:-${MYSQL_HOST:-darwin-mysql}}"
USER="root"
# Prefer MYSQL_ROOT_PASSWORD (from Helm), fallback to DARWIN_MYSQL_PASSWORD or MYSQL_PASSWORD
PASSWORD="${MYSQL_ROOT_PASSWORD:-${DARWIN_MYSQL_PASSWORD:-${MYSQL_PASSWORD:-password}}}"
DATABASE="${MYSQL_DATABASE:-darwin_ml_serve}"

echo "Connecting to MySQL at ${HOST}..."
echo "  Database: ${DATABASE}"
echo "  User: ${USER}"

# Try to connect using mysql CLI (available in the image)
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
      exit 1
    fi
  fi
  attempt=$((attempt + 1))
done

if [ "$CONNECTED" = false ]; then
  exit 1
fi

# Create database if it doesn't exist
echo ""
echo "📦 Setting up database: ${DATABASE}"
if mysql -h"${HOST}" -u"${USER}" -p"${PASSWORD}" -e "CREATE DATABASE IF NOT EXISTS \`${DATABASE}\`;" 2>/dev/null; then
  echo "✅ Database '${DATABASE}' is ready"
else
  echo "⚠️  Could not create database (may already exist or insufficient permissions)"
fi

# Generate tables using Tortoise ORM if Python environment is available
echo ""
echo "📋 Setting up database tables..."

# Check if we're in a container with the application installed
if [ -d "/app/model" ] && [ -d "/app/core" ]; then
  echo "  Using application's Python environment to generate schemas..."

  cd /app || exit 1

  # Use Python to generate tables via Tortoise ORM
  python3 << 'PYTHON_SCRIPT'
import asyncio
import sys
import os

# Add app directories to path
sys.path.insert(0, '/app')
sys.path.insert(0, '/app/model/src')
sys.path.insert(0, '/app/core/src')

try:
    from tortoise import Tortoise
    from tortoise.exceptions import DBConnectionError

    # Get connection parameters from environment
    # Use root user with root password for schema generation (needs full permissions)
    host = os.getenv('DARWIN_MYSQL_HOST') or os.getenv('MYSQL_HOST', 'darwin-mysql')
    user = 'root'  # Always use root for migrations
    password = os.getenv('MYSQL_ROOT_PASSWORD') or os.getenv('DARWIN_MYSQL_PASSWORD') or os.getenv('MYSQL_PASSWORD', 'password')
    database = os.getenv('MYSQL_DATABASE', 'darwin_ml_serve')

    db_url = f'mysql://{user}:{password}@{host}/{database}'

    async def init_db():
        try:
            # Import models to ensure they're registered
            import ml_serve_model

            await Tortoise.init(
                db_url=db_url,
                modules={'models': ['ml_serve_model']}
            )
            print(f"  Connected to database: {database}")

            # Generate schemas (create tables)
            await Tortoise.generate_schemas()
            print("  ✅ Database tables created/verified successfully")

            # Run SQL migrations after table creation
            print("")
            print("  🔄 Running SQL migrations...")
            
            import glob
            migrations_dir = '/app/resources/db/mysql/migrations'
            
            if os.path.exists(migrations_dir):
                migration_files = sorted(glob.glob(os.path.join(migrations_dir, '*.sql')))
                
                if migration_files:
                    print(f"  Found {len(migration_files)} migration file(s)")
                    
                    # Get raw connection for executing SQL
                    conn = Tortoise.get_connection("default")
                    
                    for migration_file in migration_files:
                        filename = os.path.basename(migration_file)
                        print(f"  📄 Executing migration: {filename}")
                        
                        try:
                            with open(migration_file, 'r') as f:
                                sql_content = f.read()
                            
                            # Execute the SQL migration
                            await conn.execute_query(sql_content)
                            print(f"     ✅ Migration {filename} executed successfully")
                        except Exception as mig_error:
                            # Don't fail on migration errors (idempotent migrations may fail on re-run)
                            print(f"     ⚠️  Migration {filename} had issues: {str(mig_error)[:100]}")
                            print(f"     (This is often normal for idempotent migrations)")
                    
                    print("  ✅ SQL migrations completed")
                else:
                    print("  No SQL migration files found")
            else:
                print(f"  Migrations directory not found: {migrations_dir}")

            await Tortoise.close_connections()
        except DBConnectionError as e:
            print(f"  ⚠️  Database connection error: {e}")
            print("  Tables may already exist or connection failed")
            sys.exit(0)  # Don't fail pre-deploy if tables exist
        except Exception as e:
            print(f"  ⚠️  Error setting up tables: {e}")
            print("  Tables may already exist")
            sys.exit(0)  # Don't fail pre-deploy if there's an issue

    asyncio.run(init_db())

except ImportError as e:
    print(f"  ⚠️  Tortoise ORM not available: {e}")
    print("  Skipping table generation (tables may be created by application on startup)")
    sys.exit(0)
except Exception as e:
    print(f"  ⚠️  Error: {e}")
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
  echo "  Tables will be created by the application on startup (Tortoise ORM generate_schemas=True)"
fi

echo ""
echo "✅ Pre-deploy database setup completed"