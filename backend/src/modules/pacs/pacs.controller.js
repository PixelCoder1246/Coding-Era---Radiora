const pacsService = require('./pacs.service');

async function uploadDicom(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'File is required.' });
    }

    const { accessionNumber } = req.body;
    const result = await pacsService.uploadDicom(req.file, req.user.adminId, accessionNumber);
    return res.status(200).json({ message: 'File uploaded to PACS.', result });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
}

module.exports = { uploadDicom };
