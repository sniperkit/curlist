const client = require('./../src/integrations/wtj');

const DOMAIN = process.env.DOMAIN;

client.domain(DOMAIN)
.timeout(1500)
.then(result => {
  console.log(JSON.stringify(result, null, 2));
  process.exit();
})
.catch(err => {
  console.log(err);
})
