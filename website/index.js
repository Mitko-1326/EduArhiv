const express = require("express");

const app = express();
const port = 3000;
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const API_URL = process.env.API_URL || 'http://localhost:3001';
fetch(`${API_URL}/api/files`)

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on http://localhost:${port}`);
});