const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const passport = require("passport");
const keys = require('./config/keys');
const LocalStrategy = require("passport-local").Strategy;
const session = require("express-session");
const methodOverride = require("method-override");
const community = require("./models/community.js");
const user = require("./models/user.js");
const data = require("./data");
const flash = require('connect-flash');
const authRoutes = require('./routes/auth-routes');
const profileRoutes = require('./routes/profile-routes');
const passportSetup = require('./config/passport-setup');
const app = express();
const MONGO_URI = Process.env.MONGO_URL;
const PORT = 3000;
const middleware = require("./middleware/middleware.js");
const feedbackSchema=require("./models/feedback.js");
app.use(flash())
// Database Connection
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB Connected Locally"))
    .catch(err => console.error("MongoDB Connection Error:", err));

// Middleware Setup
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

app.use(session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);

// Set View Engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Set Global Variables
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success');  
    res.locals.error_msg = req.flash('error');
    res.locals.currUser = req.user;
    next();
});
const createAdmin = async () => {
    try {
        let admin = new user({ username: "admin", email: "admin@cybershield.com", isAdmin: true });
        await user.register(admin, "cyberShield1234"); // Change the password
        console.log("Admin user created!");
    } catch (error) {
        console.error("Error creating admin:", error);
    }
};

// createAdmin();
// Initialize Data Function
const initializeData = async () => {
    try {
        await community.insertMany(data);
        console.log("Data added successfully");
    } catch (error) {
        console.error("Error initializing data:", error);
    }
};
// initializeData();

// Routes
app.get("/login", (req, res) => res.render("login"));
app.post("/login", passport.authenticate("local", {
    successRedirect: "/home",
    failureRedirect: "/login",
    failureFlash: true
}),(req,res)=>{
    console.log(req.user.isAdmin)
    if(req.user.isAdmin){
        res.redirect("/admin/dashboard");
    }
    else{
        res.redirect("/home")
    }
});


app.get("/logout", (req, res) => {
    req.logout(err => {
        if (err) {
            console.error("Logout error:", err);
            return res.redirect("/home");
        }
        res.redirect("/login");
    });
});

app.get("/home",middleware, (req, res) => res.render("home.ejs"));
app.get("/url", middleware,(req, res) => res.render("scan"));
app.get("/document",middleware, (req, res) => res.render("filescan.ejs"));
app.get("/ip",middleware, (req, res) => res.render("ip"));
app.get("/feedback",middleware, (req, res) => res.render("feedback"));
app.post("/feedback", middleware, async (req, res) => {
    try {
        const { rating, feedback } = req.body;
        console.log("Received:", rating, feedback);
        // Create new feedback document
        let user=req.user.username;
        let newFeedback = new feedbackSchema({user, rating, feedback });

        // Save to database
        await newFeedback.save();
        console.log("Feedback stored successfully");
        res.redirect("/feedback");

    } catch (err) {
        console.error("Error saving feedback:", err.message);
        res.redirect("/home");
    }
});
app.get("/about",middleware, (req, res) => res.render("about"));
// app.get("/profile", (req, res) => res.render("profile"));
app.get("/admin/dashboard",middleware,async (req,res)=>{
    if(req.user.isAdmin){
        const feedback = await feedbackSchema.find();
    res.render("adminDashboard.ejs",{feedback});
}
else{
    res.send("404!! page not found")
}
})
// User Signup Route
app.post("/signup", async (req, res) => {
    let { username, email, password } = req.body;
    let userdata = new user({ email, username });
    try {
        let newUser = await user.register(userdata, password);
        console.log("hello");
        req.login(newUser, err => {
            if (err) {
                console.error("Login error:", err);
                return res.redirect("/signup");
            }
            res.redirect("/home");
        });
    } catch (error) {
        console.error("Signup error:", error);
        res.redirect("/signup");
    }
});

// Community Routes
app.get("/community",middleware, async (req, res) => {
    try {
        const communityData = await community.find();
        res.render("community", { communitydata: communityData,loggedInUser: req.user.username});
    } catch (error) {
        console.error("Error fetching community data:", error);
        res.status(500).send("Server Error");
    }
});

app.post("/community",middleware, async (req, res) => {
    const { username, querytext } = req.body;
    if (!username || !querytext) {
        console.log("Missing community data");
        return res.redirect("/community");
    }
    try {
        const newCommunity = new community({ name: username, description: querytext, date: new Date() });
        await newCommunity.save();
        res.redirect("/community");
    } catch (error) {
        console.error("Error adding community post:", error);
        res.status(500).send("Server Error");
    }
});

app.post("/community/:id",middleware, async (req, res) => {
    const { username, text } = req.body;
    const postId = req.params.id;
    try {
        const post = await community.findById(postId);
        if (!post) return res.status(404).send("Post not found");
        post.replies.push({ username, text, date: new Date() });
        await post.save();
        res.redirect("/community");
    } catch (error) {
        console.error("Error adding reply:", error);
        res.status(500).send("Server Error");
    }
});

app.delete("/community/:id",middleware, async (req, res) => {
    try {
        const deletedPost = await community.findByIdAndDelete(req.params.id);
        if (!deletedPost) return res.status(404).send("Post not found");
        res.redirect("/community");
    } catch (error) {
        console.error("Error deleting post:", error);
        res.status(500).send("Server Error");
    }
});

app.delete("/community/:postId/reply/:replyId",middleware, async (req, res) => {
    try {
        const post = await community.findById(req.params.postId);
        if (!post) return res.status(404).send("Post not found");
        post.replies = post.replies.filter(reply => reply._id.toString() !== req.params.replyId);
        await post.save();
        res.redirect("/community");
    } catch (error) {
        console.error("Error deleting reply:", error);
        res.status(500).send("Server Error");
    }
});

// Start Server
app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
