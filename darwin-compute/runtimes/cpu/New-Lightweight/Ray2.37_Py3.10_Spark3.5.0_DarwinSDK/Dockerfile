FROM rayproject/ray:2.37.0-py310-cpu

RUN sudo apt-get update -y && sudo apt-get install -y openjdk-11-jdk zip unzip curl telnet dnsutils iputils-ping nodejs vim nano htop sed watch build-essential apache2-utils lsof maven && sudo apt-get clean

RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash \
        && export NVM_DIR="$HOME/.nvm" \
        && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" \
        && [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion" \
        && nvm install 20.12.0 \
        && nvm use 20.12.0 \
        && node -v \
        && ARCH=$(uname -m) \
        && if [ "$ARCH" = "aarch64" ] || [ "$ARCH" = "arm64" ]; then \
            AWS_CLI_URL="https://awscli.amazonaws.com/awscli-exe-linux-aarch64.zip"; \
        else \
            AWS_CLI_URL="https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip"; \
        fi \
        && curl "$AWS_CLI_URL" -o "awscliv2.zip" \
        && unzip awscliv2.zip \
        && sudo ./aws/install \
        && sudo rm -rf awscliv2.zip \
        && sudo rm -rf ./aws \
    && sudo mkdir /raydp \
        && sudo chown -R ray /raydp \
    && HOROVOD_WITH_TENSORFLOW=1 \
    && HOROVOD_WITHPYTORCH=1 \
    && HOROVOD_WITH_GLOO=1


# Uninstall unnecessary packages safely
RUN pip uninstall -y \
    adal \
    applicationinsights \
    azure-cli-core \
    azure-cli-telemetry \
    azure-common \
    azure-core \
    azure-identity \
    azure-mgmt-compute \
    azure-mgmt-core \
    azure-mgmt-network \
    azure-mgmt-resource \
    isodate \
    knack \
    msal \
    msal-extensions \
    msrestazure \
    paramiko \
    google-cloud-storage \
    google-crc32c \
    google-pasta \
    google-resumable-media \
    imageio \
    imageio-ffmpeg \
    markdown \
    msrestazure \
    scikit-image \
    scikit-learn \
    scipy \
    tensorboardx \
    Send2Trash \
    mdurl \
    redis \
    pillow \
    portalocker \
    tabulate \
    uvloop \
    anaconda-anon-usage \
    argcomplete \
    bcrypt \
    Brotli \
    cupy-cuda12x \
    Cython \
    pkginfo \
    dm-tree \
    humanfriendly \
    tifffile \
    py-spy \
    watchfiles \
    uvicorn \
    gymnasium \
    pandas \
    typer \
    psutil \
    pytz \
    conda-content-trust \
    memray\
    jax-jumpy \
    rich \
    NetworkX \
    Farama-Notifications \
    colorful || true  # Prevent errors if a packaage is not found

RUN pip install sparksql-magic

# Fix grpcio version for Ray 2.37.0 compatibility
# The runtime_env_agent crashes with certain grpcio versions
RUN pip install grpcio==1.54.2 grpcio-tools==1.54.2 --force-reinstall

# Install darwin-sdk dependencies
RUN pip install \
    boto3==1.35.91 \
    pyarrow==14.0.2 \
    "botocore>=1.35.91,<1.36" \
    "requests>=2.28.1,<=2.32.3" \
    "dataclasses-json>=0.5.7,<=0.6.7" \
    raydp==1.6.2

# Copy and install darwin-sdk from local source
COPY --chown=ray:users darwin-sdk /tmp/darwin-sdk
RUN cd /tmp/darwin-sdk && pip install . && cd / && rm -rf /tmp/darwin-sdk

RUN pip install jupyterlab==4.3.0 \
    backoff==1.10.0 \
    lxml \
    papermill

# Set default environment variables for Darwin SDK
ENV ENV=LOCAL
ENV DARWIN_COMPUTE_URL=http://darwin-compute.darwin.svc.cluster.local:8000

# Disable Ray runtime_env_agent to prevent grpcio compatibility issues
# This disables dynamic runtime environment installation but improves stability
ENV RAY_RUNTIME_ENV_AGENT_ENABLED=0
ENV RAY_DASHBOARD_AGENT_LISTEN_PORT=0
ENV RAY_RUNTIME_ENV_LOG_TO_DRIVER_ENABLED=0

# Additional Ray stability settings
ENV RAY_DEDUP_LOGS=1
ENV RAY_ENABLE_RECORD_ACTOR_TASK_LOGGING=0

RUN ray disable-usage-stats
