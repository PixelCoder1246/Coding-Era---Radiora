require('dotenv').config();

const app = require('./app');
const prisma = require('./config/db');
const { startPolling, stopPolling } = require('./services/polling.service');

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await prisma.$connect();
    console.log('[DB] PostgreSQL connected via Prisma.');

    app.listen(PORT, () => {
      console.log(
        `[SERVER] Radiora backend running on http://localhost:${PORT}`
      );
      startPolling().catch((err) =>
        console.error('[POLL] Failed to start polling:', err.message)
      );
    });
  } catch (err) {
    console.error('[STARTUP ERROR]', err);
    process.exit(1);
  }
}

// Grace(resident evil 9)ful shutdown
process.on('SIGINT', async () => {
  stopPolling();
  await prisma.$disconnect();
  console.log('[SERVER] Shutting down gracefully.');
  process.exit(0);
});

start();
