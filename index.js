 import dotenv from "dotenv";
 dotenv.config();

 import { app } from "./app.js";
 import connectDb from "./src/db/index.js";

 const port = Number(process.env.PORT) || 8000;

 const requiredEnvironmentVariables = [
     "MONGODB_URI",
     "ACCESS_TOKEN_SECRET",
     "REFRESH_TOKEN_SECRET"
 ];
 const missingEnvironmentVariables = requiredEnvironmentVariables.filter(
     (name) => !process.env[name]
 );

 if (missingEnvironmentVariables.length) {
     console.error(
         `Missing required environment variables: ${missingEnvironmentVariables.join(", ")}`
     );
     process.exit(1);
 }

 connectDb()
     .then(() => {
         const server = app.listen(port, () => {
             console.log(`Server is running at http://localhost:${port}`);
         });

         const shutdown = (signal) => {
             console.log(`\n${signal} received. Closing server gracefully.`);
             server.close(async () => {
                 const mongoose = (await import("mongoose")).default;
                 await mongoose.connection.close();
                 process.exit(0);
             });
         };

         process.once("SIGINT", () => shutdown("SIGINT"));
         process.once("SIGTERM", () => shutdown("SIGTERM"));
     })
     .catch((error) => {
         console.error("MongoDB connection failed:", error.message);
         process.exit(1);
     });
