const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const http = require("http");
const WebSocket = require("ws")

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

const wss = new WebSocket.Server({ server });

let onlineUsers = 0;

wss.on("connection", ws => {
  onlineUsers++;
  broadcastOnlineUsers();

  ws.on("close", () => {
    onlineUsers--;
    broadcastOnlineUsers();
  });
});

function broadcastOnlineUsers() {
  const message = JSON.stringify({
    type: "ONLINE_USERS",
    count: onlineUsers
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

// ===== ENDPOINTY =====

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

      db.run(
        "UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?",
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
    }
  );
});

app.get("/animals", (req, res) => {
  db.all("SELECT * FROM animals", (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

app.post("/animals", authenticateToken, requireRole(["admin"]), (req, res) => {
  const { name, type, status, image } = req.body;

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


server.listen(PORT, () => {
  console.log(`Backend działa na http://localhost:${PORT}`);
});