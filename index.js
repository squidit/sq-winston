const Logger = require('./src/logger')
const hapi16 = require('./src/middlewares/hapi16')

module.exports = {
  logger: Logger,
  middlewares: {
    hapi16
  }
}
