const express = require("express");
const { Pool } = require("pg");
const path = require("path");
const app = new express();

//validation middleware
const { validationResult } = require("express-validator");
const { accountValidation } = require("./middlewares/account.middleware");

require("dotenv").config();

const pool = new Pool({
  user: process.env.DBUSER,
  password: process.env.DBPASSWORD,
  host: process.env.DBHOST,
  port: process.env.DBPORT,
  database: process.env.DBNAME,
});

(async () => {
  let res = await pool.query('SELECT * FROM "User"');
  console.log(res.rows);
})();

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const PORT = process.env.PORT || 3000;
app.get("/", async (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/account", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "user", "account.html"));
});

app.post("/register", accountValidation, (req, res) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    // return res.status(401).json({ errors: result.array() });
    return res.send({ errors: result });
  }
  let body = req.body;
  console.log("BODY : ", body);
});

app.listen(PORT, () => {
  console.log(`Server running at port ${PORT}`);
});
