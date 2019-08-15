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

Por default a lib utiliza os *transports* do Winston. Para que o log no ES seja salvo com sucesso, é necessário exportar a variável de ambiente **ELASTIC_LOG_URL** antes de rodar o seu projeto.

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
