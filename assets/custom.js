

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

        console.log(query);

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

  // it's not working immediately..
  setTimeout(v => {

    var array = searchable_facets;
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

  }, 1000)

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

var deleteItem = function (id) {

  if (id === undefined) {
    return false;
  }

  currentItemId = id;

  $.ajax({
    url: '/item/delete/' + id,
    method: 'POST',
    success: function(data) {

      $(".table-items tr[data-id='" + id + "']").css('background-color', '#ffe6e6');
      console.log('deleted item');
    },
    error: function(data) {
      alert('Cannot delete item');
    }
  });

  return false;
}

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

var showRawData = function (id) {

  if (id === undefined) {
    return false;
  }

  $.ajax({
    url: '/item/raw/' + id,
    method: 'GET',
    success: function(data) {
      $('#modalContent').html(data);
      $('#generalModal').modal({})
    }
  });

  return false;
}

var showAddItem = function () {

  $.ajax({
    url: '/item/add',
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

$.ajaxSetup({
  beforeSend:function() {
    $('.ajax-loader').show();
  },
  complete:function() {
    $('.ajax-loader').hide();
  }
});

var showModalFacet = function(name, page) {

  var uri = new URI();
  var qs = uri.search(true);
  var filters = JSON.parse(qs.filters || '{}');
  var not_filters = JSON.parse(qs.not_filters || '{}');
  var page = page || 1;

  $.ajax({
    url: '/modal-facet/' + name,
    method: 'GET',
    data: {
      filters: filters,
      not_filters: not_filters,
      page: page
    },
    success: function(data) {
      $('#modalContent').html(data);
      $('#generalModal').modal({})
    }
  });

  return false;
}

$(document).on('click', '.facet-modal-pagination', function (event) {
  event.preventDefault()

  var name = $(this).attr('class').split('facet-modal-name-')[1];
  var name = name.split(' ')[0];
  var page = $(this).attr('data-page')

  showModalFacet(name, page);

  return false;
})
