const shortid = require('shortid')
const Logger = require('../logger')
const moment = require('moment')
const { mapRequest } = require('sq-winston/src/utils/map-request-hapi')

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
    if (request.response instanceof Error ||
      !!request.response.stack ||
      (request.response.output && request.response.output.statusCode >= 400) ||
      request.response.statusCode >= 400) {
      logFn = Logger.error
      meta.status = request.response.output.statusCode || request.response.statusCode
      meta.error = request.response.message
      meta.stack = request.response.stack
    } else {
      logFn = Logger.info
      meta.status = request.response.statusCode
    }

    // Cria de fato o registro de log
    logFn(meta.error || 'Success', meta)

    return reply.continue()
  })

  next()
}
plugin.attributes = { name: 'sq-winston-hapi16', version: '0.0.1' }

module.exports = plugin
