 import dotenv from "dotenv";
dotenv.config({
    path:'./.env'
}) 
import {app}from "./app.js"
 import connectDb from "./src/db/index.js"

 connectDb().then(()=>{
    app.listen(process.env.PORT||8000,()=>{
console.log(`server is running at port :${process.env.PORT}`);
    })
})
.catch((error)=>{
    console.log("mongoDB connection failed",err);
})
