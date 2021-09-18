const { authenticate } = require("../middlewares/authMiddleware");

const router = require("express").Router();

router.get("/",  (req, res) => {
  console.log(req.user);
  res.send("Hello");
});

module.exports.dashboardRouter = router;
