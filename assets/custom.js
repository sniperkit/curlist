Vue.component('paginate', VuejsPaginate)

var client;
client = itemsjs([], configuration);

var vm = new Vue({
  el: '#el',

  // responsible for reactive data
  data: function () {

    // making it more generic
    var filters = {};
    Object.keys(configuration.aggregations).map(function(v) {
      filters[v] = [];
    })

    return {
      query: '',
      initialized: false,
      page: 1,
      // initializing filters with empty arrays
      filters: filters,
    }
  },
  beforeMount: function () {

    var self = this;

    $.ajax({
      url: '/data',
      method: 'GET',
      success: function(result) {
        console.log('mounted')
        client.reindex(result.data);
        self.initialized = true;
      }
    });
  },
  methods: {
    reset: function () {
      var filters = {};
      Object.keys(configuration.aggregations).map(function(v) {
        filters[v] = [];
      })

      this.filters = filters;
      this.page = 1;
      this.query = '';
    },
    addFilter: function (facetName, filterName) {
      this.filters[facetName].push(filterName);
    },
    goToPage: function (page) {
      this.page = page;
      return page;
    },
    removeFilter: function (key, filter) {
      var index = this.filters[key].indexOf(filter);
      this.filters[key].splice(index, 1);
    },
    showEditItem: function (id) {
      return showEditItem(id);
    },
    showItem: function (id) {
      return showItem(id);
    }
  },
  watch: {
    query: function () {
      this.page = 1;
    }
  },
  computed: {
    searchResult: function () {

      // necessary for refreshing data
      this.initialized

      var result = client.search({
        query: this.query,
        page: this.page,
        per_page: 30,
        filters: this.filters
      })
      return result
    },
    breadcrumbs: function () {

      var output = [];
      var filters = this.filters;
      Object.keys(filters).forEach(function(key) {

        Object.keys(filters[key]).forEach(function(key2) {
          output.push({
            key: key,
            val: filters[key][key2]
          })
        })
      });

      return output;
    }
  }
});

var showEditItem = function(id) {

  $.ajax({
    url: '/item/edit/5',
    method: 'GET',
    success: function(data) {
      $('#modalContent').html(data);
      $('#generalModal').modal({})
    }
  });

  return false;
}

function split( val ) {
  return val.split( /,\s*/ );
}

function extractLast( term ) {
  return split( term ).pop();
}

function tagitInit(selector, name) {

  $(selector).tagit({
    allowSpaces: true,
    autocomplete: {
      minLength: 0,
      source: function(request, response) {

        var query = extractLast(request.term)

        $.ajax({
          url: '/facet/' + name,
          data: {
            query: request.term
          },
          success: function(data) {
            response(data);
          }
        });
      }
    }
  });
}

$('#generalModal').on('show.bs.modal', function () {
  // initialize tagsIt after modal is loaded
  // selector and aggregation name
  var fields_list = $("#generalModal input.tags-edit").map(function(v) {
    return $(this).attr('name');
  }).get();

  fields_list.forEach(function(v) {
    tagitInit('#tags-edit-' + v, v)
  })

  //tagitInit('#tags-edit-tags', 'tags')
  //tagitInit('#tags-edit-genres', 'genres')
  //tagitInit('#tags-edit-actors', 'actors')
})


$( document ).ready(function() {
  var array = ['tags', 'actors', 'genres']

  array.forEach(function(v) {

    var selector = '#aggregation_autocomplete_' + v;

    $(selector).autocomplete({
      minLength: 0,
      source: function(request, response) {

        $.ajax({
          url: '/facet/' + v,
          data: {
            query: request.term
          },
          success: function(data) {
            response(data);
          }
        });
      },
      select: function(event, ui) {
        vm.addFilter(v, ui.item.label);
        $(selector).val('');
        return false;
      }
    })
  })
});


/**
 * serializing form for ajax requests
 */
(function ($) {
  $.fn.serializeFormJSON = function () {

    var o = {};
    var a = this.serializeArray();
    $.each(a, function () {
      if (o[this.name]) {
        if (!o[this.name].push) {
          o[this.name] = [o[this.name]];
        }
        o[this.name].push(this.value || '');
      } else {
        o[this.name] = this.value || '';
      }
    });
    return o;
  };
})(jQuery);



$(document).on('submit', '.item-edit', function(event) {

  if (event.isDefaultPrevented()) {
    return false;
  }

  var data = $(this).serializeFormJSON();
  console.log(data);

  $('#item-submit,.item-submit').text('Updating..');
  var url = $(this).attr('action')

  $.ajax({
    url: url,
    method: 'POST',
    data: $(this).serialize(),
    success: function(data) {

      console.log(data);

      //if (url === '/add') {
        //alert('Successfully added "' + data.name + '"');
      //}
      location.reload();
    },
    error: function() {
      alert('An error occured.')
      $('#item-submit,.item-submit').text('Submit');
    }
  });

  return false;
});

var currentItemId;

$('body').keydown(function(e) {

  console.log('test');

  if (currentItemId && $(".item-view").is(':visible')) {

    if (e.keyCode == 37) {
      navigateItem('left');
    }
    else if(e.keyCode == 39) {
      navigateItem('right');
    }
  }
});

var showItem = function (id) {

  if (id === undefined) {
    return false;
  }

  currentItemId = id;

  $.ajax({
    url: '/item/' + id,
    method: 'GET',
    success: function(data) {
      $('#modalContent').html(data);
      $('#generalModal').modal({})
    }
  });

  return false;
}

var showEditItem = function (id) {
  $.ajax({
    url: '/item/edit/' + id,
    method: 'GET',
    success: function(data) {
      $('#modalContent').html(data);
      $('#generalModal').modal({})
    }
  });

  return false;
}

var navigateItem = function(where) {

  if (where === 'left') {
    var prevId = $(".table-items tr[data-id='" + currentItemId + "']").prev().attr('data-id');
    showItem(prevId)
  } else if (where === 'right') {
    var nextId = $(".table-items tr[data-id='" + currentItemId + "']").next().attr('data-id');
    showItem(nextId)
  }
}
