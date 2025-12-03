const winston = require('winston')
const url = require('url')

// Winston v2 configuration
const consoleConfig = {
  level: process.env.LOG_LEVEL || 'info',
  colorize: true,
  timestamp: true,
  prettyPrint: true,
}

const logger = new winston.Logger({
  transports: [
    new winston.transports.Console(consoleConfig),
  ],
  exitOnError: false,
})

const consoleLogger = new winston.Logger({
  transports: [
    new winston.transports.Console(consoleConfig),
  ],
  exitOnError: false,
})

const loggerWinston = {
  logger,
  consoleLogger,
  getStream: function(loggerInstance: any) {
    return {
      write: function(message: string, encoding?: string) {
        try {
          const parsedMessage = JSON.parse(message)
          if (parsedMessage.url) {
            parsedMessage.path = url.parse(parsedMessage.url).pathname
          }
          loggerInstance.info(parsedMessage)
        } catch (e) {
          loggerInstance.info(message)
        }
      },
    }
  },
}

export {logger, consoleLogger}
export default loggerWinston
