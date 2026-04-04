const reportService = require('./report.service');

async function resendNotification(req, res) {
  try {
    const { caseId } = req.params;
    const doctorId = req.user.userId;
    const result = await reportService.resendNotification(caseId, doctorId);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
}

async function submitReport(req, res) {
  try {
    const { caseId } = req.params;
    const { reportText, impression } = req.body;
    const doctorId = req.user.userId;

    if (!reportText) {
      return res.status(400).json({ error: 'reportText is required.' });
    }

    const result = await reportService.submitReport(caseId, doctorId, {
      reportText,
      impression,
    });

    return res.status(201).json(result);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
}

module.exports = { submitReport, resendNotification };
