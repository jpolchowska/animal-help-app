const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const http = require("http");
const WebSocket = require("ws")
const url = require("url");

const JWT_SECRET = "change_this_secret_key";

const app = express();
const PORT = 3001;

const server = http.createServer(app);

app.use(cors());
app.use(express.json());
app.use("/images", express.static("images"));

const db = new sqlite3.Database("./database.db", err => {
  if (err) {
    console.error("Błąd bazy danych:", err.message);
  } else {
    console.log("Połączono z SQLite");
  }
});

const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: "images",
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = Date.now() + ext;
    cb(null, filename);
  }
});

const upload = multer({ storage });

const wss = new WebSocket.Server({ server });

const onlineUsers = new Set();

wss.on("connection", (ws, req) => {
  const { query } = url.parse(req.url, true);
  const token = query.token;

  if (!token) {
    ws.close();
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.log("WS JWT ERROR:", err.message);
      ws.close();
      return;
    }

    const userId = user.id;
    ws.userId = userId;
    onlineUsers.add(userId);
    broadcastOnlineUsers();

    ws.on("close", () => {
      const stillConnected = [...wss.clients].some(
        client =>
          client !== ws &&
          client.readyState === WebSocket.OPEN &&
          client.userId === userId
      );

      if (!stillConnected) {
        onlineUsers.delete(userId);
        broadcastOnlineUsers();
      }
    });
  });
});

function broadcastOnlineUsers() {
  const message = JSON.stringify({
    type: "ONLINE_USERS",
    count: onlineUsers.size
  });

  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

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

app.post("/auth/register", async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: "Brak pełnych danych" });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);

    db.run(
      "INSERT INTO users (email, password_hash, role, name) VALUES (?, ?, 'user', ?)",
      [email, passwordHash, name],
      function (err) {
        if (err) {
          return res.status(400).json({ error: "Użytkownik już istnieje" });
        }

        res.status(201).json({
          id: this.lastID,
          email,
          role: "user",
          name
        });
      }
    );
  } catch (err) {
    res.status(500).json({ error: "Błąd serwera" });
  }
});

app.post("/auth/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Brak emailu lub hasła" });
  }

  db.get(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, user) => {
      if (err) {
        return res.status(500).json({ error: "Błąd serwera" });
      }

      if (!user) {
        return res.status(401).json({ error: "Nieprawidłowy email lub hasło" });
      }

      const isValid = await bcrypt.compare(password, user.password_hash);

      if (!isValid) {
        return res.status(401).json({ error: "Nieprawidłowy email lub hasło" });
      }

      const token = jwt.sign(
        {
          id: user.id,
          role: user.role
        },
        JWT_SECRET,
        { expiresIn: "1h" }
      );

      db.get(
        "SELECT created_at, last_login_at FROM users WHERE id = ?",
        [user.id],
        (err, dates) => {
          if (err) {
            return res.status(500).json({ error: "Błąd dat" });
          }

          db.run(
            "UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?",
            [user.id]
          );

          res.json({
            token,
            email: user.email,
            role: user.role,
            name: user.name,
            createdAt: dates.created_at,
            lastLoginAt: dates.last_login_at
          });
        }
      );
    }
  );
});

// app.get("/animals", (req, res) => {
//   db.all("SELECT * FROM animals", (err, rows) => {
//     if (err) {
//       return res.status(500).json({ error: err.message });
//     }
//     res.json(rows);
//   });
// });

app.get("/animals", (req, res) => {
  const { search, type, status } = req.query;

  let query = "SELECT * FROM animals WHERE 1=1"
  const params = [];

  if (search) {
    query += " AND LOWER(name) LIKE ?";
    params.push(`%${search.toLowerCase()}%`);
  }

  if (type && type !== "Wszystkie") {
    query += " AND type = ?";
    params.push(type);
  }

  if (status && status !== "Wszystkie") {
    query += " AND status = ?";
    params.push(status);
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

app.post("/animals", authenticateToken, requireRole(["admin"]), upload.single("image"), (req, res) => {
  const { name, type, status } = req.body;

  const image = req.file
  ? `/images/${req.file.filename}`
  : null;

  if (!name || !type || !status) {
    return res.status(400).json({ error: "Brak danych" });
  }

  db.run(
    "INSERT INTO animals (name, type, status, image) VALUES (?, ?, ?, ?)",
    [name, type, status, image],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.status(201).json({
        id: this.lastID,
        name,
        type,
        status,
        image
      });

      sendSSE({
        type: "ALERT",
        message: `Dodano nowe zwierzę: ${name}`
      });
    }
  );
});

app.delete("/animals/:id", authenticateToken, requireRole(["admin"]), (req, res) => {
  const { id } = req.params;

  db.run(
    "DELETE FROM animals WHERE id = ?",
    [id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: "Nie znaleziono zwierzęcia" });
      }

      res.json({ message: "Zwierzę usunięte" });
    }
  );
});

app.put("/animals/:id", authenticateToken, requireRole(["admin"]), (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: "Brak statusu" });
  }

  db.run(
    "UPDATE animals SET status = ? WHERE id = ?",
    [status, id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: "Nie znaleziono zwierzęcia" });
      }

      res.json({
        message: "Status zaktualizowany",
        status
      });
    }
  );
});

// CRUD - Adopcje

app.post(
  "/adoptions",
  authenticateToken,
  requireRole(["user", "volunteer"]),
  (req, res) => {
    const userId = req.user.id;
    const { animalId } = req.body;

    if (!animalId) {
      return res.status(400).json({ error: "Brak animalId" });
    }

    db.run(
      "INSERT INTO adoptions (user_id, animal_id) VALUES (?, ?)",
      [userId, animalId],
      function (err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        res.status(201).json({
          id: this.lastID,
          animalId,
          status: "W oczekiwaniu"
        });
      }
    );
  }
);

app.get(
  "/adoptions/my",
  authenticateToken,
  requireRole(["user", "volunteer"]),
  (req, res) => {
    const userId = req.user.id;

    db.all(
      `
      SELECT adoptions.*, animals.name AS animal_name
      FROM adoptions
      JOIN animals ON animals.id = adoptions.animal_id
      WHERE adoptions.user_id = ?
      ORDER BY adoptions.created_at DESC
      `,
      [userId],
      (err, rows) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json(rows);
      }
    );
  }
);

app.get(
  "/adoptions",
  authenticateToken,
  requireRole(["admin"]),
  (req, res) => {
    db.all(
      `
      SELECT adoptions.*, users.email, animals.name AS animal_name
      FROM adoptions
      JOIN users ON users.id = adoptions.user_id
      JOIN animals ON animals.id = adoptions.animal_id
      ORDER BY adoptions.created_at DESC
      `,
      (err, rows) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json(rows);
      }
    );
  }
);

app.put(
  "/adoptions/:id",
  authenticateToken,
  requireRole(["admin"]),
  (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: "Brak statusu" });
    }

    db.run(
      "UPDATE adoptions SET status = ? WHERE id = ?",
      [status, id],
      function (err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        if (status === "Zaakceptowany") {
          db.run(
            `
            UPDATE animals
            SET status = 'Zaadoptowane'
            WHERE id = (
              SELECT animal_id FROM adoptions WHERE id = ?
            )
            `,
            [id],
            err => {
              if (err) {
                return res.status(500).json({
                  error: "Błąd aktualizacji statusu zwierzęcia"
                });
              }

              return res.json({
                message: "Adopcja zaakceptowana, zwierzę zaadoptowane"
              });
            }
          );
        } else {
          return res.json({ message: "Status adopcji zaktualizowany" });
        }
      }
    );
  }
);

app.delete(
  "/adoptions/:id",
  authenticateToken,
  requireRole(["admin"]),
  (req, res) => {
    const { id } = req.params;

    db.run(
      "DELETE FROM adoptions WHERE id = ?",
      [id],
      function (err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        res.json({ message: "Adopcja usunięta" });
      }
    );
  }
);

app.get(
  "/adoptions/stats",
  authenticateToken,
  requireRole(["admin"]),
  (req, res) => {
    db.get(
      `
      SELECT
        COUNT(*) AS total,
        COALESCE(SUM(status = 'W oczekiwaniu'), 0) AS pending,
        COALESCE(SUM(status = 'Zaakceptowany'), 0) AS approved
      FROM adoptions
      `,
      (err, row) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json(row);
      }
    );
  }
);

app.post(
  "/volunteer/join",
  authenticateToken,
  requireRole(["user"]),
  (req, res) => {
    db.run(
      "UPDATE users SET role = 'volunteer' WHERE id = ?",
      [req.user.id],
      err => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Zostałeś wolontariuszem" });
      }
    );
  }
);

app.post(
  "/tasks",
  authenticateToken,
  requireRole(["admin"]),
  (req, res) => {
    const { title, description, date, time_from, time_to } = req.body;

    db.run(
      `INSERT INTO tasks 
       (title, description, date, time_from, time_to)
       VALUES (?, ?, ?, ?, ?)`,
      [title, description, date, time_from, time_to],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: this.lastID });
      }
    );
  }
);

app.get("/tasks", authenticateToken, (req, res) => {
  db.all("SELECT * FROM tasks", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.put(
  "/tasks/:id",
  authenticateToken,
  requireRole(["admin"]),
  (req, res) => {
    const { title, description, date, time_from, time_to } = req.body;

    db.run(
      `UPDATE tasks 
       SET title=?, description=?, date=?, time_from=?, time_to=?
       WHERE id=?`,
      [title, description, date, time_from, time_to, req.params.id],
      err => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Zaktualizowano zadanie" });
      }
    );
  }
);

app.delete(
  "/tasks/:id",
  authenticateToken,
  requireRole(["admin"]),
  (req, res) => {
    db.run(
      "DELETE FROM tasks WHERE id = ?",
      [req.params.id],
      err => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Usunięto zadanie" });
      }
    );
  }
);

app.post(
  "/tasks/:id/signup",
  authenticateToken,
  requireRole(["volunteer"]),
  (req, res) => {
    const { note } = req.body;

    db.run(
      `INSERT INTO signups (task_id, volunteer_id, note)
       VALUES (?, ?, ?)`,
      [req.params.id, req.user.id, note],
      err => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Zapisano na zadanie" });
      }
    );
  }
);

app.get(
  "/signups/my",
  authenticateToken,
  requireRole(["volunteer"]),
  (req, res) => {
    db.all(
      `
      SELECT signups.*, volunteer_tasks.title
      FROM task_signups
      JOIN volunteer_tasks ON volunteer_tasks.id = task_signups.task_id
      WHERE volunteer_id = ?
      `,
      [req.user.id],
      (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
      }
    );
  }
);

app.put(
  "/signups/:id",
  authenticateToken,
  requireRole(["volunteer"]),
  (req, res) => {
    db.run(
      "UPDATE signups SET note = ? WHERE id = ?",
      [req.body.note, req.params.id],
      err => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Zaktualizowano notatkę" });
      }
    );
  }
);

app.delete(
  "/signups/:id",
  authenticateToken,
  requireRole(["volunteer"]),
  (req, res) => {
    db.run(
      "DELETE FROM signups WHERE id = ?",
      [req.params.id],
      err => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Wypisano z zadania" });
      }
    );
  }
);

const sseClients = new Set();

app.get("/sse", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  sseClients.add(res);

  req.on("close", () => {
    sseClients.delete(res);
  });
});

function sendSSE(data) {
  const payload = `data: ${JSON.stringify(data)}\n\n`;

  sseClients.forEach(res => {
    res.write(payload);
  });
}

server.listen(PORT, () => {
  console.log(`Backend działa na http://localhost:${PORT}`);
});