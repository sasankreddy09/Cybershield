const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMangoose = require("passport-local-mongoose");
const userSchema = new Schema({
    email:{
        type:String,
        require:true
    },
    isAdmin: { type: Boolean, default: false }
});
userSchema.plugin(passportLocalMangoose);
module.exports=mongoose.model("Users",userSchema);