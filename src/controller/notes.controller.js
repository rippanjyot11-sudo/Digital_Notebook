import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asynhandler.js";
import { Notes } from "../models/notesmodel.js";
import { Subject } from "../models/subjectmodel.js";

const createNote = asyncHandler(async (req, res) => {
    const subjectId = req.params.subjectId || req.body.subjectId;
    const title = req.body.title?.trim();
    const content = req.body.content;

    if (!subjectId) throw new ApiError(400, "Subject ID is required");
    if (!title) throw new ApiError(400, "Note title is required");

    const subject = await Subject.findOne({ _id: subjectId, user: req.user._id });
    if (!subject) throw new ApiError(404, "Subject not found");

    const existingNote = await Notes.findOne({
        title,
        subject: subjectId,
        user: req.user._id
    });
    if (existingNote) throw new ApiError(409, "A note with this title already exists");

    const note = await Notes.create({
        title,
        content: content ?? "",
        user: req.user._id,
        subject: subjectId
    });
    return res.status(201).json(
        new ApiResponse(201, note, "Note created successfully")
    );
});

const getAllNotes = asyncHandler(async (req, res) => {
    const subject = await Subject.findOne({
        _id: req.params.subjectId,
        user: req.user._id
    });
    if (!subject) throw new ApiError(404, "Subject not found");

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
    const filter = { subject: req.params.subjectId, user: req.user._id };
    const total = await Notes.countDocuments(filter);
    const notes = await Notes.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

    return res.status(200).json(
        new ApiResponse(200, {
            notes,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        }, "Notes fetched successfully")
    );
});

const getNoteById = asyncHandler(async (req, res) => {
    const note = await Notes.findOne({
        _id: req.params.noteId,
        subject: req.params.subjectId,
        user: req.user._id
    });
    if (!note) throw new ApiError(404, "Note not found");

    return res.status(200).json(
        new ApiResponse(200, note, "Note fetched successfully")
    );
});

const updateNote = asyncHandler(async (req, res) => {
    const note = await Notes.findOne({
        _id: req.params.noteId,
        user: req.user._id
    });
    if (!note) throw new ApiError(404, "Note not found");

    if (req.body.title !== undefined) {
        if (!req.body.title.trim()) throw new ApiError(400, "Note title cannot be empty");
        note.title = req.body.title.trim();
    }
    if (req.body.content !== undefined) note.content = req.body.content;

    if (req.body.subjectId) {
        const subject = await Subject.findOne({
            _id: req.body.subjectId,
            user: req.user._id
        });
        if (!subject) throw new ApiError(404, "Destination subject not found");
        note.subject = req.body.subjectId;
    }

    await note.save();
    return res.status(200).json(
        new ApiResponse(200, note, "Note updated successfully")
    );
});

const deleteNote = asyncHandler(async (req, res) => {
    const deletedNote = await Notes.findOneAndDelete({
        _id: req.params.noteId,
        user: req.user._id,
        ...(req.params.subjectId ? { subject: req.params.subjectId } : {})
    });
    if (!deletedNote) throw new ApiError(404, "Note not found");

    return res.status(200).json(
        new ApiResponse(200, {}, "Note deleted successfully")
    );
});

export { deleteNote, createNote, updateNote, getAllNotes, getNoteById };
