const Logger = require('./src/logger')
const hapi16 = require('./src/middlewares/hapi16')
const hapi17 = require('./src/middlewares/hapi17')
const apm = require('elastic-apm-node')
const get = require('lodash/get')

function setupAPM () {
  const { EAPM_SECRET_TOKEN, EAPM_SERVER_URL, ELASTIC_APM_ACTIVE, NODE_ENV } = process.env
  const isAPMEnvSetted = !!(EAPM_SECRET_TOKEN && EAPM_SERVER_URL)
  if (!apm.isStarted() && isAPMEnvSetted) {
    apm.start({
      secretToken: EAPM_SECRET_TOKEN,
      serverUrl: EAPM_SERVER_URL,
      active: ELASTIC_APM_ACTIVE || NODE_ENV === 'production'
    })
    //  Add filter to remove password fields from payload
    apm.addFilter((payload) => {
      const payloadPassword = get(payload, 'context.request.payload.password')
      if (payloadPassword) {
        payload.context.request.payload.password = '[REDACTED]'
      }
      // remember to return the modified payload
      return payload
    })
  }
}

setupAPM()

module.exports = {
  logger: Logger,
  apm,
  middlewares: {
    hapi16,
    hapi17
  }
}
