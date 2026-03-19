import jwt from "jsonwebtoken";
import {ENV} from "../config/env.js"
export const generateToken = (user)=>{
    return jwt.sign({userId:user?._id,email:user.email},ENV.JWT_SECRET_TOKEN, {expiresIn: "90d"})
}