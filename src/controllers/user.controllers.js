import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

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

export { registerUser };
