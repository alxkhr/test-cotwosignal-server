const express = require('express');
const fetch = require('node-fetch');
const Datastore = require('nedb');

const app = express();

const db = {
  signals: new Datastore({ filename: '.data/signals', autoload: true }),
};

// uncomment to delete existing entries
// db.signals.remove({}, { multi: true }, (err, numRemoved) => {});

// fetchSignal();
// setInterval(fetchSignal, 1000 * 60 * 15);

async function fetchSignal() {
  const response = await fetch('https://api.co2signal.com/v1/latest?countryCode=DE', {
    headers: { 'auth-token': process.env.COTWO_API_KEY },
  });
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
    db.signals.find(criteria, (err, doc) => (err ? reject(err) : resolve(doc)));
  });
}

app.use(express.static('client'));

app.get('/signals', async function(request, response) {
  const signals = await getAllSignals();
  response.json(signals);
});

app.get('/ping', async (request, response) => {
  await fetchSignal();
  response.sendStatus(200);
});

const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
