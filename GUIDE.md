# How to create app

## Getting started

#### Clone and install app from github

```bash
git clone git@github.com:itemsapi/curlist.git
cd curlist
npm install
```

#### Configure database in config file

Application works with SQLite + ItemsJS by default.

The system is using Sequelize ORM system so instead of SQLite it can also use PostgreSQL

Look into `./config/example.yaml` to see how SQLite database is configured

#### Run migrations

It's necessary to create a tables structure of your database.

If you use PSQL you need to create a database first

```bash
NODE_ENV=example node_modules/.bin/sequelize db:migrate
```

#### Import data

- prepare your data in json (array of objects)
- customize and run `./scripts/import.js` which imports data

#### Configure website

The website is mostly configured by yaml config file.

In `./config/example.yaml` there is example configuration.

You can configure specific things:
- facets 
- searchable fields
- searchable facets
- item schema
- list of fields in add
- list of fields in edit
- list of fields in view page

#### Run app and start working

```bash
# it will run app with example config
NODE_ENV=example npm start
```

## List of configuration options

- `item_schema` - stores information about fields. Each fields can be array, text or string by default.
- `filters_page.facets_list` 
- `item_page.fields_list`
- `item_page.similar_list`
- rest options will be documented soon

For example look into `./config/example.yaml`
