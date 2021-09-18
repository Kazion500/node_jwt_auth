const router = require("express").Router();
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const {
  loginValidator,
  registerValidator,
} = require("../helpers/authValidatorHelper");
const PrismaClient = require("../helpers/prismaUtil");
const {
  getUser,
  genHashPassword,
  generateAccessToken,
  saveToken,
  generateRefreshToken,
  verifyPassword,
} = require("../helpers/authHelpers");
const { errorFormat } = require("../helpers/errorFormatter");
const { EXIST_FIELD, DOES_NOT_EXISTS } = require("../helpers/messages");
const { user, token } = new PrismaClient();

const MS = 15000;

router.post("/register", registerValidator, async (req, res) => {
  const { userName, firstName, lastName, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(errors);
  }
  const existsUser = await getUser(userName);
  if (existsUser) {
    return res.status(400).json(errorFormat(userName, EXIST_FIELD, "userName"));
  }

  const hashedPassword = genHashPassword(password);

  const newUser = await user.create({
    data: {
      userName,
      password: hashedPassword,
      lastName,
      firstName,
    },
    select: {
      userName: true,
      lastName: true,
      firstName: true,
    },
  });

  res.status(201).json(newUser);
});

router.post("/login", loginValidator, async (req, res) => {
  const { userName, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(errors);
  }
  const { match, dbUser } = await verifyPassword(userName, password);
  console.log(match);
  if (!dbUser) {
    return res
      .status(400)
      .json(errorFormat(userName, DOES_NOT_EXISTS, "userName"));
  }
  if (!match) {
    return res
      .status(400)
      .json(
        errorFormat(
          `${userName} ${password}`,
          DOES_NOT_EXISTS,
          "userName or password"
        )
      );
  }
  const accessToken = generateAccessToken(userName);
  const refreshToken = generateRefreshToken(userName);
  const { token } = await saveToken(refreshToken);

  dbUser.password = undefined;
  res.cookie("refreshToken", token, { httpOnly: true });
  res.cookie("accessToken", accessToken, { httpOnly: true, maxAge: MS });
  console.log(dbUser);
  req.user = dbUser;
  res.send(dbUser);
});

router.post("/refresh", loginValidator, async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res
      .status(401)
      .json(errorFormat(refreshToken, "Invalid Token", "token"));
  }

  // check if token exists
  try {
    const dbToken = await token.findUnique({
      where: {
        token: refreshToken,
      },
    });
    if (!dbToken) {
      return res
        .status(401)
        .json(errorFormat(refreshToken, "Invalid Token", "token"));
    }

    // verify token
    const accessToken = jwt.verify(
      dbToken.token,
      process.env.JWT_REFRESH_TOKEN,
      (err, decoded) => {
        if (err) {
          throw new Error(err.message);
        }
        req.user = decoded.password;
        return generateAccessToken(decoded.payload);
      }
    );
    res.cookie("accessToken", accessToken, { httpOnly: true, maxAge: MS });
    return res.json(accessToken);
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ error: error.message });
  }
});

module.exports.authRouter = router;
