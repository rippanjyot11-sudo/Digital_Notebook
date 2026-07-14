import {Router} from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import {createSubject, getAllSubjects, updateSubject,deleteSubject, getSubjectById} from  "../controller/subject.controller.js"
const router=Router()
router.route("/createsubject").post(verifyJWT,createSubject)
router.route("/allsubjects").get(verifyJWT,getAllSubjects)
router.route("/updateSub/:subjectId").put(verifyJWT,updateSubject)
router.route("/deleteSub/:subjectId").delete(verifyJWT,deleteSubject)
router.route("/getsubByid/:subjectId").get(verifyJWT,getSubjectById)
export default router;