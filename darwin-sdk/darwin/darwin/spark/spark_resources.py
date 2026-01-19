from dataclasses import dataclass

import ray

from darwin.util.constants import SPARK_MEMORY_UTILIZATION_FACTOR


@dataclass
class SparkResources:
    """Spark resources configuration."""

    driver_cores: int
    driver_memory: str
    executor_cores: int
    executor_memory: str
    num_executors: int

    def __str__(self):
        return (
            f"driver_cores: {self.driver_cores}, "
            f"driver_memory: {self.driver_memory}, "
            f"executor_cores: {self.executor_cores}, "
            f"executor_memory: {self.executor_memory}, "
            f"num_executors: {self.num_executors}, "
        )

    def __post_init__(self):
        if self.driver_cores < 1:
            raise ValueError("driver_cores must be at least 1")
        if self.executor_cores < 1:
            raise ValueError("executor_cores must be at least 1")
        if self.num_executors < 1:
            raise ValueError("num_executors must be at least 1")
        if not self.driver_memory.endswith("G"):
            raise ValueError("driver_memory must end with 'G'")
        if not self.executor_memory.endswith("G"):
            raise ValueError("executor_memory must end with 'G'")

    def add_executor_memory(self, memory: int) -> str:
        self.executor_memory = str(int(self.executor_memory[:-1]) + memory) + "G"
        return self.executor_memory


def _is_dynamic_allocation_enabled(spark_conf: dict) -> bool:
    return (
        spark_conf.get("spark.dynamicAllocation.enabled", False)
        or spark_conf.get("spark.dynamicAllocation.enabled", "false").lower() == "true"
    )


def prepare_resources(spark_conf: dict) -> SparkResources:
    spark_resources: SparkResources = SparkResources(
        driver_cores=1,
        driver_memory="1G",
        executor_cores=1,
        executor_memory="1G",
        num_executors=1,
    )
    spark_conf = spark_conf or {}
    if not ray.is_initialized():
        ray.init("auto", logging_level=30, log_to_driver=False)
        if _is_dynamic_allocation_enabled(spark_conf):
            spark_resources.num_executors = int(spark_conf.get("spark.dynamicAllocation.minExecutors", 2))
        else:
            spark_resources.num_executors = spark_conf.get("spark.executor.instances", len(ray.nodes()) - 1)

    for node in ray.nodes():
        if "worker" in node["NodeManagerHostname"]:
            spark_resources.executor_cores = int(
                spark_conf.get("spark.executor.cores", int(node["Resources"]["CPU"] - 1))
            )
            spark_resources.executor_memory = spark_conf.get(
                "spark.executor.memory",
                spark_resources.add_executor_memory(
                    int(
                        spark_conf.get(
                            "spark.darwin.nodeMemoryFactor",
                            SPARK_MEMORY_UTILIZATION_FACTOR,
                        )
                        * node["Resources"]["memory"]
                        / pow(10, 9)
                    )
                ),
            )
            break
    return spark_resources
