const { createLogger } = require('winston')
const { mapStep } = require('../utils/map-step')
const { mapRequest } = require('sq-winston/src/utils/map-request-hapi')
const shortid = require('shortid')
const elasticTransport = require('./transports/elastic.transport')

const key = 'sq-traceId'

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
  static step (message, stepInfo = {}, options = {}) {
    const request = options.request || {}
    let metaStep = mapStep(stepInfo)
    let metaRequest = {}
    if (Object.keys(request).length > 0) metaRequest = mapRequest(request, key)
    const meta = { ...metaStep, ...metaRequest, options }
    if (meta.traceId) meta.traceId = shortid.generate()
    logger.log(metaStep.type, message, meta)
    return meta.traceId
  }
}

module.exports = Logger
