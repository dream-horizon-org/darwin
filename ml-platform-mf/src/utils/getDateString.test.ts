import {
  convertIntoGMT,
  convertIntoIST,
  convertToGMT,
  convertToIST,
  getDateString,
  getFormattedDate,
  getTime12Hour,
  padText
} from './getDateString'

describe('getDateString', () => {
  test('should return date in dd/mmm/yyyy format from given date Object', () => {
    const date = new Date('2018-04-04T12:13:44.000Z')
    const expected = '4th Apr 2018'
    const actual = getDateString(date)
    expect(actual).toEqual(expected)
  })
})

describe('getTime12Hour', () => {
  test('should return time in 12hr format given date object', () => {
    const date = new Date('2018-04-04T12:13:44.000')
    const expected = '00:13 PM'
    const actual = getTime12Hour(date)
    expect(actual).toEqual(expected)
  })
})

describe('padText', () => {
  it('should append zero if input is less than 10', () => {
    const INPUT_VALUE = 8
    const expected = '08'
    const actual = padText(INPUT_VALUE)
    expect(actual).toEqual(expected)
  })

  it('should return same input is number is greater >= 10', () => {
    const INPUT_VALUE = 80
    const expected = '80'
    const actual = padText(INPUT_VALUE)
    expect(actual).toEqual(expected)
  })
})

describe('convertIntoIST', () => {
  it('should convert gmt date to IST date', () => {
    const INPUT_VALUE = '2020-06-10 16:20'
    const expected = '10/06/2020 21:50'
    const actual = convertIntoIST(INPUT_VALUE)
    expect(actual).toEqual(expected)
  })
})

describe('convertToIST', () => {
  it('should convert gmt date to IST date', () => {
    const INPUT_VALUE = '2020-06-10 16:20'
    const INPUT_FORMAT = 'dd/MM/yyyy HH:mm'
    const expected = '10/06/2020 21:50'
    const actual = convertToIST(INPUT_VALUE, INPUT_FORMAT)
    expect(actual).toEqual(expected)
  })
  it('should return Invalid date for undefined date', () => {
    const INPUT_VALUE = undefined
    const INPUT_FORMAT = 'dd/MM/yyyy HH:mm'
    const expected = 'Invalid date'
    const actual = convertToIST(INPUT_VALUE, INPUT_FORMAT)
    expect(actual).toEqual(expected)
  })

  it('should return Invalid date for null date value', () => {
    const INPUT_VALUE = '13/13/2020'
    const INPUT_FORMAT = 'dd/MM/yyyy HH:mm'
    const expected = 'Invalid date'
    const actual = convertToIST(INPUT_VALUE, INPUT_FORMAT)
    expect(actual).toEqual(expected)
  })
})

describe('convertToGMT', () => {
  it('should convert ist date to GMT date', () => {
    const INPUT_VALUE = '2020-06-10 16:20'
    const INPUT_FORMAT = 'dd/MM/yyyy HH:mm'
    const expected = '10/06/2020 10:50'
    const actual = convertToGMT(INPUT_VALUE, INPUT_FORMAT)
    expect(actual).toEqual(expected)
  })

  it('should retuen invalid date for undefiend date', () => {
    const INPUT_VALUE = undefined
    const INPUT_FORMAT = 'dd/MM/yyyy HH:mm'
    const expected = 'Invalid date'
    const actual = convertToGMT(INPUT_VALUE, INPUT_FORMAT)
    expect(actual).toEqual(expected)
  })

  it('should return Invalid date date for invalid date', () => {
    const INPUT_VALUE = '13/13/2020'
    const INPUT_FORMAT = 'dd/MM/yyyy HH:mm'
    const expected = 'Invalid date'
    const actual = convertToGMT(INPUT_VALUE, INPUT_FORMAT)
    expect(actual).toEqual(expected)
  })
})
describe('convertIntoGMT', () => {
  it('should convert IST date to GMT date', () => {
    const INPUT_VALUE = '2020-06-10 16:20'
    const expected = '10/06/2020 10:50'
    const actual = convertIntoGMT(INPUT_VALUE)
    expect(actual).toEqual(expected)
  })
})

describe('getTime12Hour', () => {
  it('should return with format = HH:mm AM', () => {
    const dateObj = new Date('2020-06-10 08:20')
    const expected = '08:20 AM'
    const actual = getTime12Hour(dateObj)
    expect(actual).toEqual(expected)
  })

  it('should return with format = HH:mm PM', () => {
    const dateObj = new Date('2020-06-10 16:20')
    const expected = '04:20 PM'
    const actual = getTime12Hour(dateObj)
    expect(actual).toEqual(expected)
  })
})

describe('getFormattedDate', () => {
  it('should return date with specified format for IST date', () => {
    const INTPUT_DATE = '2020-06-10 08:20'
    const FORMAT = 'dd/MM/yyyy HH:mm'
    const expected = '10/06/2020 13:50'
    const actual = getFormattedDate(INTPUT_DATE, FORMAT, true)
    expect(actual).toEqual(expected)
  })

  it('should return date with specified format for GMT date', () => {
    const INTPUT_DATE = '2020-06-10 08:20'
    const FORMAT = 'dd/MM/yyyy HH:mm'
    const expected = '10/06/2020 08:20'
    const actual = getFormattedDate(INTPUT_DATE, FORMAT, false)
    expect(actual).toEqual(expected)
  })
})
