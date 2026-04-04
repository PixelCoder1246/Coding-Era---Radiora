const adminService = require('./admin.service');

async function createDoctor(req, res) {
  try {
    const { name, email, maxConcurrentCases } = req.body;
    const adminId = req.user.adminId;

    if (!name || !email) {
      return res.status(400).json({ error: 'name and email are required.' });
    }

    const doctor = await adminService.createDoctor({
      name,
      email,
      maxConcurrentCases,
      adminId,
    });
    return res.status(201).json(doctor);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
}

async function listDoctors(req, res) {
  try {
    const doctors = await adminService.listDoctors(req.user.adminId);
    return res.status(200).json(doctors);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
}

async function deleteDoctor(req, res) {
  try {
    const { doctorId } = req.params;
    const result = await adminService.deleteDoctor(doctorId, req.user.adminId);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
}

async function resetDoctorPassword(req, res) {
  try {
    const { doctorId } = req.params;
    const result = await adminService.resetDoctorPassword(
      doctorId,
      req.user.adminId
    );
    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
}

module.exports = {
  createDoctor,
  listDoctors,
  deleteDoctor,
  resetDoctorPassword,
};
