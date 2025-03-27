const mongoose=require("mongoose");
const Schema=mongoose.Schema
communitySchema= new Schema(
    {
        name:{
            type:String,
            required:true
        },
        description:{
            type:String,
            required:true
        },
        date:{
            type:Date,
            default:Date.now
        },
        replies: [
            {
                username: String,
                text: String,
                date: { type: Date, default: Date.now }
            }
        ],
    }
)
community=new mongoose.model("Community",communitySchema);
module.exports=community;