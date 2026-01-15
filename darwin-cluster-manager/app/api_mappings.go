package app

import (
	"compute/cluster_manager/rest/clusterv2"
	"compute/cluster_manager/rest/command_execute"
	"compute/cluster_manager/rest/healthcheck"
	"compute/cluster_manager/rest/jupyter_client"
	"compute/cluster_manager/rest/resource_instance"
	"compute/cluster_manager/rest/serve"
	"compute/cluster_manager/rest/spark_history_server"
)

func mapAPIs() {
	router.GET("/healthcheck", healthcheck.Healthcheck)
	router.GET("/health", healthcheck.Healthcheck)

	router.POST("compute/v2/cluster", clusterv2.Create)
	router.PUT("compute/v2/cluster", clusterv2.Update)
	router.PUT("compute/v2/cluster/start", clusterv2.Start)
	router.PUT("compute/v2/cluster/stop", clusterv2.Stop)
	router.PUT("compute/v2/cluster/restart", clusterv2.Restart)
	router.PUT("compute/v2/cluster/status", clusterv2.Status)
	router.GET("compute/v2/cluster", clusterv2.GetAll)
	router.POST("compute/v1/serve", serve.Create)
	router.PUT("compute/v1/serve/deploy", serve.Start)
	router.PUT("compute/v1/serve/undeploy", serve.Stop)
	router.PUT("compute/v1/serve/status", serve.Status)

	jupyter := router.Group("/jupyter")
	{
		jupyter.POST("/start", jupyter_client.Create)
		jupyter.POST("/delete", jupyter_client.Delete)
		jupyter.PUT("/restart", jupyter_client.Restart)
	}

	sparkHistoryServer := router.Group("/spark-history-server")
	{
		sparkHistoryServer.POST("/start", spark_history_server.Start)
		sparkHistoryServer.POST("/stop", spark_history_server.Stop)
		sparkHistoryServer.GET("/:id/status", spark_history_server.GetStatus)
	}

	resourceInstance := router.Group("/resource-instance")
	{
		resourceInstance.POST("/", resource_instance.CreateResourceArtifact)
		resourceInstance.PUT("/chart", resource_instance.UpdateResourceArtifactChart)
		resourceInstance.PATCH("/values", resource_instance.UpdateResourceArtifactValues)
		resourceInstance.POST("/start", resource_instance.StartResourceInstance)
		resourceInstance.POST("/stop", resource_instance.StopResourceInstance)
		resourceInstance.POST("/status", resource_instance.ResourceInstanceStatus)
	}

	router.POST("/execute", command_execute.Execute)
}
