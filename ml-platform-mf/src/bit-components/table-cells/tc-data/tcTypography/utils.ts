export const typographyFunc = () => {
  const head = document.getElementsByTagName('HEAD')[0]
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href =
    'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap'
  head.appendChild(link)
}
