const path = require('path')
const WinstonES = require('winston-elasticsearch')
const elasticsearch = require('elasticsearch')
const moment = require('moment')
const { stringifyFields, hideProtectedField } = require('../../utils/map-request-hapi')
const { get, omit } = require('lodash')
const { ELASTIC_LOG_URL, NODE_ENV } = process.env

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

const elasticTransport = ELASTIC_LOG_URL
  ? new WinstonES({
    client: new elasticsearch.Client({
      host: ELASTIC_LOG_URL
    }),
    transformer
  })
  : null

module.exports = elasticTransport
