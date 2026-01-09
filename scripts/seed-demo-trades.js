const fs = require('fs');
const fetch = require('node-fetch');

(async () => {
  try {
    const raw = fs.readFileSync('./public/data/demo-trades.json', 'utf-8');
    const trades = JSON.parse(raw);
    console.log('Seeding', trades.length, 'trades...');

    for (const original of trades) {
      // Prepare payload compatible with /api/trades (avoid unknown Prisma fields)
      const t = { ...original };
      delete t.id;
      delete t.userId;
      // Prisma expects strategy_id or strategy_old; map our friendly 'strategy' into 'strategy_old'
      if (t.strategy) {
        t.strategy_old = t.strategy;
        delete t.strategy;
      }

      const seedUser = process.env.SEED_USER_ID || 'cmk5y1oe10000cbbhu2yfb208';

      const res = await fetch('http://localhost:3000/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': seedUser },
        body: JSON.stringify(t),
      });

      if (!res.ok) {
        console.error('Failed to post trade', t.id, res.status, await res.text());
      } else {
        const data = await res.json();
        console.log('Created', data && data.id ? data.id : '(no id)');
      }
    }

    console.log('Seeding complete');
  } catch (err) {
    console.error('Error seeding demo trades:', err);
    process.exit(1);
  }
})();
