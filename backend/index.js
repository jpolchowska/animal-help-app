const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

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

app.get("/animals", (req, res) => {
  db.all("SELECT * FROM animals", (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

app.listen(PORT, () => {
  console.log(`Backend działa na http://localhost:${PORT}`);
});