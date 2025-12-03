import config from 'config'
export const style = {
  background: '#121212',
  width: '80%',
  height: '80%',
  display: 'flex',
  justifyContent: 'center',
  color: 'rgba(217, 217, 217, 1)',
  padding: '20px'
}
export const iconMock = () => {
  const head = document.getElementsByTagName('HEAD')[0]
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = `${config.cfBitComponentsUrl}/fontIcons/styles.css`
  head.appendChild(link)
  const link2 = document.createElement('link')
  link2.rel = 'stylesheet'
  link2.href =
    'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap'
  head.appendChild(link2)
}
