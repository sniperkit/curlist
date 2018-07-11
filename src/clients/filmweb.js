const wtj = require('website-to-json');
const _ = require('lodash');

module.exports = async function(url) {

  var result = await wtj.extractData(url, {
    fields: ['data'],
    parse: function($) {

      var info = $(".filmInfo tr").map(function(val) {
        var title = $(this).find("th").text();
        var value = $(this).find("td").text();
        if ($(this).find("td ul").length) {
          value = $(this).find("td ul li").map(function(val) { return $(this).text() }).get()
        }
        return {key: title, value: value}
      }).get()

      var actors = $(".filmCast tr").map(function(val) { return {name: $(this).find("td").eq(1).text(), image: $(this).find("td").eq(0).find("img").attr('src'), movie_name: $(this).find("td").eq(3).text(), movie_image: $(this).find("td").eq(4).find("img").attr('src') } }).get();
      actors = actors.slice(1);

      var array = {
        name: $(".filmTitle a").text(),
        year: _.first(($(".halfSize").text() || '').match(/\d+/)),
        original_name: $("h1").parent().next().text(),
        description: $(".filmPlot").text(),
        info: info,
        //url: $(".filmTitle a").attr('href'),
        url: url,
        image: $(".posterLightbox img").attr('src'),
        //big_image: $(".posterLightbox a").attr('href'),
        //time: $(".filmTime").text(),
        rating: $("span[itemProp='ratingCount']").text(),
        //votes: $(".communityRateInfoWrapper").text(),
        //wants_to_see: $(".communityRateInfoWrapper").text(),
        actors: actors
      }

      var arrays = {
        'directors': 'reżyseria:',
        'writers': 'scenariusz:',
        'genres': 'gatunek:',
        'countries': 'produkcja:',
      }

      _.map(arrays, (v, k) => {
        array[k]  = _.head(_.filter(array.info, {key: v }));
        array[k] = array[k] ? array[k].value : [];
      })

      delete array.info;

      array.actors = _.map(array.actors, 'name');

      return array;
    }
  })

  //console.log(result);
  return result.data;
}
