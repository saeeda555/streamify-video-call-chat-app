import mongoose from "mongoose";
import User from "./User.js";

const friendRequestSchema = new mongoose.Schema({
    sender:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        rerquired:true
    },
    recipient:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        rerquired:true
    },
    status:{
        type:String,
        enum: ["pending","accepted"],
        default:"pending"
    }
},{timestamps:true})

export const FriendRequest = mongoose.model("FriendRequest",friendRequestSchema);