const express = require("express");
const pool = require("../db");
const { authenticateToken, requireRole } = require("../middleware/auth");

const router = express.Router();

router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT created_at, last_login_at FROM users WHERE id = $1",
      [req.user.id]
    );
    if (!result.rows[0]) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/stats", async (req, res) => {
  try {
    const [animals, adopted, volunteers] = await Promise.all([
      pool.query("SELECT COUNT(*) AS count FROM animals WHERE status != 'Zaadoptowane'"),
      pool.query("SELECT COUNT(*) AS count FROM animals WHERE status = 'Zaadoptowane'"),
      pool.query("SELECT COUNT(*) AS count FROM users WHERE role = 'volunteer'")
    ]);

    res.json({
      animals: parseInt(animals.rows[0].count),
      adopted: parseInt(adopted.rows[0].count),
      volunteers: parseInt(volunteers.rows[0].count)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/admin/stats", authenticateToken, requireRole(["admin"]), async (req, res) => {
  try {
    const [volunteers, tasks] = await Promise.all([
      pool.query("SELECT COUNT(*) AS volunteers FROM users WHERE role = 'volunteer'"),
      pool.query("SELECT COUNT(*) AS tasks FROM tasks")
    ]);

    res.json({
      volunteers: parseInt(volunteers.rows[0].volunteers),
      tasks: parseInt(tasks.rows[0].tasks)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/metrics", async (req, res) => {
  try {
    const [animals, users, adoptions, tasks] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM animals"),
      pool.query("SELECT COUNT(*) FROM users"),
      pool.query("SELECT COUNT(*) FROM adoptions"),
      pool.query("SELECT COUNT(*) FROM tasks"),
    ]);
    res.status(200).json({
      animals_total: parseInt(animals.rows[0].count),
      users_total: parseInt(users.rows[0].count),
      adoptions_total: parseInt(adoptions.rows[0].count),
      tasks_total: parseInt(tasks.rows[0].count),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
