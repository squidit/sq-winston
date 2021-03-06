const { get } = require('lodash')

function mapStep (object) {
  const meta = {
    step: JSON.stringify(object),
    type: 'info'
  }
  if (object instanceof Error) {
    meta.error = object.message
    meta.status = object.statusCode || get(object.output, 'statusCode', null)
    meta.type = 'error'
  }
  if (object.stack) {
    meta.stack = object.stack
    meta.type = 'error'
  }
  if (object.statusCode) meta.status = object.statusCode
  if (object.uid) meta.uid = object.uid
  return meta
}

module.exports = {
  mapStep
}
