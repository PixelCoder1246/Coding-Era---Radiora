const caseService = require('./case.service');

async function listCases(req, res) {
  try {
    const cases = await caseService.listCases(req.user);
    return res.status(200).json(cases);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
}

async function getCaseById(req, res) {
  try {
    const { caseId } = req.params;
    const caseRecord = await caseService.getCaseById(caseId);
    return res.status(200).json(caseRecord);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
}

async function assignDoctor(req, res) {
  try {
    const { caseId } = req.params;
    const { doctorId } = req.body;

    if (!doctorId) {
      return res.status(400).json({ error: 'doctorId is required.' });
    }

    const updated = await caseService.assignDoctor(caseId, doctorId);
    return res.status(200).json({ message: 'Doctor assigned.', case: updated });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
}

module.exports = { listCases, getCaseById, assignDoctor };
