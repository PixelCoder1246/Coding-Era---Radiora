const hisService = require('./his.service');

async function createPatient(req, res) {
  try {
    const { patientId, name, dob, gender } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'name is required.' });
    }

    const patient = await hisService.createPatient({
      patientId,
      name,
      dob,
      gender,
    });
    return res.status(201).json(patient);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
}

async function createOrder(req, res) {
  try {
    const { accessionNumber, patientId, modality, bodyPart } = req.body;

    if (!patientId) {
      return res.status(400).json({ error: 'patientId is required.' });
    }

    const order = await hisService.createOrder({
      accessionNumber,
      patientId,
      modality,
      bodyPart,
    });
    return res.status(201).json(order);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
}

module.exports = { createPatient, createOrder };
