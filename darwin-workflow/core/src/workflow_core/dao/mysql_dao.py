import aiomysql
from workflow_core.constants.configs import Config


class MysqlDao:
    def __init__(self, env: str):
        self.config = Config(env).db_config
        self.pool = None

    async def initialize_database_connection_pool(self):
        if self.pool is None:
            self.pool = await aiomysql.create_pool(
                host=self.config['host'],
                port=self.config['port'],
                user=self.config['username'],
                password=self.config['password'],
                db=self.config['database'],
                charset='utf8mb4',
                autocommit=True,
                minsize=5,
                connect_timeout=5,  # 5 second timeout for connection establishment
                pool_recycle=3600  # Recycle connections after 1 hour to avoid stale connections
            )

    async def healthcheck(self):
        try:
            async with self.pool.acquire() as connection:
                async with connection.cursor() as cursor:
                    await cursor.execute("SELECT 1")
                    result = await cursor.fetchone()
                    return result
        except Exception as e:
            raise Exception(f"Database Error: {str(e)}")

    async def execute_mysql_query_async(self, query, params):
        try:
            async with self.pool.acquire() as connection:
                async with connection.cursor() as cursor:
                    await cursor.execute(query, params)
                    result = await cursor.fetchall()
        except Exception as e:
            raise Exception(f"Database Error: {str(e)}")
        return result
