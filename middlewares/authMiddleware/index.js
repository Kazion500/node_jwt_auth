async function authenticate(req, res, next) {
    console.log(res.user);
  if (req.user) {
    next();
  }
  res.sendStatus(401);
}


module.exports = {authenticate}