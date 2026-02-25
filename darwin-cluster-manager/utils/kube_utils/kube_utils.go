package kube_utils

import (
	"compute/cluster_manager/dto/resource_instance"
	"compute/cluster_manager/utils/logger"
	"compute/cluster_manager/utils/rest_errors"
	"context"
	"fmt"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/elbv2"
	"github.com/aws/aws-sdk-go/service/resourcegroupstaggingapi"
	"go.uber.org/zap"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/tools/clientcmd"
)

type ServeStatusDto struct {
	ServeName      string
	ActivePods     int
	TotalPods      int
	AlbStatus      string
	TargetsHealthy int
	TotalTargets   int
	Resources      []ClusterResourceDto
}

type ClusterStatusDto struct {
	ClusterName string
	Resources   []ClusterResourceDto
}

type ClusterResourceDto struct {
	Name    string
	Type    string
	Status  string
	Message string
}

type PodReleaseNameDto struct {
	Name   string
	Status string
}

func GetResources(clusterName string, namespace string, KubeConfigPath string) (ClusterStatusDto, rest_errors.RestErr) {
	pods, restError := GetPods(clusterName, namespace, "rayCluster="+clusterName+"-kuberay", KubeConfigPath)
	if restError != nil {
		return ClusterStatusDto{}, restError
	}
	// TODO
	// lbs, rest_error := GetSvc(cluster_name, namespace)
	// if rest_error != nil {
	// 	return ClusterStatusDto{},rest_error
	// }
	// resources := append(pods,lbs...)
	return ClusterStatusDto{clusterName, pods}, nil
}

// GetAllReleases Get All Releases in the given namespace using the given selectors
//
//	namespace : string : namespace of the cluster
//	kubeConfigPath : string : path to the kube config file
//	selectors : string : selectors to filter the pods
//	releaseNameLabel : string : label of the pod to fetch the release name
//
// Returns: []PodReleaseNameDto : list of releases (name, status)
func GetAllReleases(namespace string, kubeConfigPath string, selectors string, releaseNameLabel string, requestId string) ([]PodReleaseNameDto, rest_errors.RestErr) {
	config, err := clientcmd.BuildConfigFromFlags("", kubeConfigPath)
	if err != nil {
		return nil, rest_errors.NewInternalServerError(fmt.Sprintf("Failed to build config from the config path %s", kubeConfigPath), err)
	}
	logger.DebugR(requestId, "Kube config built", logger.Field("kube_config_path", kubeConfigPath))

	clientSet, err := kubernetes.NewForConfig(config)
	if err != nil {
		return nil, rest_errors.NewInternalServerError("Failed to initiate k8s client", err)
	}
	logger.DebugR(requestId, "Kube client initiated")

	releases, err := clientSet.CoreV1().Pods(namespace).List(context.TODO(), metav1.ListOptions{
		LabelSelector: selectors,
	})
	if err != nil {
		return nil, rest_errors.NewInternalServerError("Error getting the pods of ray cluster", err)
	}
	logger.DebugR(requestId, "Releases fetched")

	var resources []PodReleaseNameDto
	for _, release := range releases.Items {
		resources = append(resources, PodReleaseNameDto{
			release.ObjectMeta.Labels[releaseNameLabel],
			string(release.Status.Phase)})
	}
	return resources, nil
}

func GetPods(clusterName string, namespace string, labelselector string, KubeConfigPath string) ([]ClusterResourceDto, rest_errors.RestErr) {
	config, err := clientcmd.BuildConfigFromFlags("", KubeConfigPath)
	if err != nil {
		restError := rest_errors.NewInternalServerError("Error getting config", err)
		return nil, restError
	}
	clientset, err := kubernetes.NewForConfig(config)
	if err != nil {
		restError := rest_errors.NewInternalServerError("Error initiating the kube config", err)
		return nil, restError
	}
	pods, err := clientset.CoreV1().Pods(namespace).List(context.TODO(), metav1.ListOptions{
		LabelSelector: labelselector})
	if err != nil {
		restError := rest_errors.NewInternalServerError("Error getting the pods of ray cluster", err)
		return nil, restError
	}

	var resources []ClusterResourceDto
	for _, pod := range pods.Items {
		newResource := ClusterResourceDto{pod.ObjectMeta.Name, "pod", string(pod.Status.Phase), pod.Status.Message}
		if newResource.Status == "Running" {
			allContainersReady := true
			for _, containerStatus := range pod.Status.ContainerStatuses {
				if !containerStatus.Ready {
					allContainersReady = false
					break
				}
			}
			if !allContainersReady {
				newResource.Status = "Pending"
				newResource.Message = "Containers are not ready"
			}
		}
		resources = append(resources, newResource)
	}
	return resources, nil
}

func GetServeALBArnWithTag(tagKey string, tagValue string) (string, rest_errors.RestErr) {
	sess := session.Must(session.NewSession(
		aws.NewConfig().WithRegion("us-east-1"),
	))
	resourceapiClient := resourcegroupstaggingapi.New(sess)
	tagFilters := &resourcegroupstaggingapi.TagFilter{}
	tagFilters.Key = aws.String(tagKey)
	tagFilters.Values = append(tagFilters.Values, aws.String(tagValue))

	getResourcesInput := &resourcegroupstaggingapi.GetResourcesInput{}
	getResourcesInput.TagFilters = append(getResourcesInput.TagFilters, tagFilters)
	getResourcesInput.ResourceTypeFilters = append(
		getResourcesInput.ResourceTypeFilters,
		aws.String("elasticloadbalancing:loadbalancer"),
	)

	resources, err := resourceapiClient.GetResources(getResourcesInput)
	if err != nil {
		return "", rest_errors.NewInternalServerError("Error getting the resources from AWS", err)
	}

	if resources.ResourceTagMappingList == nil || len(resources.ResourceTagMappingList) == 0 {
		return "", rest_errors.NewInternalServerError("No ALB found", nil)
	}
	albArn := *resources.ResourceTagMappingList[0].ResourceARN

	return albArn, nil
}

func GetALBStatus(albArn string) (ClusterResourceDto, rest_errors.RestErr) {
	sess := session.Must(session.NewSession(
		aws.NewConfig().WithRegion("us-east-1"),
	))
	elb := elbv2.New(sess)
	input := &elbv2.DescribeLoadBalancersInput{}
	input.LoadBalancerArns = append(input.LoadBalancerArns, aws.String(albArn))
	result, e := elb.DescribeLoadBalancers(input)
	if e != nil {
		return ClusterResourceDto{}, rest_errors.NewInternalServerError("Error getting the resources from AWS", e)
	}
	if result.LoadBalancers == nil || len(result.LoadBalancers) == 0 {
		return ClusterResourceDto{}, rest_errors.NewInternalServerError("No ALB found", e)
	}
	resp := ClusterResourceDto{}
	resp.Name = albArn
	resp.Type = "alb"
	resp.Status = *result.LoadBalancers[0].State.Code
	if result.LoadBalancers[0].State.Reason != nil {
		resp.Message = *result.LoadBalancers[0].State.Reason
	}
	return resp, nil
}

func GetTargetGroupStatus(albArn string) ([]ClusterResourceDto, rest_errors.RestErr) {
	sess := session.Must(session.NewSession(
		aws.NewConfig().WithRegion("us-east-1"),
	))

	elb := elbv2.New(sess)
	input := &elbv2.DescribeTargetGroupsInput{}
	input.LoadBalancerArn = aws.String(albArn)
	result, e := elb.DescribeTargetGroups(input)
	if e != nil {
		return []ClusterResourceDto{}, rest_errors.NewInternalServerError("Error getting the resources from AWS", e)
	}
	var resources []ClusterResourceDto
	for _, targetGroup := range result.TargetGroups {
		input := &elbv2.DescribeTargetHealthInput{}
		input.TargetGroupArn = targetGroup.TargetGroupArn
		result, e := elb.DescribeTargetHealth(input)
		if e != nil {
			return []ClusterResourceDto{}, rest_errors.NewInternalServerError("Error getting the resources from AWS", e)
		}
		for _, target := range result.TargetHealthDescriptions {
			temp := ClusterResourceDto{}
			temp.Name = *target.Target.Id
			temp.Type = "target"
			temp.Status = *target.TargetHealth.State
			if target.TargetHealth.Reason != nil {
				temp.Message = *target.TargetHealth.Reason
			}
			resources = append(resources, temp)
		}
	}

	return resources, nil
}

func GetRayServeStatus(serveName string, namespace string, KubeConfigPath string) (ServeStatusDto, rest_errors.RestErr) {
	response := ServeStatusDto{}
	response.ServeName = serveName
	pods, err := GetPods(serveName, namespace, "rayCluster="+serveName+"-kuberay", KubeConfigPath)
	if err != nil {
		return ServeStatusDto{}, err
	}
	activePods := 0
	for _, pod := range pods {
		if pod.Status == "Running" {
			activePods++
		}
	}
	response.ActivePods = activePods
	response.TotalPods = len(pods)
	response.Resources = pods
	albArn, err := GetServeALBArnWithTag("ingress.k8s.aws/stack", namespace+"/serve-"+serveName)
	if err != nil {
		return ServeStatusDto{}, err
	}
	alb, err := GetALBStatus(albArn)
	if err != nil {
		return ServeStatusDto{}, err
	}
	response.AlbStatus = alb.Status
	response.Resources = append(response.Resources, alb)
	targetGroups, err := GetTargetGroupStatus(albArn)
	if err != nil {
		return ServeStatusDto{}, err
	}
	targetsHealthy := 0
	for _, target := range targetGroups {
		if target.Status == "healthy" {
			targetsHealthy++
		}
	}
	response.TargetsHealthy = targetsHealthy
	response.TotalTargets = len(targetGroups)
	response.Resources = append(response.Resources, targetGroups...)

	return response, nil
}

// GetFastapiServeStatus TODO Add other resources
func GetFastapiServeStatus(serveName string, namespace string, KubeConfigPath string) (ServeStatusDto, rest_errors.RestErr) {
	response := ServeStatusDto{}
	response.ServeName = serveName
	pods, err := GetPods(serveName, namespace, "app.kubernetes.io/name="+serveName, KubeConfigPath)
	if err != nil {
		return ServeStatusDto{}, err
	}
	activePods := 0
	for _, pod := range pods {
		if pod.Status == "Running" {
			activePods++
		}
	}
	response.ActivePods = activePods
	response.TotalPods = len(pods)
	response.Resources = pods
	albArn, err := GetServeALBArnWithTag("ingress.k8s.aws/stack", "istio-system/"+serveName+"-"+namespace+"-internal")
	if err != nil {
		return ServeStatusDto{}, err
	}
	alb, err := GetALBStatus(albArn)
	if err != nil {
		return ServeStatusDto{}, err
	}
	response.AlbStatus = alb.Status
	response.Resources = append(response.Resources, alb)
	targetGroups, err := GetTargetGroupStatus(albArn)
	if err != nil {
		return ServeStatusDto{}, err
	}
	targetsHealthy := 0
	for _, target := range targetGroups {
		if target.Status == "healthy" {
			targetsHealthy++
		}
	}
	response.TargetsHealthy = targetsHealthy
	response.TotalTargets = len(targetGroups)
	response.Resources = append(response.Resources, targetGroups...)
	return response, nil
}

func GetPodsStatus(requestId string, kubeConfigPath string, namespace string, labelSelector string) ([]resource_instance.PodsData, rest_errors.RestErr) {
	config, err := clientcmd.BuildConfigFromFlags("", kubeConfigPath)
	if err != nil {
		logger.ErrorR(requestId, "Failed to build config from the config path", zap.Any("Error", err))
		restError := rest_errors.NewInternalServerError("Error getting k8s client config", err)
		return nil, restError
	}

	clientSet, err := kubernetes.NewForConfig(config)
	if err != nil {
		logger.ErrorR(requestId, "Failed to initiate k8s client", zap.Any("Error", err))
		restError := rest_errors.NewInternalServerError("Error initiating the kube config", err)
		return nil, restError
	}

	pods, err := clientSet.CoreV1().Pods(namespace).List(context.TODO(), metav1.ListOptions{LabelSelector: labelSelector})
	if err != nil {
		logger.ErrorR(requestId, "Failed to get the pods", zap.Any("Error", err))
		restError := rest_errors.NewInternalServerError("Error getting the pods", err)
		return nil, restError
	}

	var resources []resource_instance.PodsData
	for _, pod := range pods.Items {
		newResource := resource_instance.PodsData{pod.ObjectMeta.Name, string(pod.Status.Phase), pod.Status.Message}
		if newResource.Status == "Running" {
			allContainersReady := true
			for _, containerStatus := range pod.Status.ContainerStatuses {
				if !containerStatus.Ready {
					allContainersReady = false
					break
				}
			}
			if !allContainersReady {
				newResource.Status = "Pending"
				newResource.Message = "Containers are not ready"
			}
		}
		resources = append(resources, newResource)
	}

	logger.DebugR(requestId, "Pods fetched successfully")
	return resources, nil
}
