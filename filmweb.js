const filmweb = require('./src/clients/filmweb');

(async function() {

  var result = await filmweb('http://www.filmweb.pl/Podziemny.Krag')

  console.log(JSON.stringify(result, null, 2));
})();

