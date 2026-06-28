const express = require("express");
const multer = require("multer");
const path = require("path");
const pool = require("../db");
const { authenticateToken, requireRole } = require("../middleware/auth");

const router = express.Router();

const storage = multer.diskStorage({
  destination: "images",
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});

const upload = multer({ storage });

router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM animals WHERE id = $1",
      [req.params.id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: "Animal not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  const { search, type, status } = req.query;

  let query = "SELECT * FROM animals WHERE 1=1";
  const params = [];

  if (search) {
    params.push(`%${search.toLowerCase()}%`);
    query += ` AND LOWER(name) LIKE $${params.length}`;
  }

  if (type && type !== "Wszystkie") {
    params.push(type);
    query += ` AND type = $${params.length}`;
  }

  if (status && status !== "Wszystkie") {
    params.push(status);
    query += ` AND status = $${params.length}`;
  }

  try {
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", authenticateToken, requireRole(["admin"]), upload.single("image"), async (req, res) => {
  const { name, type, status, age, sex, description, traits } = req.body;
  const image = req.file ? `/images/${req.file.filename}` : null;

  if (!name || !type || !status) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO animals (name, type, status, image, age, sex, description, traits) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id",
      [name, type, status, image, age || null, sex || null, description || null, traits || null]
    );

    res.status(201).json({
      id: result.rows[0].id,
      name,
      type,
      status,
      image
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", authenticateToken, requireRole(["admin"]), async (req, res) => {
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: "Missing status" });
  }

  try {
    const result = await pool.query(
      "UPDATE animals SET status = $1 WHERE id = $2",
      [status, req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Animal not found" });
    }

    res.json({ message: "Status updated", status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", authenticateToken, requireRole(["admin"]), async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM animals WHERE id = $1",
      [req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Animal not found" });
    }

    res.json({ message: "Animal deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
