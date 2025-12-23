FROM apache/airflow:2.7.0

USER root

# Install any system dependencies if needed
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    build-essential \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

USER airflow

# Copy the workflow_model module (workflow_core depends on it)
COPY --chown=airflow:root model /opt/airflow/workflow_model_module/

# Copy the workflow_core module (airflow_core depends on it)
COPY --chown=airflow:root core /opt/airflow/workflow_core_module/

# Install workflow_model first (dependency of workflow_core)
WORKDIR /opt/airflow/workflow_model_module
RUN pip install --no-cache-dir -e .

# Install workflow_core (dependency of airflow_core)
WORKDIR /opt/airflow/workflow_core_module
RUN pip install --no-cache-dir -e .

# Copy the airflow_core module
COPY --chown=airflow:root airflow /opt/airflow/airflow_core_module/

# Install the airflow_core module
WORKDIR /opt/airflow/airflow_core_module
RUN pip install --no-cache-dir -e .

# Set back to airflow home
WORKDIR /opt/airflow

# Install additional Python dependencies
# First install dependencies from requirements.txt
RUN pip install --no-cache-dir \
    boto3 \
    requests \
    pydantic \
    typeguard \
    elasticsearch \
    tortoise-orm \
    pymysql \
    cryptography \
    PyYAML \
    ray \
    kubernetes

# Verify installation
RUN python -c "import airflow_core; print('airflow_core module installed successfully')"

