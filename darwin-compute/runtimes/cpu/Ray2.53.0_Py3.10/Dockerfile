FROM rayproject/ray:2.53.0-py310-cpu

RUN sudo apt-get update -y && sudo apt-get install -y openjdk-11-jdk zip unzip curl telnet dnsutils iputils-ping nodejs vim nano htop sed watch build-essential apache2-utils lsof maven && sudo apt-get clean

RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash \
        && export NVM_DIR="$HOME/.nvm" \
        && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" \
        && [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion" \
        && nvm install 20.12.0 \
        && nvm use 20.12.0 \
        && node -v \
    && ARCH=$(uname -m) && \
    if [ "$ARCH" = "aarch64" ] || [ "$ARCH" = "arm64" ]; then \
        AWS_ARCH="aarch64"; \
    else \
        AWS_ARCH="x86_64"; \
    fi && \
    curl "https://awscli.amazonaws.com/awscli-exe-linux-${AWS_ARCH}.zip" -o "awscliv2.zip" \
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
    colorful || true  # Prevent errors if a package isn't found

# Install required Python packages with correct dependencies

RUN pip install backoff==1.10.0 \
    jupyterlab==4.3.0 \
    lxml \
    papermill

# Disable Ray usage stats
RUN ray disable-usage-stats
