function mapRequest (request, key, meta = { url: {}, authentication: {} }) {
  return ({
    traceId: meta.traceId || request.headers[key],
    method: meta.method || request.method,
    url: {
      href: meta.url.href || request.url.href,
      path: meta.url.path || request.url.path,
      query: meta.url.query || (Object.keys(request.url.query).length > 0 ? request.url.query : null),
      params: meta.url.params || (Object.keys(request.params).length > 0 ? request.params : null)
    },
    payload: meta.payload || request.payload,
    authentication: {
      strategy: meta.authentication.strategy || (request.auth ? request.auth.strategy : null),
      email: meta.authentication.email || (request.auth && request.auth.credentials ? request.auth.credentials.email : null),
      squidId: meta.authentication.squidId || (request.auth && request.auth.credentials ? request.auth.credentials.squidId : null),
      sub: meta.authentication.sub || (request.auth && request.auth.credentials ? request.auth.credentials.sub : null),
      credentials: meta.authentication.credentials || (request.auth ? request.auth.credentials : null)
    }
  })
}

function stringifyFields (meta) {
  if (meta.url) {
    if (meta.url.query) meta.url.query = JSON.stringify(meta.url.query)
    if (meta.url.params) meta.url.params = JSON.stringify(meta.url.params)
  }
  if (meta.authentication) meta.authentication.credentials = JSON.stringify(meta.authentication.credentials)
  return meta
}

module.exports = {
  mapRequest,
  stringifyFields
}