const router = require("express").Router();

const authCheck = (req, res, next) => {
  if (!req.isAuthenticated()) {  // ✅ Use Passport's isAuthenticated() method
    return res.redirect("/auth/login");
  }
  next();
};

router.get("/", authCheck, (req, res) => {
  res.render("home", ); // ✅ Pass user data to profile.ejs
});

module.exports = router;
