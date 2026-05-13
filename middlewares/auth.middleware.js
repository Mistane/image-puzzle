const jwt = require("jsonwebtoken");

let authCheck = (req, res, next) => {
  let authHeader = req.headers["authorization"] || req.headers["Authorization"];
  let token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(403).json({ msg: "You need to log in first" });
  jwt.verify(token, process.env.ACCESS_SECRET_KEY, (err, info) => {
    if (err) {
      return res.status(401).json({ msg: "Invalid Token!" });
    }
    console.log("info", info);
    next();
  });
};

module.exports = authCheck;
