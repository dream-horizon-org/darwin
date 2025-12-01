# Add Proper Attribution for MLflow Fork

## Summary

This PR adds comprehensive Apache 2.0 license attribution for the `mlflow` module, which is a modified version of the open-source MLflow project originally developed by Databricks, Inc.

## Motivation

The `mlflow` folder contains substantial code derived from the Apache MLflow project. To comply with Apache License 2.0 requirements and properly credit the original authors, we need to:

1. ✅ Include the Apache 2.0 license text
2. ✅ Add a NOTICE file with attribution details
3. ✅ Maintain original copyright notices
4. ✅ Document modifications made to the original work
5. ✅ Update package metadata to reflect proper licensing

## Changes Made

### 1. Added NOTICE File (`mlflow/NOTICE`)
- Documents this is a modified version of Apache MLflow
- Attributes original work to Databricks, Inc. and the Apache Software Foundation
- Lists specific modifications made for Darwin platform integration
- Includes MLflow trademark notice

### 2. Added LICENSE File (`mlflow/LICENSE`)
- Complete Apache License 2.0 text
- Maintains original copyright: "Copyright 2018 Databricks, Inc."
- Required for redistribution under Apache 2.0

### 3. Updated README (`mlflow/README.md`)
- Added prominent "Attribution" section at the top
- Links to original MLflow repository
- Documents all modifications made by DS Horizon
- References LICENSE and NOTICE files

### 4. Added Copyright Headers to Source Files
Added Apache 2.0 compliant headers to all modified source files:
- `mlflow/app_layer/src/mlflow_app_layer/main.py`
- `mlflow/app_layer/src/mlflow_app_layer/controllers/experiment.py`
- `mlflow/app_layer/src/mlflow_app_layer/controllers/model.py`
- `mlflow/app_layer/src/mlflow_app_layer/controllers/proxy.py`
- `mlflow/app_layer/src/mlflow_app_layer/controllers/run.py`
- `mlflow/app_layer/src/mlflow_app_layer/controllers/user.py`
- `mlflow/app_layer/src/mlflow_app_layer/service/mlflow.py`
- `mlflow/app_layer/src/mlflow_app_layer/util/auth_utils.py`
- `mlflow/sdk/darwin_mlflow/client.py`

Each header includes:
```python
# Copyright 2018 Databricks, Inc.
# Modifications Copyright 2025 DS Horizon
#
# Licensed under the Apache License, Version 2.0...
```

### 5. Updated Package Metadata
- **`mlflow/app_layer/setup.cfg`**: Added license field and Apache classifier
- **`mlflow/app_layer/setup.py`**: Added copyright header
- **`mlflow/sdk/setup.py`**: Added license info, long_description with attribution, and Apache classifier

## Apache 2.0 Compliance Checklist

This PR ensures full compliance with Apache License 2.0 Section 4 requirements:

- ✅ **4(a)** - Recipients receive copy of Apache License 2.0
- ✅ **4(b)** - Modified files carry prominent notices of changes
- ✅ **4(c)** - All copyright, patent, trademark notices retained from original
- ✅ **4(d)** - NOTICE file included with attribution information

## Modifications to Original MLflow

The Darwin MLflow platform includes these key modifications:

1. **Custom Authentication & Authorization Layer** - Integration with Darwin's user management
2. **Experiment & Run Management APIs** - Custom endpoints for Darwin workflows
3. **UI Integration & Proxy Layer** - Customized serving of MLflow UI
4. **S3 Bucket Initialization** - Automatic artifact storage setup
5. **MySQL Database Integration** - Custom metadata storage for Darwin
6. **Permissions System** - Multi-user experiment access control

## Testing

- ✅ All files compile without errors
- ✅ No functional changes - only attribution added
- ✅ Package metadata is valid
- ✅ LICENSE file is complete and properly formatted
- ✅ NOTICE file follows Apache guidelines

## Impact

- **No functional changes** - This is purely documentation and licensing
- **No breaking changes** - API and behavior remain identical
- **Improved compliance** - Properly attributes original MLflow authors
- **Better transparency** - Clear documentation of fork relationship

## Files Changed

```
15 files changed, 451 insertions(+), 2 deletions(-)

 mlflow/LICENSE                                     | 202 +++++++++++++++++++++
 mlflow/NOTICE                                      |  31 ++++
 mlflow/README.md                                   |  22 +++
 mlflow/app_layer/setup.cfg                         |   5 +-
 mlflow/app_layer/setup.py                          |  15 ++
 mlflow/app_layer/src/mlflow_app_layer/controllers/experiment.py |  17 ++
 mlflow/app_layer/src/mlflow_app_layer/controllers/model.py      |  17 ++
 mlflow/app_layer/src/mlflow_app_layer/controllers/proxy.py      |  17 ++
 mlflow/app_layer/src/mlflow_app_layer/controllers/run.py        |  17 ++
 mlflow/app_layer/src/mlflow_app_layer/controllers/user.py       |  17 ++
 mlflow/app_layer/src/mlflow_app_layer/main.py                   |  19 ++
 mlflow/app_layer/src/mlflow_app_layer/service/mlflow.py         |  17 ++
 mlflow/app_layer/src/mlflow_app_layer/util/auth_utils.py        |  17 ++
 mlflow/sdk/darwin_mlflow/client.py                              |  18 ++
 mlflow/sdk/setup.py                                             |  22 ++-
```

## Commits

This PR includes 5 atomic commits:

1. `5f4b844` - Add NOTICE file with MLflow attribution
2. `b60399e` - Add Apache 2.0 LICENSE file for mlflow module
3. `06da3a1` - Update README with clear MLflow attribution
4. `292f985` - Add Apache 2.0 copyright headers to source files
5. `8e04f8e` - Update package metadata with Apache 2.0 license information

## References

- [Apache MLflow GitHub Repository](https://github.com/mlflow/mlflow)
- [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0)
- [Apache License Application Guidelines](https://www.apache.org/dev/apply-license.html)
- [Databricks MLflow](https://www.databricks.com/product/managed-mlflow)

## Review Checklist

- [ ] LICENSE file is complete and unmodified Apache 2.0 text
- [ ] NOTICE file properly attributes Databricks and Apache Software Foundation
- [ ] README clearly documents fork relationship and modifications
- [ ] All source file headers include both original and modification copyrights
- [ ] Package metadata includes license information
- [ ] No functional code changes introduced

---

**Note**: This PR maintains the Apache 2.0 license for the mlflow module, ensuring compatibility with the overall Darwin project's MIT license while properly attributing the original MLflow authors.

