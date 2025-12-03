export interface IProps {
  currentLink: string
  linkList: Array<{path: string; label: string}>
  onLinkClick: (link: string) => void
  dataTest?: string
}
