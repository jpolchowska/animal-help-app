const express = require("express");
const pool = require("../db");
const { authenticateToken, requireRole } = require("../middleware/auth");

const router = express.Router();

router.post("/", authenticateToken, requireRole(["user", "volunteer"]), async (req, res) => {
  const { animalId } = req.body;

  if (!animalId) {
    return res.status(400).json({ error: "Missing animalId" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO adoptions (user_id, animal_id) VALUES ($1, $2) RETURNING id",
      [req.user.id, animalId]
    );

    res.status(201).json({
      id: result.rows[0].id,
      animalId,
      status: "W oczekiwaniu"
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/my", authenticateToken, requireRole(["user", "volunteer"]), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        adoptions.*,
        animals.name AS animal_name,
        animals.image AS animal_image
       FROM adoptions
       JOIN animals ON animals.id = adoptions.animal_id
       WHERE adoptions.user_id = $1
       ORDER BY adoptions.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/stats", authenticateToken, requireRole(["admin"]), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE status = 'W oczekiwaniu') AS pending,
        COUNT(*) FILTER (WHERE status = 'Zaakceptowany') AS approved
       FROM adoptions`
    );
    const row = result.rows[0];
    res.json({
      total: parseInt(row.total),
      pending: parseInt(row.pending),
      approved: parseInt(row.approved)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", authenticateToken, requireRole(["admin"]), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        adoptions.*,
        users.email,
        animals.name AS animal_name,
        animals.image AS animal_image
       FROM adoptions
       JOIN users ON users.id = adoptions.user_id
       JOIN animals ON animals.id = adoptions.animal_id
       ORDER BY adoptions.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", authenticateToken, requireRole(["admin"]), async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: "Missing status" });
  }

  try {
    await pool.query(
      "UPDATE adoptions SET status = $1 WHERE id = $2",
      [status, id]
    );

    if (status === "Zaakceptowany") {
      await pool.query(
        `UPDATE animals
         SET status = 'Zaadoptowane'
         WHERE id = (SELECT animal_id FROM adoptions WHERE id = $1)`,
        [id]
      );
      return res.json({ message: "Adoption accepted" });
    }

    res.json({ message: "Adoption status updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", authenticateToken, requireRole(["admin"]), async (req, res) => {
  try {
    await pool.query("DELETE FROM adoptions WHERE id = $1", [req.params.id]);
    res.json({ message: "Adoption deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
