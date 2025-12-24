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
    && curl -fsSL --connect-timeout 30 --max-time 600 --retry 3 --retry-delay 5 "$JAVA_URL" -o /tmp/java.tar.gz \
    && mkdir -p /opt/java \
    && tar -C /opt/java -xzf /tmp/java.tar.gz --strip-components=1 \
    && rm -f /tmp/java.tar.gz

ENV PATH="/opt/java/bin:$PATH"

# --- Install Maven ---
ENV MAVEN_VERSION=3.9.1
ENV MAVEN_HOME=/opt/maven

# Download Maven with retry logic and fallback mirrors (sh-compatible)
RUN MAVEN_FILENAME="apache-maven-$MAVEN_VERSION-bin.tar.gz" \
    && ( \
        echo "Attempting to download Maven from archive.apache.org..." \
        && curl -fsSL --connect-timeout 30 --max-time 300 --retry 3 --retry-delay 5 \
            "https://archive.apache.org/dist/maven/maven-3/$MAVEN_VERSION/binaries/$MAVEN_FILENAME" \
            -o /tmp/maven.tar.gz \
    ) || ( \
        echo "archive.apache.org failed, trying dlcdn.apache.org..." \
        && curl -fsSL --connect-timeout 30 --max-time 300 --retry 3 --retry-delay 5 \
            "https://dlcdn.apache.org/maven/maven-3/$MAVEN_VERSION/binaries/$MAVEN_FILENAME" \
            -o /tmp/maven.tar.gz \
    ) || ( \
        echo "dlcdn.apache.org failed, trying mirrors.ocf.berkeley.edu..." \
        && curl -fsSL --connect-timeout 30 --max-time 300 --retry 3 --retry-delay 5 \
            "https://mirrors.ocf.berkeley.edu/apache/maven/maven-3/$MAVEN_VERSION/binaries/$MAVEN_FILENAME" \
            -o /tmp/maven.tar.gz \
    ) \
    && if [ ! -f /tmp/maven.tar.gz ]; then \
        echo "❌ Failed to download Maven from all mirrors" && exit 1; \
    fi \
    && echo "✅ Successfully downloaded Maven" \
    && mkdir -p /opt/maven \
    && tar -C /opt/maven -xzf /tmp/maven.tar.gz --strip-components=1 \
    && rm -f /tmp/maven.tar.gz

ENV PATH="/opt/maven/bin:$PATH"

# Create .m2 directory and copy Maven settings
RUN mkdir -p /root/.m2
COPY tmp/settings.xml /root/.m2/settings.xml

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
