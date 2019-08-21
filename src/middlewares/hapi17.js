const shortid = require('shortid')
const Logger = require('../logger')
const moment = require('moment')
const { mapRequest } = require('sq-winston/src/utils/map-request-hapi')

const key = 'sq-traceId'

const plugin = {
  register: (server, options, next) => {
  server.ext('onRequest', (request, reply) => {
    // Gera um identificador único para o request
    if (!request.headers[key]) request.headers[key] = shortid.generate()

    // Adiciona no context do request um objeto com as propriedades para log
    request.meta = mapRequest(request, key)
    request.meta.begin = moment.utc()

    return reply.continue
  })

  server.ext('onPostAuth', (request, reply) => {
    request.meta = mapRequest(request, key, request.meta)

    return reply.continue
  })

  server.ext('onPreResponse', (request, reply) => {
    request.meta = mapRequest(request, key)
    // Recupera o header do response para enviar o traceId
    const headers = request.response instanceof Error ? request.response.output.headers : request.response.headers
    headers[key] = request.headers[key]

    // Adiciona as propriedades do request
    request.meta.end = moment.utc()
    request.meta.duration = request.meta.end - request.meta.begin

    // Adiciona os metas do log
    const meta = {
      type: 'http',
      ...request.meta
    }

    // Verifica se ocorreu erro no request para adicionar os respctivos metas
    let logFn = null
    meta.status = request.response.statusCode
      ? request.response.statusCode
      : (request.response.output ? request.response.output.statusCode : 599)
    if (request.response instanceof Error ||
      !!request.response.stack ||
      meta.status >= 400) {
      logFn = Logger.error
      meta.error = typeof request.response.message === 'string'
        ? request.response.message
        : request.response.source ? JSON.stringify(request.response.source) : 'No message available'
      meta.stack = typeof request.response.stack === 'string'
        ? request.response.stack
        : (request.response.source && request.response.source.stack ? request.response.source.stack : 'No stack available')
      meta.details = typeof request.response.details === 'string'
        ? request.response.details
        : request.response.details ? JSON.stringify(request.response.details) : 'No message available'
    } else {
      logFn = Logger.info
    }

    // Cria de fato o registro de log
    logFn(meta.error || 'Success', meta)

    return reply.continue
  })

    next
  },
  name: 'sq-winston',
  options: {
    apiVersion: require('../../package.json').version
  }
}

module.exports = plugin
