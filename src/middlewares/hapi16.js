const shortid = require('shortid')
const Logger = require('../logger')
const moment = require('moment')
const { mapRequest, stringifyFields } = require('../utils/map-request-hapi')
const apm = require('elastic-apm-node')

const key = 'sq-traceId'

const plugin = function (server, options, next) {
  server.ext('onRequest', (request, reply) => {
    // Gera um identificador único para o request
    if (!request.headers[key]) request.headers[key] = shortid.generate()

    // Adiciona no context do request um objeto com as propriedades para log
    request.meta = mapRequest(request, key)
    request.meta.begin = moment.utc()

    return reply.continue()
  })

  server.ext('onPostAuth', (request, reply) => {
    request.meta = mapRequest(request, key, request.meta)

    return reply.continue()
  })

  server.ext('onPreResponse', (request, reply) => {
    request.meta = mapRequest(request, key)

    // Recupera o header do response para enviar o traceId
    const headers = request.response instanceof Error ? request.response.output.headers : request.response.headers
    headers[key] = request.headers[key]
    const currentTransaction = apm.currentTransaction || {}
    headers['trace.id'] = request.headers['trace.id'] || currentTransaction.traceId
    headers['transaction.id'] = request.headers['transaction.id'] || currentTransaction.id

    // Adiciona os metas do log
    const meta = {
      type: 'http',
      ...request.meta
    }

    if (request.payload && apm.isStarted()) {
      const {payload} = stringifyFields({ url: true, payload: request.payload }, false)
      apm.setCustomContext({
        payload
      })

      Logger.info('Payload Info', {
        ...headers,
        payloadString: JSON.stringify(payload),
        payload
      })
    }

    let logFn = Logger.info
    meta.status = request.response.statusCode || request.response.statusCode

    const isErrorRequest = request.response instanceof Error || !!request.response.stack || meta.status >= 400
    
    if (isErrorRequest) {
      logFn = Logger.error
      meta.error = 'No message available'
      meta.stack = 'No stack available'
      meta.details = 'No message available'

      if (typeof request.response.message === 'string') {
        meta.error = request.response.message
      } else if (request.response.source) {
        meta.error = JSON.stringify(request.response.source)
      }

      if (typeof request.response.stack === 'string') {
        meta.stack = request.response.stack
      } else if (request.response.source && request.response.source.stack) {
        meta.stack = request.response.source.stack
      }

      if (typeof request.response.details === 'string') {
        meta.details = request.response.details
      } else if (request.response.details) {
        meta.details = JSON.stringify(request.response.details)
      }
    }

    // Cria de fato o registro de log
    const {ELASTIC_LOG_INDEX_PREFIX} = process.env
    const isIndexPayments = ELASTIC_LOG_INDEX_PREFIX && ELASTIC_LOG_INDEX_PREFIX.includes('payments')
    const isIndexImpersonate = ELASTIC_LOG_INDEX_PREFIX && ELASTIC_LOG_INDEX_PREFIX.includes('payments')
    if (isIndexImpersonate || isIndexPayments) {
      logFn(meta.error || 'Success', meta)
    }

    return reply.continue()
  })

  next()
}
plugin.attributes = { name: 'sq-winston-hapi16', version: '0.0.1' }

module.exports = plugin
