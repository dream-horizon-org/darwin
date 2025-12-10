# Darwin Spark
Darwin Spark is a framework for building and running Spark applications at organization. It provides a set of utilities and configurations to streamline the development process.

## Features
- **Complete data-connectivity for all organization data-sources**: No additional configuration is required to connect to organization data sources.
- **Pre-configured Spark configurations**: The SDK provides a set of default Spark configurations that are optimized for Darwin clusters.
- **Celeborn support**: The SDK includes support for Celeborn, a shuffle service that improves Spark performance by reducing shuffle data transfer.
- **Pre-configured Spark session**: The SDK provides a pre-configured Spark session that is ready to use in darwin clusters.
- **Supported spark versions**: `3.5.0`.
- **Auto merging of Spark configurations**: The SDK automatically merges Spark configurations from the application with the default configurations provided by the SDK.
- **Dependency management**: The SDK manages dependencies for Spark applications, ensuring that all required libraries are included in the build.
- **Versioning**: The SDK follows a versioning scheme that includes both Spark version and SDK build version.

## Developers Guide

### Versioning
* SDK version consists of 2 parts: `spark_version+build_version`
  * Spark version is the version of Spark that the SDK is built against.
  * Build version is the version of the SDK itself, which is incremented with each release.
  * Release versions are tagged in the format `darwin-<spark_version>+<build_version>`.
  * On raising a PR, the sdk will be built for supported spark versions and the build version will be incremented.
### Dependency Management
   
* pom.xml file is used to maintain dependencies for spark. This file is used by maven to resolve dependencies from maven central and org jfrog.
* Make sure to add a server in .m2/settings.xml for org jfrog repository.
  * Example:
    ```xml
    <server>
      <id>jfrog-org</id>  <!-- must match <repository><id> -->
      <username>admin@organization.com</username>
      <password>PASSWORD</password>
    </server>
    ```
* The final build file contains the jars for all the dependencies and is stored in the darwin/jars folder.

### Building the SDK
* The SDK can be built using the `build.sh` script.
* Run `./build.sh -s <spark_version> -b <sdk_version>` to build the SDK for a specific Spark version and SDK version.

### Building Runtime Images with Darwin SDK

The `runtime_builder.sh` script allows you to create Docker runtime images with Darwin SDK pre-installed. This is useful for deploying Darwin SDK-enabled clusters via darwin-cluster-manager.

#### Usage

```bash
# Navigate to darwin-sdk directory
cd darwin-sdk

# Build runtime (no push)
./runtime_builder.sh --runtime-path <path-to-runtime>

# Build and push to Kind registry (default: 127.0.0.1:55000)
./runtime_builder.sh --runtime-path <path-to-runtime> --push

# Build with custom registry and tag
./runtime_builder.sh --runtime-path <path-to-runtime> --registry gcr.io/myproject --tag 1.0.0 --push
```

#### Options

| Option | Description |
|--------|-------------|
| `--runtime-path` | **Required.** Path to source runtime directory containing Dockerfile |
| `--push` | Push the image to the registry after building |
| `--registry` | Target registry (default: `127.0.0.1:55000`) |
| `--tag` | Image tag (default: derived from folder name) |
| `--platform` | Docker platform (default: `linux/amd64`) |

#### Examples

```bash
# Build from an existing runtime
./runtime_builder.sh --runtime-path ../darwin-compute/runtimes/cpu/New-Lightweight/Ray2.37_Py3.10_Spark3.5.0

# Build and push to local Kind registry
./runtime_builder.sh --runtime-path ../darwin-compute/runtimes/cpu/New-Lightweight/Ray2.37_Py3.10_Spark3.5.0 --push

# Build for custom registry
./runtime_builder.sh --runtime-path ../darwin-compute/runtimes/cpu/New-Lightweight/Ray2.37_Py3.10_Spark3.5.0 --registry gcr.io/myproject --tag 2.37.0-darwin-sdk --push
```

#### Output

The script will:
1. Build Darwin SDK as a Python wheel
2. Generate a new Dockerfile that extends the base runtime with Darwin SDK
3. Build the Docker image
4. Optionally push to the specified registry
5. Save the new Dockerfile to `darwin-compute/runtimes` with `_DarwinSDK` suffix

Example output structure:
```
darwin-compute/runtimes/cpu/New-Lightweight/
├── Ray2.37_Py3.10_Spark3.5.0/           # Original runtime
│   └── Dockerfile
└── Ray2.37_Py3.10_Spark3.5.0_DarwinSDK/ # New runtime with Darwin SDK
    └── Dockerfile
```

#### Deploying with Darwin Cluster Manager

To use the built image with darwin-cluster-manager, update the Helm values:

```yaml
# darwin-cluster-manager/charts/ray-cluster/values.yaml
image:
  repository: 127.0.0.1:55000/ray
  tag: 2.37.0-darwin-sdk
  pullPolicy: Always
```

### Testing
* The SDK includes a set of unit tests to ensure the functionality of the framework.
* Run `mvn clean package -Dspark.version=<spark_version>` to add dependencies for spark.
* OneLogin to AWS prod account.
* You are now good to test the sdk in the prod environment.