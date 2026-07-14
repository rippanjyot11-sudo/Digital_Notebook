import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import userRouter from "./src/routes/user.routes.js"
import subjectRouter from "./src/routes/subject.routes.js"
import noteRouter from "./src/routes/notes.routes.js"
const app=express()
app.use(cors({
    origin:process.env.CORS_ORIGIN
}))
app.use(express.json({ limit: "16kb" }))

app.use(express.urlencoded({
    extended: true,
    limit: "16kb"
}))

app.use(express.static("public"))

app.use(cookieParser())

app.use("/api/v1/users",userRouter)
app.use("/api/v1/subjects",subjectRouter)
app.use("/api/v1/notes",noteRouter)
export {app}