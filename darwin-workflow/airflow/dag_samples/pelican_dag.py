from airflow import DAG
from datetime import datetime
from operators.pelican_workload_operator import PelicanWorkloadOperator

with DAG(
    dag_id='example_pelican_workload',
    start_date=datetime(2025, 5, 1),
    schedule=None,
    catchup=False,
) as dag:

    run_pelican = PelicanWorkloadOperator(
        task_id='run_word_count',
        task_name='word_count',
        artifact={
            'file': '/home/ray/.ivy2/jars/spark-wordcount-2.0-20250212.114447-1.jar',
            'className': 'com.example.spark.SparkPi',
            'sparkVersion': '3.5.0',
        },
        spark_configs={
            'spark.executor.cores': '2',
            'spark.executor.instances': '2',
            'spark.executor.memory': '4g',
            'spark.driver.cores': '2',
            'spark.driver.memory': '2g',
            'pelican.logging.enabled': 'true',
            'spark.jars.ivySettings': '/home/ray/rss/pelican-logs/ivysettings__3__xml.xml',
            'spark.jars.repositories': 'https://dreamsports.jfrog.io/artifactory/d11-groups/',
            'spark.jars.packages': 'com.example.spark:spark-wordcount:2.0-SNAPSHOT'
        },
        pelican_configs={'pelican.spot.enabled': 'true'},
        mode='BATCH',
        override_spark_configs={'spark.executor.cores': '4'},
    )