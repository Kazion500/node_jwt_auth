const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const PrismaClient = require("../prismaUtil");
const { user, token } = new PrismaClient();
const RAW_SALT = parseInt(process.env.RAW_SALT, 10);

async function verifyPassword(username, password) {
  const dbUser = await getUser(username);
  const match = await bcrypt.compare(password, dbUser.password);
  return { match, dbUser };
}

function genHashPassword(rawPassword) {
  const salt = bcrypt.genSaltSync(RAW_SALT);
  const hash = bcrypt.hashSync(rawPassword, salt);

  return hash;
}

async function getUser(userName) {
  const uniqueUser = await user.findUnique({
    where: {
      userName,
    },
  });
  return uniqueUser;
}

async function saveToken(refreshToken) {
  try {
    const newToken = await token.create({
      data: {
        token: refreshToken,
      },
    });
    return newToken;
  } catch (error) {
    return error.message;
  }
}

function generateAccessToken(payload) {
  return jwt.sign({ payload }, process.env.JWT_ACCESS_TOKEN, { expiresIn: 15 });
}

function generateRefreshToken(payload) {
  return jwt.sign({ payload }, process.env.JWT_REFRESH_TOKEN);
}

module.exports = {
  verifyPassword,
  getUser,
  genHashPassword,
  saveToken,
  generateAccessToken,
  generateRefreshToken,
};
