import dotenv from "dotenv";
dotenv.config();

export const ENV = {
    PORT:process.env.PORT,
    MONGO_URI:process.env.MONGO_URI,
    JWT_SECRET_TOKEN:process.env.JWT_SECRET_TOKEN,
    NODE_ENV:process.env.NODE_ENV,
    STREAM_API_KEY:process.env.STREAM_API_KEY,
    STREAM_API_SECRET:process.env.STREAM_API_SECRET

}