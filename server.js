const express = require('express');
const app = express();
const Datastore = require('nedb');

const db = {
  signals: new Datastore({ filename: '.data/signals', autoload: true }),
};

async function insertSignal(doc) {
  return new Promise((resolve, reject) => {
    db.signals.insert(doc, (err, newDoc) => (err ? reject(err) : resolve(newDoc)));
  });
}

async function getAllSignals(criteria) {
  return new Promise((resolve, reject) => {
    db.signals.findOne(criteria, (err, firstDoc) => (err ? reject(err) : resolve(firstDoc)));
  });
}

app.use(express.static('client'));

app.get('/signals', async function(request, response) {
  const signals = await getAllSignals();
  response.json(signals);
});

const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
