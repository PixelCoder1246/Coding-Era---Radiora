const integrationService = require('./integration.service');
const { stopPolling, startPolling } = require('../../services/polling.service');

async function getPacsConfig(req, res) {
  try {
    const config = await integrationService.getPacsConfig(req.user.adminId);
    if (!config)
      return res
        .status(404)
        .json({ error: 'PACS configuration not found. Save it first.' });
    return res.status(200).json(config);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
}

async function getHisConfig(req, res) {
  try {
    const config = await integrationService.getHisConfig(req.user.adminId);
    if (!config)
      return res
        .status(404)
        .json({ error: 'HIS configuration not found. Save it first.' });
    return res.status(200).json(config);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
}

async function savePacsConfig(req, res) {
  try {
    const { url, username, password, pollIntervalSeconds } = req.body;
    if (!url) return res.status(400).json({ error: 'url is required.' });
    const integration = await integrationService.savePacsConfig(
      req.user.adminId,
      {
        url,
        username,
        password,
        pollIntervalSeconds,
      }
    );
    return res
      .status(200)
      .json({ message: 'PACS integration saved.', integration });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
}

async function saveHisConfig(req, res) {
  try {
    const { url, apiKey } = req.body;
    if (!url) return res.status(400).json({ error: 'url is required.' });
    const integration = await integrationService.saveHisConfig(
      req.user.adminId,
      { url, apiKey }
    );
    return res
      .status(200)
      .json({ message: 'HIS integration saved.', integration });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
}

async function getStatus(req, res) {
  try {
    const status = await integrationService.getStatus(req.user.adminId);
    return res.status(200).json(status);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
}

async function activatePacs(req, res) {
  try {
    const result = await integrationService.activatePacs(req.user.adminId);

    // Restart the polling service so the new pollIntervalSeconds takes effect immediately
    stopPolling();
    await startPolling();

    return res.status(200).json({
      message:
        'PACS integration activated. Polling restarted with updated interval.',
      ...result,
    });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
}

async function activateHis(req, res) {
  try {
    const result = await integrationService.activateHis(req.user.adminId);

    // Also restart polling — HIS activation might be the last piece needed
    stopPolling();
    await startPolling();

    return res
      .status(200)
      .json({ message: 'HIS integration activated. Polling restarted.', ...result });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
}

module.exports = {
  getPacsConfig,
  getHisConfig,
  savePacsConfig,
  saveHisConfig,
  getStatus,
  activatePacs,
  activateHis,
};
