import config from 'config'
export const hexToRGB = (hex: string, opacity: number) => {
  const hexRegex = new RegExp('^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$')
  const isValidHex = hexRegex.test(hex)
  if (isValidHex) {
    const r = parseInt(hex.slice(1, 3), 16),
      g = parseInt(hex.slice(3, 5), 16),
      b = parseInt(hex.slice(5, 7), 16)

    if (opacity) {
      return `rgba(${r}, ${g}, ${b}, ${opacity})`
    } else {
      return `rgba(${r}, ${g}, ${b})`
    }
  }
  return hex
}

export const renderIcon = () => {
  const head = document.getElementsByTagName('HEAD')[0]
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = `${config.cfBitComponentsUrl}/fontIcons/styles.css`
  head.appendChild(link)
}
