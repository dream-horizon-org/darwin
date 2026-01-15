from src.util import otel_bootstrap
from src.util.otel_util import otel_instrumentor
from os import environ

from fastapi import FastAPI, APIRouter

from src.client.mysql_client import MysqlClient
from src.constant.constants import ENV_ENVIRONMENT_VARIABLE
from src.rest import entities, link, processed_event, transformer, source, raw_event, cluster_event
from src.transformers.utils.transformer_utils import get_instance_id_from_ip
from src.util.event_utils import get_ui_events
from src.transformers.utils.register_utils import register_transformers

db_client = MysqlClient()
root_path = environ.get("ROOT_PATH", "")
app = FastAPI(root_path=root_path)
otel_instrumentor(app=app)
env = environ.get(ENV_ENVIRONMENT_VARIABLE, "local")
db_client.init_db(app)

app.include_router(entities.entity_router, prefix="/api/v1")
app.include_router(link.link_router, prefix="/api/v1")
app.include_router(processed_event.processed_event_router, prefix="/api/v1")
app.include_router(raw_event.raw_event_router, prefix="/api/v1")
app.include_router(source.source_router, prefix="/api/v1")
app.include_router(transformer.transformer_router, prefix="/api/v1")
app.include_router(cluster_event.cluster_event_router, prefix="/api/v1")

router = APIRouter()


@router.get("/healthcheck")
@router.get("/health")
async def healthcheck():
    return {"status": "SUCCESS", "message": "OK"}


@router.get("/severities")
async def severities():
    # TODO Put into constants
    return {
        "data": ["INFO", "WARN", "ERROR"]
    }


@router.get("/event-types")
async def event_types():
    return {
        "data": get_ui_events()
    }


@router.get("/ec2-details/{ip_address}")
async def ec2_details(ip_address: str):
    return {
        "data": get_instance_id_from_ip(ip_address)
    }


app.include_router(router)

@app.on_event("startup")
async def init():
    register_transformers()
    if env in ["uat", "prod"]:
        return
    await db_client.init_tortoise()


@app.on_event("shutdown")
async def close():
    await db_client.close_tortoise()
