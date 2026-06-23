// Importy
const express = require("express");
const cors = require("cors");
const crypto = require("crypto");

const { Pool } = require("pg");
const multer = require("multer");
const path = require("path");

const PORT = process.env.PORT || 3001;
const KEYCLOAK_URL = process.env.KEYCLOAK_URL || "http://keycloak:8080";
const JWKS_URI = `${KEYCLOAK_URL}/realms/animal-help-app/protocol/openid-connect/certs`;

const app = express();

app.use(cors());
app.use(express.json());
app.use("/images", express.static("images"));


// Baza danych
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

pool.connect()
  .then(() => console.log("Connected to PostgreSQL"))
  .catch(err => console.error("Database error:", err.message));


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
async function verifyKeycloakToken(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const header = JSON.parse(Buffer.from(parts[0], "base64url").toString());
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString());

    const response = await fetch(JWKS_URI);
    const { keys } = await response.json();

    const key = keys.find(k => k.kid === header.kid);
    if (!key) return null;

    const cert = `-----BEGIN CERTIFICATE-----\n${key.x5c[0].match(/.{1,64}/g).join("\n")}\n-----END CERTIFICATE-----\n`;

    const verify = crypto.createVerify("RSA-SHA256");
    verify.update(parts[0] + "." + parts[1]);
    const isValid = verify.verify(cert, parts[2], "base64url");

    if (!isValid) return null;
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;

    return payload;
  } catch {
    return null;
  }
}

async function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Missing token" });
  }

  const payload = await verifyKeycloakToken(token);

  if (!payload) {
    return res.status(403).json({ error: "Invalid token" });
  }

  try {
    const result = await pool.query("SELECT id FROM users WHERE email = $1", [payload.email]);
    if (!result.rows[0]) {
      return res.status(403).json({ error: "User not found" });
    }

    const roles = payload.realm_access?.roles || [];
    const role = roles.find(r => ["admin", "user", "volunteer"].includes(r)) || "user";

    req.user = { id: result.rows[0].id, role };
    next();
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
}

function requireRole(roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
}

async function authenticateServiceToken(req, res, next) {
  const token = (req.headers["authorization"] || "").split(" ")[1];
  if (!token) return res.status(401).json({ error: "Missing token" });

  const payload = await verifyKeycloakToken(token);
  if (!payload) return res.status(403).json({ error: "Invalid token" });

  req.client = { sub: payload.sub, clientId: payload.azp };
  next();
}


// Zwierzęta

app.get("/animals/:id", async (req, res) => {
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

app.put("/animals/:id", authenticateToken, requireRole(["admin"]), async (req, res) => {
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

app.delete("/animals/:id", authenticateToken, requireRole(["admin"]), async (req, res) => {
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


// Adopcje

app.post(
  "/adoptions",
  authenticateToken,
  requireRole(["user", "volunteer"]),
  async (req, res) => {
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
  }
);

app.delete(
  "/adoptions/:id",
  authenticateToken,
  requireRole(["admin"]),
  async (req, res) => {
    try {
      await pool.query("DELETE FROM adoptions WHERE id = $1", [req.params.id]);
      res.json({ message: "Adoption deleted" });
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
      res.json({ message: "You are now a volunteer" });
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
      res.json({ message: "Task updated" });
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
      res.json({ message: "Task deleted" });
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
      res.status(201).json({ message: "Signed up for task" });
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
      res.json({ message: "Note updated" });
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
      res.json({ message: "Unregistered from task" });
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


// Profil

app.get("/profile", authenticateToken, async (req, res) => {
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


// Raport B2B

app.get("/report", authenticateServiceToken, async (req, res) => {
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


// Healthcheck

app.get("/healthz", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.status(200).json({ status: "ok", database: "connected" });
  } catch (err) {
    res.status(503).json({ status: "error", database: "unreachable" });
  }
});


// Statystyki systemu

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
  console.log(`Resource server running on http://localhost:${PORT}`);
});
