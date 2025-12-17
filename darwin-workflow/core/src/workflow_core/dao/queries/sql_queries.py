GET_DAG_DETAILS = """
SELECT is_paused,next_dagrun
FROM dag
WHERE dag_id = %s;
"""

GET_LATEST_DAG_RUNS = """
SELECT state
from dag_run
WHERE dag_id = %s order by execution_date desc limit 5;
"""

GET_LATEST_STATE = """
SELECT state,end_date
from dag_run
WHERE dag_id = %s order by execution_date desc limit 1;
"""

GET_ALL_DAG_DETAILS = """
SELECT dag_id,is_paused,next_dagrun
FROM dag
WHERE dag_id IN """


GET_LATEST_DAG_RUNS_FOR_ALL_DAGS_BEGIN = """
SELECT state, dag_id, execution_date
FROM (
    SELECT *,
        ROW_NUMBER() OVER (PARTITION BY dag_id ORDER BY execution_date DESC) AS rn
    FROM dag_run
    WHERE dag_id IN (
    """

GET_LATEST_DAG_RUNS_FOR_ALL_DAGS_END = """)
) AS ranked_dag_runs
WHERE rn <= 5;
"""

GET_WORKFLOW_TASK_FAILURES = """
SELECT start_date,end_date,duration
FROM task_fail
WHERE dag_id = %s AND run_id = %s AND task_id = %s;
"""

GET_WORKFLOW_LATEST_RETRY_TIME = """
SELECT start_date,end_date,duration
FROM task_instance
WHERE dag_id = %s AND run_id = %s AND task_id = %s;
"""

GET_ALL_TASK_INSTANCE_FOR_A_RUN = """
SELECT task_id, start_date, end_date, duration, state, try_number FROM task_instance
WHERE dag_id = %s AND run_id = %s
"""

GET_VARIABLE = """
SELECT val FROM variable WHERE `key` = %s;
"""