const pacsService = require('./pacs.service');

async function uploadDicom(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'File is required.' });
    }

    const result = await pacsService.uploadDicom(req.file);
    return res.status(200).json({ message: 'File uploaded to PACS.', result });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
}

module.exports = { uploadDicom };
