#!/bin/bash
# Run unit tests for ml-serve-app

set -e

# Config
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "${SCRIPT_DIR}/../.."

echo -e "${GREEN}🧪 Running Unit Tests${NC}"

# Check if already in a virtual environment
if [ -n "$VIRTUAL_ENV" ]; then
    echo -e "${GREEN}✓ Already in virtual environment: $VIRTUAL_ENV${NC}"
    echo -e "${YELLOW}Skipping installation (assuming dependencies are installed)${NC}"
else
    echo -e "${YELLOW}Not in a virtual environment, setting up...${NC}"

    # Setup venv
    if [ ! -d ".venv" ]; then
        echo -e "${YELLOW}⚠️  Creating venv...${NC}"
        # Check for Python 3.9 (try python3.9, then python)
        if command -v python3.9 &> /dev/null; then
            PYTHON_CMD=$(command -v python3.9)
        elif command -v python &> /dev/null; then
            PYTHON_CMD=$(command -v python)
        else
            echo -e "${RED}Error: Python 3.9 required but not found${NC}"
            echo -e "${YELLOW}Please install Python 3.9 first${NC}"
            exit 1
        fi
        echo -e "${YELLOW}Using Python: $($PYTHON_CMD --version)${NC}"
        $PYTHON_CMD -m venv .venv
    fi

    source .venv/bin/activate
    pip install -q --upgrade pip

    # Install core packages
    echo -e "${YELLOW}Installing core packages...${NC}"
    for dir in model core app_layer; do
        if [ "$dir" = "app_layer" ]; then
            (cd $dir && pip install -q -e .[testing])
        else
            (cd $dir && pip install -q -e .)
        fi
    done

    # Install runtime dependencies (tests import from runtime/darwin-serve-runtime)
    echo -e "${YELLOW}Installing runtime dependencies...${NC}"
    pip install -q -r runtime/darwin-serve-runtime/requirements.txt

    echo -e "${GREEN}✓ Installation complete${NC}"
fi

# Run tests
echo -e "\n${YELLOW}🏃 Running tests...${NC}\n"
pytest tests/unit/ -v --tb=short --color=yes -m "unit" "$@"
EXIT_CODE=$?

[ $EXIT_CODE -eq 0 ] && echo -e "\n${GREEN}✅ Passed!${NC}" || echo -e "\n${RED}❌ Failed${NC}"
exit $EXIT_CODE
