GET_CLUSTER_STATUS = """
SELECT status
FROM cluster_status
WHERE cluster_id=%(cluster_id)s
"""

GET_CLUSTER_ARTIFACT_ID = """
SELECT artifact_id
FROM cluster_status
WHERE cluster_id=%(cluster_id)s
"""

GET_CLUSTER_RUN_ID = """
SELECT active_cluster_runid AS run_id
FROM cluster_status
WHERE cluster_id=%(cluster_id)s
"""

GET_CLUSTER_METADATA = """
SELECT *
FROM cluster_status
WHERE cluster_id=%(cluster_id)s
"""

GET_ALL_CLUSTERS_METADATA = """
SELECT * 
FROM cluster_status
"""

CREATE_CLUSTER = """
INSERT INTO cluster_status(cluster_id, artifact_id, status, cluster_name) 
VALUES (%(cluster_id)s, %(artifact_id)s, %(status)s, %(cluster_name)s)
"""

DELETE_CLUSTER = """
DELETE FROM cluster_status 
WHERE cluster_id=%(cluster_id)s
"""

UPDATE_CLUSTER_NAME_AND_ARTIFACT = """
UPDATE cluster_status 
SET cluster_name=%(name)s, artifact_id=%(artifact_id)s 
WHERE cluster_id=%(cluster_id)s
"""

UPDATE_CLUSTER_NAME = """
UPDATE cluster_status
SET cluster_name=%(name)s
WHERE cluster_id=%(cluster_id)s
"""

UPDATE_CLUSTER_STATUS = """
UPDATE cluster_status
SET status           = %(status)s,
    last_updated_at  = NOW(),
    active_pods      = %(active_pods)s,
    available_memory = %(available_memory)s
WHERE cluster_id = %(cluster_id)s;
"""

GET_CLUSTER_LAST_UPDATED_AT = """
SELECT last_updated_at
FROM cluster_status
WHERE cluster_id=%(cluster_id)s
"""

START_CLUSTER = """
UPDATE cluster_status
SET status               = 'creating',
    active_cluster_runid = %(run_id)s,
    last_used_at         = CURRENT_TIMESTAMP,
    last_updated_at      = CURRENT_TIMESTAMP,
    last_picked_at       = DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 10 SECOND)
WHERE cluster_id = %(cluster_id)s;
"""

STOP_CLUSTER = """
UPDATE cluster_status
SET status           = 'inactive',
    active_pods      = 0,
    available_memory = 0,
    last_updated_at  = CURRENT_TIMESTAMP
WHERE cluster_id = %(cluster_id)s;
"""

RESTART_CLUSTER = """
UPDATE cluster_status
SET status          = 'creating',
    last_used_at    = CURRENT_TIMESTAMP,
    last_updated_at = CURRENT_TIMESTAMP,
    last_picked_at  = DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 10 SECOND)
WHERE cluster_id = %(cluster_id)s
"""

UPDATE_CLUSTER_LAST_UPDATED = """
UPDATE cluster_status
SET last_updated_at=CURRENT_TIMESTAMP
WHERE cluster_id=%(cluster_id)s
"""

UPDATE_CLUSTER_LAST_USED_AT = """
UPDATE cluster_status
SET last_used_at = NOW()
WHERE cluster_id = %(cluster_id)s;
"""

GET_ALL_RUNTIMES = """
SELECT * 
FROM cluster_runtimes
ORDER BY id DESC
"""

GET_RUNTIME_INFO = """
SELECT runtime, image, namespace 
FROM cluster_runtimes 
WHERE runtime=%(runtime)s
"""

GET_RUNTIME_IMAGE = """
SELECT image
FROM runtimes_v2
WHERE runtime=%(runtime)s
"""

GET_RUNTIME_NAMESPACE = """
SELECT namespace
FROM cluster_runtimes
WHERE runtime=%(runtime)s
"""

INSERT_RUNTIME = """
INSERT INTO cluster_runtimes(runtime, image, namespace) 
VALUES (%(runtime)s, %(image)s, %(namespace)s)
"""

UPDATE_RUNTIME_NAMESPACE = """
UPDATE cluster_runtimes
SET namespace=%(namespace)s
WHERE runtime=%(runtime)s
"""

UPDATE_RUNTIME_IMAGE = """
UPDATE cluster_runtimes
SET image=%(image)s
WHERE runtime=%(runtime)s
"""

DELETE_RUNTIME = """
DELETE FROM cluster_runtimes 
WHERE runtime=%(runtime)s
"""

GET_CLUSTERS_FROM_LIST = """
SELECT *
FROM cluster_status
WHERE cluster_id IN 
"""

GET_CLUSTER_ACTIONS_FOR_CLUSTER_RUN_ID = """
SELECT updated_at, action, message
FROM cluster_actions
WHERE cluster_runid='%(run_id)s'
ORDER BY id %(sort_order)s
"""

GET_CLUSTER_RUNTIME_IDS = """
SELECT cluster_runid, count(cluster_runid) as event_count
FROM cluster_actions
WHERE cluster_id='%(cluster_id)s'
GROUP BY cluster_runid
ORDER BY MIN(updated_at) %(sort_order)s
LIMIT %(offset)s, %(page_size)s
"""

GET_FIRST_AND_LAST_EVENT = """
(SELECT * FROM cluster_actions
WHERE cluster_runid=%(run_id)s
ORDER BY id desc
LIMIT 1
)
UNION ALL
(SELECT * FROM cluster_actions
WHERE cluster_runid=%(run_id)s
ORDER BY id asc
LIMIT 1
)
"""

INSERT_CLUSTER_ACTION = """
INSERT INTO cluster_actions(cluster_runid, action, message, cluster_id, artifact_id)
VALUES (%(run_id)s, %(action)s, %(message)s, %(cluster_id)s, %(artifact_id)s)
"""

INSERT_CUSTOM_RUNTIME = """
INSERT INTO cluster_runtimes(runtime, image, namespace, created_by, type)
VALUES (%(runtime)s, %(image)s, %(namespace)s, %(created_by)s, %(type)s)
"""

INSERT_JUPYTER_POD_DETAILS = """
INSERT INTO jupyter_pod (pod_name, jupyter_link, consumer_id)
VALUES (%(pod_name)s, %(jupyter_link)s, %(consumer_id)s);
"""

UPDATE_JUPYTER_LAST_ACTIVITY_DETAILS = """
UPDATE jupyter_pod
SET last_activity=CURRENT_TIMESTAMP
WHERE pod_name=%(pod_name)s;
"""

UPDATE_JUPYTER_POD_CONSUMER = """
UPDATE jupyter_pod 
SET consumer_id=%(consumer_id)s,
last_activity=CURRENT_TIMESTAMP
WHERE pod_name=%(pod_name)s;
"""

GET_JUPYTER_POD_DETAILS = """
SELECT pod_name, jupyter_link, last_activity
FROM jupyter_pod
WHERE pod_name=%s;
"""

GET_UNATTACHED_JUPYTER_POD = """
SELECT pod_name, jupyter_link, last_activity
FROM jupyter_pod
WHERE consumer_id IS NULL;
"""

GET_UNATTACHED_JUPYTER_POD_COUNT = """
SELECT COUNT(*)
FROM jupyter_pod
WHERE consumer_id IS NULL;
"""

GET_POD_BY_CONSUMER_ID = """
SELECT pod_name, jupyter_link, consumer_id
FROM jupyter_pod
WHERE consumer_id=%(consumer_id)s;
"""

DELETE_JUPYTER_POD = """
DELETE FROM jupyter_pod
WHERE pod_name=%(pod_name)s;
"""

GET_UNUSED_JUPYTER_POD = """
SELECT pod_name, jupyter_link, last_activity
FROM jupyter_pod
WHERE last_activity < NOW() - INTERVAL 1 MINUTE
ORDER BY last_activity ASC
LIMIT 1
FOR UPDATE SKIP LOCKED;
"""

INSERT_RECENTLY_VISITED = """
INSERT INTO user_cluster_visits (user_id, cluster_id)
VALUES (%(user_email)s, %(cluster_id)s)
ON DUPLICATE KEY UPDATE visited_at=CURRENT_TIMESTAMP;
"""

GET_RECENTLY_VISITED = """
SELECT cluster_id, visited_at
FROM user_cluster_visits
WHERE user_id=%(user_email)s AND deleted=false ORDER BY visited_at DESC LIMIT 3;
"""

SET_DELETED_RECENTLY_VISITED = """
UPDATE user_cluster_visits
SET deleted=true
WHERE cluster_id=%(cluster_id)s;
"""

GET_ALL_CLUSTERS_RUNNING_FOR_THRESHOLD_TIME = """
SELECT cluster_status.cluster_id AS cluster_id, cluster_runid, max(updated_at) AS last_started_at
FROM cluster_actions
         LEFT JOIN cluster_status
                   ON cluster_actions.cluster_id = cluster_status.cluster_id AND cluster_actions.cluster_runid = cluster_status.active_cluster_runid
WHERE cluster_status.status NOT IN ('inactive', 'cluster_died')
  AND action IN ('Started', 'Restarting')
  AND cluster_actions.updated_at < NOW() - INTERVAL %(cluster_running_time_threshold_in_minutes)s MINUTE
GROUP BY cluster_id, cluster_runid;
"""

CREATE_CLUSTER_CONFIG = """
INSERT INTO cluster_configs (config_key, value)
VALUES (%(key)s, %(value)s);
"""

UPDATE_CLUSTER_CONFIG = """
UPDATE cluster_configs
SET value=%(value)s
WHERE config_key=%(key)s;
"""

GET_CLUSTER_CONFIG = """
SELECT value
FROM cluster_configs
WHERE config_key=%(key)s;
"""

GET_ALL_CLUSTER_CONFIG = """
SELECT config_key, value
FROM cluster_configs
LIMIT %(limit)s OFFSET %(offset)s;
"""

GET_CLUSTERS_LAST_USED_BEFORE_DAYS = """
SELECT cluster_id 
FROM cluster_status 
WHERE last_used_at < NOW() - INTERVAL %(days)s DAY
AND cluster_id IN 
"""

GET_CLUSTER_ACTION = """
SELECT action, updated_at
FROM cluster_actions
WHERE cluster_id=%(cluster_id)s AND action=%(action)s ORDER BY updated_at DESC LIMIT 1;
"""

GET_ALL_SPARK_HISTORY_SERVERS = """
SELECT *
FROM spark_history_server
LIMIT %(limit)s OFFSET %(offset)s
"""

GET_ALL_ACTIVE_SPARK_HISTORY_SERVERS = """
SELECT *
FROM spark_history_server
WHERE status IN ('active', 'created')
LIMIT %(limit)s OFFSET %(offset)s
"""

GET_SPARK_HISTORY_SERVER_BY_ID = """
SELECT *
FROM spark_history_server
WHERE id=%(id)s
"""

GET_SPARK_HISTORY_SERVER_BY_RESOURCE = """
SELECT *
FROM spark_history_server
WHERE resource=%(resource)s
"""

INSERT_SPARK_HISTORY_SERVER = """
INSERT INTO spark_history_server(id, resource, user, ttl, filesystem, events_path, cloud_env, started_at, status)
VALUES (%(id)s, %(resource)s, %(user)s, %(ttl)s, %(filesystem)s, %(events_path)s, %(cloud_env)s, %(started_at)s, 
        %(status)s)
"""

UPDATE_SPARK_HISTORY_SERVER = """
UPDATE spark_history_server
SET resource=%(resource)s, user=%(user)s, ttl=%(ttl)s, filesystem=%(filesystem)s, events_path=%(events_path)s, 
    cloud_env=%(cloud_env)s, started_at=%(started_at)s, status=%(status)s
WHERE id=%(id)s
"""

UPDATE_SPARK_HISTORY_SERVER_STATUS = """
UPDATE spark_history_server
SET status=%(status)s
WHERE id=%(id)s
"""

DELETE_SPARK_HISTORY_SERVER = """
DELETE FROM spark_history_server
WHERE id=%(id)s
"""


GET_LIBRARIES_FOR_CLUSTER = """
SELECT *
FROM library
WHERE cluster_id=%(cluster_id)s
AND (name LIKE %(key)s OR source LIKE %(key)s)
ORDER BY %(sort_by)s %(sort_order)s
LIMIT %(page_size)s OFFSET %(offset)s
"""

GET_LIBRARIES_COUNT_FOR_CLUSTER = """
SELECT COUNT(*) as library_count
FROM library
WHERE cluster_id=%(cluster_id)s
AND (name LIKE %(key)s OR source LIKE %(key)s)
"""

INSERT_LIBRARY = """
INSERT INTO library (cluster_id, name, version, type, source, path, status, metadata, execution_id)
VALUES (%(cluster_id)s, %(name)s, %(version)s, %(type)s, %(source)s, %(path)s, %(status)s, %(metadata)s, %(execution_id)s)
"""

GET_LIBRARY = """
SELECT *
FROM library
WHERE id=%(library_id)s
"""

UPDATE_LIBRARY_STATUS = """
UPDATE library
SET status=%(status)s
WHERE id=%(library_id)s
"""

INSERT_REMOTE_COMMAND = """
INSERT INTO remote_command_status (execution_id, cluster_id, command, target, status, timeout)
VALUES (%(execution_id)s, %(cluster_id)s, %(command)s, %(target)s, %(status)s, %(timeout)s)
"""

START_REMOTE_COMMAND_EXECUTION = """
UPDATE remote_command_status
SET status='running', started_at=CURRENT_TIMESTAMP
WHERE execution_id=%(execution_id)s
"""

DELETE_REMOTE_COMMAND = """
DELETE FROM remote_command_status
WHERE execution_id=%(execution_id)s
"""

UPDATE_REMOTE_COMMAND_EXECUTION_STATUS = """
UPDATE remote_command_status
SET status=%(status)s
WHERE execution_id=%(execution_id)s
"""

GET_ALL_REMOTE_COMMANDS_OF_CLUSTER = """
SELECT execution_id, command, target, status, timeout
FROM remote_command_status
WHERE cluster_id=%(cluster_id)s
"""

GET_REMOTE_COMMAND_EXECUTION_STATUS = """
SELECT status
FROM remote_command_status
WHERE execution_id=%(execution_id)s
"""

GET_ERROR_DETAILS_FOR_REMOTE_COMMAND = """
SELECT error_logs_path, error_code
FROM remote_command_status
WHERE execution_id=%(execution_id)s
"""

INSERT_PODS_COMMAND_EXECUTION = """
INSERT INTO pod_command_execution_status (cluster_run_id, execution_id, pod_name, status)
VALUES (%(cluster_run_id)s, %(execution_id)s, %(pod_name)s, %(status)s)
ON DUPLICATE KEY UPDATE status = %(status)s, updated_at=CURRENT_TIMESTAMP;
"""

GET_CLUSTER_LAST_STARTED_TIME = """
SELECT updated_at AS last_started_time
FROM cluster_actions
WHERE cluster_id = %(cluster_id)s AND action = 'Started'
ORDER BY updated_at DESC
LIMIT 1;
"""

GET_CLUSTER_LAST_STOPPED_TIME = """
SELECT updated_at AS last_stopped_time
FROM cluster_actions
WHERE cluster_id = %(cluster_id)s AND action = 'Stopped'
ORDER BY updated_at DESC
LIMIT 1;
"""

GET_LIBRARIES_FROM_ID = """
SELECT *
FROM library WHERE id IN 
"""

GET_CLUSTER_LIBRARIES = """
SELECT *
FROM library
WHERE cluster_id=%(cluster_id)s
"""

GET_LIBRARY_WITH_STATUS_AND_CLUSTER_ID = """
SELECT *
FROM library WHERE cluster_id=%(cluster_id)s AND status=%(status)s
"""

UPDATE_STATUS_OF_LIBRARY_HAVING_ID = """
UPDATE library SET status=%(status)s
WHERE id IN 
"""

DELETE_LIBRARY_WITH_ID = """
DELETE FROM library WHERE id IN
"""

UPDATE_CLUSTER_LIBRARY_STATUS = """
UPDATE library SET status=%(status)s
WHERE cluster_id=%(cluster_id)s
"""

UPDATE_RUNNING_LIBRARIES_TO_CREATED = """
UPDATE library SET status='created'
WHERE cluster_id=%(cluster_id)s AND status='running'
"""

UPDATE_CLUSTER_COMMAND_EXECUTION_STATUS_TO_RUNNING = """
UPDATE remote_command_status
SET status='running', started_at=CURRENT_TIMESTAMP
WHERE cluster_id=%(cluster_id)s
"""

UPDATE_RUNNING_COMMANDS_STATUS_TO_CREATED = """
UPDATE remote_command_status
SET status='created'
WHERE cluster_id=%(cluster_id)s AND status='running'
"""

UPDATE_LIBRARY_STATUS_AND_EXECUTION_ID = """
UPDATE library
SET status=%(status)s, execution_id=%(execution_id)s
WHERE id=%(library_id)s
"""

# RUNTIME-V2 #

V2_GET_DEFAULT_RUNTIME_BY_CLASS = """
SELECT runtime_id
FROM default_runtimes_v2
WHERE class=%(class)s
"""

V2_GET_TOTAL_COUNT_BY_CLASS = """
SELECT COUNT(*)
FROM runtimes_v2
WHERE class = %(class)s
AND is_deleted = %(is_deleted)s
AND (%(search_query)s IS NULL 
     OR runtime LIKE CONCAT('%%', %(search_query)s, '%%')
     OR image LIKE CONCAT('%%', %(search_query)s, '%%'))
"""

V2_GET_COUNT_BY_CLASS_AND_TYPE = """
SELECT COUNT(*)
FROM runtimes_v2
WHERE class = %(class)s
AND type = %(type)s 
AND is_deleted = %(is_deleted)s
AND (%(search_query)s IS NULL 
     OR runtime LIKE CONCAT('%%', %(search_query)s, '%%')
     OR image LIKE CONCAT('%%', %(search_query)s, '%%'))
"""

V2_GET_COUNT_OF_RUNTIMES_BY_USER = """
SELECT COUNT(*)
FROM runtimes_v2
WHERE class = "CUSTOM"
AND created_by = %(created_by)s
AND is_deleted = FALSE
AND (%(search_query)s IS NULL 
     OR runtime LIKE CONCAT('%%', %(search_query)s, '%%')
     OR image LIKE CONCAT('%%', %(search_query)s, '%%'))
"""

V2_GET_COUNT_OF_RUNTIMES_BY_OTHERS = """
SELECT COUNT(*)
FROM runtimes_v2
WHERE class = "CUSTOM"
AND created_by != %(created_by)s
AND is_deleted = FALSE
AND (%(search_query)s IS NULL 
     OR runtime LIKE CONCAT('%%', %(search_query)s, '%%')
     OR image LIKE CONCAT('%%', %(search_query)s, '%%'))
"""

V2_GET_RUNTIME_INFO_BY_NAME = """
SELECT id, runtime, is_deleted, spark_connect, spark_auto_init
FROM runtimes_v2
WHERE runtime=%(runtime)s
"""

V2_GET_RUNTIME_INFO_BY_ID = """
SELECT * 
FROM runtimes_v2
WHERE id=%(runtime_id)s
"""

V2_GET_RUNTIME_COMPONENTS_BY_ID = """
SELECT name, version
FROM runtime_components_v2
WHERE runtime_id=%(runtime_id)s
"""

V2_GET_RUNTIMES_BY_CLASS_AND_TYPE = """
SELECT *
FROM runtimes_v2
WHERE class = %(class)s
  AND type = %(type)s
  AND is_deleted = %(is_deleted)s
  AND (%(search_query)s IS NULL 
       OR runtime LIKE CONCAT('%%', %(search_query)s, '%%')
       OR image LIKE CONCAT('%%', %(search_query)s, '%%'))
ORDER BY last_updated_at DESC
LIMIT %(limit)s OFFSET %(offset)s
"""

V2_GET_RUNTIMES_BY_USER = """
SELECT *
FROM runtimes_v2
WHERE class = %(class)s
  AND created_by = %(created_by)s
  AND is_deleted = %(is_deleted)s
  AND (%(search_query)s IS NULL 
       OR runtime LIKE CONCAT('%%', %(search_query)s, '%%')
       OR image LIKE CONCAT('%%', %(search_query)s, '%%'))
ORDER BY last_updated_at DESC
LIMIT %(limit)s OFFSET %(offset)s
"""

V2_GET_RUNTIMES_BY_OTHERS = """
SELECT *
FROM runtimes_v2
WHERE class = %(class)s
  AND created_by != %(created_by)s
  AND is_deleted = %(is_deleted)s
  AND (%(search_query)s IS NULL 
       OR runtime LIKE CONCAT('%%', %(search_query)s, '%%')
       OR image LIKE CONCAT('%%', %(search_query)s, '%%'))
ORDER BY last_updated_at DESC
LIMIT %(limit)s OFFSET %(offset)s
"""

V2_GET_DEFAULT_RUNTIME_BY_ID = """
SELECT id
FROM default_runtimes_v2
WHERE runtime_id=%(runtime_id)s
"""

V2_SOFT_DELETE_RUNTIME = """
UPDATE runtimes_v2
SET is_deleted=TRUE
WHERE runtime=%(runtime)s
"""

V2_DELETE_COMPONENTS = """
DELETE FROM runtime_components_v2
WHERE runtime_id=%(runtime_id)s
"""

V2_INSERT_COMPONENT = """
INSERT INTO runtime_components_v2 (runtime_id, name, version)
VALUES (%(runtime_id)s, %(name)s, %(version)s)
"""

V2_CREATE_RUNTIME = """
INSERT INTO runtimes_v2 (runtime, class, type, image, reference_link, created_by, created_at, last_updated_by, last_updated_at, is_deleted, spark_connect, spark_auto_init)
VALUES (%(runtime)s, %(class)s, %(type)s, %(image)s, %(reference_link)s, %(created_by)s, CURRENT_TIMESTAMP, %(last_updated_by)s, CURRENT_TIMESTAMP, FALSE, %(spark_connect)s, %(spark_auto_init)s);
"""

V2_UPDATE_RUNTIME = """
UPDATE runtimes_v2
SET image = %(image)s,
    class = %(class)s,
    type = %(type)s,
    reference_link = %(reference_link)s,
    last_updated_by = %(last_updated_by)s,
    last_updated_at = CURRENT_TIMESTAMP,
    spark_connect = %(spark_connect)s,
    spark_auto_init = %(spark_auto_init)s
WHERE id = %(id)s
"""

V2_UPDATE_SOFT_DELETED_RUNTIME = """
UPDATE runtimes_v2
SET image = %(image)s,
    class = %(class)s,
    type = %(type)s,
    reference_link = %(reference_link)s,
    created_by = %(created_by)s,
    created_at = CURRENT_TIMESTAMP,
    last_updated_by = %(last_updated_by)s,
    last_updated_at = CURRENT_TIMESTAMP,
    is_deleted = FALSE,
    spark_connect = %(spark_connect)s,
    spark_auto_init = %(spark_auto_init)s
WHERE id = %(id)s
"""

V2_SET_DEFAULT_RUNTIME = """
INSERT INTO default_runtimes_v2 (class, runtime_id)
VALUES (%(class)s, %(runtime_id)s)
ON DUPLICATE KEY UPDATE runtime_id = %(runtime_id)s
"""
