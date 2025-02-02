import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";

// checks if user is present (signed in) or not
// with the help of this function we will inject a property called user in req or res object
export const verifyJWT = asyncHandler(async (req, _, next) => {
  // _ as parameter because res object is not used
  try {
    // getting token either from cookies or from authorization in headers manually sent by user
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    // check if token is present
    if (!token) {
      throw new ApiError(401, "Unauthorized Request");
    }
    // validate token using jwt
    // this decodedToken contains user data
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const loggedInUser = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!loggedInUser) {
      throw new ApiError(401, "Invalid Access Token");
    }

    // add new property in req object
    req.user = loggedInUser;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});
