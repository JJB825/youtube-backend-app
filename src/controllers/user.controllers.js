import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import { COOKIE_OPTIONS } from "../constants.js";

// here normal async function is user because we are not generating any web request
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    // get user to use the token methods
    const user = await User.findById(userId);
    // generate tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    // store refreshToken in database for further reference
    user.refreshToken = refreshToken;
    // saves without applying specified validation
    await user.save({ validateBeforeSave: false });
    // return both tokens to user
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating tokens");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  const { username, email, password, fullName } = req.body;
  // console.log(username, email, password, fullName);

  // validation - one of them not empty
  if (
    [username, email, password, fullName].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "Please fill all input fields");
  }
  // you can check for other validation too

  // check if user already exists: username or email
  const exisitingUser = await User.findOne({ $or: [{ username }, { email }] });
  if (exisitingUser) {
    throw new ApiError(
      409, // indicates a conflict with resource's current state
      "User already exists with entered username or password"
    );
  }

  // check for images: avatar compulsory, coverImage (not mandatory)
  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;
  // used optional chaining as not sure that the avatar image location is present or not

  let coverImageLocalPath;
  // checking for coverImage
  // Array.isArray checks whether the argument is an array or not
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar Image is necessary");
  }

  // if images are present, upload them to cloudinary - take out url from response, check if avatar is uploaded or not, because avatar is required field
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar Image not uploaded successfully");
  }

  // since here all required fields are obtained, create new user object - create entry in db
  const user = await User.create({
    username: username.toLowerCase(),
    email,
    password,
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });

  // check for user creation - if new user is created or not
  // created user without fields password and refreshToken returned
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering user");
  }

  // return response
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  // take user data from req.body - ask for username/email and password
  const { email, username, password } = req.body;

  // check for empty username or password
  if (!(username || email)) {
    throw new ApiError(400, "Username or email is required");
  }

  // find user using email/username
  const user = await User.findOne({ $or: [{ username }, { email }] });

  // if user exists proceed else return error
  if (!user) {
    throw new ApiError(404, "User doesn't exists");
  }

  // check for password -> using compare function, if password correct, proceed else return error
  // the custom methods created in user model is not available using User model, that only provides access to mongoose methods, custom methods are available using user variable, the instance created using User model
  const passwordCheck = await user.isPasswordCorrect(password);
  if (!passwordCheck) {
    throw new ApiError(401, "Invalid password credentials");
  }

  // generate access and refresh token
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  // send both tokens to user in form of secure cookies
  // generate data (user object) to be sent to user as response (without password and refreshToken)
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  // options for cookies -> make it modifiable only through server, used from constants.js

  // send response of success login
  return (
    res
      .status(200)
      // able to access this property due to use of cookieparser middleware
      .cookie("accessToken", accessToken, COOKIE_OPTIONS)
      .cookie("refreshToken", refreshToken, COOKIE_OPTIONS)
      .json(
        // good practice of sending both tokens along with data to allow user to do whatever with it, since it has the authority
        new ApiResponse(
          // statusCode
          200,
          // data
          { user: loggedInUser, accessToken, refreshToken },
          // message
          "User logged in successfully"
        )
      )
  );
});

const logoutUser = asyncHandler(async (req, res) => {
  // reset refreshToken field from User
  await User.findByIdAndUpdate(
    req.user._id,
    // updates the fields
    { $set: { refreshToken: undefined } },
    // returns new copy
    { new: true }
  );

  // clear cookies from user browser
  return (
    res
      .status(200)
      // need to provide options while clearing cookies
      .clearCookie("accessToken", COOKIE_OPTIONS)
      .clearCookie("refreshToken", COOKIE_OPTIONS)
      .json(new ApiResponse(200, {}, "User logged out successfully"))
  );
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  // get refreshToken from cookies
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  // check if refreshToken has been received or not
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorised request");
  }

  // put in try-catch to handle errors
  try {
    // verify token using jwt and decode it
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    // get user using _id from decodedToken
    const user = await User.findById(decodedToken?._id);

    // check if user exists
    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    // match the incoming token and the one stored in database for validating further process
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    // send response to user
    return res
      .status(200)
      .cookie("accessToken", accessToken, COOKIE_OPTIONS)
      .cookie("refreshToken", newRefreshToken, COOKIE_OPTIONS)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access Token refreshed successfully"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Refresh Token");
  }
});

// common user functionalities needed
const changeCurrentPassword = asyncHandler(async (req, res) => {
  // take password from req.body
  const { oldPassword, newPassword } = req.body;

  // here user can be retrieved using req.user can be used because before executing this function we will pass the middleware verifyJWT to ensure that the user is logged in or not, cause this is authenticated functionality
  const user = await User.findById(req.user?._id);

  // check if old password entered is true or false
  const passwordCheck = await user.isPasswordCorrect(oldPassword);
  if (!passwordCheck) {
    throw new ApiError(401, "Invalid old password");
  }

  // set new password and save
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  // return success response
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password updated successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});

// updating user details depend on what all fields are you allowing to update
// this is for text details updates, for file updates make separate controllers
const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  // check for input fields
  if (!(fullName || email)) {
    throw new ApiError(400, "Please fill all input fields");
  }

  // get user and update details
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    // updates the fields
    { $set: { fullName, email } },
    // returns new copy
    { new: true }
    // chaining methods
  ).select("-password");

  // return response
  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedUser, "Account Details updated successfully")
    );
});

// here two middlewares before this function: first multer for accepting file inputs, second authentication
const updateUserAvatar = asyncHandler(async (req, res) => {
  // take out local path
  const avatarLocalPath = req.files?.avatar[0]?.path;

  // check if present or not
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar Image is necessary");
  }

  // upload file on cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);

  // check for successfull upload
  if (!avatar.url) {
    throw new ApiError(500, "Avatar Image not uploaded successfully");
  }

  // update the avatar field of the user and save
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    // updates the fields
    { $set: { avatar: avatar.url } },
    // returns new copy
    { new: true }
    // chaining methods
  ).select("-password");

  // return response
  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedUser, "Avatar image updated successfully")
    );
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  // take out local path
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  // check if present or not
  if (!coverImageLocalPath) {
    throw new ApiError(400, "Cover Image is necessary");
  }

  // upload file on cloudinary
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  // check for successfull upload
  if (!coverImage.url) {
    throw new ApiError(500, "Cover Image not uploaded successfully");
  }

  // update the avatar field of the user and save
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    // updates the fields
    { $set: { coverImage: coverImage.url } },
    // returns new copy
    { new: true }
    // chaining methods
  ).select("-password");

  // return response
  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedUser, "Cover Image updated successfully")
    );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
};
