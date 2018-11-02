const path = require('path')
const WinstonES = require('winston-elasticsearch')
const elasticsearch = require('elasticsearch')
const moment = require('moment')
const { get, omit } = require('lodash')
const { ELASTIC_LOG_URL } = process.env

const transformer = (log) => {
  const meta = log.meta || {}
  const type = get(meta, 'type', 'custom')
  const traceId = get(meta, 'traceId')

  const packageJson = require(path.join(process.cwd(), 'package.json')) || {}

  return {
    '@timestamp': moment.utc().format(),
    message: log.message,
    severity: log.level,
    name: packageJson.name || 'NA',
    version: packageJson.version || 'NA',
    environment: process.env.NODE_ENV,
    type,
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
