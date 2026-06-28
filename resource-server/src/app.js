const express = require("express");
const cors = require("cors");

const animalsRouter = require("./routes/animals");
const adoptionsRouter = require("./routes/adoptions");
const volunteerRouter = require("./routes/volunteer");
const tasksRouter = require("./routes/tasks");
const usersRouter = require("./routes/users");
const reportRouter = require("./routes/report");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/images", express.static("images"));

app.use("/animals", animalsRouter);
app.use("/adoptions", adoptionsRouter);
app.use("/volunteer", volunteerRouter);
app.use("/tasks", tasksRouter);
app.use("/report", reportRouter);
app.use("/", usersRouter);

app.get("/healthz", async (req, res) => {
  const pool = require("./db");
  try {
    await pool.query("SELECT 1");
    res.status(200).json({ status: "ok", database: "connected" });
  } catch (err) {
    res.status(503).json({ status: "error", database: "unreachable" });
  }
});

module.exports = app;
