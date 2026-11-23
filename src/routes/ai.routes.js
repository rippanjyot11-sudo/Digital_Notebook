import { Router } from "express";
import {
    askStudyQuestion,
    generateQuestions,
    ingestNote,
    summarizeNote
} from "../controller/ai.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);
router.post("/summarize/:noteId", summarizeNote);
router.post("/questiongenerate/:noteId", generateQuestions);
router.post("/ingest/:noteId", ingestNote);
router.post("/query", askStudyQuestion);

export default router;
