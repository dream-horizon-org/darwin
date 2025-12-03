export const dockerFileString = async (file: File): Promise<string> => {
  let dockerString = ''
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader()
    fileReader.onload = (function (file) {
      return function (e) {
        let data = this.result
        dockerString = data as string
      }
    })(file)
    fileReader.readAsText(file)

    fileReader.onloadend = () => {
      resolve(dockerString)
    }

    fileReader.onerror = (error) => {
      reject(error)
    }
  })
}
