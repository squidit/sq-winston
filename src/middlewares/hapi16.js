const shortid = require('shortid')
const moment = require('moment')
const Logger = require('../logger')

const key = 'sq-traceId'

const plugin = function (server, options, next) {
  server.ext('onRequest', (request, reply) => {
    // Gera um identificador único para o request
    if (!request.headers[key]) request.headers[key] = shortid.generate()

    // Adiciona no context do request um objeto com as propriedades para log
    request.meta = {
      traceId: request.headers[key],
      method: request.method,
      url: {
        href: request.url.href,
        path: request.url.path,
        query: request.url.query,
        params: request.params
      },
      payload: request.payload,
      begin: moment.utc()
    }

    return reply.continue()
  })

  server.ext('onPostAuth', (request, reply) => {
    request.meta.authentication = {
      strategy: request.auth.strategy,
      credentials: request.auth.credentials
    }

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
    if (request.response instanceof Error) {
      logFn = Logger.error
      meta.status = request.response.output.statusCode
      meta.error = request.response.message
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
