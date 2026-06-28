const express = require("express");
const pool = require("../db");
const { authenticateServiceToken } = require("../middleware/auth");

const router = express.Router();

router.get("/", authenticateServiceToken, async (req, res) => {
  try {
    const [animals, adoptions, byStatus, byType, bySex, usersByRole, tasks, sexByType, ageByType] = await Promise.all([
      pool.query("SELECT COUNT(*) AS total FROM animals"),
      pool.query(`SELECT COUNT(*) AS total,
        COUNT(*) FILTER (WHERE status = 'W oczekiwaniu') AS pending,
        COUNT(*) FILTER (WHERE status = 'Zaakceptowany') AS approved,
        COUNT(*) FILTER (WHERE status = 'Odrzucony') AS rejected
        FROM adoptions`),
      pool.query("SELECT status, COUNT(*) AS count FROM animals GROUP BY status"),
      pool.query("SELECT type, COUNT(*) AS count FROM animals GROUP BY type ORDER BY count DESC"),
      pool.query("SELECT sex, COUNT(*) AS count FROM animals WHERE sex IS NOT NULL AND sex != '' GROUP BY sex ORDER BY count DESC"),
      pool.query("SELECT role, COUNT(*) AS count FROM users GROUP BY role ORDER BY count DESC"),
      pool.query("SELECT COUNT(*) AS total FROM tasks"),
      pool.query("SELECT type, sex, COUNT(*) AS count FROM animals WHERE sex IS NOT NULL AND sex != '' GROUP BY type, sex ORDER BY type, count DESC"),
      pool.query("SELECT type, ROUND(AVG(age::numeric), 1) AS avg_age, MIN(age::numeric) AS min_age, MAX(age::numeric) AS max_age FROM animals WHERE age IS NOT NULL AND age != '' AND age ~ '^[0-9]+(\\.[0-9]+)?$' GROUP BY type"),
    ]);

    const adoptionTotal = parseInt(adoptions.rows[0].total);
    const adoptionApproved = parseInt(adoptions.rows[0].approved);
    const animalsTotal = parseInt(animals.rows[0].total);

    res.json({
      generatedAt: new Date().toISOString(),
      animals: {
        total: animalsTotal,
        byStatus: byStatus.rows.reduce((acc, r) => ({ ...acc, [r.status]: parseInt(r.count) }), {}),
        byType: byType.rows.map(r => ({ type: r.type, count: parseInt(r.count) })),
        bySex: bySex.rows.map(r => ({ sex: r.sex, count: parseInt(r.count) })),
        sexByType: sexByType.rows.map(r => ({ type: r.type, sex: r.sex, count: parseInt(r.count) })),
        ageByType: ageByType.rows.map(r => ({ type: r.type, avg: parseFloat(r.avg_age) || 0, min: parseInt(r.min_age) || 0, max: parseInt(r.max_age) || 0 })),
      },
      adoptions: {
        total: adoptionTotal,
        pending: parseInt(adoptions.rows[0].pending),
        approved: adoptionApproved,
        rejected: parseInt(adoptions.rows[0].rejected),
        successRate: adoptionTotal > 0 ? Math.round((adoptionApproved / adoptionTotal) * 100) : 0,
      },
      users: {
        total: usersByRole.rows.reduce((sum, r) => sum + parseInt(r.count), 0),
        byRole: usersByRole.rows.reduce((acc, r) => ({ ...acc, [r.role]: parseInt(r.count) }), {}),
      },
      tasks: parseInt(tasks.rows[0].total),
      client: req.client.clientId,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
