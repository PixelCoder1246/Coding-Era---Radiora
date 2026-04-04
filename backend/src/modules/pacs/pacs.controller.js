const pacsService = require('./pacs.service');
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });

async function uploadDicom(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'File is required.' });
    }

    const { accessionNumber } = req.body;
    const result = await pacsService.uploadDicom(
      req.file,
      req.user.adminId,
      accessionNumber
    );

    const message =
      result.type === 'archive'
        ? `Successfully processed archive and uploaded ${result.totalSlices} slices.`
        : 'File uploaded to PACS.';

    return res.status(200).json({ message, result });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
}

async function listStudies(req, res) {
  try {
    const studies = await pacsService.listStudies(req.user.adminId);
    return res.status(200).json(studies);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
}

async function deleteStudy(req, res) {
  try {
    const { orthancId } = req.params;
    const result = await pacsService.deleteStudy(orthancId, req.user.adminId);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
}

module.exports = { uploadDicom, listStudies, deleteStudy };
