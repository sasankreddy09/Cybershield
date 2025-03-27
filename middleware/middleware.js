module.exports =  (req, res, next) => {
      if (req.isAuthenticated()) {
        return next(); // ✅ Allow access if user is logged in
      }
      req.flash('error', 'You must be logged in to view this page');
      res.redirect('/login');  // ⛔ Redirect if not authenticated
    };
  