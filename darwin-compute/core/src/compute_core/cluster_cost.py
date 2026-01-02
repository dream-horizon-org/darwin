import sys

from compute_core.constant.constants import PredictionTables


# TODO: Consider fetching pricing data from AWS Pricing API instead of hardcoded tables
class PredictAPI:
    def __init__(self):
        pass

    def get_price(self, instance: list, node_capacity_type: str):
        # TODO: we can choose to remove this feature or have a better way of managing prices
        if node_capacity_type == "ondemand":
            return instance[3]
        else:
            # TODO: Lets remove this 
            return max(instance[4], 0.3 * instance[3])
            # temp[4] is the minimum spot price. Spot price ranges b/w 10-50% of on-demand - logic assumes an avg. of 30% and takes the maximum of the two

    def core_search(self, prediction_table: list, cores: int, node_capacity_type: str):
        # searches for the instance type having cores greater or equal to the input param in the specified prediction table (refer constants) and returns its ondemand/spot price
        for row in prediction_table:
            if row[1] >= cores:
                return self.get_price(row, node_capacity_type)
        return -1

    def memory_search(self, prediction_table: list, memory: int, node_capacity_type: str):
        # searches for the instance type having memory greater or equal to the input param in the specified prediction table (refer constants) and returns its ondemand/spot price
        for row in prediction_table:
            if row[2] >= memory:
                return self.get_price(row, node_capacity_type)
        return sys.maxsize

    def cost_calc(self, cores: int, memory: int, node_capacity_type: str):
        # cmr = core is to memory ratio - which is usually in the form of 1:x; x>=1. Since, we need x for calculation, we have used cmr = x here
        cmr = memory / cores

        # The logic searches for the best instance (in different CMR tables named as CMR value - like oneTwo => CMR = 1:2) to schedule a pod with specified cores and memory

        if cmr <= 2:
            return self.core_search(PredictionTables.oneTwo, cores, node_capacity_type)

        if 2 < cmr < 4:
            price_one_two = self.memory_search(PredictionTables.oneTwo, memory, node_capacity_type)
            price_one_four = self.core_search(PredictionTables.oneFour, cores, node_capacity_type)
            return min(price_one_two, price_one_four)
        if cmr == 4:
            return self.core_search(PredictionTables.oneFour, cores, node_capacity_type)

        if 4 < cmr < 8:
            price_one_four = self.memory_search(PredictionTables.oneFour, memory, node_capacity_type)
            price_one_eight = self.core_search(PredictionTables.oneEight, cores, node_capacity_type)
            return min(price_one_four, price_one_eight)
        if cmr == 8:
            return self.core_search(PredictionTables.oneEight, cores, node_capacity_type)

        if cmr > 8:
            return self.memory_search(PredictionTables.oneEight, memory, node_capacity_type)

    def get_gpu_cost(self, gpu_name: str, gpu_count: int):
        price = PredictionTables.gpuPricing.get(gpu_name, {}).get(gpu_count, None)
        if price is None:
            raise ValueError(f"Unsupported GPU config: {gpu_name} with {gpu_count} GPUs")
        return price

    def get_ray_cluster_cost(self, head_details, worker_details) -> tuple:
        head_cost = {"cpu": 0, "gpu": 0}
        if head_details.node_type == "gpu":
            head_cost["gpu"] = self.get_gpu_cost(head_details.gpu_pod.name, head_details.gpu_pod.gpu_count)
        else:
            head_cost["cpu"] = self.cost_calc(head_details.cores, head_details.memory, head_details.node_capacity_type)

        worker_cost = {"cpu": {"min": 0, "max": 0}, "gpu": {"min": 0, "max": 0}}
        for worker_group in worker_details:
            key = "gpu" if worker_group.node_type == "gpu" else "cpu"
            if key == "gpu":
                worker_pod_cost = self.get_gpu_cost(worker_group.gpu_pod.name, worker_group.gpu_pod.gpu_count)
            else:
                worker_pod_cost = self.cost_calc(
                    worker_group.cores_per_pods, worker_group.memory_per_pods, worker_group.node_capacity_type
                )
            worker_cost[key]["min"] += worker_group.min_pods * worker_pod_cost
            worker_cost[key]["max"] += worker_group.max_pods * worker_pod_cost

        # TODO: Magic multipliers 1.706 and 1.727 are unexplained - document or make configurable
        min_cost = round(
            (head_cost["gpu"] + worker_cost["gpu"]["min"]) + 1.706 * (head_cost["cpu"] + worker_cost["cpu"]["min"]), 3
        )
        max_cost = round(
            (head_cost["gpu"] + worker_cost["gpu"]["max"]) + 1.727 * (head_cost["cpu"] + worker_cost["cpu"]["max"]), 3
        )

        # NOTE: We are quoting a value 50% higher to approximately match up with the allocation metric provided by Kubecost (possibly discontinued).
        # Estimates to be improved overtime based on feedback and observation as more data comes in and cost visibility tools are standardised/implemented

        return min_cost, max_cost
