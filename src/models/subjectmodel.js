import mongoose, {Schema} from "mongoose"
const subjectSchema=new Schema({
name:{
   type:String,
    required:true,
    trim:true
},
user:{
    type:Schema.Types.ObjectId,
    ref:"User"
}
})
export const  Subject=mongoose.model("Subject",subjectSchema)