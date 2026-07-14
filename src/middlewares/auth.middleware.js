import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asynhandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/usermodel.js";
export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token =
            req.cookies?.accessToken ||
            req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }

        // token verify ye ek traika hai ise aaise hi likhte hai
        const decodedToken = jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET
        );

        // user find
        const user = await User.findById(decodedToken?._id).select(
            "-password -refreshToken"
        );

        if (!user) {
            throw new ApiError(401, "Invalid access token");
        }

        req.user = user;

        next();
    } catch (error) {
        throw new ApiError(
            401,
            error?.message || "Invalid access token"
        );
    }
});
