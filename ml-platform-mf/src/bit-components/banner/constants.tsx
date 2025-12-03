export enum Severity {
  Success = 'success',
  Warning = 'warning',
  Information = 'information',
  Failure = 'failure'
}

export const BannerSeverityList = [
  {value: Severity.Success, text: 'Success'},
  {value: Severity.Warning, text: 'Warning'},
  {value: Severity.Information, text: 'Information'},
  {value: Severity.Failure, text: 'Failure'}
]
