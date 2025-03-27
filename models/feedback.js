const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const feedbackSchema=new Schema(
    {
        user:{
            type:String,
            required:true,
        },
        rating:{
            type:Number,
            required:true,
        },
        feedback:{
            type:String,
            required:true,
        },
        date:{
            type:Date,
            default:Date.now(),
        }
    }
)
module.exports=mongoose.model("feedbacks",feedbackSchema);