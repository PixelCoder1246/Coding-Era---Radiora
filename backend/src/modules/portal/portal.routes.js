const { Router } = require('express');
const { getReport } = require('./portal.controller');

const router = Router();

router.get('/report/:token', getReport);

module.exports = router;
