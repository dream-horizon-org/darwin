FROM debian:bookworm-slim AS base

# Install dependencies
RUN apt-get update && \
    apt-get install -y \
      curl wget unzip gnupg ca-certificates bash \
      && rm -rf /var/lib/apt/lists/*

# --- Install Java (arch-aware) ---
ARG TARGETARCH
ENV JAVA_VERSION=11.0.25+9

RUN JAVA_FILE_VERSION=$(echo "$JAVA_VERSION" | sed 's/+/_/g') \
    && if [ "$TARGETARCH" = "amd64" ]; then \
           JAVA_URL="https://github.com/adoptium/temurin11-binaries/releases/download/jdk-$JAVA_VERSION/OpenJDK11U-jdk_x64_linux_hotspot_$JAVA_FILE_VERSION.tar.gz"; \
       elif [ "$TARGETARCH" = "arm64" ]; then \
           JAVA_URL="https://github.com/adoptium/temurin11-binaries/releases/download/jdk-$JAVA_VERSION/OpenJDK11U-jdk_aarch64_linux_hotspot_$JAVA_FILE_VERSION.tar.gz"; \
       else \
           echo "Unsupported arch: $TARGETARCH" && exit 1; \
       fi \
    && echo "Downloading Java from $JAVA_URL" \
    && curl -fsSL "$JAVA_URL" -o /tmp/java.tar.gz \
    && mkdir -p /opt/java \
    && tar -C /opt/java -xzf /tmp/java.tar.gz --strip-components=1 \
    && rm -f /tmp/java.tar.gz

ENV PATH="/opt/java/bin:$PATH"

# --- Install Maven ---
ENV MAVEN_VERSION=3.9.1
ENV MAVEN_HOME=/opt/maven

RUN MAVEN_URL="https://archive.apache.org/dist/maven/maven-3/$MAVEN_VERSION/binaries/apache-maven-$MAVEN_VERSION-bin.tar.gz" \
    && echo "Downloading Maven from $MAVEN_URL" \
    && curl -fsSL "$MAVEN_URL" -o /tmp/maven.tar.gz \
    && mkdir -p /opt/maven \
    && tar -C /opt/maven -xzf /tmp/maven.tar.gz --strip-components=1 \
    && rm -f /tmp/maven.tar.gz

ENV PATH="/opt/maven/bin:$PATH"

# Create .m2 directory and generate default Maven settings
RUN mkdir -p /root/.m2 && \
    cat > /root/.m2/settings.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<settings xmlns="http://maven.apache.org/SETTINGS/1.2.0"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.2.0
                              https://maven.apache.org/xsd/settings-1.2.0.xsd">
  <localRepository>/root/.m2/repository</localRepository>
</settings>
EOF

# --- Final runtime image ---
FROM debian:bookworm-slim

RUN apt-get update && \
    apt-get install -y ca-certificates bash curl wget unzip && \
    rm -rf /var/lib/apt/lists/*

# Copy Java and Maven from build stage
COPY --from=base /opt/java /opt/java
COPY --from=base /opt/maven /opt/maven
COPY --from=base /root/.m2 /root/.m2

# If you need dd-java-agent.jar, make sure to COPY it separately or download it as needed
# COPY --from=base /opt/dd-java-agent.jar /opt/dd-java-agent.jar

ENV PATH="/opt/java/bin:/opt/maven/bin:$PATH" \
    JAVA_HOME="/opt/java" \
    MAVEN_HOME="/opt/maven"

CMD ["sh", "-c", "java -version && echo '---' && mvn -version && echo '---' && mvn help:effective-settings | head -20"]
