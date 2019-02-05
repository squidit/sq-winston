const path = require('path')
const WinstonES = require('winston-elasticsearch')
const elasticsearch = require('elasticsearch')
const moment = require('moment')
const { stringifyFields } = require('../../utils/map-request-hapi')
const { get, omit } = require('lodash')
const { ELASTIC_LOG_URL, NODE_ENV } = process.env

function getOptions (meta) {
  return ({
    type: meta.options.type,
    name: meta.options.name,
    version: meta.options.version
  })
}

const transformer = (log) => {
  const { type, name, version } = getOptions(log.meta)

  const meta = stringifyFields(omit(log.meta, ['options']) || {})
  const typelog = type || get(meta, 'type', 'custom')
  const traceId = get(meta, 'traceId')

  const packageJson = require(path.join(process.cwd(), 'package.json')) || {}

  return {
    '@timestamp': moment.utc().format(),
    message: log.message,
    severity: log.level,
    name: name || packageJson.name || 'NA',
    version: version || packageJson.version || 'NA',
    environment: NODE_ENV,
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
