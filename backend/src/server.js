require('dotenv').config();

const app = require('./app');
const prisma = require('./config/db');

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await prisma.$connect();
    console.log('[DB] PostgreSQL connected via Prisma.');

    app.listen(PORT, () => {
      console.log(`[SERVER] Radiora backend running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('[STARTUP ERROR]', err);
    process.exit(1);
  }
}

// Grace(resident evil 9)ful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('[SERVER] Shutting down gracefully.');
  process.exit(0);
});

start();