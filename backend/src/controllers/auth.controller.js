import User from "../models/User.js";
import { generateToken } from "../lib/generateToken.js";
import { ENV } from "../config/env.js";
import { upsertStreamUser } from "../lib/stream.js";
import response from "../lib/responseHandler.js";


export const signup = async(req,res)=>{


    const {fullName,email,password} = req.body;
    
//save the user after checking everything
    try {
        

        if(!email ||!fullName || !password){
            return response(res,400,' all fields are required')
        }

        if(password.length<6){
            return response(res,400,'password must be atleast 6 characters')
        }
        const existingUser = await User.findOne({
            $or:[{email},{fullName}]
        });
        if(existingUser){
            return response(res,400,"Email or username already exists")
        }

        const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
        if(!emailRegex.test(email)){
            return response(res,400,"Invalid email format")
        }

        const idx = Math.floor(Math.random()*100) +1 //1-100
        const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`

        const newUser = await User.create({
            email,
            fullName,
            password,
            profilePic: randomAvatar,
        })

        try {
            await upsertStreamUser({
            id:newUser._id.toString(),
            name: newUser.fullName,
            image: newUser.profilePic || "",

        });
        console.log(`new stram user created successfuly for ${newUser.fullName}`)
        } catch (error) {
            console.log("Error creating stream user:",error)
        }

        const token = generateToken(newUser)

        res.cookie("auth_Token",token,{
            httpOnly:true, //prevent xss attacks
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: "strict", // prevent CSRF attacks
            secure: ENV.NODE_ENV === "production",
       
        })
        return response(res,201,"User created successfully",{
            user:newUser
        })
         
    } catch (error) {
        console.error("error in signup controller",error)
        return response(res,500,"Internal Server Error",error.message)
    }

}

export const logIn = async(req,res)=>{
    try {
        const {email,password} = req.body;

        if(!(email || password)){
            return response(res,404,'all fields are required')
        }
        const user = await User.findOne({email});
        if(!user){
            return response(res,404,'User not found with this email')

        }

        const isPasswordCorrect=await user.matchPassword(password)

        if(!isPasswordCorrect){
            return response(res,404,'invalid email or password')
        }

        const token = generateToken(user);

        res.cookie("auth_Token",token,{
            httpOnly:true, //prevent xss attacks
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: "strict", // prevent CSRF attacks
            secure: ENV.NODE_ENV === "production",
       
        })
        return response(res,201,"User loggedIn successfully",{
            user
        })

    } catch (error) {
        console.error("error in login controller")
        return response(res,500,"Internal Server Error",error.message)
    }
}

export const logOut = async(req,res)=>{
    try {
        res.cookie("auth_Token","")
        return response(res,200,"User logged out successfully")
    } catch (error) {
        return response(res,500,"Internal Server Error",error.message)
    }
}

export const onBoard = async(req,res)=>{
    console.log(req.user)
    try {
         if (!req.user) {
            return res.status(401).json({ message: "Unauthorized - Please login" });
    }
        const userId = req.user._id
        const {fullName,bio,nativeLanguage,learningLanguage,location} = req.body;

        if((!fullName || !bio || !nativeLanguage || !learningLanguage || !location)){
            return response(res,400,"all fields are required",{missingfields:[
                !fullName && "fullName",
                !bio && "bio",
                !nativeLanguage && "nativeLanguage",
                !learningLanguage && "learningLanguage",
                !location && "location",
            ].filter(Boolean)})
        }

        const updatedUser = await User.findByIdAndUpdate(userId,{...req.body,
            isOnboarded:true,
        },{new:true})

        if(!updatedUser) return response(res,404,"User not found")

        try {
            await upsertStreamUser({
            id: updatedUser._id.toString(),
            name: updatedUser.fullName,
            image: updatedUser.profilePic || "",
      });
      console.log(`Stream user updated after onboarding for ${updatedUser.fullName}`);
    } catch (streamError) {
      console.log("Error updating Stream user during onboarding:", streamError.message);
    }

    res.status(200).json({ success: true, user: updatedUser });
    

    } catch (error) {
        console.error("Onboarding error:", error);
        res.status(500).json({ message: "Internal Server Error" });
        }
}