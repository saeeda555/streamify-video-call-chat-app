import express from "express";
import { ENV } from "./config/env.js";
import authRoutes from "./routes/auth.routes.js"
import { connectDB } from "./lib/db.js";
import cookiParser from "cookie-parser";
import userRoutes from "./routes/user.route.js"
import chatRoutes from "./routes/chat.routes.js"
import cors from "cors"
import path from "path";

const app = express()
const __dirname = path.resolve();

app.use(cookiParser())
app.use(express.json())
app.use(cors({
    origin:"http://localhost:5173",
    credentials: true // allow frontend to send the cookies
}))

app.use('/api/auth',authRoutes)
app.use("/api/users",userRoutes)
app.use("/api/chats",chatRoutes)

if(ENV.NODE_ENV ==="production"){
    app.use(express.static(path.join(__dirname, "../frontend/dist")));

    app.get("*", (req,res)=>{
        res.sendFile(path.join(__dirname, "../frontend/dist/index.html"))
    })
}

app.listen(ENV.PORT,()=>{
    console.log(`server listening on port :${ENV.PORT}`);
    connectDB();
});