import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asynhandler.js"
import  jwt from "jsonwebtoken"
import {Subject} from "../models/subjectmodel.js"
import { response } from "express"
import { Notes } from "../models/notesmodel.js"
const createSubject=asyncHandler(async(req, res)=>{
    const{name}=req.body; // maine subject nikala frontend se
    if(!name){
        throw new ApiError("subject name required");
    }

    const existingSubject=Subject.findOne({
        name:name,
        user:req.user._id
    })
    if(existingSubject){
    throw new ApiError(
        400,
        "Subject already exists"
    )
}
    // ab databse mai subject create hoga 
    const subject=await Subject.create({
       name:name,
       user:req.user._id
    })
return res.status(201).json(
    new ApiResponse(
        201,
        subject,
        "Subject created successfully"
    )
)
})
// mtlb dekho sbse ohele hme ye dekhna h ki hme logged in user ke hi sare subjects chaihe agr loggiedn nhi hai
// to nhi de skte hai so we use using jwt
const getAllSubjects=(asyncHandler(async(req,res)=>{
    // ye check krne ki no zaryuart because jwt alaredy verify krke bhjega and agr nhi hua user to
    // error thorw krega vo
const user=req.user._id // yani is user ke subjects chaihe sare 
if(!user){
    throw new ApiError(400, "user not logged in")
}


 const subjects=await Subject.find({
 user:req.user._id
 })
// ye databse sse sare subject de dega agr manlo suvjet aary empty bhi hui 
// tb bhi ek empty aaray return krga adn response defa kyuki it is not an errro hp 
// skta hai ek naya user aaya hai aur usne koi bhi subject na bnaya ho
return res.status(200).json(new ApiResponse(200, subjects, "subjects fetched succesfully"))
}))


const getSubjectById=asyncHandler(async(req,res)=>{
    const {subjectId}=req.params;
    const subject=await Subject.findOne({
        user:req.user._id,
        _id:subjectId
    }
    )
    if(!subject){
        throw new ApiError(404, "subject not exist")
    }
    return res.status(200).json(
        new ApiResponse(200, subject,"subject fetched succefully")
    )
})

const updateSubject=asyncHandler(async(req, res)=>{
    const {subjectId}=req.params; // subject id leke 
    const subject=await Subject.findOne({ // chcek kro ye subject isi user ka hai aur ye subjacet id 
        // hai database mai 
        user:req.user._id,
        _id:subjectId
    })
    if(!subject){
        throw new ApiError(404, "subject dont exist");
    }
    // ab body se naya naam le subjacet ka aur save kr database mai
    const{newSubjectName}=req.body;
    if(!newSubjectName){
        throw new ApiError(400,"no subject name is there")
    }
    subject.name=newSubjectName;
await subject.save(); // database mai save
     return res.status(200).json(
        new ApiResponse(200, subject, "subject name saved successfully")
     )
})


const deleteSubject=asyncHandler(async(req, res)=>{
    const {subjectId}=req.params;
// ab mughe current user ke liye subject delet krna hai to kmai use krungi 
// find one currnte user and id dono ke basi pe dkete krega aur find by ud sir subject id check kreag
// ye method do kam krega phele subject check krega and agrhoga subject to delete krega to 
// hme ab dubara dtabse mai check krne ki zaraurat nhi hai


 // pehle us subject ke sare notes delete karo
    await Notes.deleteMany({
        subject: subjectId,
        user: req.user._id
    });

    // ab subject delete karo
    await Subject.findOneAndDelete({
        user: req.user._id,
        _id: subjectId
    });
const deletedSubject=await Subject.findOneAndDelete({
user:req.user._id,
_id:subjectId
})
 if(!deletedSubject){
        throw new ApiError(404, "subject dont exixts");
    }
return res.status(200).json(
    new ApiResponse(200, {}, "subject deletd successfully")
)
})

export {createSubject, getAllSubjects, updateSubject,deleteSubject, getSubjectById}
