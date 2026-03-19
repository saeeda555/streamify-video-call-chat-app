import express from "express";
import { logIn, logOut, onBoard, signup } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";


const router = express.Router()

router.post("/signup",signup)
router.post("/login",logIn)
router.post("/logout",logOut)
router.post("/onboard",authMiddleware,onBoard)

router.get("/me",authMiddleware,(req,res)=>{
    res.status(200).json({success:true,user:req.user})
})

export default router;

