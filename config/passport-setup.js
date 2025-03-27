const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const keys = require("./keys");
const User = require("../models/user-model");

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: keys.google.clientID,
      clientSecret: keys.google.clientSecret,
      callbackURL: process.env.GOOGLE_REDIRECT_URL || "http://localhost:3000/auth/google/redirect",
      scope: ["profile", "email"], // Ensure email is included in Google's response
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("🔍 Google Profile:", profile); // Debugging: Check if email is received

        // Extract email safely
        const email = profile.emails?.[0]?.value || null;

        if (!email) {
          console.error("❌ No email provided by Google");
          return done(new Error("Google account has no email"), null);
        }

        // Check if user already exists in the database
        let currentUser = await User.findOne({ googleId: profile.id });

        if (currentUser) {
          console.log("✅ User exists:", currentUser);
          return done(null, currentUser);
        }

        // If user doesn't exist, create a new user with email
        const newUser = new User({
          googleId: profile.id,
          email: email, // Ensure email is saved
          username: profile.displayName,
          thumbnail: profile.photos?.[0]?.value || "", // Fixed profile image
        });

        await newUser.save();
        console.log("🆕 Created new user:", newUser);
        return done(null, newUser);
      } catch (error) {
        console.error("❌ OAuth Error:", error);
        return done(error, null);
      }
    }
  )
);
