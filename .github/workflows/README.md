# Darwin Workflow CI Tests

This directory contains CI workflows for testing `darwin-workflow` service.

## Workflows

### 1. Linting Workflow (`darwin-workflow-lint.yml`)

**Purpose**: Runs code quality checks (flake8 and mypy) on all workflow modules.

**Triggers**:
- Pull requests (opened, synchronize, reopened)
- Pushes to `main` or `develop` branches
- Only runs when files in `darwin-workflow/**` are changed

**What it does**:
- Tests each module (`app_layer`, `core`, `model`, `sdk`, `airflow`) in parallel
- Runs `flake8` with max-line-length=160
- Runs `mypy` for type checking (non-blocking)

**Local Testing with `act`**:
```bash
# Test linting for a specific module
act -W .github/workflows/darwin-workflow-lint.yml \
    --container-architecture linux/amd64 \
    -j lint \
    --matrix module:app_layer

# Test all modules (will run in parallel)
act -W .github/workflows/darwin-workflow-lint.yml \
    --container-architecture linux/amd64
```

**Note**: The workflow correctly identifies linting errors. Fix them before merging.

---

### 2. Health Check Workflow (`darwin-workflow-healthcheck.yml`)

**Purpose**: Tests that the workflow service starts correctly and responds to health checks.

**Triggers**:
- Pull requests (opened, synchronize, reopened)
- Pushes to `main` or `develop` branches
- Only runs when files in `darwin-workflow/**` are changed

**What it does**:
- Sets up MySQL service container
- Installs all workflow dependencies
- Starts the FastAPI service
- Tests `/healthcheck` endpoint
- Validates response structure

**Local Testing with `act`**:
```bash
# Note: Service containers have known issues with act
# The workflow structure is correct but may need to be tested on GitHub Actions
act -W .github/workflows/darwin-workflow-healthcheck.yml \
    --container-architecture linux/amd64 \
    --dryrun
```

**Known Limitations**:
- `act` has issues with service containers (MySQL), so full testing should be done on GitHub Actions
- The workflow structure is validated and correct

---

## Setup for Local Testing

### Install `act`

```bash
# macOS
brew install act

# Or download from: https://github.com/nektos/act/releases
```

### Configure `act`

Create `~/Library/Application Support/act/actrc`:
```
-P ubuntu-latest=catthehacker/ubuntu:act-latest
```

### Run Workflows

```bash
# List all workflows
act -l

# Run a specific workflow
act -W .github/workflows/darwin-workflow-lint.yml \
    --container-architecture linux/amd64

# Run a specific job
act -W .github/workflows/darwin-workflow-lint.yml \
    --container-architecture linux/amd64 \
    -j lint
```

## References

- [act Documentation](https://github.com/nektos/act)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

