const express = require('express');
const cors = require('cors');
const authRoutes = require('./modules/auth/auth.routes');
const integrationRoutes = require('./modules/integration/integration.routes');
const caseRoutes = require('./modules/cases/case.routes');
const hisRoutes = require('./modules/his/his.routes');
const pacsRoutes = require('./modules/pacs/pacs.routes');
const adminRoutes = require('./modules/admin/admin.routes');
const portalRoutes = require('./modules/portal/portal.routes');

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  })
);
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'radiora-backend' });
});

app.use('/api/auth', authRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/his', hisRoutes);
app.use('/api/pacs', pacsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/portal', portalRoutes);

app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found.` });
});

app.use((err, req, res, _next) => {
  console.error('[ERROR]', err);
  res
    .status(err.status || 500)
    .json({ error: err.message || 'Internal server error.' });
});

module.exports = app;
