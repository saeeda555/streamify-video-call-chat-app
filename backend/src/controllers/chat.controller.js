import response from "../lib/responseHandler.js";
import { generateStreamToken } from "../lib/stream.js"

export const getStreamToken = async(req,res)=>{
    try {
        const token = generateStreamToken(req.user.id);

        return response(res,200,"",{token})
    } catch (error) {
        console.log("Error in getStreamToken controlleer",error.message);
        return response(res, 500 ,"internal server error")
    }
}