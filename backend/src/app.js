const express = require('express');
const authRoutes = require('./modules/auth/auth.routes');
const integrationRoutes = require('./modules/integration/integration.routes');
const caseRoutes = require('./modules/cases/case.routes');
const hisRoutes = require('./modules/his/his.routes');
const pacsRoutes = require('./modules/pacs/pacs.routes');

const app = express();

app.use(express.json());

// HP checker
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'radiora-backend' });
});

app.use('/api/auth', authRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/his', hisRoutes);
app.use('/api/pacs', pacsRoutes);

// 404 errors handling at your face
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found.` });
});

// Global errors handling at your face
app.use((err, req, res, _next) => {
  console.error('[ERROR]', err);
  res
    .status(err.status || 500)
    .json({ error: err.message || 'Internal server error.' });
});

module.exports = app;
