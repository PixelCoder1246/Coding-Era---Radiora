const caseService = require('./case.service');
const prisma = require('../../config/db');

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
    const caseRecord = await caseService.getCaseById(caseId, req.user.adminId);
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

    const updated = await caseService.assignDoctor(
      caseId,
      doctorId,
      req.user.adminId
    );
    return res.status(200).json({ message: 'Doctor assigned.', case: updated });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
}

async function receiveAiResult(req, res) {
  try {
    const { caseId } = req.params;
    const { findings, confidence, annotations } = req.body;

    if (!findings || confidence === undefined || !annotations) {
      return res
        .status(400)
        .json({ error: 'findings, confidence, and annotations are required.' });
    }

    const caseRecord = await prisma.case.findUnique({ where: { id: caseId } });
    if (!caseRecord) {
      return res.status(404).json({ error: 'Case not found.' });
    }

    const existing = await prisma.aiResult.findUnique({ where: { caseId } });
    if (existing) {
      return res
        .status(409)
        .json({ error: 'AI result already stored for this case.' });
    }

    await prisma.aiResult.create({
      data: { caseId, findings, confidence, annotations },
    });

    await prisma.case.update({
      where: { id: caseId },
      data: { aiStatus: 'COMPLETED' },
    });

    return res.status(200).json({ message: 'AI result stored.' });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
}

async function updateCaseStatus(req, res) {
  try {
    const { caseId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'status is required.' });
    }

    const updated = await caseService.updateCaseStatus(
      caseId,
      status,
      req.user
    );
    return res
      .status(200)
      .json({ message: 'Case status updated.', case: updated });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
}

async function deleteCase(req, res) {
  try {
    const { caseId } = req.params;
    const result = await caseService.deleteCase(caseId, req.user.adminId);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
}

module.exports = {
  listCases,
  getCaseById,
  assignDoctor,
  receiveAiResult,
  updateCaseStatus,
  deleteCase,
};
