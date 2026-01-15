#!/usr/bin/env python3
"""
Ray Cluster Test Script
Tests distributed task execution across all nodes in the Ray cluster.
"""

import os
import socket
from collections import Counter

import ray


def main():
    # Initialize Ray - connects to existing cluster via RAY_ADDRESS env var
    ray.init()

    print("=" * 60)
    print("RAY CLUSTER STATUS")
    print("=" * 60)

    # Show cluster resources
    resources = ray.cluster_resources()
    print(f"\nCluster Resources:")
    print(f"  CPUs: {resources.get('CPU', 0)}")
    print(f"  Memory: {resources.get('memory', 0) / 1e9:.2f} GB")
    print(f"  Object Store: {resources.get('object_store_memory', 0) / 1e9:.2f} GB")

    # Show nodes
    nodes = ray.nodes()
    alive_nodes = [n for n in nodes if n["Alive"]]
    dead_nodes = [n for n in nodes if not n["Alive"]]

    print(f"\nNodes: {len(alive_nodes)} alive, {len(dead_nodes)} dead")
    for node in alive_nodes:
        node_name = node.get("NodeName", "unknown")
        hostname = node.get("NodeManagerHostname", "unknown")
        cpus = node.get("Resources", {}).get("CPU", 0)
        is_head = "node:__internal_head__" in node.get("Resources", {})
        role = "HEAD" if is_head else "WORKER"
        print(f"  [{role}] {hostname} ({node_name}) - {cpus} CPUs")

    print("\n" + "=" * 60)
    print("RUNNING DISTRIBUTED TASKS")
    print("=" * 60)

    @ray.remote
    def get_node_info(task_id):
        """Get information about the node executing this task."""
        import time

        time.sleep(0.1)  # Small delay to allow distribution
        return {
            "task_id": task_id,
            "hostname": socket.gethostname(),
            "ip": socket.gethostbyname(socket.gethostname()),
            "pid": os.getpid(),
            "node_id": ray.get_runtime_context().get_node_id()[:8],
        }

    @ray.remote
    def compute_square(x):
        """Simple compute task."""
        import time

        time.sleep(0.05)
        return {"input": x, "result": x * x, "hostname": socket.gethostname()}

    # Test 1: Get node info from multiple tasks
    print("\nTest 1: Node Discovery")
    print("-" * 40)
    num_discovery_tasks = 20
    futures = [get_node_info.remote(i) for i in range(num_discovery_tasks)]
    results = ray.get(futures)

    # Group by hostname
    hosts = Counter(r["hostname"] for r in results)
    print(f"Tasks distributed across {len(hosts)} node(s):")
    for hostname, count in sorted(hosts.items()):
        print(f"  {hostname}: {count} tasks")

    # Test 2: Compute tasks
    print("\nTest 2: Distributed Computation")
    print("-" * 40)
    num_compute_tasks = 50
    compute_futures = [compute_square.remote(i) for i in range(num_compute_tasks)]
    compute_results = ray.get(compute_futures)

    # Verify results
    all_correct = all(r["result"] == r["input"] ** 2 for r in compute_results)
    compute_hosts = Counter(r["hostname"] for r in compute_results)

    print(f"Computed {num_compute_tasks} squares - All correct: {all_correct}")
    print(f"Distribution across {len(compute_hosts)} node(s):")
    for hostname, count in sorted(compute_hosts.items()):
        print(f"  {hostname}: {count} tasks")

    print("\n" + "=" * 60)
    print("CLUSTER TEST COMPLETE")
    print("=" * 60)

    if len(hosts) > 1:
        print("\n✅ SUCCESS: Tasks were distributed across multiple nodes!")
    else:
        print("\n⚠️  WARNING: All tasks ran on a single node.")
        print("   This may indicate worker nodes are not accepting tasks.")

    ray.shutdown()


if __name__ == "__main__":
    main()
