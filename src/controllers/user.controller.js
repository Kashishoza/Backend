import { asyncHandler } from  "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";    
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

const registerUser = asyncHandler( async (req, res) =>{
    // get user details from frontend
    // validate details - not empty
    // check if user exists - username, email 
    // check files - avatar, cover image
    // upload them to cloudinary - check avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation 
    // return response

    console.log("BODY:", req.body);
    console.log("FILES:", req.files);


    const {fullName, email, username, password} = req.body
    console.log("email: ", email);

    // if (fullName === "") {
    //     throw new ApiError(400, "Fullname id required")
    // }
    if (
        [fullName, email, username, password].some((field)=>{
            field?.trim() === ""
        })
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [ { username }, { email } ] 
    })

    if(existedUser){
        throw new ApiError(409, "User with email or username already Exists")
    }

    console.log(req.files)
    const avatarLocalPath = req.files?.avatar[0]?.path;
    console.log(avatarLocalPath)

    const coverImageLocalPath = req.files?.coverImage[0].path;
    console.log(coverImageLocalPath)

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    console.log("image uploaded")

    if(!avatar){
        throw new ApiError(400, "Avatar file is required")
    }

    const user = await User.create({
                            fullName, 
                            avatar: avatar.url,
                            coverImage: coverImage?.url  || " ",
                            email,
                            password,
                            username: username ? username.toLowerCase() : ""
                        })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!createdUser){
        throw new ApiError(500, "Something went wrong registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Registered Successfully")
    )
})

export {
     registerUser, 
    }