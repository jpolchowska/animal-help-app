const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");

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

app.listen(PORT, () => {
  console.log(`Backend działa na http://localhost:${PORT}`);
});