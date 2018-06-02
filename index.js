const express = require('express');
const app = express();
const Promise = require('bluebird');
Promise.config({
  warnings: false
})

const _ = require('lodash');
const config = require('config');
const PORT = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const logger = require('./src/clients/logger');
const itemsjs = require('itemsjs');

const service = require('./src/services/service');

const Item = require('./src/models/item');
const User = require('./src/models/user');
const Changelog = require('./src/models/changelog');

require('./src/listeners/es.js');

const listeners = config.get('listeners_path') ? require(config.get('listeners_path')) : {};
const emitter = require('./src/clients/emitter');

const i18n = require('./src/clients/i18n');
app.use(i18n.init);

var client = require('./src/clients/elasticitems');

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


function isAdmin(req, res, next) {

  var is_ajax = req.xhr || req.headers.accept.indexOf('json') > -1;

  if (!req.user || !req.user.is_admin) {
    if (is_ajax) {
      return res.status(401).json({
      });
    }
    return res.redirect('/login');
  }

  next();
}

app.all('*', function(req, res, next) {

  req.user_id = req.user ? req.user.id : undefined;
  res.locals.item_schema = config.get('item_schema');
  res.locals.user = req.user;
  res.locals.user_display_field = config.get('user_display_field');
  res.locals.searchable_facets = config.get('searchable_facets');
  res.locals.item_display_field = config.get('item_display_field');

  res.locals.sortings = _.map(config.get('search.sortings'), (v, k) => {
    return {
      title: v.title,
      name: k
    };
  })

  res.locals.per_page_list = config.get('per_page_list');

  res.locals.configuration = config.get('search');
  res.locals.default_sort = config.get('default_sort');

  console.log('user_id');
  console.log(req.user_id);
  next();
})

app.get(['/'], async function(req, res) {

  var query = req.query;

  query.page = query.page || 1;
  query.per_page = query.per_page || 30;
  query.sort = req.query.sort || 'id_desc';

  query.filters = JSON.parse(req.query.filters || '{}');
  query.not_filters = JSON.parse(req.query.not_filters || '{}');

  var query_string = '(enabled:true OR _missing_:enabled)';

  var is_ajax = req.query.is_ajax || req.xhr;

  var result = await client.search(query)

  return res.render('views/catalog', {
    is_search_box: true,
    items: result.data.items,
    pagination: result.pagination,
    aggregations: result.data.aggregations,
    aggregations_config: config.get('search.aggregations'),
    //queue_names: config.get('enrichment.fields'),
    //pages_count_limit: pages_count_limit,
    //categories: categories,
    query: req.query.query,
    page: query.page,
    sort: query.sort,
    //facets_open: facets_open,
    is_ajax: is_ajax,
    //permalink: permalink,
    url: req.url,
    sortings: _.chain(config.get('search.sortings')).pickBy(v => {
      if (v.field.indexOf('position_') === -1) {
        return true;
      }
      return false;
    }).map((v, k) => {
      return {
        title: v.title,
        name: k
      };
    }).value(),
    filters: query.filters,
    not_filters: query.not_filters,
  });
})

app.get(['/facet/:name'], async function(req, res) {

  var result = await client.aggregation({
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
    include: [Item, User],
    //include: [User],
    order: [
      ['id', 'DESC']
    ]
  });

  return res.render('views/changelog', {
    rows: rows
  });
})

app.get(['/item/add'], async function(req, res) {

  return res.render('views/modals-content/add', {
    fields_list: config.get('add_page.fields_list')
  });
})

app.post(['/item/add'], async function(req, res) {

  console.log(req.body);

  var body = service.processItemForDB(req.body, config.get('item_schema'));
  var newItem = await service.addItem(body, req.user_id);

  await emitter.emitAsync('item.added', newItem, req.user_id);

  return res.json({});
})

/**
 * check acl here
 */
app.post(['/item/delete/:id'], isAdmin, async function(req, res) {

  var item = await service.deleteItem(req.params.id);

  var data = await service.allItems();
  client.reindex(data);

  return res.json({
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

  var json = service.processItemForDB(req.body, config.get('item_schema'));
  var newItem = await service.editItem(req.params.id, json, req.user_id);

  //var item = await Item.findById(req.params.id);
  //req.body.last_user_id = req.user.id;
  //req.body.last_activity = 'form-edit';
  //item = await item.update(req.body);
  //console.log(item);
  return res.json({});


  //var result = await emitter.emitAsync('item.edited', newItem);
  //console.log('result');
  //console.log(result);

  return res.json({});
})

app.get('/modal-facet/:name', async function(req, res) {

  var facet_conf = config.get('search.aggregations')[req.params.name] || {};

  var merge = _.merge(_.omit(facet_conf, ['type']), {
    field: req.params.name,
    name: req.params.name,
    filters: req.query.filters,
    not_filters: req.query.not_filters,
    page: req.query.page || 1,
    per_page: 100,
    size: 50000
  })

  var facet = await client.aggregation(merge)

  return res.render('views/modals-content/facet', {
    facet: facet,
    pagination: facet.pagination,
    filters: req.query.filters,
    not_filters: req.query.not_filters,
    name: req.params.name
  });
})

app.get(['/facets'], async function(req, res) {

  var output = {};
  var list = _.keys(config.get('search.aggregations'));
  var per_page = 100;

  await Promise.all(list).map(async v => {
    var r = await client.aggregation({
      name: v,
      sort: '_count',
      order: 'desc',
      per_page: per_page
    })

    output[v] = r;
  })

  return res.render('views/facets', {
    output: output,
    list: list
  });
})

app.get(['/item/raw/:id'], async function(req, res) {

  var item = await Item.findById(req.params.id);
  var item_es = await client.get(item.id);


  return res.render('views/modals-content/raw', {
    item: item,
    item_es: item_es
  });
})

app.get(['/item/:id'], async function(req, res) {

  var item = await Item.findById(req.params.id);

  var similar_list = config.get('item_page.similar_list');

  var similars = {};

  //console.log(similar_list);

  similar_list.forEach(k => {
    if (item['json'] && item['json'][k]) {
      similars[k] = client.similar(req.params.id, {
        field: k,
        per_page: 4,
        minimum: 1,
        page: 1
      })
    }
  })

  //console.log(similars);

  return res.render('views/modals-content/item', {
    item: _.merge(service.processItemForDisplay(item.json), {
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
/*app.get(['/search'], async function(req, res) {

  var queries = req.query;
  console.log(queries);

  queries.page = queries.page || 1;
  queries.per_page = queries.per_page || 30;
  queries.sort = req.query.sort || 'id_desc';

  var result = await client.search(queries)
  return res.json(result)
})*/

app.get(['/export'], async function(req, res) {

  var data = await service.allItems();

  var filename = 'export.json';
  res.attachment(filename);
  return res.status(200).send(data);
})

app.get(['/profile'], function(req, res) {

  return res.render('views/users/profile', {
  });
})

app.get(['/data'], async function(req, res) {

  var data = await service.allItems();

  return res.json({
    data: data
  });
})

app.listen(PORT, function () {
  logger.info('Your app listening on port %s!', PORT);
});
