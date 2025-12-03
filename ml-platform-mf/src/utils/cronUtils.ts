import cronstrue from 'cronstrue'

export const convertCronToString = (cron: string) =>
  cronstrue.toString(cron, {throwExceptionOnParseError: false})
