const integrationService = require('./integration.service');

async function savePacsConfig(req, res) {
  try {
    const { url, username, password, pollIntervalSeconds } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'url is required.' });
    }

    const integration = await integrationService.savePacsConfig({ url, username, password, pollIntervalSeconds });
    return res.status(200).json({ message: 'PACS integration saved.', integration });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
}

async function saveHisConfig(req, res) {
  try {
    const { url, apiKey } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'url is required.' });
    }

    const integration = await integrationService.saveHisConfig({ url, apiKey });
    return res.status(200).json({ message: 'HIS integration saved.', integration });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
}

async function getStatus(req, res) {
  try {
    const status = await integrationService.getStatus();
    return res.status(200).json(status);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
}

async function activatePacs(req, res) {
  try {
    const result = await integrationService.activatePacs();
    return res.status(200).json({ message: 'PACS integration activated. Polling ready.', ...result });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
}

async function activateHis(req, res) {
  try {
    const result = await integrationService.activateHis();
    return res.status(200).json({ message: 'HIS integration activated.', ...result });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
}

module.exports = { savePacsConfig, saveHisConfig, getStatus, activatePacs, activateHis };
