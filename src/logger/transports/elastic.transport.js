const path = require('path')
const WinstonES = require('winston-elasticsearch')
const elasticsearch = require('elasticsearch')
const moment = require('moment')
const { stringifyFields, hideProtectedField } = require('../../utils/map-request-hapi')
const { get, omit } = require('lodash')
const { ELASTIC_LOG_INDEX_PREFIX, ELASTIC_LOG_PASSWORD, ELASTIC_LOG_URL, ELASTIC_LOG_USER, NODE_ENV } = process.env

function getOptions (meta) {
  return ({
    type: get(meta, 'options.type'),
    name: get(meta, 'options.name'),
    version: get(meta, 'options.version'),
    environment: get(meta, 'options.environment')
  })
}

const transformer = (log) => {
  const { type, name, version, environment } = getOptions(log.meta)

  const meta = stringifyFields(hideProtectedField(omit(log.meta, ['options', 'begin'])) || {})
  const typelog = type || get(meta, 'type', 'custom')
  const traceId = get(meta, 'traceId')

  const packageJson = require(path.join(process.cwd(), 'package.json')) || {}

  return {
    '@timestamp': moment.utc().format(),
    message: log.message,
    severity: log.level,
    name: name || packageJson.name || 'NA',
    version: version || packageJson.version || 'NA',
    environment: environment || NODE_ENV,
    type: typelog,
    traceId,
    fields: omit(meta, ['type', 'traceId'])
  }
}

function getESOptions () {
  const options = {
    host: ELASTIC_LOG_URL
  }
  if (ELASTIC_LOG_USER && ELASTIC_LOG_PASSWORD) {
    options.httpAuth = `${ELASTIC_LOG_USER}:${ELASTIC_LOG_PASSWORD}`
  }

  return options
}

let elasticTransport = null
if (ELASTIC_LOG_URL) {
  const opts = {
    client: new elasticsearch.Client(getESOptions()),
    transformer
  }
  if (ELASTIC_LOG_INDEX_PREFIX && ELASTIC_LOG_INDEX_PREFIX.includes('payments')) {
    opts.index = ELASTIC_LOG_INDEX_PREFIX
  } else {
    opts.indexPrefix = ELASTIC_LOG_INDEX_PREFIX ? ELASTIC_LOG_INDEX_PREFIX : 'logs'
  }

  elasticTransport = new WinstonES(opts)
}


const elasticTransportImpersonate = ELASTIC_LOG_URL
  ? new WinstonES({
    client: new elasticsearch.Client(getESOptions()),
    transformer,
    index: 'impersonate'
  })
  : null

module.exports = {
  elasticTransport,
  elasticTransportImpersonate
}
