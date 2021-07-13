const { set, get } = require('lodash')
const { PROTECTED_FIELDS } = process.env

function mapRequest (request, key, meta = { url: {}, authentication: {} }) {
  const path = meta.url.path || get(request, 'url.path', null)
  const pathname = path ? path.split('?')[0] : null
  return ({
    traceId: meta.traceId || (request.headers ? request.headers[key] : null),
    begin: meta.begin,
    method: meta.method || request.method,
    url: {
      href: meta.url.href || get(request, 'url.href', null),
      path: path,
      pathname: pathname,
      query: meta.url.query || (request.url && request.url.query && Object.keys(request.url.query).length > 0 ? request.url.query : null),
      params: meta.url.params || (request.params && Object.keys(request.params).length > 0 ? request.params : null)
    },
    payload: meta.payload || request.payload,
    community: request.headers && request.headers['x-sq-community'] ? request.headers['x-sq-community'] : null,
    authentication: {
      strategy: meta.authentication.strategy || get(request.auth, 'strategy', null),
      email: meta.authentication.email || get(request.auth, 'credentials.email', null),
      squidId: meta.authentication.squidId || get(request.auth, 'credentials.squidId', null),
      sub: meta.authentication.sub || get(request.auth, 'credentials.sub', null),
      credentials: meta.authentication.credentials || get(request.auth, 'credentials', null),
      impersonate: get(request.auth, 'credentials.impersonate', null)
    }
  })
}

function stringifyFields (meta, parseToString = true) {
  if (meta.url) {
    if (meta.url.query) meta.url.query = JSON.stringify(meta.url.query)
    if (meta.url.params) meta.url.params = JSON.stringify(meta.url.params)
    if (meta.payload) {
      Object.keys(meta.payload).forEach(k => {
        if (meta.payload[k]) {
          if ((k.indexOf('file') > -1 &&
              meta.payload[k]._data &&
              Buffer.isBuffer(meta.payload[k]._data)) ||
            /^data:(?=.*base64).*/.test(meta.payload[k])) {
            delete meta.payload[k]
          }
        }
      })
      if (parseToString) meta.payload = JSON.stringify(meta.payload)
    }
  }
  if (meta.authentication) meta.authentication.credentials = JSON.stringify(meta.authentication.credentials)
  return meta
}

function hideProtectedField (meta) {
  const protectedFields = PROTECTED_FIELDS ? PROTECTED_FIELDS.split(',') : []
  for (const field of protectedFields) {
    if (field && get(meta, field)) {
      set(meta, field, '********')
    }
  }
  return meta
}

module.exports = {
  mapRequest,
  stringifyFields,
  hideProtectedField
}
