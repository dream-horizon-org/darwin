const LINK_ID = 'bit-typography-font-link'

export const typographyFunc = () => {
  if (document.getElementById(LINK_ID)) {
    return
  }
  const head = document.getElementsByTagName('HEAD')[0]
  const link = document.createElement('link')
  link.id = LINK_ID
  link.rel = 'stylesheet'
  link.href =
    'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap'
  head.appendChild(link)
}

export const style = {
  background: '#121212',
  width: '100%',
  height: '90%',
  display: 'flex',
  padding: '20px',
  justifyContent: 'center'
}
