const jwt = require("jsonwebtoken");

let generateAccessToken = (info) => {
  return jwt.sign(info, process.env.ACCESS_SECRET_KEY, {
    expiresIn: 1 * 60,
  });
};

let generateRefreshToken = (info) => {
  return jwt.sign(info, process.env.REFRESH_SECRET_KEY);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
};
