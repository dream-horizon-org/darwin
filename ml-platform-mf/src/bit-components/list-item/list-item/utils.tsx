import config from 'config'
export const iconMockFun = () => {
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
export const style = {
  background: '#121212',
  width: '90%',
  height: '90%',
  display: 'flex',
  padding: '20px',
  justifyContent: 'center'
}

export const mockAvatarLInk =
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZmlsZXxlbnwwfHwwfHw%3D&w=1000&q=80'
