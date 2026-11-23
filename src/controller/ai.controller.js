import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asynhandler.js";
import { Notes } from "../models/notesmodel.js";
import { Subject } from "../models/subjectmodel.js";

const requestAiService = async (path, body) => {
    const serviceUrl = process.env.AI_SERVICE_URL || "http://127.0.0.1:8001";
    const serviceToken = process.env.AI_SERVICE_TOKEN;
    if (!serviceToken) {
        throw new ApiError(503, "AI_SERVICE_TOKEN is not configured on the backend");
    }

    let response;
    try {
        response = await fetch(`${serviceUrl}${path}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-AI-Service-Token": serviceToken
            },
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(120_000)
        });
    } catch (error) {
        if (error.name === "TimeoutError" || error.name === "AbortError") {
            throw new ApiError(504, "The AI service took too long to respond");
        }
        console.error("AI service request failed:", error.message);
        throw new ApiError(503, "AI service is unavailable. Start the AI service and try again.");
    }

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
        const detail = payload.detail || payload.message;
        throw new ApiError(
            response.status >= 500 || response.status === 401 ? 502 : response.status,
            typeof detail === "string" ? detail : "AI service request failed"
        );
    }
    return payload;
};

const getOwnedNote = async (noteId, userId) => {
    const note = await Notes.findOne({ _id: noteId, user: userId });
    if (!note) throw new ApiError(404, "Note not found");

    const subject = await Subject.findOne({
        _id: note.subject,
        user: userId
    });
    if (!subject) throw new ApiError(404, "Subject not found");

    return { note, subject };
};

const notePayload = (note, subject, userId) => ({
    note_id: note._id.toString(),
    user_id: userId.toString(),
    subject_id: subject._id.toString(),
    title: note.title,
    content: note.content || ""
});

const summarizeNote = asyncHandler(async (req, res) => {
    const { note, subject } = await getOwnedNote(req.params.noteId, req.user._id);
    if (!note.content?.trim()) throw new ApiError(400, "Add content to this note before summarizing");

    const result = await requestAiService(
        "/summarize",
        notePayload(note, subject, req.user._id)
    );
    return res.status(200).json(new ApiResponse(200, result, "Note summarized"));
});

const generateQuestions = asyncHandler(async (req, res) => {
    const { note, subject } = await getOwnedNote(req.params.noteId, req.user._id);
    if (!note.content?.trim()) throw new ApiError(400, "Add content to this note before generating questions");

    const result = await requestAiService(
        "/questiongenerate",
        notePayload(note, subject, req.user._id)
    );
    return res.status(200).json(new ApiResponse(200, result, "Practice questions generated"));
});

const ingestNote = asyncHandler(async (req, res) => {
    const { note, subject } = await getOwnedNote(req.params.noteId, req.user._id);
    if (!note.content?.trim()) throw new ApiError(400, "Add content to this note before adding it to study search");

    const result = await requestAiService(
        "/ingest",
        notePayload(note, subject, req.user._id)
    );
    return res.status(200).json(new ApiResponse(200, result, "Note added to study search"));
});

const askStudyQuestion = asyncHandler(async (req, res) => {
    const question = req.body.question?.trim();
    const subjectId = req.body.subjectId;
    if (!question) throw new ApiError(400, "A question is required");

    if (subjectId) {
        const subject = await Subject.findOne({ _id: subjectId, user: req.user._id });
        if (!subject) throw new ApiError(404, "Subject not found");
    }

    const result = await requestAiService("/query", {
        question,
        user_id: req.user._id.toString(),
        ...(subjectId ? { subject_id: subjectId } : {})
    });
    return res.status(200).json(new ApiResponse(200, result, "Study answer generated"));
});

export { summarizeNote, generateQuestions, ingestNote, askStudyQuestion };
