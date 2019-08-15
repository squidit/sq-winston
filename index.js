const Logger = require('./src/logger')
const hapi16 = require('./src/middlewares/hapi16')
const hapi17 = require('./src/middlewares/hapi17')

module.exports = {
  logger: Logger,
  middlewares: {
    hapi16,
    hapi17
  }
}
