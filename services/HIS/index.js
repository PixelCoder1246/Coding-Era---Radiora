const express = require('express');
const app = express();

app.use(express.json());

const API_KEY = 'test-key';

const patients = {};
const orders = {};

app.use((req, res, next) => {
  const key = req.headers['x-api-key'];
  if (key !== API_KEY) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  next();
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/patients', (req, res) => {
  const { patientId, name, dob, gender, email, phone } = req.body;
  patients[patientId] = { patientId, name, dob, gender, email, phone };
  res.json(patients[patientId]);
});

app.get('/patients/:id', (req, res) => {
  res.json(patients[req.params.id] || null);
});

app.post('/orders', (req, res) => {
  const { accessionNumber, patientId, modality, bodyPart } = req.body;

  orders[accessionNumber] = {
    accessionNumber,
    patientId,
    modality,
    bodyPart,
    requestedAt: new Date(),
  };

  res.json(orders[accessionNumber]);
});

app.get('/orders', (req, res) => {
  const acc = req.query.accessionNumber;
  res.json(orders[acc] || null);
});

app.listen(3001, () => {
  console.log('HIS running on http://localhost:3001');
});