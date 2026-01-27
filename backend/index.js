const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "change_this_secret_key";

const app = express();
const PORT = 3001;

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

// ===== ENDPOINTY =====

app.get("/animals", (req, res) => {
  db.all("SELECT * FROM animals", (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

app.post("/auth/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password ) {
    return res.status(400).json({ error: "Brak emailu lub hasła" });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);

    db.run(
      "INSERT INTO users (email, password_hash) VALUES (?, ?)",
      [email, passwordHash],
      function (err) {
        if (err) {
          return res.status(400).json({ error: "Użytkownik już istnieje" });
        }

        res.status(201).json({
          id: this.lastID,
          email
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

      res.json({
        token,
        email: user.email,
        role: user.role
      });
    }
  );
});

app.post("/animals", authenticateToken, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Brak uprawnień" });
  }

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

app.listen(PORT, () => {
  console.log(`Backend działa na http://localhost:${PORT}`);
});