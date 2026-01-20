#!/bin/sh
set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║           Darwin Distribution - Initial Setup                   ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check if yq is available
if ! command -v yq >/dev/null 2>&1; then
  echo "❌ yq is required but not installed."
  echo "   Please run setup.sh first to install dependencies, or install yq manually."
  exit 1
fi

# Check if services.yaml exists
YAML_FILE="services.yaml"
if [ ! -f "$YAML_FILE" ]; then
  echo "❌ services.yaml not found in current directory."
  exit 1
fi

DEP_FILE="service-dependencies.yaml"
if [ ! -f "$DEP_FILE" ]; then
  echo "❌ $DEP_FILE not found in current directory."
  exit 1
fi

# Create .setup directory if it doesn't exist
mkdir -p .setup

# Output file
OUTPUT_FILE=".setup/enabled-services.yaml"

# Parse command line arguments
ALL_YES=false
DEV_MODE=false
while [ $# -gt 0 ]; do
  case "$1" in
    --all)
      ALL_YES=true
      shift
      ;;
    --dev-mode)
      DEV_MODE=true
      shift
      ;;
    *)
      echo "Unknown option: $1"
      echo "Usage: $0 [--all] [--dev-mode]"
      echo "  --all:      Enable all services without prompts"
      echo "  --dev-mode: Enable granular service-by-service selection"
      exit 1
      ;;
  esac
done

# Check if config already exists
if [ -f "$OUTPUT_FILE" ]; then
  if [ "$ALL_YES" = "true" ]; then
    echo "⚠️  Configuration already exists. Overwriting (--all mode)..."
  else
    printf "⚠️  Configuration already exists. Overwrite? (y/n) "
    read REPLY
    case "$REPLY" in
      [Yy]|[Yy][Ee][Ss]) ;;
      *)
        echo "Keeping existing configuration."
        exit 0
        ;;
    esac
  fi
fi

if [ "$ALL_YES" = "true" ]; then
  echo "Running in --all mode: Enabling all services without prompts."
elif [ "$DEV_MODE" = "true" ]; then
  echo "Running in --dev-mode: Granular service-by-service selection."
  echo "Dependencies will be automatically resolved."
else
  echo "This wizard will help you select your use case (Training / Inference)."
  echo "Dependencies will be automatically resolved."
  echo ""
  echo "Tip: Use --dev-mode for granular service-by-service selection."
fi
echo ""

# ============================================================================
# DEPENDENCY DEFINITIONS
# ============================================================================
# Top-level features and their included applications
# Format: FEATURE_APPS_<feature>="app1 app2 app3"

FEATURE_APPS_compute="darwin-compute darwin-cluster-manager"
FEATURE_APPS_workspace="darwin-workspace"
FEATURE_APPS_feature_store="darwin-ofs-v2 darwin-ofs-v2-admin darwin-ofs-v2-consumer"
FEATURE_APPS_mlflow="darwin-mlflow darwin-mlflow-app"
FEATURE_APPS_serve="ml-serve-app artifact-builder"
FEATURE_APPS_catalog="darwin-catalog"
FEATURE_APPS_chronos="chronos chronos-consumer"
FEATURE_APPS_workflow="darwin-workflow"

# List of all top-level features
ALL_FEATURES="compute workspace feature_store mlflow serve catalog chronos workflow"

# ============================================================================
# PRESET DEFINITIONS (simplified mode)
# ============================================================================
# Presets map to combinations of features for common use cases
PRESET_FEATURES_training="compute mlflow"
PRESET_FEATURES_inference="serve mlflow"

# Preset descriptions for user-friendly display
PRESET_DESC_training="Training (Compute + MLFlow)"
PRESET_DESC_inference="Inference (Serve + MLFlow)"

# List of all presets
ALL_PRESETS="training inference"

# Service-to-service dependencies
# Format: SERVICE_DEPS_<service>="dep1 dep2" (use underscores for hyphens in var names)
SERVICE_DEPS_darwin_ofs_v2="darwin-ofs-v2-admin"
SERVICE_DEPS_darwin_ofs_v2_admin=""
SERVICE_DEPS_darwin_ofs_v2_consumer="darwin-ofs-v2-admin"
SERVICE_DEPS_darwin_mlflow=""
SERVICE_DEPS_darwin_mlflow_app="darwin-mlflow"
SERVICE_DEPS_chronos=""
SERVICE_DEPS_chronos_consumer="chronos"
SERVICE_DEPS_darwin_compute="darwin-cluster-manager"
SERVICE_DEPS_darwin_cluster_manager=""
SERVICE_DEPS_darwin_workspace="darwin-compute"
SERVICE_DEPS_ml_serve_app="artifact-builder darwin-cluster-manager darwin-mlflow-app"
SERVICE_DEPS_artifact_builder=""
SERVICE_DEPS_darwin_catalog=""
SERVICE_DEPS_darwin_workflow="darwin-compute darwin-cluster-manager"

# Service-to-datastore dependencies
# Format: SERVICE_DATASTORES_<service>="ds1 ds2 ds3"
SERVICE_DATASTORES_darwin_ofs_v2="cassandra mysql busybox"
SERVICE_DATASTORES_darwin_ofs_v2_admin="zookeeper cassandra mysql localstack kafka busybox"
SERVICE_DATASTORES_darwin_ofs_v2_consumer="zookeeper cassandra mysql localstack kafka busybox"
SERVICE_DATASTORES_darwin_mlflow="mysql localstack busybox"
SERVICE_DATASTORES_darwin_mlflow_app="mysql localstack busybox"
SERVICE_DATASTORES_chronos="mysql localstack busybox kafka zookeeper"
SERVICE_DATASTORES_chronos_consumer="mysql localstack busybox kafka zookeeper"
SERVICE_DATASTORES_darwin_compute="mysql opensearch busybox"
SERVICE_DATASTORES_darwin_cluster_manager="mysql opensearch localstack busybox"
SERVICE_DATASTORES_darwin_workspace="mysql busybox"
SERVICE_DATASTORES_ml_serve_app="mysql localstack busybox"
SERVICE_DATASTORES_artifact_builder="mysql localstack busybox"
SERVICE_DATASTORES_darwin_catalog="mysql localstack"
SERVICE_DATASTORES_darwin_workflow="mysql elasticsearch localstack busybox airflow"

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

# Get feature apps by feature name
get_feature_apps() {
  local feature="$1"
  local var_name="FEATURE_APPS_${feature}"
  eval echo "\$$var_name"
}

# Get service dependencies
get_service_deps() {
  local service="$1"
  yq eval ".services[\"$service\"].required_services[]" "$DEP_FILE" 2>/dev/null
}

# Get service datastores
get_service_datastores() {
  local service="$1"
  yq eval ".services[\"$service\"].required_datastores[]" "$DEP_FILE" 2>/dev/null
}

# Check if item is in space-separated list
list_contains() {
  local list="$1"
  local item="$2"
  case " $list " in
    *" $item "*) return 0 ;;
    *) return 1 ;;
  esac
}

# Add item to list if not already present
list_add() {
  local list="$1"
  local item="$2"
  if ! list_contains "$list" "$item"; then
    if [ -z "$list" ]; then
      echo "$item"
    else
      echo "$list $item"
    fi
  else
    echo "$list"
  fi
}

# Prompt with validation and 3 retries
# Usage: prompt_yn "prompt text" "default (y/n)"
# Sets global variable PROMPT_RESULT to "true" or "false"
PROMPT_RESULT=""

prompt_yn() {
  local prompt_text="$1"
  local default="$2"
  local retries=3
  local attempt=0
  
  while [ $attempt -lt $retries ]; do
    printf "%s (y/n) " "$prompt_text"
    read REPLY
    
    # Handle empty response (use default)
    if [ -z "$REPLY" ]; then
      if [ "$default" = "y" ]; then
        PROMPT_RESULT="true"
      else
        PROMPT_RESULT="false"
      fi
      return 0
    fi
    
    # Handle valid y/n responses
    case "$REPLY" in
      [Yy]|[Yy][Ee][Ss])
        PROMPT_RESULT="true"
        return 0
        ;;
      [Nn]|[Nn][Oo])
        PROMPT_RESULT="false"
        return 0
        ;;
    esac
    
    # Invalid input
    attempt=$((attempt + 1))
    remaining=$((retries - attempt))
    if [ $remaining -gt 0 ]; then
      echo "    ⚠️  Invalid input. Please enter 'y' or 'n'. ($remaining retries left)"
    fi
  done
  
  # After 3 retries, use default
  echo "    ⚠️  Using default: $default"
  if [ "$default" = "y" ]; then
    PROMPT_RESULT="true"
  else
    PROMPT_RESULT="false"
  fi
  return 0
}

# ============================================================================
# DEPENDENCY RESOLUTION FUNCTIONS
# ============================================================================

# Global variables for tracking enabled items
ENABLED_SERVICES=""
ENABLED_DATASTORES=""
DIRECTLY_SELECTED_FEATURES=""
AUTO_ENABLED_SERVICES=""

# Recursively resolve service dependencies and collect datastores
# This function populates ENABLED_SERVICES and ENABLED_DATASTORES
resolve_service_deps() {
  local service="$1"
  local is_direct="$2"  # "direct" or "auto"
  
  # Skip if already processed
  if list_contains "$ENABLED_SERVICES" "$service"; then
    return
  fi
  
  # Add service to enabled list
  ENABLED_SERVICES=$(list_add "$ENABLED_SERVICES" "$service")
  
  # Track if auto-enabled
  if [ "$is_direct" = "auto" ]; then
    AUTO_ENABLED_SERVICES=$(list_add "$AUTO_ENABLED_SERVICES" "$service")
  fi
  
  # Add datastores for this service
  local datastores
  datastores=$(get_service_datastores "$service")
  for ds in $datastores; do
    ENABLED_DATASTORES=$(list_add "$ENABLED_DATASTORES" "$ds")
  done
  
  # Recursively resolve dependencies
  local deps
  deps=$(get_service_deps "$service")
  for dep in $deps; do
    resolve_service_deps "$dep" "auto"
  done
}

# Enable a feature and all its applications with dependencies
enable_feature() {
  local feature="$1"
  local apps
  apps=$(get_feature_apps "$feature")
  
  for app in $apps; do
    resolve_service_deps "$app" "direct"
  done
}

# Get preset features by preset name
get_preset_features() {
  local preset="$1"
  local var_name="PRESET_FEATURES_${preset}"
  eval echo "\$$var_name"
}

# Enable a preset (enables all features in the preset)
enable_preset() {
  local preset="$1"
  local features
  features=$(get_preset_features "$preset")
  
  for feature in $features; do
    if ! list_contains "$SELECTED_FEATURES" "$feature"; then
      SELECTED_FEATURES=$(list_add "$SELECTED_FEATURES" "$feature")
    fi
  done
}

# Select presets (simplified mode)
# Prompts user to select Training and/or Inference presets
# Sets SELECTED_FEATURES based on preset selections
select_presets() {
  local selected_presets=""
  local retries=0
  local max_retries=3
  
  while [ -z "$selected_presets" ] && [ $retries -lt $max_retries ]; do
    echo "Select which capabilities you need (you can enable both):"
    echo ""
    
    for preset in $ALL_PRESETS; do
      desc_var="PRESET_DESC_${preset}"
      desc=$(eval echo "\$$desc_var")
      
      prompt_yn "  Enable $desc?" "n"
      if [ "$PROMPT_RESULT" = "true" ]; then
        selected_presets=$(list_add "$selected_presets" "$preset")
      fi
    done
    
    if [ -z "$selected_presets" ]; then
      retries=$((retries + 1))
      remaining=$((max_retries - retries))
      if [ $remaining -gt 0 ]; then
        echo ""
        echo "  ⚠️  You must select at least one preset. ($remaining retries left)"
        echo ""
      fi
    fi
  done
  
  if [ -z "$selected_presets" ]; then
    echo ""
    echo "  ⚠️  No preset selected after $max_retries attempts. Defaulting to Training."
    selected_presets="training"
  fi
  
  # Enable all selected presets
  for preset in $selected_presets; do
    enable_preset "$preset"
  done
  
  echo ""
  echo "Selected presets:"
  for preset in $selected_presets; do
    desc_var="PRESET_DESC_${preset}"
    desc=$(eval echo "\$$desc_var")
    echo "   ✓ $desc"
  done
}

# ============================================================================
# FEATURE SELECTION
# ============================================================================

# Feature descriptions for user-friendly display
FEATURE_DESC_compute="Compute"
FEATURE_DESC_workspace="Workspace"
FEATURE_DESC_feature_store="Feature Store"
FEATURE_DESC_mlflow="MLflow"
FEATURE_DESC_serve="Serve"
FEATURE_DESC_catalog="Catalog"
FEATURE_DESC_chronos="Chronos"
FEATURE_DESC_workflow="Workflow"

# Collect user selections
SELECTED_FEATURES=""

if [ "$ALL_YES" = "true" ]; then
  # --all mode: Enable all features
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "                     SELECT FEATURES TO ENABLE"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  SELECTED_FEATURES="$ALL_FEATURES"
elif [ "$DEV_MODE" = "true" ]; then
  # --dev-mode: Granular service-by-service selection (original behavior)
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "                 SELECT FEATURES TO ENABLE (Dev Mode)"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "Select which features you want to enable. Dependencies will be"
  echo "automatically resolved (services and datastores)."
  echo ""
  
  for feature in $ALL_FEATURES; do
    # Get description
    desc_var="FEATURE_DESC_${feature}"
    desc=$(eval echo "\$$desc_var")
    
    prompt_yn "  Enable $desc?" "n"
    if [ "$PROMPT_RESULT" = "true" ]; then
      SELECTED_FEATURES=$(list_add "$SELECTED_FEATURES" "$feature")
    fi
  done
else
  # Default mode: Simplified preset selection (Training / Inference)
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "                       SELECT USE CASE"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "Choose your use case. Dependencies will be automatically resolved."
  echo "(Use --dev-mode for granular service-by-service selection)"
  echo ""
  
  select_presets
fi

# ============================================================================
# RESOLVE DEPENDENCIES
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "                     RESOLVING DEPENDENCIES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -z "$SELECTED_FEATURES" ]; then
  echo "⚠️  No features selected. Only CLI tools will be configured."
else
  # Resolve all dependencies for selected features
  for feature in $SELECTED_FEATURES; do
    DIRECTLY_SELECTED_FEATURES=$(list_add "$DIRECTLY_SELECTED_FEATURES" "$feature")
    enable_feature "$feature"
  done
  
  echo "📦 Services to be enabled:"
  for svc in $ENABLED_SERVICES; do
    if list_contains "$AUTO_ENABLED_SERVICES" "$svc"; then
      echo "   ✓ $svc (auto-enabled as dependency)"
    else
      echo "   ✓ $svc (directly selected)"
    fi
  done
  
  echo ""
  echo "🗄️  Datastores to be enabled:"
  for ds in $ENABLED_DATASTORES; do
    echo "   ✓ $ds"
  done
fi

# ============================================================================
# CONFIRMATION (optional, skip in --all mode)
# ============================================================================
if [ "$ALL_YES" != "true" ] && [ -n "$SELECTED_FEATURES" ]; then
  echo ""
  prompt_yn "Proceed with this configuration?" "y"
  if [ "$PROMPT_RESULT" != "true" ]; then
    echo "❌ Configuration cancelled."
    exit 0
  fi
fi

# ============================================================================
# DARWIN SDK RUNTIME (auto-enabled if darwin-compute is enabled)
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "                    DARWIN SDK RUNTIME"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

DARWIN_SDK_ENABLED=false

# Check if darwin-sdk-runtime is defined in services.yaml
sdk_defined=$(yq eval '.darwin-sdk-runtime.enabled' "$YAML_FILE")
if [ "$sdk_defined" = "true" ]; then
  sdk_image=$(yq eval '.darwin-sdk-runtime.image-name' "$YAML_FILE")
  
  if [ "$ALL_YES" = "true" ]; then
    DARWIN_SDK_ENABLED=true
  elif list_contains "$ENABLED_SERVICES" "darwin-compute"; then
    # Prompt user if darwin-compute is enabled
    prompt_yn "  Enable Darwin SDK Runtime ($sdk_image)? (includes Spark support)" "y"
    if [ "$PROMPT_RESULT" = "true" ]; then
      DARWIN_SDK_ENABLED=true
    fi
  else
    echo "  ⏭️  Darwin SDK Runtime skipped (requires darwin-compute)"
  fi
fi

# ============================================================================
# RAY RUNTIMES (select specific runtimes when darwin-compute is enabled)
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "                       RAY RUNTIMES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

ENABLED_RAY_IMAGES=""

ray_count=$(yq eval '.ray-images | length' "$YAML_FILE")
if [ "$ray_count" = "0" ] || [ "$ray_count" = "null" ]; then
  echo "  ⏭️  No Ray runtimes defined in services.yaml"
elif list_contains "$ENABLED_SERVICES" "darwin-compute"; then
  echo "Select which Ray runtimes to enable:"
  echo ""
  
  i=0
  while [ $i -lt $ray_count ]; do
    image_name=$(yq eval ".ray-images[$i].image-name" "$YAML_FILE")
    
    if [ "$ALL_YES" = "true" ]; then
      ENABLED_RAY_IMAGES=$(list_add "$ENABLED_RAY_IMAGES" "$image_name")
    else
      prompt_yn "  Enable $image_name?" "y"
      if [ "$PROMPT_RESULT" = "true" ]; then
        ENABLED_RAY_IMAGES=$(list_add "$ENABLED_RAY_IMAGES" "$image_name")
      fi
    fi
    
    i=$((i + 1))
  done
  
  if [ -z "$ENABLED_RAY_IMAGES" ]; then
    echo ""
    echo "  ⚠️  No Ray runtimes selected. Enabling ray:2.37.0 as default."
    ENABLED_RAY_IMAGES="ray:2.37.0"
  fi
else
  echo "  ⏭️  Ray runtimes skipped (requires darwin-compute)"
fi

# ============================================================================
# CLI TOOLS
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "                        CLI TOOLS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

DARWIN_CLI_ENABLED=false

if [ "$ALL_YES" = "true" ]; then
  DARWIN_CLI_ENABLED=true
else
  prompt_yn "  Enable darwin-cli (local installation)?" "n"
  if [ "$PROMPT_RESULT" = "true" ]; then
    DARWIN_CLI_ENABLED=true
  fi
fi

# ============================================================================
# DETERMINE RAY-IMAGES AND SERVE-IMAGES STATUS
# ============================================================================
COMPUTE_ENABLED=false
ML_SERVE_APP_ENABLED=false

if list_contains "$ENABLED_SERVICES" "darwin-compute"; then
  COMPUTE_ENABLED=true
fi

if list_contains "$ENABLED_SERVICES" "ml-serve-app"; then
  ML_SERVE_APP_ENABLED=true
fi

# ============================================================================
# WRITE CONFIGURATION FILE
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "                     WRITING CONFIGURATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Initialize the output file
cat > "$OUTPUT_FILE" << EOF
# Darwin Distribution - Enabled Services Configuration
# Generated by init.sh on $(date)
#
# Legend:
#   (direct)     - Directly selected by user
#   (dependency) - Auto-enabled due to dependencies

EOF

# Write applications section
echo "applications:" >> "$OUTPUT_FILE"

# Get all applications from services.yaml and write their status
app_count=$(yq eval '.applications | length' "$YAML_FILE")
i=0
while [ $i -lt $app_count ]; do
  app_name=$(yq eval ".applications[$i].application" "$YAML_FILE")
  
  if list_contains "$ENABLED_SERVICES" "$app_name"; then
    if list_contains "$AUTO_ENABLED_SERVICES" "$app_name"; then
      echo "  $app_name: true  # (dependency)" >> "$OUTPUT_FILE"
    else
      echo "  $app_name: true  # (direct)" >> "$OUTPUT_FILE"
    fi
  else
    echo "  $app_name: false" >> "$OUTPUT_FILE"
  fi
  
  i=$((i + 1))
done

echo "" >> "$OUTPUT_FILE"

# Write ray-images section
echo "ray-images:" >> "$OUTPUT_FILE"

ray_count=$(yq eval '.ray-images | length' "$YAML_FILE")
if [ "$ray_count" = "0" ] || [ "$ray_count" = "null" ]; then
  echo "  # No ray images defined" >> "$OUTPUT_FILE"
else
  i=0
  while [ $i -lt $ray_count ]; do
    image_name=$(yq eval ".ray-images[$i].image-name" "$YAML_FILE")
    
    if list_contains "$ENABLED_RAY_IMAGES" "$image_name"; then
      echo "  \"$image_name\": true  # (selected)" >> "$OUTPUT_FILE"
    else
      echo "  \"$image_name\": false" >> "$OUTPUT_FILE"
    fi
    
    i=$((i + 1))
  done
fi

echo "" >> "$OUTPUT_FILE"

# Write serve-images section
echo "serve-images:" >> "$OUTPUT_FILE"

serve_count=$(yq eval '.serve-images | length' "$YAML_FILE")
if [ "$serve_count" = "0" ] || [ "$serve_count" = "null" ]; then
  echo "  # No serve images defined" >> "$OUTPUT_FILE"
else
  i=0
  while [ $i -lt $serve_count ]; do
    image_name=$(yq eval ".serve-images[$i].image-name" "$YAML_FILE")
    
    if [ "$ML_SERVE_APP_ENABLED" = "true" ]; then
      echo "  \"$image_name\": true  # (auto-enabled with ml-serve-app)" >> "$OUTPUT_FILE"
    else
      echo "  \"$image_name\": false" >> "$OUTPUT_FILE"
    fi
    
    i=$((i + 1))
  done
fi

echo "" >> "$OUTPUT_FILE"

# Write datastores section
echo "datastores:" >> "$OUTPUT_FILE"

datastore_count=$(yq eval '.datastores | length' "$YAML_FILE")
if [ "$datastore_count" = "0" ] || [ "$datastore_count" = "null" ]; then
  echo "  # No datastores defined in services.yaml" >> "$OUTPUT_FILE"
else
  i=0
  while [ $i -lt $datastore_count ]; do
    ds_name=$(yq eval ".datastores[$i].name" "$YAML_FILE")
    
    if list_contains "$ENABLED_DATASTORES" "$ds_name"; then
      echo "  $ds_name: true" >> "$OUTPUT_FILE"
    else
      echo "  $ds_name: false" >> "$OUTPUT_FILE"
    fi
    
    i=$((i + 1))
  done
fi

echo "" >> "$OUTPUT_FILE"

# Write darwin-sdk-runtime section
echo "darwin-sdk-runtime:" >> "$OUTPUT_FILE"
echo "  enabled: $DARWIN_SDK_ENABLED" >> "$OUTPUT_FILE"

echo "" >> "$OUTPUT_FILE"

# Write cli-tools section
echo "cli-tools:" >> "$OUTPUT_FILE"
echo "  darwin-cli: $DARWIN_CLI_ENABLED" >> "$OUTPUT_FILE"

# ============================================================================
# SUMMARY
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "                        CONFIGURATION SAVED"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Configuration saved to: $OUTPUT_FILE"
echo ""
echo "Enabled services:"
echo ""

# Show enabled applications
echo "📦 Applications:"
if [ -n "$ENABLED_SERVICES" ]; then
  for svc in $ENABLED_SERVICES; do
    if list_contains "$AUTO_ENABLED_SERVICES" "$svc"; then
      echo "   ✓ $svc (dependency)"
    else
      echo "   ✓ $svc (direct)"
    fi
  done
else
  echo "   (none)"
fi

# Show ray images if any are enabled
if [ -n "$ENABLED_RAY_IMAGES" ]; then
  echo ""
  echo "🔷 Ray Images (selected):"
  for img in $ENABLED_RAY_IMAGES; do
    echo "   ✓ $img"
  done
elif [ "$COMPUTE_ENABLED" = "true" ]; then
  echo ""
  echo "🔷 Ray Images:"
  echo "   (none selected)"
fi

# Show serve images only if ml-serve-app is enabled
if [ "$ML_SERVE_APP_ENABLED" = "true" ]; then
  echo ""
  echo "🚀 Serve Images (auto-enabled with ml-serve-app):"
  yq eval '.serve-images | to_entries | .[] | select(.value == true) | "   ✓ " + .key' "$OUTPUT_FILE" 2>/dev/null || echo "   (none)"
fi

echo ""
echo "🗄️  Datastores:"
if [ -n "$ENABLED_DATASTORES" ]; then
  for ds in $ENABLED_DATASTORES; do
    echo "   ✓ $ds"
  done
else
  echo "   (none)"
fi

echo ""
echo "🛠️  CLI Tools:"
if [ "$DARWIN_CLI_ENABLED" = "true" ]; then
  echo "   ✓ darwin-cli"
else
  echo "   (none)"
fi

# Show darwin-sdk runtime status
if [ "$DARWIN_SDK_ENABLED" = "true" ]; then
  echo ""
  echo "🔷 Darwin SDK Runtime:"
  echo "   ✓ ray:2.37.0-darwin-sdk (Ray + Spark + Darwin SDK)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "                        DEPENDENCY SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
if [ -n "$DIRECTLY_SELECTED_FEATURES" ]; then
  echo "Features selected by user:"
  for feature in $DIRECTLY_SELECTED_FEATURES; do
    desc_var="FEATURE_DESC_${feature}"
    desc=$(eval echo "\$$desc_var")
    echo "   • $desc"
  done
  echo ""
fi

if [ -n "$AUTO_ENABLED_SERVICES" ]; then
  echo "Services auto-enabled as dependencies:"
  for svc in $AUTO_ENABLED_SERVICES; do
    echo "   → $svc"
  done
  echo ""
fi

echo "Next steps:"
echo "  1. Run ./setup.sh to build images and set up the cluster"
echo "  2. Run ./start.sh to deploy the platform"
echo ""
