import {StreamChat} from "stream-chat"
import { ENV } from "../config/env.js"

const apiKey = ENV.STREAM_API_KEY
const apiSecret= ENV.STREAM_API_SECRET;


if(!(apiKey || apiSecret)){
    console.error("Stream api key or secret is missing")
}

const streamClient = StreamChat.getInstance(apiKey,apiSecret);// through this we can communicate with stream

export const upsertStreamUser = async(userData)=>{
    try {
        await streamClient.upsertUsers([userData]) // create or update
        return userData
    } catch (error) {
        console.error("error creating stream user:",error)
    }
};

export const generateStreamToken = (userId) => {
    try {
        // ensure userid is a stirng
        const userIdStr = userId.toString();
        return streamClient.createToken(userIdStr)
    } catch (error) {
        console.error("error generating stream token:",error)
    }
};
