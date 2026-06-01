// Importy
const express = require("express");
const cors = require("cors");

const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const multer = require("multer");
const path = require("path");

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret_key";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/images", express.static("images"));


// Baza danych
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

pool.connect()
  .then(() => console.log("Połączono z PostgreSQL"))
  .catch(err => console.error("Błąd bazy danych:", err.message));


// Upload zdjęć
const storage = multer.diskStorage({
  destination: "images",
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});

const upload = multer({ storage });


// Autoryzacja
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Brak tokenu" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Nieprawidłowy token" });
    }

    req.user = user;
    next();
  });
}

function requireRole(roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Brak uprawnień" });
    }
    next();
  };
}


// Rejestracja i logowanie

app.post("/auth/register", async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: "Brak pełnych danych" });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (email, password_hash, role, name) VALUES ($1, $2, 'user', $3) RETURNING id",
      [email, passwordHash, name]
    );

    res.status(201).json({
      id: result.rows[0].id,
      email,
      role: "user",
      name
    });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).json({ error: "Użytkownik już istnieje" });
    }
    res.status(500).json({ error: "Błąd serwera" });
  }
});

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Brak emailu lub hasła" });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: "Nieprawidłowy email lub hasło" });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return res.status(401).json({ error: "Nieprawidłowy email lub hasło" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    await pool.query(
      "UPDATE users SET last_login_at = NOW() WHERE id = $1",
      [user.id]
    );

    res.json({
      token,
      email: user.email,
      role: user.role,
      name: user.name,
      createdAt: user.created_at,
      lastLoginAt: user.last_login_at
    });
  } catch (err) {
    res.status(500).json({ error: "Błąd serwera" });
  }
});


// Zwierzęta

app.get("/animals/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM animals WHERE id = $1",
      [req.params.id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: "Nie znaleziono zwierzęcia" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/animals", async (req, res) => {
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

app.post("/animals", authenticateToken, requireRole(["admin"]), upload.single("image"), async (req, res) => {
  const { name, type, status, age, sex, description, traits } = req.body;
  const image = req.file ? `/images/${req.file.filename}` : null;

  if (!name || !type || !status) {
    return res.status(400).json({ error: "Brak danych" });
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

app.put("/animals/:id", authenticateToken, requireRole(["admin"]), async (req, res) => {
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: "Brak statusu" });
  }

  try {
    const result = await pool.query(
      "UPDATE animals SET status = $1 WHERE id = $2",
      [status, req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Nie znaleziono zwierzęcia" });
    }

    res.json({ message: "Status zaktualizowany", status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/animals/:id", authenticateToken, requireRole(["admin"]), async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM animals WHERE id = $1",
      [req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Nie znaleziono zwierzęcia" });
    }

    res.json({ message: "Zwierzę usunięte" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Adopcje

app.post(
  "/adoptions",
  authenticateToken,
  requireRole(["user", "volunteer"]),
  async (req, res) => {
    const { animalId } = req.body;

    if (!animalId) {
      return res.status(400).json({ error: "Brak animalId" });
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
  }
);

app.get(
  "/adoptions/my",
  authenticateToken,
  requireRole(["user", "volunteer"]),
  async (req, res) => {
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
  }
);

app.get(
  "/adoptions",
  authenticateToken,
  requireRole(["admin"]),
  async (req, res) => {
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
  }
);

app.put(
  "/adoptions/:id",
  authenticateToken,
  requireRole(["admin"]),
  async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: "Brak statusu" });
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
        return res.json({ message: "Adopcja zaakceptowana, zwierzę zaadoptowane" });
      }

      res.json({ message: "Status adopcji zaktualizowany" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

app.delete(
  "/adoptions/:id",
  authenticateToken,
  requireRole(["admin"]),
  async (req, res) => {
    try {
      await pool.query("DELETE FROM adoptions WHERE id = $1", [req.params.id]);
      res.json({ message: "Adopcja usunięta" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

app.get(
  "/adoptions/stats",
  authenticateToken,
  requireRole(["admin"]),
  async (req, res) => {
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
  }
);


// Wolontariat

app.post(
  "/volunteer/join",
  authenticateToken,
  requireRole(["user"]),
  async (req, res) => {
    try {
      await pool.query(
        "UPDATE users SET role = 'volunteer' WHERE id = $1",
        [req.user.id]
      );
      res.json({ message: "Zostałeś wolontariuszem" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);


// Zadania

app.post(
  "/tasks",
  authenticateToken,
  requireRole(["admin"]),
  async (req, res) => {
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
  }
);

app.get("/tasks", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM tasks");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put(
  "/tasks/:id",
  authenticateToken,
  requireRole(["admin"]),
  async (req, res) => {
    const { title, description, date, time_from, time_to } = req.body;

    try {
      await pool.query(
        `UPDATE tasks SET title=$1, description=$2, date=$3, time_from=$4, time_to=$5
         WHERE id=$6`,
        [title, description, date, time_from, time_to, req.params.id]
      );
      res.json({ message: "Zaktualizowano zadanie" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

app.delete(
  "/tasks/:id",
  authenticateToken,
  requireRole(["admin"]),
  async (req, res) => {
    try {
      await pool.query("DELETE FROM tasks WHERE id = $1", [req.params.id]);
      res.json({ message: "Usunięto zadanie" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);


// Zapisy na zadania

app.post(
  "/tasks/:id/signup",
  authenticateToken,
  requireRole(["volunteer"]),
  async (req, res) => {
    try {
      await pool.query(
        "INSERT INTO signups (task_id, volunteer_id, note) VALUES ($1, $2, $3) ON CONFLICT (task_id, volunteer_id) DO NOTHING",
        [req.params.id, req.user.id, req.body.note]
      );
      res.status(201).json({ message: "Zapisano na zadanie" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

app.get(
  "/signups/my",
  authenticateToken,
  requireRole(["volunteer"]),
  async (req, res) => {
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
  }
);

app.put(
  "/signups/:id",
  authenticateToken,
  requireRole(["volunteer"]),
  async (req, res) => {
    try {
      await pool.query(
        "UPDATE signups SET note = $1 WHERE id = $2",
        [req.body.note, req.params.id]
      );
      res.json({ message: "Zaktualizowano notatkę" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

app.delete(
  "/signups/:id",
  authenticateToken,
  requireRole(["volunteer"]),
  async (req, res) => {
    try {
      await pool.query("DELETE FROM signups WHERE id = $1", [req.params.id]);
      res.json({ message: "Wypisano z zadania" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);


// Statystyki

app.get(
  "/admin/stats",
  authenticateToken,
  requireRole(["admin"]),
  async (req, res) => {
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
  }
);


// Statystyki publiczne

app.get("/stats", async (req, res) => {
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


// Healthcheck

app.get("/healthz", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.status(200).json({ status: "ok", database: "connected" });
  } catch (err) {
    res.status(503).json({ status: "error", database: "unreachable" });
  }
});


// Obserwowalność

app.get("/metrics", async (req, res) => {
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


// Start serwera

app.listen(PORT, () => {
  console.log(`Backend działa na http://localhost:${PORT}`);
});
