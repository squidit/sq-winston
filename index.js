const Logger = require('./src/logger')
const hapi16 = require('./src/middlewares/hapi16')
const hapi17 = require('./src/middlewares/hapi17')
const apm = require('elastic-apm-node')

function setupAPM () {
  const {
    EAPM_SECRET_TOKEN,
    EAPM_SERVER_URL
  } = process.env
  const isAPMEnvSetted = !!(EAPM_SECRET_TOKEN && EAPM_SERVER_URL)

  if (!apm.isStarted() && isAPMEnvSetted) {
    //  Config Optional Envs
    apm.start({
      secretToken: EAPM_SECRET_TOKEN,
      serverUrl: EAPM_SERVER_URL
    })
  } else {
    console.log(`EAPM_SECRET_TOKEN and EAPM_SERVER_URL is required`)
  }
}

module.exports = {
  logger: Logger,
  setupAPM,
  apm: require('elastic-apm-node'),
  middlewares: {
    hapi16,
    hapi17
  }
}
