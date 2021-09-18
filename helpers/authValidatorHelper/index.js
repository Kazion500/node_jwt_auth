const { check } = require("express-validator");

const loginValidator = [
  check("userName")
    .notEmpty()
    .withMessage("This field is required")
    .matches(/\d/)
    .withMessage("must contain a number"),
  check("password")
    .notEmpty()
    .withMessage("This field is required")
    .isLength({ min: 5 })
    .withMessage("password should have at least 6 characters")
    .matches(/\d/)
    .withMessage("must contain a number"),
];

const registerValidator = [
  check("userName")
    .notEmpty()
    .withMessage("This field is required")
    .matches(/\d/)
    .withMessage("must contain a number"),
  check("password")
    .notEmpty()
    .trim()
    .escape()
    .withMessage("This field is required")
    .isLength({ min: 5 })
    .withMessage("password should have at least 6 characters")
    .matches(/\d/)
    .withMessage("must contain a number"),
  check("firstName")
    .notEmpty()
    .trim()
    .escape()
    .withMessage("This field is required"),
  check("lastName")
    .notEmpty()
    .trim()
    .escape()
    .withMessage("This field is required"),
];

module.exports = { loginValidator, registerValidator };
