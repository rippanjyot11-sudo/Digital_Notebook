import mongoose from "mongoose";
import { DB_name } from "../../constants.js";

const connectDb = async () => {
    if (!process.env.MONGODB_URI) {
        throw new Error("MONGODB_URI is required. Add it to .env.");
    }

    const connectionInstance = await mongoose.connect(process.env.MONGODB_URI, {
        dbName: process.env.DB_NAME || DB_name
    });

    console.log(
        `Database connected successfully! DB: ${connectionInstance.connection.name}`
    );
};

export default connectDb;
