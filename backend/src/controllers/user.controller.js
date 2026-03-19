import response from "../lib/responseHandler.js"
import { FriendRequest } from "../models/FriendRequest.js";
import User from "../models/User.js";

export const getRecommendedUsers = async(req,res)=>{
    try {
        const currentUserId = req.user._id;
        const currentUser = req.user

        const recommendedUsers = await User.find({
            $and: [
                {_id: {$ne: currentUserId}}, // excluede myself or currentuser
                {_id:{$nin: currentUser.friends}},
                {isOnboarded: true}
            ]
        })
        return response(res,200,"suggested users recommendation", recommendedUsers)
    } catch (error) {
        console.error("Error in getRecommended controller",error.message);
        return response(res,500,"internal server error")
    }
}
export const getMyFriends = async(req,res)=>{
    try {
        const userId = req.user._id;
        const user = await User.findById(userId).select("friends").populate("friends","fullName profilepic nativeLanguage learningLanguage")

        return response(res,200,"successfull getting myfriend",user.friends)

    } catch (error) {
         console.error("Error in get my friends",error.message)
        return response(res,500,"internal server error")
    }
}

export const sendFriendRequest = async(req,res)=>{
    try {
        const myId = req.user.id;
        const {id:recipientId} = req.params;

        if(myId === recipientId){
            return response(res,400,"you cannot follow yourself")
        }

        const recipient = await User.findById(recipientId);
        

        if(!recipient){
            return response(res,404,"recipient not found")

        }
        if(recipient.friends.includes(myId)){
            return response(res,400,"You are already friends with this user")
        }
        // check if req already exists
        const existingRequest = await FriendRequest.findOne({
            $or:[
                {sender:myId,recipient:recipientId},
                {sender:recipientId,recipient:myId}
            ],
        });
        if(existingRequest){
            return response(res,400,"a friend request already exists btw u and this user")
        }

        const friendRequest =  await FriendRequest.create({
            sender: myId,
            recipient: recipientId,
        });

        return response(res,200,"friend request sent",friendRequest)
    } catch (error) {
        console.error("Error in sending friend request",error.message)
        return response(res,500,"internal server error")
    }
}

export const acceptFriendRequest = async(req,res)=>{
    try {
        const {id:requestId} = req.params;
        const friendRequest = await FriendRequest.findById(requestId);

        if(!friendRequest){
            return response(res,404,"friend request not found")
        }
        if(friendRequest.recipient.toString()!==req.user.id){
            return response(res,403,"you are not authorized to  accept this request")
        }

        friendRequest.status="accepted";
        await friendRequest.save();

        //add each other in friends array
        // addtoset : adds elements to an array only if they do not already exists

        await User.findByIdAndUpdate(friendRequest.sender,{
            $addToSet:{friends:friendRequest.recipient}
        })
        await User.findByIdAndUpdate(friendRequest.recipient,{
            $addToSet:{friends:friendRequest.sender}
        })
        return response(res,200,"friend request accepted",{
            senderId: friendRequest.sender,
            recipientId: friendRequest.recipient,
            status: friendRequest.status
        })
    } catch (error) {

        console.error("Error in accepting friend request",error.message)
        return response(res,500,"internal server error")
    }
}

export const getFriendRequest = async(req,res)=>{
    try {
        const incomingReqs = await FriendRequest.find({
            recipient:req.user.id,
            status:"pending"
        }).populate("sender","fullName profilePic nativeLanguage learningLanguage")

        const acceptedReqs = await FriendRequest.find({
            sender:req.user.id,
            status:"accepted",
        }).populate("recipient","fullName profilePic nativeLanguage learningLanguge")

        return response(res,200,"request fetch success",{incomingReqs,acceptedReqs})
    } catch (error) {
        console.error("Error in getting friend request",error.message)
        return response(res,500,"internal server error")
    }
}
export const getOutgoingFriendReqs = async(req,res)=>{
    try {
        const outgoingReqs = await FriendRequest.find({
            sender:req.user.id,
            status:"pending",
        }).populate("recipient" , "fullName profilePic nativeLanguage learningLanguage");

        return response(res,200,"outgoing request fetched successfully",outgoingReqs)
    } catch (error) {
        console.error("Error in getting outgoing friend request",error.message)
        return response(res,500,"internal server error")
    }
}