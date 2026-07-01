import mongoose from 'mongoose'
import {DB_name} from "../../constants.js"
const connectDb=async()=>{
try {
    console.log(process.env.MONGODB_URI);
    const connectionInstance=await mongoose.connect(`${process.env.MONGODB_URI}/${DB_name}`)
    console.log(`Database connected successfully! DB HOST:${connectionInstance.connection.host}`)
} catch (error) {
    console.log("MONGODB connection error", error)
    process.exit(1)
}
}
export default connectDb
