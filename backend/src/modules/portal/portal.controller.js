const portalService = require('./portal.service');

async function getReport(req, res) {
  try {
    const { token } = req.params;
    const report = await portalService.getReportByToken(token);
    return res.status(200).json(report);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
}

module.exports = { getReport };
