# Scripts

Utility scripts for Darwin platform development and operations.

## Available Scripts

### `check-services.sh`
Check health status of Darwin services and their dependencies based on `service-dependencies.yaml`.
```bash
./scripts/check-services.sh <service-name>
```

### `fast-redeploy.sh`
Fast rebuild and redeploy Darwin services to the kind cluster without full platform restart.
```bash
./scripts/fast-redeploy.sh <service-name1> [service-name2 ...]
```

