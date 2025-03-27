const router = require("express").Router();
const passport = require("passport");

// Auth login
router.get("/login", (req, res) => {
  res.render("login");
});

// Logout
router.get('/logout', (req, res, next) => {
    req.logout((err) => { // ✅ Passport 0.6+ requires a callback
        if (err) {
            return next(err);
        }
        req.session.destroy(() => { // ✅ Destroy session after logout
            res.redirect('/auth/login'); // ✅ Redirect to home page
        });
    });
});


// Auth with Google
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }) // ✅ Added "email" scope
);

// Google OAuth callback route
router.get(
  "/google/redirect",
  passport.authenticate("google", {
    failureRedirect: "/login", // ✅ Redirect to login if authentication fails
  }),
  (req, res) => {
    res.redirect("/profile"); // ✅ Redirect to profile on success
  }
);

module.exports = router;
