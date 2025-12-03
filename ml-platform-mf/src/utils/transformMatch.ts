import {format} from 'date-fns'
export const transformMatch = (data) => {
  const matchObj: any = {}
  matchObj.totalCount = data.totalCount
  matchObj.matches = data.matches.map((item) => ({
    id: item.matchId,
    matchName: `${item.squads[0].name} vs ${item.squads[1].name}`,
    matchDate: item?.startTime && format(new Date(item.startTime), 'dd/MM/yyyy')
  }))
  return matchObj
}
