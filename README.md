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
