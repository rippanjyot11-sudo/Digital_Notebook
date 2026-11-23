import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asynhandler.js";
import { Subject } from "../models/subjectmodel.js";
import { Notes } from "../models/notesmodel.js";

const createSubject = asyncHandler(async (req, res) => {
    const name = req.body.name?.trim();
    if (!name) throw new ApiError(400, "Subject name is required");

    const existingSubject = await Subject.findOne({
        name: { $regex: `^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
        user: req.user._id
    });
    if (existingSubject) {
        throw new ApiError(409, "Subject already exists");
    }

    const subject = await Subject.create({ name, user: req.user._id });
    return res.status(201).json(
        new ApiResponse(201, subject, "Subject created successfully")
    );
});

const getAllSubjects = asyncHandler(async (req, res) => {
    const subjects = await Subject.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json(
        new ApiResponse(200, subjects, "Subjects fetched successfully")
    );
});

const getSubjectById = asyncHandler(async (req, res) => {
    const subject = await Subject.findOne({
        _id: req.params.subjectId,
        user: req.user._id
    });
    if (!subject) throw new ApiError(404, "Subject not found");

    return res.status(200).json(
        new ApiResponse(200, subject, "Subject fetched successfully")
    );
});

const updateSubject = asyncHandler(async (req, res) => {
    const name = req.body.name?.trim() || req.body.newSubjectName?.trim();
    if (!name) throw new ApiError(400, "New subject name is required");

    const subject = await Subject.findOne({
        _id: req.params.subjectId,
        user: req.user._id
    });
    if (!subject) throw new ApiError(404, "Subject not found");

    subject.name = name;
    await subject.save();
    return res.status(200).json(
        new ApiResponse(200, subject, "Subject updated successfully")
    );
});

const deleteSubject = asyncHandler(async (req, res) => {
    const subject = await Subject.findOneAndDelete({
        _id: req.params.subjectId,
        user: req.user._id
    });
    if (!subject) throw new ApiError(404, "Subject not found");

    await Notes.deleteMany({ subject: subject._id, user: req.user._id });
    return res.status(200).json(
        new ApiResponse(200, {}, "Subject deleted successfully")
    );
});

export {
    createSubject,
    getAllSubjects,
    updateSubject,
    deleteSubject,
    getSubjectById
};
