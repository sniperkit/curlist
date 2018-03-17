# Curlist

The very experimental tool for creating curated list. 
The mission is to create a framework for creating data oriented web applications.

## Requirements

- Node >= 8.x
- SQLite or PostgreSQL
- ItemsJS

## Getting started

In progress..

## Useful commands

```bash
# create or update a table
node_modules/.bin/sequelize migration:generate --name changelog
# make migration
node_modules/.bin/sequelize db:migrate


# create db user
sudo -u postgres createuser mateusz
# create db
sudo -u postgres createdb curlist 
# drop db
sudo -u postgres dropdb curlist 
```

## Current features

- exploring data by filters and full text search
- items changelog
- items editing 
- fast view
- list of all filters

## License 

This library is created by Mateusz Rzepa and licensed under the GPL.
