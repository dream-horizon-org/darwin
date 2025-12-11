CREATE DATABASE IF NOT EXISTS darwin;
USE darwin;

CREATE TABLE IF NOT EXISTS `cluster_status`
(
    `cluster_id`           VARCHAR(255)                                                                                                                                   NOT NULL,
    `artifact_id`          VARCHAR(255)                                                                                                                                   NOT NULL,
    `status`               ENUM ('active','inactive','creating','jupyter_up','head_node_up', 'head_node_died', 'worker_node_died', 'cluster_died', 'worker_nodes_scaled') NOT NULL,
    `active_pods`          INT                                                                                                                                                     DEFAULT NULL,
    `available_memory`     INT                                                                                                                                                     DEFAULT NULL,
    `active_cluster_runid` VARCHAR(255)                                                                                                                                            DEFAULT NULL,
    `cluster_name`         VARCHAR(255)                                                                                                                                            DEFAULT NULL,
    `last_updated_at`      TIMESTAMP                                                                                                                                      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `last_picked_at`       TIMESTAMP                                                                                                                                      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `last_used_at`         TIMESTAMP                                                                                                                                      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`cluster_id`),
    INDEX `idx_last_updated_at` (`last_updated_at`)
);

CREATE TABLE IF NOT EXISTS `cluster_actions`
(
    `cluster_runid` VARCHAR(255) NOT NULL,
    `action`        VARCHAR(255) NOT NULL,
    `message`       TEXT         NOT NULL,
    `updated_at`    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `cluster_id`    VARCHAR(255) NOT NULL,
    `artifact_id`   VARCHAR(255) NOT NULL,
    `id`            INT          NOT NULL AUTO_INCREMENT,
    PRIMARY KEY (`id`),
    INDEX `idx_cluster_id` (`cluster_id`),
    INDEX `idx_cluster_runid` (`cluster_runid`)
);

CREATE TABLE IF NOT EXISTS `cluster_runtimes`
(
    `id`         INT          NOT NULL AUTO_INCREMENT,
    `runtime`    VARCHAR(255) NOT NULL,
    `image`      VARCHAR(255) NOT NULL,
    `namespace`  VARCHAR(128) NOT NULL,
    `created_by` VARCHAR(255)                DEFAULT 'Darwin',
    `type`       ENUM ('cpu','gpu','custom') DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `runtime` (`runtime`),
    UNIQUE KEY `image` (`image`)
);

CREATE TABLE IF NOT EXISTS `user_cluster_visits`
(
    `user_id`    VARCHAR(255) NOT NULL,
    `cluster_id` VARCHAR(255) NOT NULL,
    `visited_at` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `deleted`    TINYINT(1)   NOT NULL DEFAULT '0',
    PRIMARY KEY (`user_id`, `cluster_id`)
);

CREATE TABLE IF NOT EXISTS `jupyter_pod`
(
    `pod_name`      VARCHAR(100) NOT NULL,
    `jupyter_link`  TEXT,
    `last_activity` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `consumer_id`   TEXT,
    PRIMARY KEY (`pod_name`)
);

CREATE TABLE IF NOT EXISTS `spark_history_server`
(
    `id`          VARCHAR(36)                                      NOT NULL,
    `resource`    VARCHAR(255)                                     NOT NULL UNIQUE, # cluster_id or project_id
    `filesystem`  ENUM ('s3', 'efs')                               NOT NULL,
    `events_path` TEXT                                             NOT NULL,
    `ttl`         INT                                              NOT NULL,        # in minutes
    `started_at`  TIMESTAMP                                        NOT NULL DEFAULT current_timestamp,
    `user`        VARCHAR(255)                                     NOT NULL,
    `cloud_env`   VARCHAR(36)                                      NOT NULL,
    `status`      ENUM ('created', 'active', 'inactive', 'failed') NOT NULL,
    PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `cluster_configs`
(
    `config_key` VARCHAR(255) NOT NULL,
    `value`      TEXT         NOT NULL,
    PRIMARY KEY (`config_key`)
);

CREATE TABLE IF NOT EXISTS `remote_command_status`
(
    `execution_id`    VARCHAR(36)                                      NOT NULL,
    `cluster_id`      VARCHAR(36)                                      NOT NULL,
    `command`         TEXT                                             NOT NULL,
    `status`          ENUM ('created', 'running', 'success', 'failed') NOT NULL DEFAULT 'created',
    `target`          ENUM ('head', 'worker', 'cluster')               NOT NULL DEFAULT 'cluster',
    `timeout`         INT                                              NOT NULL DEFAULT 300,
    `error_logs_path` VARCHAR(255),
    `error_code`      VARCHAR(255),
    `started_at`      TIMESTAMP                                        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`      TIMESTAMP                                        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `last_picked_at`  TIMESTAMP                                        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`execution_id`),
    INDEX `idx_cluster_id` (`cluster_id`),
    INDEX `idx_status` (`status`),
    INDEX `idx_updated_at` (`updated_at`)
);

CREATE TABLE IF NOT EXISTS `pod_command_execution_status`
(
    `cluster_run_id` VARCHAR(36)                                      NOT NULL,
    `execution_id`   VARCHAR(36)                                      NOT NULL,
    `pod_name`       VARCHAR(100)                                     NOT NULL,
    `status`         ENUM ('started', 'running', 'success', 'failed') NOT NULL,
    `updated_at`     TIMESTAMP                                        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`cluster_run_id`, `execution_id`, `pod_name`)
);

CREATE TABLE IF NOT EXISTS `library`
(
    `id`           INT                                                                   NOT NULL AUTO_INCREMENT,
    `cluster_id`   VARCHAR(255)                                                          NOT NULL,
    `name`         VARCHAR(255)                                                          NOT NULL,
    `version`      VARCHAR(255)                                                                   DEFAULT NULL,
    `type`         ENUM ('jar', 'whl', 'zip', 'tar', 'gz', 'txt', 'pypi', 'maven_jar')   NOT NULL,
    `source`       ENUM ('maven', 'pypi', 's3', 'workspace')                                      DEFAULT NULL,
    `path`         VARCHAR(255)                                                                   DEFAULT NULL,
    `metadata`     JSON                                                                           DEFAULT NULL,
    `status`       ENUM ('created', 'running', 'failed', 'success', 'uninstall_pending') NOT NULL,
    `execution_id` VARCHAR(255)                                                                   DEFAULT NULL,
    `created_at`   TIMESTAMP                                                             NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`   TIMESTAMP                                                             NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_cluster_id` (`cluster_id`)
);

INSERT IGNORE INTO `cluster_runtimes` (`runtime`, `image`, `namespace`, `created_by`, `type`)
VALUES ('0.0', 'localhost:5000/ray:2.37.0', 'ray', 'Darwin', 'cpu');

INSERT INTO `cluster_configs` (`config_key`, `value`)
VALUES ('cloud_env', 'kind-0'),
       ('cloud_env_job', 'kind-0'),
       ('cloud_env_remotekernel', 'kind-0'),
       ('cloud_env_shs', 'kind-0'),
       ('RSS_TOTAL_FSX_NUM', '1'),
       ('RSS_PER_FSX_CLAIM_NUM', '1')
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);

CREATE TABLE IF NOT EXISTS `runtimes_v2`
(
    `id`              INT                           NOT NULL AUTO_INCREMENT,
    `runtime`         VARCHAR(255)                  NOT NULL,
    `class`           ENUM ('CPU', 'GPU', 'CUSTOM') NOT NULL,
    `type`            ENUM ('Ray Only', 'Ray and Spark', 'Others') DEFAULT NULL,
    `image`           VARCHAR(255)                  NOT NULL,
    `reference_link`  VARCHAR(255)                                 DEFAULT NULL,
    `created_by`      VARCHAR(255)                  NOT NULL,
    `last_updated_by` VARCHAR(255)                  NOT NULL,
    `created_at`      TIMESTAMP                     NOT NULL       DEFAULT CURRENT_TIMESTAMP,
    `last_updated_at` TIMESTAMP                     NOT NULL       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `is_deleted`      BOOLEAN                       NOT NULL       DEFAULT FALSE,
    `spark_connect`   BOOLEAN                       NOT NULL       DEFAULT FALSE,
    `spark_auto_init` BOOLEAN                       NOT NULL       DEFAULT FALSE,
    PRIMARY KEY (`id`),
    UNIQUE KEY `unique` (`runtime`),
    UNIQUE KEY `image` (`image`),
    INDEX `idx_last_updated` (`last_updated_at` DESC),
    INDEX `idx_created_by` (`created_by`),
    INDEX `idx_id` (`id`),
    INDEX `idx_runtime` (`runtime`),
    INDEX `idx_class` (`class`),
    INDEX `idx_type` (`type`),
    INDEX `idx_image` (`image`),
    INDEX `idx_is_deleted` (`is_deleted`),
    CONSTRAINT `check_type_for_class` CHECK (
        (`class` = 'CUSTOM' AND `type` IS NULL) OR
        (`class` IN ('CPU', 'GPU') AND `type` IN ('Ray Only', 'Ray and Spark', 'Others'))
        )
);

CREATE TABLE IF NOT EXISTS `runtime_components_v2`
(
    `id`         INT          NOT NULL AUTO_INCREMENT,
    `runtime_id` INT          NOT NULL,
    `name`       VARCHAR(255) NOT NULL,
    `version`    VARCHAR(50)  NOT NULL,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`runtime_id`) REFERENCES `runtimes_v2` (`id`) ON DELETE CASCADE,
    UNIQUE KEY `unique_component_per_runtime` (`runtime_id`, `name`),
    INDEX `idx_runtime_id` (`runtime_id`)
);

CREATE TABLE IF NOT EXISTS `default_runtimes_v2`
(
    `id`         INT                           NOT NULL AUTO_INCREMENT,
    `class`      ENUM ('CPU', 'GPU', 'CUSTOM') NOT NULL,
    `runtime_id` INT DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `unique_class_default` (`class`),
    FOREIGN KEY (`runtime_id`) REFERENCES `runtimes_v2` (`id`) ON DELETE SET NULL,
    INDEX `id` (`id`),
    INDEX `class` (`class`)
);

INSERT IGNORE INTO `runtimes_v2` (`runtime`, `class`, `type`, `image`, `created_by`, `last_updated_by`, `spark_auto_init`)
VALUES ('0.0', 'CPU', 'Ray Only', 'localhost:5000/ray:2.37.0', 'Darwin', 'Darwin', FALSE);

INSERT IGNORE INTO `default_runtimes_v2` (`class`, `runtime_id`)
VALUES ('CPU', 1),
       ('GPU', NULL),
       ('CUSTOM', NULL);
