{{/* vim: set filetype=mustache: */}}
{{/*
Expand the name of the chart.
*/}}
{{- define "ray-cluster.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "ray-cluster.fullname" -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name := default .Chart.Name .Values.nameOverride -}}
{{- if contains $name .Release.Name -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}
{{- end -}}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "ray-cluster.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Common labels
*/}}
{{- define "ray-cluster.labels" -}}
{{- $labels := default (dict) .Values.labels }}
helm.sh/chart: {{ include "ray-cluster.chart" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/name: {{ include "ray-cluster.name" . }}
rayCluster: {{ include "ray-cluster.fullname" $ }}
app.kubernetes.io/component: {{ .Values.cluster_type }}
darwin.dream11.com/resource-instance-id: {{ .Release.Name }}
org_name: dream11
component_type: pod
resource_type: application
provisioned-by-user: {{ .Values.user }}
environment_name: {{ default "local" (index $labels "environment") }}
service_name: {{ default "darwin" (index $labels "service") }}
component_name: {{ default .Values.cluster_name (index $labels "project") }}
squad: {{ default "data-science" (index $labels "squad") }}
{{- $ignore := list "environment" "service" "project" "squad" }}
{{- range $k, $v := $labels }}
  {{- if not (has $k $ignore) }}
{{ $k }}: {{ $v | quote }}
  {{- end }}
{{- end }}
{{- end -}}

{{/*
Create the name of the service account to use
*/}}
{{- define "ray-cluster.serviceAccountName" -}}
{{- if .Values.serviceAccount.create -}}
    {{ default (include "ray-cluster.fullname" .) .Values.serviceAccount.name }}
{{- else -}}
    {{ default "default" .Values.serviceAccount.name }}
{{- end -}}
{{- end -}}

{{/*
Ray Cluster Monitoring Common Labels
*/}}
{{- define "ray-cluster.monitoring.labels" -}}
{{- $labels := default (dict) .Values.labels }}
helm.sh/chart: {{ include "ray-cluster.chart" . }}
org_name: dream11
component_type: pod
resource_type: application
provisioned-by-user: {{ .Values.user }}
environment_name: {{ default "local" (index $labels "environment") }}
service_name: {{ default "darwin" (index $labels "service") }}
component_name: {{ default .Values.cluster_name (index $labels "project") }}
squad: {{ default "data-science" (index $labels "squad") }}
{{- $ignore := list "environment" "service" "project" "squad" }}
{{- range $k, $v := $labels }}
  {{- if not (has $k $ignore) }}
{{ $k }}: {{ $v | quote }}
  {{- end }}
{{- end }}
{{- end -}}
