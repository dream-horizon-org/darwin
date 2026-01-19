package command_execute

import (
	dto "compute/cluster_manager/dto/command_execute"
	"compute/cluster_manager/utils/kube_utils"
	"compute/cluster_manager/utils/kubeconfig_utils"
	"compute/cluster_manager/utils/rest_errors"
)

type CommandExecuteService struct{}

func (c *CommandExecuteService) CommandExecute(request dto.CommandExecute, requestId string) rest_errors.RestErr {
	kubeConfigPath, kubeConfigErr := kubeconfig_utils.GetKubeConfigPath(request.KubeCluster)
	if kubeConfigErr != nil {
		return kubeConfigErr
	}

	//	Execute command on resource instance
	_, err := kube_utils.ExecuteCommandOnMultiplePodsContainer(requestId, kubeConfigPath, request.KubeNamespace, request.LabelSelector, request.ContainerName, request.Command)
	if err != nil {
		return err
	}

	return nil
}
