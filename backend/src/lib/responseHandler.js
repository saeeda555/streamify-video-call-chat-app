

 const response = async(res,statusCode,message,data=null)=>{
    const responseObject = {
        status: statusCode < 400 ? "success" :"error",
        message,
        data
    }
    return res.status(statusCode).json(responseObject)

}

export default response