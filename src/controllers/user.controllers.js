import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

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
  // options for cookies -> make it modifiable only through server
  const options = { httpOnly: true, secure: true };

  // send response of success login
  return (
    res
      .status(200)
      // able to access this property due to use of cookieparser middleware
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
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
  const options = { httpOnly: true, secure: true };
  return (
    res
      .status(200)
      // need to provide options while clearing cookies
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new ApiResponse(200, {}, "User logged out successfully"))
  );
});

export { registerUser, loginUser, logoutUser };
