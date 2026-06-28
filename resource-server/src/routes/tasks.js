const express = require("express");
const pool = require("../db");
const { authenticateToken, requireRole } = require("../middleware/auth");

const router = express.Router();

router.post("/", authenticateToken, requireRole(["admin"]), async (req, res) => {
  const { title, description, date, time_from, time_to } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO tasks (title, description, date, time_from, time_to)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [title, description, date, time_from, time_to]
    );
    res.status(201).json({ id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM tasks");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", authenticateToken, requireRole(["admin"]), async (req, res) => {
  const { title, description, date, time_from, time_to } = req.body;

  try {
    await pool.query(
      `UPDATE tasks SET title=$1, description=$2, date=$3, time_from=$4, time_to=$5
       WHERE id=$6`,
      [title, description, date, time_from, time_to, req.params.id]
    );
    res.json({ message: "Task updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", authenticateToken, requireRole(["admin"]), async (req, res) => {
  try {
    await pool.query("DELETE FROM tasks WHERE id = $1", [req.params.id]);
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/:id/signup", authenticateToken, requireRole(["volunteer"]), async (req, res) => {
  try {
    await pool.query(
      "INSERT INTO signups (task_id, volunteer_id, note) VALUES ($1, $2, $3) ON CONFLICT (task_id, volunteer_id) DO NOTHING",
      [req.params.id, req.user.id, req.body.note]
    );
    res.status(201).json({ message: "Signed up for task" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/signups/my", authenticateToken, requireRole(["volunteer"]), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT signups.*, tasks.title, tasks.description, tasks.date, tasks.time_from, tasks.time_to
       FROM signups
       JOIN tasks ON tasks.id = signups.task_id
       WHERE volunteer_id = $1`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/signups/:id", authenticateToken, requireRole(["volunteer"]), async (req, res) => {
  try {
    await pool.query(
      "UPDATE signups SET note = $1 WHERE id = $2",
      [req.body.note, req.params.id]
    );
    res.json({ message: "Note updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/signups/:id", authenticateToken, requireRole(["volunteer"]), async (req, res) => {
  try {
    await pool.query("DELETE FROM signups WHERE id = $1", [req.params.id]);
    res.json({ message: "Unregistered from task" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
