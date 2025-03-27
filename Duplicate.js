const express = require("express");
const path = require("path");
const app = express();
const mongoose=require("mongoose");
const community=require("./models/community.js");
const MONGO_URI="mongodb://127.0.0.1:27017/cybershield"; 
const methodOverride=require("method-override");
const passport=require("passport");
const data=require("./data");
const user = require("./models/user.js");
app.use(express.urlencoded({ extended: true })); 
app.use(methodOverride("_method"));
app.use(passport.intialize());
app.use(passport.session());
passport.use(new LocalPassport(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());
app.use((req,res,next)=>{
    res.locals.currUser=req.user;
    next();
})
//starting the server
mongoose.connect(MONGO_URI).then(() => console.log('MongoDB Connected Locally'))
.catch((err) => console.error('MongoDB Connection Error:', err));
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
//intializing data
const Intialize=async (data)=>{
    try{
        await community.insertMany(data);
        console.log("data is added succesfully")
    }
    catch(error){
        console.log(error);
    }
}
//middlewares
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
//routes
app.post("/signup",async (req,res)=>{
    let {username,email,passport}=req.body;
    let userdata=new user({email,username});
    let x=await user.register(userdata,password);
    req.login(x,(err)=>{
        if(err){
            return console.log("not login");
        }
        else{
            console.log(x);
            res.redirect("/home");
        }
    })
})
app.get("/login", (req, res) => {
    res.render("login");
});
app.get("/login/home",(req,res)=>{
    res.render("home.ejs");
})
app.get("/url",(req,res)=>{
    res.render("scan");
})
app.get("/document",(req,res)=>{
    res.render("filescan");
})
app.get("/ip",(req,res)=>{
    res.render("ip");
})
app.get("/community",async (req,res)=>{
    const communitydata =await community.find()
    res.render("community",{communitydata});
    // console.log(communitydata)
})
app.post("/community", async (req,res)=>{
    const { username, querytext } = req.body;
    const name=username;
    const description=querytext;
    try {

        if (!name || !description) {
            console.log("Please enter the data")
        }

        const newCommunity = new community({ name, description, date: new Date() });
        await newCommunity.save();
        
        // res.status(201).json({ message: "Community discussion saved!", community: newCommunity });
    } catch (err) {
        res.status(500).json({ error: "Server error", details: err.message });
    }
    res.redirect("/community")
})
app.get("/feedback",(req,res)=>{
    res.render("feedback");
})

app.get("/about",(req,res)=>{
    res.render("about");
})
app.get("/profile",(req,res)=>{
    res.render("profile")
})
app.post("/community/:id", async (req, res) => {
    const { username, text } = req.body;  // Extract username & reply text from form
    const postId = req.params.id;  // Get post ID from URL

    try {
        const post = await community.findById(postId);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        // Push the new reply into the replies array
        post.replies.push({ username, text, date: new Date() });
        await post.save().then((data)=>{console.log(data)});  // Save the updated document

        res.redirect(`/community`);  // Redirect to the same post page
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error", details: err.message });
    }
});
app.delete("/community/:id", async (req, res) => {
        try {
            const postId = req.params.id;
    
            // Find and delete the community post
            const deletedPost = await community.findByIdAndDelete(postId);
            
            if (!deletedPost) {
                return res.status(404).json({ error: "Post not found" });
            }
    
            res.redirect("/community")
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Server error", details: err.message });
        }
    });    
    app.delete("/community/:postId/reply/:replyId", async (req, res) => {
        const { postId, replyId } = req.params; // Get post ID and reply ID
    
        try {
            const post = await community.findById(postId);
            if (!post) {
                return res.status(404).json({ error: "Post not found" });
            }
    
            // Remove the reply by filtering out the one with replyId
            post.replies = post.replies.filter(reply => reply._id.toString() !== replyId);
            await post.save(); // Save the updated post
    
            res.redirect("/community"); // Redirect back to community page
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Server error", details: err.message });
        }
    });
    