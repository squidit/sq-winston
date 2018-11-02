const { createLogger } = require('winston')

const elasticTransport = require('./transports/elastic.transport')

/**
 * Retorna todos os transporter que serão utilizados pelo Winston
 */
function getTransports () {
  const transports = [elasticTransport]
  return transports.filter(t => t !== null)
}

/**
 * Cria o objeto de log do Winston
 */
const logger = createLogger({
  transports: getTransports()
})

/**
 * Classe com funções estáticas para realizar o log
 */
class Logger {
  static error (message, meta = {}) {
    logger.log('error', message, meta)
  }
  static warn (message, meta = {}) {
    logger.log('warn', message, meta)
  }
  static info (message, meta = {}) {
    logger.log('info', message, meta)
  }
}

module.exports = Logger
