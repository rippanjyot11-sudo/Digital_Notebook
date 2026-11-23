import mongoose , {Schema} from "mongoose"
const notesSchema=new Schema({
    title:{
        type:String
    },
    content:{
        type:String
    },
    subject:{
        type:Schema.Types.ObjectId,
        ref:"Subject"
    },
    user:{
type:Schema.Types.ObjectId,
ref:"User"
    }
}, { timestamps: true })
export const Notes=mongoose.model("Notes", notesSchema)
// yha jo subject hai na usme id se store hoga subject;