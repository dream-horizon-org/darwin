import * as t from 'io-ts'

export const JobClusterDefinitionInputSchema = t.partial({
  jobClusterDefinitionId: t.union([t.undefined, t.null, t.string]),
})

export const SelectionOnRuntimeSchema = t.type({
  id: t.union([t.null, t.string]),
  displayName: t.union([t.null, t.string]),
})

export const SelectionOnParamsSchema = t.type({
  headNodeCpuUsageThreshold: t.union([t.null, t.number]),
  workerNodeCpuUsageThreshold: t.union([t.null, t.number]),
})

export const SelectionOnAutoTerminationPoliciesSchema = t.type({
  policyName: t.union([t.null, t.string]),
  enabled: t.union([t.null, t.literal(false), t.literal(true)]),
  params: t.union([
    t.null,
    t.type({
      headNodeCpuUsageThreshold: t.union([t.null, t.number]),
      workerNodeCpuUsageThreshold: t.union([t.null, t.number]),
    }),
  ]),
})

export const SelectionOnTemplateSchema = t.type({
  id: t.union([t.null, t.string]),
  displayName: t.union([t.null, t.string]),
  memoryPerCore: t.union([t.null, t.string]),
  templateId: t.union([t.null, t.string]),
})

export const SelectionOnGpuPodSchema = t.type({
  name: t.union([t.null, t.string]),
  cores: t.union([t.null, t.number]),
  memory: t.union([t.null, t.number]),
  gpuCount: t.union([t.null, t.number]),
  gRamMemory: t.union([t.null, t.number]),
  gRamType: t.union([t.null, t.string]),
})

export const SelectionOnHeadNodeConfigSchema = t.type({
  cores: t.union([t.null, t.number]),
  memory: t.union([t.null, t.number]),
  nodeType: t.union([t.null, t.string]),
  nodeCapacityType: t.union([t.null, t.string]),
  gpuPod: t.union([
    t.null,
    t.type({
      name: t.union([t.null, t.string]),
      cores: t.union([t.null, t.number]),
      memory: t.union([t.null, t.number]),
      gpuCount: t.union([t.null, t.number]),
      gRamMemory: t.union([t.null, t.number]),
      gRamType: t.union([t.null, t.string]),
    }),
  ]),
})

export const SelectionOnDiskSettingSchema = t.type({
  diskType: t.union([t.null, t.string]),
  storageSize: t.union([t.null, t.number]),
})

export const SelectionOnWorkerNodeConfigsSchema = t.type({
  coresPerPods: t.union([t.null, t.number]),
  memoryPerPods: t.union([t.null, t.number]),
  minPods: t.union([t.null, t.number]),
  maxPods: t.union([t.null, t.number]),
  diskSetting: t.union([
    t.null,
    t.type({
      diskType: t.union([t.null, t.string]),
      storageSize: t.union([t.null, t.number]),
    }),
  ]),
  nodeType: t.union([t.null, t.string]),
  nodeCapacityType: t.union([t.null, t.string]),
  gpuPod: t.union([
    t.null,
    t.type({
      name: t.union([t.null, t.string]),
      cores: t.union([t.null, t.number]),
      memory: t.union([t.null, t.number]),
      gpuCount: t.union([t.null, t.number]),
      gRamMemory: t.union([t.null, t.number]),
      gRamType: t.union([t.null, t.string]),
    }),
  ]),
})

export const SelectionOnInstanceRoleSchema = t.type({
  id: t.union([t.null, t.number]),
  displayName: t.union([t.null, t.string]),
  roleId: t.union([t.null, t.string]),
})

export const SelectionOnAvailabilityZoneSchema = t.type({
  id: t.union([t.null, t.number]),
  displayName: t.union([t.null, t.string]),
  zoneId: t.union([t.null, t.string]),
})

export const SelectionOnRayParamsSchema = t.type({
  objectStoreMemory: t.union([t.null, t.number]),
  cpusOnHead: t.union([t.null, t.number]),
})

export const SelectionOnAdvanceConfigSchema = t.type({
  environmentVariables: t.union([t.null, t.string]),
  spark_config: t.unknown,
  logPath: t.union([t.null, t.string]),
  initScript: t.union([t.null, t.string]),
  instanceRole: t.union([
    t.null,
    t.type({
      id: t.union([t.null, t.number]),
      displayName: t.union([t.null, t.string]),
      roleId: t.union([t.null, t.string]),
    }),
  ]),
  availabilityZone: t.union([
    t.null,
    t.type({
      id: t.union([t.null, t.number]),
      displayName: t.union([t.null, t.string]),
      zoneId: t.union([t.null, t.string]),
    }),
  ]),
  rayParams: t.union([
    t.null,
    t.type({
      objectStoreMemory: t.union([t.null, t.number]),
      cpusOnHead: t.union([t.null, t.number]),
    }),
  ]),
})

export const SelectionOnDashboardsSchema = t.type({
  rayDashboardUrl: t.union([t.null, t.string]),
  sparkUIUrl: t.union([t.null, t.string]),
  grafanaDashboardUrl: t.union([t.null, t.string]),
  resourceUtilizationDashboardUrl: t.union([t.null, t.string]),
})

export const SelectionOnDataSchema = t.type({
  clusterId: t.union([t.null, t.string]),
  clusterName: t.union([t.null, t.string]),
  isJobCluster: t.union([t.null, t.literal(false), t.literal(true)]),
  status: t.union([t.null, t.string]),
  tags: t.union([t.null, t.array(t.union([t.null, t.string]))]),
  runtime: t.union([
    t.null,
    t.type({
      id: t.union([t.null, t.string]),
      displayName: t.union([t.null, t.string]),
    }),
  ]),
  inactiveTime: t.union([t.null, t.number]),
  autoTerminationPolicies: t.union([
    t.null,
    t.array(
      t.union([
        t.null,
        t.type({
          policyName: t.union([t.null, t.string]),
          enabled: t.union([t.null, t.literal(false), t.literal(true)]),
          params: t.union([
            t.null,
            t.type({
              headNodeCpuUsageThreshold: t.union([t.null, t.number]),
              workerNodeCpuUsageThreshold: t.union([t.null, t.number]),
            }),
          ]),
        }),
      ])
    ),
  ]),
  template: t.union([
    t.null,
    t.type({
      id: t.union([t.null, t.string]),
      displayName: t.union([t.null, t.string]),
      memoryPerCore: t.union([t.null, t.string]),
      templateId: t.union([t.null, t.string]),
    }),
  ]),
  user: t.union([t.null, t.string]),
  headNodeConfig: t.union([
    t.null,
    t.type({
      cores: t.union([t.null, t.number]),
      memory: t.union([t.null, t.number]),
      nodeType: t.union([t.null, t.string]),
      nodeCapacityType: t.union([t.null, t.string]),
      gpuPod: t.union([
        t.null,
        t.type({
          name: t.union([t.null, t.string]),
          cores: t.union([t.null, t.number]),
          memory: t.union([t.null, t.number]),
          gpuCount: t.union([t.null, t.number]),
          gRamMemory: t.union([t.null, t.number]),
          gRamType: t.union([t.null, t.string]),
        }),
      ]),
    }),
  ]),
  workerNodeConfigs: t.union([
    t.null,
    t.array(
      t.union([
        t.null,
        t.type({
          coresPerPods: t.union([t.null, t.number]),
          memoryPerPods: t.union([t.null, t.number]),
          minPods: t.union([t.null, t.number]),
          maxPods: t.union([t.null, t.number]),
          diskSetting: t.union([
            t.null,
            t.type({
              diskType: t.union([t.null, t.string]),
              storageSize: t.union([t.null, t.number]),
            }),
          ]),
          nodeType: t.union([t.null, t.string]),
          nodeCapacityType: t.union([t.null, t.string]),
          gpuPod: t.union([
            t.null,
            t.type({
              name: t.union([t.null, t.string]),
              cores: t.union([t.null, t.number]),
              memory: t.union([t.null, t.number]),
              gpuCount: t.union([t.null, t.number]),
              gRamMemory: t.union([t.null, t.number]),
              gRamType: t.union([t.null, t.string]),
            }),
          ]),
        }),
      ])
    ),
  ]),
  advanceConfig: t.union([
    t.null,
    t.type({
      environmentVariables: t.union([t.null, t.string]),
      spark_config: t.unknown,
      logPath: t.union([t.null, t.string]),
      initScript: t.union([t.null, t.string]),
      instanceRole: t.union([
        t.null,
        t.type({
          id: t.union([t.null, t.number]),
          displayName: t.union([t.null, t.string]),
          roleId: t.union([t.null, t.string]),
        }),
      ]),
      availabilityZone: t.union([
        t.null,
        t.type({
          id: t.union([t.null, t.number]),
          displayName: t.union([t.null, t.string]),
          zoneId: t.union([t.null, t.string]),
        }),
      ]),
      rayParams: t.union([
        t.null,
        t.type({
          objectStoreMemory: t.union([t.null, t.number]),
          cpusOnHead: t.union([t.null, t.number]),
        }),
      ]),
    }),
  ]),
  dashboards: t.union([
    t.null,
    t.type({
      rayDashboardUrl: t.union([t.null, t.string]),
      sparkUIUrl: t.union([t.null, t.string]),
      grafanaDashboardUrl: t.union([t.null, t.string]),
      resourceUtilizationDashboardUrl: t.union([t.null, t.string]),
    }),
  ]),
  createdOn: t.union([t.null, t.string]),
  createdAt: t.union([t.null, t.string]),
  estimatedCost: t.union([t.null, t.string]),
})

export const SelectionOnJobClusterDefinitionSchema = t.type({
  data: t.union([
    t.null,
    t.type({
      clusterId: t.union([t.null, t.string]),
      clusterName: t.union([t.null, t.string]),
      isJobCluster: t.union([t.null, t.literal(false), t.literal(true)]),
      status: t.union([t.null, t.string]),
      tags: t.union([t.null, t.array(t.union([t.null, t.string]))]),
      runtime: t.union([
        t.null,
        t.type({
          id: t.union([t.null, t.string]),
          displayName: t.union([t.null, t.string]),
        }),
      ]),
      inactiveTime: t.union([t.null, t.number]),
      autoTerminationPolicies: t.union([
        t.null,
        t.array(
          t.union([
            t.null,
            t.type({
              policyName: t.union([t.null, t.string]),
              enabled: t.union([t.null, t.literal(false), t.literal(true)]),
              params: t.union([
                t.null,
                t.type({
                  headNodeCpuUsageThreshold: t.union([t.null, t.number]),
                  workerNodeCpuUsageThreshold: t.union([t.null, t.number]),
                }),
              ]),
            }),
          ])
        ),
      ]),
      template: t.union([
        t.null,
        t.type({
          id: t.union([t.null, t.string]),
          displayName: t.union([t.null, t.string]),
          memoryPerCore: t.union([t.null, t.string]),
          templateId: t.union([t.null, t.string]),
        }),
      ]),
      user: t.union([t.null, t.string]),
      headNodeConfig: t.union([
        t.null,
        t.type({
          cores: t.union([t.null, t.number]),
          memory: t.union([t.null, t.number]),
          nodeType: t.union([t.null, t.string]),
          nodeCapacityType: t.union([t.null, t.string]),
          gpuPod: t.union([
            t.null,
            t.type({
              name: t.union([t.null, t.string]),
              cores: t.union([t.null, t.number]),
              memory: t.union([t.null, t.number]),
              gpuCount: t.union([t.null, t.number]),
              gRamMemory: t.union([t.null, t.number]),
              gRamType: t.union([t.null, t.string]),
            }),
          ]),
        }),
      ]),
      workerNodeConfigs: t.union([
        t.null,
        t.array(
          t.union([
            t.null,
            t.type({
              coresPerPods: t.union([t.null, t.number]),
              memoryPerPods: t.union([t.null, t.number]),
              minPods: t.union([t.null, t.number]),
              maxPods: t.union([t.null, t.number]),
              diskSetting: t.union([
                t.null,
                t.type({
                  diskType: t.union([t.null, t.string]),
                  storageSize: t.union([t.null, t.number]),
                }),
              ]),
              nodeType: t.union([t.null, t.string]),
              nodeCapacityType: t.union([t.null, t.string]),
              gpuPod: t.union([
                t.null,
                t.type({
                  name: t.union([t.null, t.string]),
                  cores: t.union([t.null, t.number]),
                  memory: t.union([t.null, t.number]),
                  gpuCount: t.union([t.null, t.number]),
                  gRamMemory: t.union([t.null, t.number]),
                  gRamType: t.union([t.null, t.string]),
                }),
              ]),
            }),
          ])
        ),
      ]),
      advanceConfig: t.union([
        t.null,
        t.type({
          environmentVariables: t.union([t.null, t.string]),
          spark_config: t.unknown,
          logPath: t.union([t.null, t.string]),
          initScript: t.union([t.null, t.string]),
          instanceRole: t.union([
            t.null,
            t.type({
              id: t.union([t.null, t.number]),
              displayName: t.union([t.null, t.string]),
              roleId: t.union([t.null, t.string]),
            }),
          ]),
          availabilityZone: t.union([
            t.null,
            t.type({
              id: t.union([t.null, t.number]),
              displayName: t.union([t.null, t.string]),
              zoneId: t.union([t.null, t.string]),
            }),
          ]),
          rayParams: t.union([
            t.null,
            t.type({
              objectStoreMemory: t.union([t.null, t.number]),
              cpusOnHead: t.union([t.null, t.number]),
            }),
          ]),
        }),
      ]),
      dashboards: t.union([
        t.null,
        t.type({
          rayDashboardUrl: t.union([t.null, t.string]),
          sparkUIUrl: t.union([t.null, t.string]),
          grafanaDashboardUrl: t.union([t.null, t.string]),
          resourceUtilizationDashboardUrl: t.union([t.null, t.string]),
        }),
      ]),
      createdOn: t.union([t.null, t.string]),
      createdAt: t.union([t.null, t.string]),
      estimatedCost: t.union([t.null, t.string]),
    }),
  ]),
})

export const JobClusterDefinitionSchema = t.type({
  jobClusterDefinition: t.union([
    t.null,
    t.type({
      data: t.union([
        t.null,
        t.type({
          clusterId: t.union([t.null, t.string]),
          clusterName: t.union([t.null, t.string]),
          isJobCluster: t.union([t.null, t.literal(false), t.literal(true)]),
          status: t.union([t.null, t.string]),
          tags: t.union([t.null, t.array(t.union([t.null, t.string]))]),
          runtime: t.union([
            t.null,
            t.type({
              id: t.union([t.null, t.string]),
              displayName: t.union([t.null, t.string]),
            }),
          ]),
          inactiveTime: t.union([t.null, t.number]),
          autoTerminationPolicies: t.union([
            t.null,
            t.array(
              t.union([
                t.null,
                t.type({
                  policyName: t.union([t.null, t.string]),
                  enabled: t.union([t.null, t.literal(false), t.literal(true)]),
                  params: t.union([
                    t.null,
                    t.type({
                      headNodeCpuUsageThreshold: t.union([t.null, t.number]),
                      workerNodeCpuUsageThreshold: t.union([t.null, t.number]),
                    }),
                  ]),
                }),
              ])
            ),
          ]),
          template: t.union([
            t.null,
            t.type({
              id: t.union([t.null, t.string]),
              displayName: t.union([t.null, t.string]),
              memoryPerCore: t.union([t.null, t.string]),
              templateId: t.union([t.null, t.string]),
            }),
          ]),
          user: t.union([t.null, t.string]),
          headNodeConfig: t.union([
            t.null,
            t.type({
              cores: t.union([t.null, t.number]),
              memory: t.union([t.null, t.number]),
              nodeType: t.union([t.null, t.string]),
              nodeCapacityType: t.union([t.null, t.string]),
              gpuPod: t.union([
                t.null,
                t.type({
                  name: t.union([t.null, t.string]),
                  cores: t.union([t.null, t.number]),
                  memory: t.union([t.null, t.number]),
                  gpuCount: t.union([t.null, t.number]),
                  gRamMemory: t.union([t.null, t.number]),
                  gRamType: t.union([t.null, t.string]),
                }),
              ]),
            }),
          ]),
          workerNodeConfigs: t.union([
            t.null,
            t.array(
              t.union([
                t.null,
                t.type({
                  coresPerPods: t.union([t.null, t.number]),
                  memoryPerPods: t.union([t.null, t.number]),
                  minPods: t.union([t.null, t.number]),
                  maxPods: t.union([t.null, t.number]),
                  diskSetting: t.union([
                    t.null,
                    t.type({
                      diskType: t.union([t.null, t.string]),
                      storageSize: t.union([t.null, t.number]),
                    }),
                  ]),
                  nodeType: t.union([t.null, t.string]),
                  nodeCapacityType: t.union([t.null, t.string]),
                  gpuPod: t.union([
                    t.null,
                    t.type({
                      name: t.union([t.null, t.string]),
                      cores: t.union([t.null, t.number]),
                      memory: t.union([t.null, t.number]),
                      gpuCount: t.union([t.null, t.number]),
                      gRamMemory: t.union([t.null, t.number]),
                      gRamType: t.union([t.null, t.string]),
                    }),
                  ]),
                }),
              ])
            ),
          ]),
          advanceConfig: t.union([
            t.null,
            t.type({
              environmentVariables: t.union([t.null, t.string]),
              spark_config: t.unknown,
              logPath: t.union([t.null, t.string]),
              initScript: t.union([t.null, t.string]),
              instanceRole: t.union([
                t.null,
                t.type({
                  id: t.union([t.null, t.number]),
                  displayName: t.union([t.null, t.string]),
                  roleId: t.union([t.null, t.string]),
                }),
              ]),
              availabilityZone: t.union([
                t.null,
                t.type({
                  id: t.union([t.null, t.number]),
                  displayName: t.union([t.null, t.string]),
                  zoneId: t.union([t.null, t.string]),
                }),
              ]),
              rayParams: t.union([
                t.null,
                t.type({
                  objectStoreMemory: t.union([t.null, t.number]),
                  cpusOnHead: t.union([t.null, t.number]),
                }),
              ]),
            }),
          ]),
          dashboards: t.union([
            t.null,
            t.type({
              rayDashboardUrl: t.union([t.null, t.string]),
              sparkUIUrl: t.union([t.null, t.string]),
              grafanaDashboardUrl: t.union([t.null, t.string]),
              resourceUtilizationDashboardUrl: t.union([t.null, t.string]),
            }),
          ]),
          createdOn: t.union([t.null, t.string]),
          createdAt: t.union([t.null, t.string]),
          estimatedCost: t.union([t.null, t.string]),
        }),
      ]),
    }),
  ]),
})

export const GraphQLWrapperSchema = t.type({
  query: t.string,
  name: t.string,
  operation: t.keyof({query: null, mutation: null, subscription: null}),
})

export const GQLSchema = t.type({
  query: t.string,
  name: t.string,
  operation: t.keyof({query: null, mutation: null, subscription: null}),
})
