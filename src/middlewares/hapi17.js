const shortid = require('shortid')
const Logger = require('../logger')
const moment = require('moment')
const { mapRequest, stringifyFields } = require('sq-winston/src/utils/map-request-hapi')
const apm = require('elastic-apm-node')

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
      const apmHeaders = {}
      const currentTransaction = apm.currentTransaction
      if (currentTransaction) {
        apmHeaders['trace.id'] = currentTransaction.traceId
        apmHeaders['transaction.id'] = currentTransaction.id
      }
      if (!request.headers['trace.id'] && !request.headers['transaction.id']) {
        request.headers = {
          ...request.headers,
          ...apmHeaders
        }
      }

      if (request.payload && apm.isStarted()) {
        const {payload} = stringifyFields({ url: true, payload: request.payload }, false)
        apm.setCustomContext({
          payload
        })
        Logger.info('Info', {
          ...apmHeaders,
          payload: JSON.stringify(payload)
        })
      }
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
