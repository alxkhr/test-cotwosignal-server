const express = require('express');
const app = express();
const Datastore = require('nedb');

const db = {
  signals: new Datastore({ filename: '.data/signals', autoload: true }),
};

// TODO remove if working
db.signals.remove({}, { multi: true }, (err, numRemoved) => {});
loadFirstSignal();

async function loadFirstSignal() {
  const response = await fetch('', { headers: { 'auth-token': process.env.COTWO_API_KEY } });
  if (response.ok) {
    const resContent = await response.json();
    await insertSignal({
      timestamp: new Date().toISOString(),
      status: resContent.status,
      intensity: resContent.data.carbonIntensity,
      good: 100 - resContent.data.fossilFuelPercentage,
    });
  } else {
    await insertSignal({
      timestamp: new Date().toISOString(),
      status: 'server not responding',
      intensity: -1,
      good: -1,
    });
  }
}

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
