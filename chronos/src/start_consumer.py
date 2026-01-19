from src.util import otel_bootstrap
from src.util.otel_util import otel_instrumentor
import asyncio
from loguru import logger
import threading
from os import environ

from fastapi import FastAPI, HTTPException

from src.client.mysql_client import MysqlClient
from src.constant.constants import ENV_ENVIRONMENT_VARIABLE
from src.consumers.configs.config import Config
from src.consumers.configs.config_constants import SQS_STRATEGY, KAFKA_STRATEGY, QUEUE_STRATEGY
from src.consumers.configs.kafka_config import get_kafka_config
from src.consumers.configs.sqs_config import get_sqs_config
from src.consumers.dao.kafka_admin import KafkaAdmin
from src.consumers.consumer_worker import ConsumerWorker
from src.consumers.sqs_consumer_worker import SQSConsumerWorker
from src.transformers.utils.register_utils import register_transformers


root_path = environ.get("ROOT_PATH", "")
app = FastAPI(root_path=root_path)
otel_instrumentor(app=app)
env = environ.get(ENV_ENVIRONMENT_VARIABLE, "local")
db_client = MysqlClient()
db_client.init_db_consumer(app)

config = Config(env)
cm = None
queue_strategy = environ.get(QUEUE_STRATEGY, SQS_STRATEGY).upper()


@app.on_event("startup")
def startup_event():
    register_transformers()

    def run_consumer():
        async def start():
            global cm
            if queue_strategy == SQS_STRATEGY:
                logger.info("Starting SQS consumer application")
                cm = SQSConsumerWorker(get_sqs_config(env)["consumer_configs"], env)
                logger.info("SQS consumer worker created")
            elif queue_strategy == KAFKA_STRATEGY:
                logger.info("Starting Kafka consumer application")
                cm = ConsumerWorker(get_kafka_config(env), env)
                logger.info("Kafka consumer worker created")
            else:
                raise ValueError(f"Unknown QUEUE strategy: {queue_strategy}")

            await cm.run()
            return "Ok"

        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(start())
        loop.close()

    startup_thread = threading.Thread(target=run_consumer)
    startup_thread.start()


@app.on_event("shutdown")
async def close():
    await db_client.close_tortoise()


@app.get("/healthcheck")
@app.get("/health")
def health():
    if queue_strategy == SQS_STRATEGY:
        if cm and not cm.is_worker_closed():
            return {"status": "SUCCESS", "message": "OK"}
        else:
            raise HTTPException(status_code=500, detail="SQS Consumer not running")
    elif queue_strategy == KAFKA_STRATEGY:
        consumer_name = config.get_kafka_consumer_name
        bootstrap_servers = config.get_kafka_url
        kafka_admin = KafkaAdmin(bootstrap_servers)
        resp = kafka_admin.healthcheck(consumer_name)
        if resp["status"] == "OK":
            return {"status": "SUCCESS", "message": "OK"}
        else:
            raise HTTPException(status_code=500, detail=f"Kafka Consumer failed - {resp['state']}")
    else:
        raise HTTPException(status_code=500, detail=f"Unknown QUEUE strategy: {queue_strategy}")
