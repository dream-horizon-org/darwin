export const getColumnConfig = (
  data: String[]
): {id: String; label: String}[] => {
  return data.map((d) => ({id: d, label: d}))
}

export const formatFeaturesData = (features) => {
  return features.reduce((acc, curr) => {
    const key = curr.title
    const sampleData = curr.sampleData
    for (let i = 0; i < sampleData.length; i++) {
      if (!acc[i]) acc[i] = {}
      acc[i][key] = sampleData[i]
    }
    return acc
  }, [])
}
