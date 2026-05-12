const { body } = require("express-validator");

let validationRules = [
  body("username")
    .notEmpty()
    .withMessage("Cant leave username blank")
    .escape()
    .trim(),
  body("password")
    .notEmpty()
    .withMessage("Cant leave password blank")
    .escape()
    .trim(),
];

module.exports = {
  accountValidation: validationRules,
};
