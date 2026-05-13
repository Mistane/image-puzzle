require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");
const path = require("path");
const app = new express();

app.use(cookieParser());

//validation middleware
const { validationResult } = require("express-validator");
const { accountValidation } = require("./middlewares/account.middleware");

//bcrypt
const bcrypt = require("bcrypt");
const saltRounds = 10;

//token helper
const {
  generateAccessToken,
  generateRefreshToken,
} = require("./helpers/tokenHelper");

//auth middleware
const authCheck = require("./middlewares/auth.middleware");
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

//testing
app.post("/test", authCheck, (req, res) => {
  res.json("hello");
});

app.get("/", async (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/account", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "user", "account.html"));
});

app.post("/users/token/refresh", async (req, res) => {
  let refreshToken = req.cookies["refreshToken"];
  if (!refreshToken)
    return res.status(401).json({ msg: "You need to log in first" });
  jwt.verify(
    refreshToken,
    process.env.REFRESH_SECRET_KEY,
    async (err, info) => {
      if (err) {
        return res.status(401).json({ msg: "Invalid token" });
      }
      console.log(info);
      let objInfo = {
        userId: info.userId,
        username: info.username,
      };
      let newAccessToken = generateAccessToken(objInfo);
      let newRefreshToken = generateRefreshToken(objInfo);

      let text = `UPDATE "User" 
    SET "refreshTokens" = array_append(array_remove("refreshTokens", $1), $2)
    WHERE $1 = ANY("refreshTokens")`;
      let values = [refreshToken, newRefreshToken];
      await pool.query(text, values);
      res.cookie("refreshToken", newRefreshToken, {
        expires: new Date(Date.now() + 12 * 60 * 60000), //30 mins
        secure: true,
        httpOnly: true,
      });

      res.status(200).json({ newAccessToken });
    },
  );
});

app.post(
  "/account/register",
  authCheck,
  accountValidation,
  async (req, res) => {
    const result = validationResult(req);
    console.log("result: ", result);
    if (!result.isEmpty()) {
      let errors = result["errors"].map((field) => {
        return {
          msg: field.msg,
          selector: field.path,
        };
      });
      return res.status(401).json({ errors });
    }
    let { username, password } = req.body;

    //check user exist
    let text = 'SELECT * FROM "User" WHERE username = $1';
    let values = [username];
    let queryResult = await pool.query(text, values);
    let checkUserExist = queryResult.rows;
    if (!checkUserExist.length == 0) {
      return res.status(401).json({ msg: "Username is already taken" });
    }
    let hashedPassword = await bcrypt.hash(password, saltRounds);
    text = 'INSERT INTO "User"(username, "hashedPassword") VALUES($1, $2)';
    values = [username, hashedPassword];
    queryResult = await pool.query(text, values);
    console.log(queryResult.rows);
    res.status(200).json({ msg: "Register Successfully" });
  },
);

app.post("/account/login", accountValidation, async (req, res) => {
  const result = validationResult(req);
  console.log("result: ", result);
  if (!result.isEmpty()) {
    let errors = result["errors"].map((field) => {
      return {
        msg: field.msg,
        selector: field.path,
      };
    });
    return res.status(401).json({ errors });
  }
  let { username, password } = req.body;

  //check user exist
  let text = 'SELECT * FROM "User" WHERE username = $1';
  let values = [username];
  let queryResult = await pool.query(text, values);
  let user = queryResult.rows[0];
  console.log(user);
  if (!user) {
    return res
      .status(401)
      .json({ msg: "Username doesnt exist, please register first" });
  }
  let isPasswordCorrect = await bcrypt.compare(password, user.hashedPassword);
  if (!isPasswordCorrect)
    return res.status(401).json({ msg: "Wrong username or password" });
  const info = {
    userId: user["userId"],
    username: user["username"],
  };
  let accessToken = generateAccessToken(info);
  let refreshToken = generateRefreshToken(info);

  text =
    'UPDATE "User" SET "refreshTokens" = array_append("refreshTokens", $1) WHERE username = $2';
  values = [refreshToken, user["username"]];

  await pool.query(text, values);
  res.cookie("refreshToken", refreshToken, {
    expires: new Date(Date.now() + 12 * 60 * 60000), //30 mins
    secure: true,
    httpOnly: true,
  });
  res.status(200).json({ msg: "login Successfully", accessToken });
});

app.listen(PORT, () => {
  console.log(`Server running at port ${PORT}`);
});
