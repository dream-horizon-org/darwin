#!/bin/bash
# cleanup-test-db.sh - Clean up integration test database entries

set -e

# Config
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ML_SERVE_APP_ROOT="$( cd "${SCRIPT_DIR}/../.." && pwd )"
PROJECT_ROOT="$( cd "${ML_SERVE_APP_ROOT}/.." && pwd )"

echo -e "${BLUE}🧹 Cleaning Up Integration Test Database${NC}"

# Setup
cd "${ML_SERVE_APP_ROOT}"
[ -d "tests/integration" ] || { echo -e "${RED}❌ Missing ml-serve-app/tests${NC}"; exit 1; }
[ -d ".venv" ] || { echo -e "${RED}❌ Missing .venv${NC}"; exit 1; }

# Python cleanup script
cat > /tmp/cleanup_test_db.py << 'EOFPYTHON'
import asyncio, os, sys
from tortoise import Tortoise
from ml_serve_model import Serve, Artifact, Environment, Deployment

async def cleanup():
    try:
        db_url = f"mysql://{os.environ.get('MYSQL_USERNAME','root')}:{os.environ.get('MYSQL_PASSWORD','password')}@{os.environ.get('MYSQL_HOST','localhost')}:{os.environ.get('MYSQL_PORT','3306')}/{os.environ.get('MYSQL_DATABASE','darwin_ml_serve')}"
        await Tortoise.init(db_url=db_url, modules={"models": ["ml_serve_model"]})
        
        print(f"📡 Connected to {db_url.split('@')[-1]}")
        
        # Clean serves
        test_serves = await Serve.filter(space__in=["serve-test", "test-space"]).all()
        for serve in test_serves:
            await Deployment.filter(serve_id=serve.id).delete()
            await Artifact.filter(serve_id=serve.id).delete()
            await serve.delete()
            print(f"  ✓ Deleted serve: {serve.name}")
        
        # Clean envs
        test_envs = await Environment.filter(name__startswith="integration-test").all()
        for env in test_envs:
            await env.delete()
            print(f"  ✓ Deleted env: {env.name}")
        
        print(f"✅ Cleaned {len(test_serves)} serves and {len(test_envs)} envs")
        await Tortoise.close_connections()
        
    except Exception as e:
        if "doesn't exist" not in str(e):
            print(f"❌ Error: {e}", file=sys.stderr)
            sys.exit(1)
        print("ℹ️  Database not initialized - nothing to clean")

if __name__ == "__main__":
    asyncio.run(cleanup())
EOFPYTHON

# Run cleanup
source .venv/bin/activate
export KUBECONFIG="${KUBECONFIG:-${PROJECT_ROOT}/.setup/kindkubeconfig.yaml}"

# Port forward if needed
if kubectl get pod -n darwin -l app.kubernetes.io/name=mysql &>/dev/null; then
    echo -e "${YELLOW}🔌 Port-forwarding MySQL...${NC}"
    pkill -f "kubectl.*port-forward.*mysql.*3306" 2>/dev/null || true
    kubectl port-forward -n darwin svc/darwin-mysql 3306:3306 &>/dev/null &
    PORT_FORWARD_PID=$!
    sleep 3
fi

python /tmp/cleanup_test_db.py
EXIT_CODE=$?

[ -n "$PORT_FORWARD_PID" ] && kill $PORT_FORWARD_PID 2>/dev/null
rm -f /tmp/cleanup_test_db.py
exit $EXIT_CODE
