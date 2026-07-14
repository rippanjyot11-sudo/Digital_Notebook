import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asynhandler.js"
import {Notes} from "../models/notesmodel.js"
import { Subject } from "../models/subjectmodel.js"
const createNote=asyncHandler(async(req, res)=>{
    const {title}=req.body;
    const {content}=req.body;
    const {subjectId}=req.params;
//maine frontend se cheez eli hai and mai unhe databe mai check krri hu ki kya vo same hai
// amine yha ttile ke basis pe duoliacte note check kiay ahi 
    const existingNote=await Notes.findOne(
        {
title:title,
subject:subjectId,
user:req.user._id
        }
    )
    if(existingNote){
        throw new ApiError(404, "same note exists alraedy")
    }
const note= await Notes.create({
    title:title,
    content:content,
    user:req.user._id,
    subject:subjectId
})
return res.status(201).json(
    new ApiResponse(
        201,
        note,
        "note created successfully"
    )
)
})


const getAllNotes=asyncHandler(async(req, res)=>{
    const {subjectId}=req.params;
    const page = Number(req.query.page) || 1; // mai page leke aayi
    const limit = Number(req.query.limit) || 10;// yha limit aayi 
    const subject=await Subject.findOne({
        _id:subjectId,
        user:req.user._id
    }) // find one merko ek single document dega array nhi yani object dega so i can do (!subject)
    if(!subject){
        throw new ApiError(404, "subject not found");
    }
// pheel hmne subject collection mai dekha ki subject hai agr hai to theek hai nhi hai to errro 
// kyuki ye ho ksta hai ki subject ho but notes na ho to vo koi error ki baat nhi hai

    const notes=await Notes.find({
        subject:subjectId,
        user:req.user._id         // ye aray dega to agr note skhli bhi honge to empoty array
    })
    .skip((page - 1) * limit)
    .limit(limit);

    return res.status(200).json(
        new ApiResponse(200, notess, "notes fetechd succefully")
    )
})


const getNoteById=asyncHandler(async(req, res)=>{
    const {title}=req.body;
    const {subjectId}=req.params;
    const {noteId}=req.params;
    const subject = await Subject.findOne({
    _id: subjectId,
    user: req.user._id
});
if(!subject){
    throw new ApiError("subject not found");
}
    const note =await Notes.findOne({
        _id:noteId,
        subject:subjectId,
        user:req.user._id,
    }
    )
    if(!note){
        throw new ApiError(404, "note not found")
    }
    return res.status(200).json(new Response(200, note,"note fetched succefully"))
})

const updateNote=asyncHandler(async(req, res)=>{
const { title}=req.body;
const {content}=req.body;
const {noteId}=req.params;
const {subjectId}=req.params;
if(!title && !content && !subjectId){
    throw new ApiError(400,"Nothing to update");
}
const note=await Notes.findOne({
    _id:noteId,
user:req.user._id
})
if(!note){
    throw new ApiError(404, "no notes found")
}
// dekh  is note se backend phele hi note le aaya hai use koi naya title ki zaraurt nhi hai mtlb akg e
// aise mt likho ki new title ya new new content 
// password vale mai to backend ko old pass ko ohele verify krna tha fir nwe pass bnata tha
// aur forntend bhi new pass nad old pass bhjt lekin notes mai frintedn koi alg se
// new title ya conetnt nhi bhejag vio to normally bs title ke jagah naya nam type kr dega and vhi bhjega
// since pass is senetive to frontend new and old dono bhjega and backend pohele old ko databs ese 
// check krega and tbhi new paawod se uodate kreag 
if(title)
note.title=title;
if(content)
note.content=content
if(subjectId)
note.subject=subjectId
await note.save();
return res.status(200).json(
        new ApiResponse(200, note, "note updated successfully")
    );
})

 const deleteNote=asyncHandler(async(req, res)=>{
    const {noteId}=req.params;
    const deletednote=await Notes.findOneAndDelete({
        _id:noteId,
        user:req.user._id
    })
     if(!deletednote){
        throw new ApiError(404, "no note to delete");
    }
    return res.status(200).json(
    new ApiResponse(200, {}, "note deletd successfully")
)
})
export {deleteNote, createNote, updateNote, getAllNotes,getNoteById}
