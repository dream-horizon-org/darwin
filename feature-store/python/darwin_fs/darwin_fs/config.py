import os

USER_ENV = os.environ.get("ENV", 'prod')
if USER_ENV == "uat":
  os.environ['TEAM_SUFFIX'] = '-uat'
elif USER_ENV == "darwin-local":
  os.environ['TEAM_SUFFIX'] = ''

TEAM_SUFFIX = os.environ.get('TEAM_SUFFIX', '')
VPC_SUFFIX = os.environ.get('VPC_SUFFIX', '')

DARWIN_OFS_V2_HOST = "http://darwin-ofs-v2" + TEAM_SUFFIX + ".dream11" + VPC_SUFFIX + ".local"
DARWIN_OFS_V2_ADMIN_HOST = "http://darwin-ofs-v2-admin" + TEAM_SUFFIX + ".dream11" + VPC_SUFFIX + ".local"
DARWIN_OFS_V2_WRITER_HOST = "http://darwin-ofs-v2-writer" + TEAM_SUFFIX + ".dream11" + VPC_SUFFIX + ".local"

# darwin-local uses localhost ingress
if USER_ENV == "darwin-local":
  DARWIN_OFS_V2_HOST = "http://localhost/feature-store"
  DARWIN_OFS_V2_ADMIN_HOST = "http://localhost/feature-store-admin"
  DARWIN_OFS_V2_WRITER_HOST = "http://localhost/feature-store"

# writer only on prod
if USER_ENV != 'prod' and USER_ENV != 'darwin-local':
  DARWIN_OFS_V2_WRITER_HOST = DARWIN_OFS_V2_HOST

DARWIN_OFS_V2_KAFKA_HOST = "darwin-ofs-v2-kafka" + TEAM_SUFFIX + ".dream11" + VPC_SUFFIX + ".local"
if USER_ENV == "darwin-local":
  DARWIN_OFS_V2_KAFKA_HOST = "localhost:9092"

SDK_ENV = os.environ.get("sdk.python.environment", '')
if SDK_ENV == "test":
  DARWIN_OFS_V2_HOST = os.environ.get("ofs.server.host")
  DARWIN_OFS_V2_ADMIN_HOST = os.environ.get("ofs.admin.host")
  DARWIN_OFS_V2_WRITER_HOST = os.environ.get("ofs.server.host")
  DARWIN_OFS_V2_KAFKA_HOST = os.environ.get("ofs.kafka.host")

DARWIN_OFS_V2_ADMIN_ENTITY_ENDPOINT = "/entity"
DARWIN_OFS_V2_ADMIN_ENTITY_METADATA_ENDPOINT = "/entity/metadata"
DARWIN_OFS_V2_ADMIN_FG_ENDPOINT = "/feature-group"
DARWIN_OFS_V2_ADMIN_FG_METADATA_ENDPOINT = "/feature-group/metadata"
DARWIN_OFS_V2_ADMIN_FG_SCHEMA_ENDPOINT = "/feature-group/schema"
DARWIN_OFS_V2_ADMIN_FG_LATEST_VERSION_ENDPOINT = "/feature-group/version"

DARWIN_OFS_V2_FG_WRITE_V1_ENDPOINT = "/feature-group/write-features-v1"
DARWIN_OFS_V2_FG_WRITE_V2_ENDPOINT = "/feature-group/write-features-v2"
DARWIN_OFS_V2_FG_READ_ENDPOINT = "/feature-group/read-features"
DARWIN_OFS_V2_FG_MULTI_READ_ENDPOINT = "/feature-group/multi-read-features"

DARWIN_OFS_V2_OFFLINE_STORE_BASE_S3_PATH = f"s3a://darwin-ofs-v2-tables{TEAM_SUFFIX}/"

if TEAM_SUFFIX != '' or VPC_SUFFIX != '':
  print(f"not pointing to prod\nTEAM_SUFFIX is set to {TEAM_SUFFIX}\nVPC_SUFFIX is set to {VPC_SUFFIX}")
  print(f"using configs:")
  print(f"\tofs_host: {DARWIN_OFS_V2_HOST}")
  print(f"\tofs_writer_host: {DARWIN_OFS_V2_WRITER_HOST}")
  print(f"\tofs_admin_host: {DARWIN_OFS_V2_ADMIN_HOST}")
  print(f"\tofs_kafka_host: {DARWIN_OFS_V2_KAFKA_HOST}")
