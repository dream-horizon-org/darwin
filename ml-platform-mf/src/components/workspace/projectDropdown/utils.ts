export const getProjectDropdownTabs = (myProjectCounts, otherProjectsCount) => {
  return [
    {
      label: 'My Workspace',
      projectCount: myProjectCounts,
      iconPosition: 'end' as 'end' | 'start' | 'bottom' | 'top'
    },
    {
      label: 'Other Workspaces',
      projectCount: otherProjectsCount,
      iconPosition: 'end' as 'end' | 'start' | 'bottom' | 'top'
    }
  ]
}
