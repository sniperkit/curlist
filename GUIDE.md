# How to create app

## Getting started

- clone app from github
- configure database in config file (sqlite + itemsjs by default)
- run migrations
- prepare your data in json (array of objects)
- customize and run `./scripts/import.js` which imports data
- customize `./config/default.yaml` for your need i.e.: 
  - facets 
  - searchable fields
  - searchable facets
  - item schema
  - list of fields in add
  - list of fields in edit
  - list of fields in view page
- run app and start working
