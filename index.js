const express = require('express');
const app = express();
const Promise = require('bluebird');
Promise.config({
  warnings: false
})

const _ = require('lodash');
const PORT = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const logger = require('./src/clients/logger');
const itemsjs = require('itemsjs');
const service = require('./src/services/service');
const config = require('config');

const Item = require('./src/models/item');
const User = require('./src/models/user');
const Changelog = require('./src/models/changelog');

var client;

require('./src/clients/itemsjs')(result => {
  client = result;
  console.log('loaded itemsjs');
});

const nunenv = require('./src/clients/nunenv')(app, './', {
  autoescape: true,
  watch: true,
  noCache: true
})

app.use('/bootstrap', express.static('node_modules/bootstrap'));
app.use('/assets', express.static('assets'));
app.use('/docs', express.static('docs'));
app.use('/libs', express.static('bower_components'));
app.use('/libs/vuejs-paginate', express.static('node_modules/vuejs-paginate/dist'));

app.use(bodyParser.json({limit: '10mb'}));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

app.set('view engine', 'html.twig');
app.set('view cache', false);
app.engine('html.twig', nunenv.render);


var session = require('express-session');
var cookieParser = require('cookie-parser');
var SequelizeStore = require('connect-session-sequelize')(session.Store);

app.use(cookieParser())
app.use(session({
  secret: 'curlist',
  store: new SequelizeStore({
    db: require('./src/clients/sequelize')
  }),
  saveUninitialized: false,
  resave: false,
  proxy: true
}))

require('./src/clients/passport')(app)

app.all('*', function(req, res, next) {

  req.user_id = req.user ? req.user.id : undefined;
  res.locals.item_schema = config.get('item_schema');
  res.locals.searchable_facets = config.get('searchable_facets');


  res.locals.configuration = config.get('search');

  console.log('user_id');
  console.log(req.user_id);
  next();
})

app.get(['/'], function(req, res) {

  return res.render('views/catalog', {
    is_search_box: true
  });
})

app.get(['/facet/:name'], function(req, res) {

  var result = client.aggregation({
    name: req.params.name,
    query: req.query.query,
    per_page: 10
  })

  return res.json(_.map(result.data.buckets, function(val) {
    return {
      value: val.key,
      label: val.key
    }
  }))
})

app.get(['/changelog'], async function(req, res) {

  var rows = await Changelog.findAll({
    limit: 20,
    //include: [Item, User],
    include: [User],
    order: [
      ['id', 'DESC']
    ]
  });

  return res.render('views/changelog', {
    rows: rows
  });
})

app.get(['/item/edit/:id'], async function(req, res) {

  var item = await Item.findById(req.params.id);

  return res.render('views/modals-content/edit', {
    fields_list: config.get('edit_page.fields_list'),
    item: _.merge(item.json, {
      id: item.id
    })
  });
})

app.post(['/item/edit/:id'], async function(req, res) {

  var body = service.processItemForDB(req.body, config.get('item_schema'));
  var newItem = await service.editItem(req.params.id, body, req.user_id);

  return res.json({});
})

app.get(['/facets'], async function(req, res) {

  var output = {};
  var list = _.keys(config.get('search.facets'));
  var per_page = 100;

  await Promise.all(list).map(v => {
    var r = client.aggregation({
      name: v,
      per_page: per_page
    })

    output[v] = r;
  })

  return res.render('views/facets', {
    output: output,
    list: list
  });
})

app.get(['/item/:id'], async function(req, res) {

  var item = await Item.findById(req.params.id);

  var similar_list = config.get('item_page.similar_list');

  var similars = {};

  similar_list.forEach(v => {
    similars[v] = client.similar(req.params.id, {
      field: v,
      per_page: 4,
      page: 1
    })
  })

  return res.render('views/modals-content/item', {
    item: _.merge(item.json, {
      id: item.id
    }),
    fields_list: config.get('item_page.fields_list'),
    similar_list: similar_list,
    similars: similars
  });
})

/**
 * not used right now but there will be itemsjs or elasticsearch data
 * get by ajax
 */
app.get(['/search'], async function(req, res) {

  var result = client.search({
    per_page: 10
  })

  return res.json(result)
})

app.get(['/data'], async function(req, res) {

  var items = await Item.findAll({
    //raw: true
    order: [
      ['id', 'DESC']
    ]
  });

  var data = _.map(items, v => {
    return Object.assign({
      id: v.id
    }, v.json);
  });

  return res.json({
    data: data
  });
})

app.listen(PORT, function () {
  logger.info('Your app listening on port %s!', PORT);
});
