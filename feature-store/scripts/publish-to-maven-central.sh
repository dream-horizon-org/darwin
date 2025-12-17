#!/bin/bash
#
# Script to publish com.dream11 artifacts to Maven Central
# 
# Prerequisites:
#   - Maven installed
#   - GPG key configured for signing
#   - Environment variables set:
#     - MAVEN_CENTRAL_USERNAME
#     - MAVEN_CENTRAL_PASSWORD
#
# Usage: ./publish-to-maven-central.sh [--dry-run]
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SETTINGS_FILE="${SCRIPT_DIR}/settings.xml"
M2_REPO="${HOME}/.m2/repository"
GROUP_PATH="com/dream11"
# OSSRH Staging URL for Maven Central (traditional approach)
# The new Central Portal requires bundle upload via REST API
OSSRH_URL="https://oss.sonatype.org/service/local/staging/deploy/maven2"
# Alternative: Central Portal Publisher API
CENTRAL_PORTAL_URL="https://central.sonatype.com/api/v1/publisher/upload"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

DRY_RUN=false
if [[ "$1" == "--dry-run" ]]; then
    DRY_RUN=true
    echo -e "${YELLOW}Running in dry-run mode - no artifacts will be published${NC}"
fi

# Check required environment variables
check_env() {
    if [[ -z "${MAVEN_CENTRAL_USERNAME}" ]]; then
        echo -e "${RED}Error: MAVEN_CENTRAL_USERNAME environment variable not set${NC}"
        exit 1
    fi
    if [[ -z "${MAVEN_CENTRAL_PASSWORD}" ]]; then
        echo -e "${RED}Error: MAVEN_CENTRAL_PASSWORD environment variable not set${NC}"
        exit 1
    fi
}

# Define artifacts to publish in dependency order (parents first)
# Format: groupId:artifactId:version:packaging
# Note: Versions are based on what's needed by feature-store pom.xml
ARTIFACTS=(
    # Parent POMs (must be published first)
    "com.dream11:d11-vertx-parent:1.0.12:pom"
    "com.dream11:d11-vertx-microservice-parent:1.0.12:pom"
    
    # Core libraries (versions from feature-store pom.xml overrides)
    "com.dream11:common:4.1.23:jar"
    "com.dream11:rest:7.3.5:jar"
    "com.dream11:config-core:1.1.21:jar"
    "com.dream11:d11-vertx-logger:1.0.2:jar"
    "com.dream11:d11-vertx-config:1.1.21:pom"
    
    # Database/Cache libraries
    "com.dream11:d11-vertx-cassandra:2.2.22:jar"
    "com.dream11:d11-vertx-mysql:1.0.11:jar"
    "com.dream11:d11-vertx-caffeine:1.0.6:jar"
    "com.dream11:d11-vertx-webclient:1.0.5:jar"
    
    # Migrations - versions from parent pom (2.2.16)
    "com.dream11.migrations:root:2.2.16:pom"
    "com.dream11.migrations:core:2.2.16:jar"
    "com.dream11.migrations:migrations-maven-plugin:2.2.16:maven-plugin"
    
    # Config plugin
    "com.dream11:config-maven-plugin:1.1.21:maven-plugin"
    
    # Test utilities (optional - only if tests are run)
    "com.dream11:d11-tests:1.0.8:jar"
    "com.dream11:d11-tests-common-utils:1.0.14:jar"
)

# Function to get artifact path
get_artifact_path() {
    local group_id="$1"
    local artifact_id="$2"
    local version="$3"
    
    # Convert groupId dots to path separators using sed
    local group_path
    group_path=$(echo "${group_id}" | sed 's/\./\//g')
    echo "${M2_REPO}/${group_path}/${artifact_id}/${version}"
}

# Function to create bundle for Central Portal upload
create_bundle() {
    local artifact_id="$1"
    local version="$2"
    local packaging="$3"
    local artifact_path
    
    artifact_path=$(get_artifact_path "$artifact_id" "$version" "$packaging")
    local base_name="${artifact_id##*/}-${version}"
    
    echo -e "${YELLOW}Creating bundle for ${artifact_id}:${version}${NC}"
    
    if [[ ! -d "${artifact_path}" ]]; then
        echo -e "${RED}  ERROR: Artifact directory not found: ${artifact_path}${NC}"
        return 1
    fi
    
    local bundle_dir="/tmp/maven-central-bundle/${artifact_id}/${version}"
    mkdir -p "${bundle_dir}"
    
    # Copy required files
    local pom_file="${artifact_path}/${base_name}.pom"
    if [[ -f "${pom_file}" ]]; then
        cp "${pom_file}" "${bundle_dir}/"
        echo -e "${GREEN}  ✓ POM file${NC}"
    else
        echo -e "${RED}  ERROR: POM file not found: ${pom_file}${NC}"
        return 1
    fi
    
    # Copy JAR files for non-pom packaging
    if [[ "${packaging}" != "pom" ]]; then
        local jar_file="${artifact_path}/${base_name}.jar"
        if [[ -f "${jar_file}" ]]; then
            cp "${jar_file}" "${bundle_dir}/"
            echo -e "${GREEN}  ✓ JAR file${NC}"
        else
            echo -e "${RED}  ERROR: JAR file not found: ${jar_file}${NC}"
            return 1
        fi
        
        # Copy sources JAR if available
        local sources_jar="${artifact_path}/${base_name}-sources.jar"
        if [[ -f "${sources_jar}" ]]; then
            cp "${sources_jar}" "${bundle_dir}/"
            echo -e "${GREEN}  ✓ Sources JAR${NC}"
        else
            echo -e "${YELLOW}  ⚠ Sources JAR not found (optional)${NC}"
        fi
        
        # Copy javadoc JAR if available
        local javadoc_jar="${artifact_path}/${base_name}-javadoc.jar"
        if [[ -f "${javadoc_jar}" ]]; then
            cp "${javadoc_jar}" "${bundle_dir}/"
            echo -e "${GREEN}  ✓ Javadoc JAR${NC}"
        else
            echo -e "${YELLOW}  ⚠ Javadoc JAR not found (optional)${NC}"
        fi
    fi
    
    echo "${bundle_dir}"
}

# Function to sign files with GPG
sign_files() {
    local bundle_dir="$1"
    
    echo -e "${YELLOW}Signing files in ${bundle_dir}${NC}"
    
    for file in "${bundle_dir}"/*.{pom,jar}; do
        if [[ -f "${file}" ]]; then
            if [[ "${DRY_RUN}" == "true" ]]; then
                echo -e "  Would sign: ${file}"
            else
                gpg --armor --detach-sign "${file}"
                echo -e "${GREEN}  ✓ Signed: $(basename "${file}")${NC}"
            fi
        fi
    done
}

# Function to generate checksums
generate_checksums() {
    local bundle_dir="$1"
    
    echo -e "${YELLOW}Generating checksums${NC}"
    
    for file in "${bundle_dir}"/*.{pom,jar}; do
        if [[ -f "${file}" ]]; then
            if [[ "${DRY_RUN}" == "true" ]]; then
                echo -e "  Would generate checksums for: ${file}"
            else
                md5sum "${file}" | cut -d' ' -f1 > "${file}.md5"
                sha1sum "${file}" | cut -d' ' -f1 > "${file}.sha1"
                sha256sum "${file}" | cut -d' ' -f1 > "${file}.sha256"
                echo -e "${GREEN}  ✓ Checksums: $(basename "${file}")${NC}"
            fi
        fi
    done
}

# Function to create deployment bundle zip
create_deployment_bundle() {
    local bundle_dir="$1"
    local artifact_id="$2"
    local version="$3"
    
    local bundle_zip="/tmp/maven-central-bundle/${artifact_id##*/}-${version}-bundle.zip"
    
    echo -e "${YELLOW}Creating deployment bundle: ${bundle_zip}${NC}"
    
    if [[ "${DRY_RUN}" == "true" ]]; then
        echo -e "  Would create bundle zip"
        return 0
    fi
    
    (cd "${bundle_dir}" && zip -r "${bundle_zip}" .)
    echo "${bundle_zip}"
}

# Function to upload to Central Portal
upload_to_central() {
    local bundle_zip="$1"
    local artifact_id="$2"
    
    echo -e "${YELLOW}Uploading ${artifact_id} to Maven Central${NC}"
    
    if [[ "${DRY_RUN}" == "true" ]]; then
        echo -e "  Would upload: ${bundle_zip}"
        return 0
    fi
    
    local response
    response=$(curl -s -w "\n%{http_code}" \
        -u "${MAVEN_CENTRAL_USERNAME}:${MAVEN_CENTRAL_PASSWORD}" \
        -F "bundle=@${bundle_zip}" \
        "${CENTRAL_URL}")
    
    local http_code
    http_code=$(echo "${response}" | tail -n1)
    local body
    body=$(echo "${response}" | head -n -1)
    
    if [[ "${http_code}" -ge 200 && "${http_code}" -lt 300 ]]; then
        echo -e "${GREEN}  ✓ Upload successful!${NC}"
        echo "  Response: ${body}"
    else
        echo -e "${RED}  ✗ Upload failed (HTTP ${http_code})${NC}"
        echo "  Response: ${body}"
        return 1
    fi
}

# Deploy using Central Portal Publisher API
deploy_with_central_portal() {
    local group_id="$1"
    local artifact_id="$2"
    local version="$3"
    local packaging="$4"
    local artifact_path
    
    artifact_path=$(get_artifact_path "$group_id" "$artifact_id" "$version")
    local base_name="${artifact_id}-${version}"
    
    echo -e "${YELLOW}Deploying ${group_id}:${artifact_id}:${version} via Central Portal API${NC}"
    
    local pom_file="${artifact_path}/${base_name}.pom"
    local jar_file="${artifact_path}/${base_name}.jar"
    local sources_jar="${artifact_path}/${base_name}-sources.jar"
    local javadoc_jar="${artifact_path}/${base_name}-javadoc.jar"
    
    if [[ ! -f "${pom_file}" ]]; then
        echo -e "${RED}  ERROR: POM not found: ${pom_file}${NC}"
        return 1
    fi
    
    # Create bundle directory
    local bundle_dir="/tmp/maven-central-bundle/${group_id}/${artifact_id}/${version}"
    rm -rf "${bundle_dir}"
    mkdir -p "${bundle_dir}"
    
    # Copy files to bundle directory
    cp "${pom_file}" "${bundle_dir}/${base_name}.pom"
    echo -e "${GREEN}  ✓ Copied POM${NC}"
    
    if [[ "${packaging}" != "pom" ]]; then
        if [[ -f "${jar_file}" ]]; then
            cp "${jar_file}" "${bundle_dir}/${base_name}.jar"
            echo -e "${GREEN}  ✓ Copied JAR${NC}"
        else
            echo -e "${RED}  ERROR: JAR not found: ${jar_file}${NC}"
            return 1
        fi
    fi
    
    if [[ -f "${sources_jar}" ]]; then
        cp "${sources_jar}" "${bundle_dir}/${base_name}-sources.jar"
        echo -e "${GREEN}  ✓ Copied Sources JAR${NC}"
    fi
    
    if [[ -f "${javadoc_jar}" ]]; then
        cp "${javadoc_jar}" "${bundle_dir}/${base_name}-javadoc.jar"
        echo -e "${GREEN}  ✓ Copied Javadoc JAR${NC}"
    fi
    
    # Generate checksums
    echo -e "${YELLOW}  Generating checksums...${NC}"
    for file in "${bundle_dir}"/*; do
        if [[ -f "${file}" && ! "${file}" =~ \.(md5|sha1|sha256|asc)$ ]]; then
            md5 -q "${file}" > "${file}.md5" 2>/dev/null || md5sum "${file}" | cut -d' ' -f1 > "${file}.md5"
            shasum -a 1 "${file}" | cut -d' ' -f1 > "${file}.sha1"
            shasum -a 256 "${file}" | cut -d' ' -f1 > "${file}.sha256"
        fi
    done
    echo -e "${GREEN}  ✓ Checksums generated${NC}"
    
    # Create the bundle zip
    local bundle_zip="/tmp/maven-central-bundle/${artifact_id}-${version}-bundle.zip"
    rm -f "${bundle_zip}"
    (cd "${bundle_dir}" && zip -q -r "${bundle_zip}" .)
    echo -e "${GREEN}  ✓ Bundle created: ${bundle_zip}${NC}"
    
    if [[ "${DRY_RUN}" == "true" ]]; then
        echo -e "  Would upload: ${bundle_zip}"
        echo -e "  Would use auth: ${MAVEN_CENTRAL_USERNAME}:****"
        rm -rf "${bundle_dir}"
        return 0
    fi
    
    # Upload to Central Portal
    echo -e "${YELLOW}  Uploading to Central Portal...${NC}"
    local response
    response=$(curl -s -w "\n%{http_code}" \
        -X POST \
        -u "${MAVEN_CENTRAL_USERNAME}:${MAVEN_CENTRAL_PASSWORD}" \
        -F "bundle=@${bundle_zip};type=application/octet-stream" \
        -F "name=${group_id}:${artifact_id}:${version}" \
        -F "publishingType=AUTOMATIC" \
        "${CENTRAL_PORTAL_URL}?name=${group_id}:${artifact_id}:${version}&publishingType=AUTOMATIC")
    
    local http_code
    http_code=$(echo "${response}" | tail -n1)
    local body
    body=$(echo "${response}" | head -n -1)
    
    # Cleanup
    rm -rf "${bundle_dir}"
    rm -f "${bundle_zip}"
    
    if [[ "${http_code}" -ge 200 && "${http_code}" -lt 300 ]]; then
        echo -e "${GREEN}  ✓ Upload successful (HTTP ${http_code})${NC}"
        if [[ -n "${body}" ]]; then
            echo -e "  Deployment ID: ${body}"
        fi
        return 0
    else
        echo -e "${RED}  ✗ Upload failed (HTTP ${http_code})${NC}"
        echo -e "  Response: ${body}"
        return 1
    fi
}

# Main function
main() {
    echo "========================================"
    echo "Maven Central Publishing Script"
    echo "========================================"
    echo ""
    
    check_env
    
    # Clean up previous bundle directory
    rm -rf /tmp/maven-central-bundle
    mkdir -p /tmp/maven-central-bundle
    
    local failed_artifacts=()
    local successful_artifacts=()
    
    for artifact in "${ARTIFACTS[@]}"; do
        IFS=':' read -r group_id artifact_id version packaging <<< "${artifact}"
        
        echo ""
        echo "========================================"
        echo "Processing: ${group_id}:${artifact_id}:${version}"
        echo "========================================"
        
        # Use Central Portal Publisher API
        if deploy_with_central_portal "${group_id}" "${artifact_id}" "${version}" "${packaging}"; then
            successful_artifacts+=("${group_id}:${artifact_id}:${version}")
        else
            failed_artifacts+=("${group_id}:${artifact_id}:${version}")
            echo -e "${YELLOW}Continuing with next artifact...${NC}"
        fi
    done
    
    echo ""
    echo "========================================"
    echo "Summary"
    echo "========================================"
    echo -e "${GREEN}Successful: ${#successful_artifacts[@]}${NC}"
    for artifact in "${successful_artifacts[@]}"; do
        echo -e "  ✓ ${artifact}"
    done
    
    if [[ ${#failed_artifacts[@]} -gt 0 ]]; then
        echo -e "${RED}Failed: ${#failed_artifacts[@]}${NC}"
        for artifact in "${failed_artifacts[@]}"; do
            echo -e "  ✗ ${artifact}"
        done
        exit 1
    fi
    
    echo ""
    echo -e "${GREEN}All artifacts processed successfully!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Verify artifacts at: https://central.sonatype.com/search?q=com.dream11"
    echo "2. If using staging, release the artifacts from the Sonatype portal"
    echo "3. Update POM files to remove local-repo references"
    echo "4. Remove local-repo folder from git"
}

main "$@"

