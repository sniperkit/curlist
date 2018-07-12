# Curlist

Experimental tool for creating curated list of domains. 

## Requirements

- Node >= 8.x
- SQLite or PostgreSQL
- Elasticsearch
- Redis

## Getting started

```bash
git clone git@github.com:itemsapi/curlist.git
cd curlist
npm install

# generate database schema
NODE_ENV=domains node_modules/.bin/sequelize db:migrate

# configure your database, elasticsearch and item_schema
vim config/domains.yaml

# create index in Elasticsearch
NODE_ENV=domains node scripts/db-to-es.js
PORT=3000 npm start

# run worker in case you want to process data (in background)
NODE_ENV=domains nodemon worker
```

## Current features

- exploring data by filters and full text search
- data history (changelog)
- integrations with external API's 
- import / export by using CSV
- processing data efficiently in background (jobs queue)

## Integrations 

- https://github.com/digestoo/website-to-json-dockerized
- https://github.com/digestoo/tech-detector
- https://github.com/digestoo/ecommerce-crawler

## License 

This library is created by Mateusz Rzepa and licensed under the GPL.
