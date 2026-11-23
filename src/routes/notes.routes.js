import {Router} from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { updateNote, deleteNote, createNote,getAllNotes, getNoteById } from "../controller/notes.controller.js"
const router=Router()
router.route("/createnote").post(verifyJWT,createNote)
router.route("/createnote/:subjectId").post(verifyJWT,createNote)
router.route("/allnotes/:subjectId").get(verifyJWT,getAllNotes)
router.route("/updatenote/:noteId/:subjectId").put(verifyJWT,updateNote)
router.route("/deletenote/:noteId/:subjectId").delete(verifyJWT,deleteNote)
router.route("/getnotebyid/:noteId/:subjectId").get(verifyJWT,getNoteById)
export default router;