const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const animals = [
  {
    id: 1,
    name: "Piorun",
    type: "pies",
    status: "Do adopcji"
  },
  {
    id: 2,
    name: "Mruczek",
    type: "kot",
    status: "W trakcie leczenia"
  }
];

app.get("/animals", (req, res) => {
  res.json(animals);
});

app.listen(PORT, () => {
  console.log(`Backend działa na http://localhost:${PORT}`);
});