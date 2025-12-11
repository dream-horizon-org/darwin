package constants

import (
	"os"
)

var (
	AwsS3Bucket = map[string]string{
		"darwin-local": "darwin",
		"local": "d11-mlstag",
	}
)

// TODO: To be removed completely as this is not getting used anywhere
var (
	URL = map[string]string{
		"darwin-local": "localhost",
		"local": "darwin-mlp-stag.d11dev.com",
	}
)

var (
	ServeChartPath = map[string]string{
		"ray":     "./charts/darwin-ray-serve",
		"fastapi": "./charts/darwin-fastapi-serve",
	}
)

// TODO: Change path of charts to be referenced from anywhere

const (
	AwsS3Region                               = "us-east-1"
	LocalValuesFolder                         = "./tmp/values/"
	DashboardSuffix                           = "-dashboard/"
	JupyterSuffix                             = "-jupyter"
	MetricsSuffix                             = "-metrics/"
	PORT                                      = "8080"
	ChartPath                                 = "./charts/ray-cluster"
	ArtifactStoreS3Prefix                     = "mlp/cluster_manager/"
	LocalArtifactPath                         = "./tmp/artifacts/"
	LocalJupyterArtifactValuesPath            = "./tmp/values/jupyter/"
	LocalSparkHistoryServerArtifactValuesPath = "./tmp/values/spark-history-server/"
	KubeConfigDir                             = "./configs/"
	JupyterChartPath                          = "./charts/darwin-jupyter"
	SparkHistoryServerChartPath               = "./charts/spark-history-server"
	SparkHistoryServerArtifactS3Prefix        = "darwin/temp/spark_history_server/"
)

var (
	ENV = os.Getenv("ENV")
	AwsEndpoint = os.Getenv("AWS_ENDPOINT_OVERRIDE")
)

var (
	RayHeadNodeSelector           = "ray.io/is-ray-node=yes, ray.io/node-type=head"
	RayNodeReleaseNameLabel       = "app.kubernetes.io/instance"
	DefaultJupyterValuesConstants = map[string]interface{}{
		"nameOverride": "",
		"replicas":     1,
		"nodeSelector": map[string]interface{}{
		},
		"image": map[string]interface{}{
			"pullPolicy": "IfNotPresent",
			"repository": "localhost:5000/ray",
			"tag":        "2.37.0",
		},
		"env": []map[string]interface{}{
			{
				"name":  "SHELL",
				"value": "/bin/bash",
			},
		},
		"resources": map[string]interface{}{
			"limits": map[string]interface{}{
				"cpu":    "2",
				"memory": "4Gi",
			},
			"requests": map[string]interface{}{
				"cpu":    "2",
				"memory": "4Gi",
			},
		},
		"volumeMounts": []map[string]interface{}{
			{
				"name":      "persistent-storage",
				"mountPath": "/home/ray/fsx",
			},
		},
	}
)

var MaxSecretHistory = 3
