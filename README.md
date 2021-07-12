# Elastic-Kibana Winston

Lib para log de aplicações com foco em armazenamento no **Elasticsearch** para consumo e visualização no **Kibana**.

## Antes de Começar

Antes de começar recomendo subir uma imagem Docker de ELK para testes.

Guia de instalação: https://elk-docker.readthedocs.io/#installation

- Elasticsearch: roda por default na porta 9200
- Kibana: roda por default na porta 5601

## Instalando

```sh
$ npm install github:squidit/sq-winston
```

## Utilização

Por default a lib utiliza os *transports* do Winston. Para que o log no ES seja salvo com b

```sh
ELASTIC_LOG_URL=http://localhost:9200
```

Caso não exista essa variável de ambiente, a lib não irá realizar nenhum log

### Middlewares

#### Logs de *Requests*
Para habilitar logs de *requests* (para **Hapi 16** e **Hapi 17**) segue a implementação:

- **Hapi 16:**

No *register* de *plugins*:

```
const sqWinston = require('sq-winston')

const registers = [
    hapiAuthJWT,
    swagger,
    inert,
    vision,
    swaggerUI,
    sqWinston.middlewares.hapi16
  ]
```
- **Hapi 17:**

No *register* de *plugins*:

```
const sqWinston = require('sq-winston')

const registers = [
    hapiAuthJWT,
    swagger,
    inert,
    vision,
    swaggerUI,
    sqWinston.middlewares.hapi17,
  ]
```

#### Logs de *Steps*
Para habilitar logs de *steps* segue a implementação:

No arquivo a fazer o *log*:

```
const sqWinston = require('sq-winston')

let message = '' // [[String com a mensagem a ser logada]]
const options = { } // [[Objeto com os parâmetros do *log*]]
                    // type: String - Tipo do log. 'http', 'info' (Default), 'warn', 'error
                    // name: String - Nome do projeto - Default: Nome no package.json
                    // version: String - Versão do projeto - Default: Versão no package.json
                    // environment: String - Ambiente do projeto - Default: Variável NODE_ENV
                    // request: Objeto - Objeto da request que vem do handler - Opcional

const data = { } // [[Objeto com os qualquer dado a ser stringficado]]
const traceId = logger.step(message, data, options) // a resposta do logger devolve uma hash de rastreamento
```

# Envs APM
As envs marcadas como **"*"** são **obrigatórias** e as demais são opcionais, para mais info ler a [Doc de Config APM](https://www.elastic.co/guide/en/apm/agent/nodejs/current/configuration.html) do Elastic

- EAPM_SERVER_URL*
  - Servidor APM
- EAPM_SECRET_TOKEN*
  - Token para o servidor APM
- ELASTIC_APM_ACTIVE
  - Define se os dados de APM serão enviados, default é se o NODE_ENV é production
- ELASTIC_APM_CAPTURE_BODY
  - Define se pega o body da request ( valido somente para Content-type url encoded )
- ELASTIC_APM_ERROR_MESSAGE_MAX_LENGTH
  - Define o tamanho maximo da msg
- ELASTIC_APM_API_REQUEST_SIZE
  - Define o tamanho maximo da msg
- ELASTIC_APM_CAPTURE_HEADERS
  - Define se deve guardar os headers de requests
- ELASTIC_APM_FILTER_HTTP_HEADERS
  - Define se dados sensiveis (como password, card) devem ser oculatado do header
- ELASTIC_SANITIZE_FIELD_NAMES
  - Quais os campos devem ser filtrados na hora de guardar (tanto do payload quanto do headers)
