const ErrorHandler = require("../utils/errorHandler");
const catchAsyncError = require("../middleware/catchAsyncError");
const sendEmail = require("../utils/sendEmail")
const user = require('../models/userModel');
const sendToken = require("../utils/jwtToken");
const crypto = require('crypto')

//Register User
exports.registerUser = catchAsyncError(async(req,res,next)=>{
    const {name,email,password,} = req.body
    const users = await user.create({
        name,email,password,
        avatar:{
            public_id:"this is sample id",
            url:"url.com"
        }
    });

    sendToken(users,201,res)
})


//Login User

exports.loginUser = catchAsyncError(async (req,res,next)=>{
    const {email,password}=req.body;

    //checking if user has given password and email both 

    if(!email || !password){
        return next(new ErrorHandler("Please Enter Email & Pasword",400))
    }

    const User = await user.findOne({email}).select("+password")
    if(!user){
        return next(new ErrorHandler("Invalid email or password",401))
    }
    
    const isPasswordMatched = await User.comparePassword(password);

    if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid email or password",401))
    }

    sendToken(User,200,res)
})

//LogOut User
exports.logout = catchAsyncError(async (req,res,next)=>{
    
    res.cookie("token",null,{
        expires:new Date(Date.now()),
        httpOnly:true 
    })
    res.status(200).json({
        success:true,
        message:"Logged out"
    })
})


//Forgot Password
exports.forgotPassword = catchAsyncError(async (req,res,next)=>{
    const User = await user.findOne({email:req.body.email})

    if (!User) {
        return next(new ErrorHandler("User not Found",404))
    }

    //Get ResetPassword Token
    const resetToken = await User.getResetPasswordToken();

    await User.save({validateBeforeSave:false})


    const resetPasswordUrl = `${req.protocol}://${req.get('host')}/api/v1/password/reset/${resetToken}`

    const messages  = `Your  password reset token is :- \n\n ${resetPasswordUrl} \n\n if you have not requested this email then please ignore it`;

    try {
        await sendEmail({
            email:User.email,
            subject:`Ecommerce Password Recovery`,
            message:messages
        })

        res.status(200).json({
            success:true,
            message:`Email sent to ${User.email} successfully`
        })
    } catch (error) {
        User.resetPasswordToken = undefined;    
        User.resetPasswordExpire = undefined;
       
    await User.save({validateBeforeSave:false})

    next(new ErrorHandler(error.message,500))
    }
})

//Reset Password
exports.resetPassword = catchAsyncError(async(req,res,next)=>{

    // creating token hash
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest('hex');

    const User = await user.findOne({
        resetPasswordToken,
        resetPasswordExpire:{$gt:Date.now()}
    })


    if (!User) {
        return next(new ErrorHandler("Reset Password token is invalid or has been has been expired ",400))
    }

    if (req.body.password !== req.body.confirmpassword ) {
         return next(new ErrorHandler("Password does not match",400))
    }

    User.password = req.body.password;
    User.resetPasswordToken = undefined;
    User.resetPasswordExpire = undefined;

    await User.save();

    sendToken(User,200,res)
})


//Get User Detail
 exports.getUserDetail = catchAsyncError(async(req,res,next)=>{

    const User = await user.findById(req.user.id)
    res.status(200).json({
        success:true,
        User 
    })
 })

 //Update User Password
 exports.updatePassword = catchAsyncError(async(req,res,next)=>{

    const User = await user.findById(req.user.id).select("+password");

    const isPasswordMatched = await User.comparePassword(req.body.oldPassword);

    if (!isPasswordMatched) {
        return next(new ErrorHandler("Old Passwod is incorrect ",401))
    }

    if (req.body.newPassword !== req.body.confirmpassword) {
        return next(new ErrorHandler("Password does not match",400))
    }
    
    User.password = req.body.newPassword;

    
    await User.save();

    sendToken(User,200,res)
 })

 //Update User Profile
 exports.updateProfile = catchAsyncError(async (req,res,next)=>{
    const newUserData={
        name:req.body.name,
        email:req.body.email,
    }

    // we will add cloudinary later
    const User = await user.findByIdAndUpdate(req.user.id,newUserData,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    })

    res.status(200).json({
        success:true,
         
    })
 })

 //Get all Users (admin)
 exports.getAllUser = catchAsyncError(async (req,res,next)=>{
    const users = await user.find();
    res.status(200).json({
        success:true,
        users
    })
 }
 )

 // Get Single User (admin)
 exports.getSingleUser = catchAsyncError(async (req,res,next)=>{
     console.log(req.params.id);
    const User = await user.findById(req.params.id);
    if (!User) {
        return next(new ErrorHandler(`User does not exit with id: ${req.params.id}`))
    }
    res.status(200).json({ 
        success:true,
        User
    })
 }
 )


  //Update User Role --Admin
  exports.updateUserRole = catchAsyncError(async (req,res,next)=>{
    const newUserData={
        name:req.body.name,
        email:req.body.email,
        role: req.body.role
    }

    // we will add cloudinary later
    const User = await user.findByIdAndUpdate(req.params.id,newUserData,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    })

    res.status(200).json({
        success:true,
         
    })
 })

 //Delete User Role  --Admin
 exports.deleteUser= catchAsyncError(async (req,res,next)=>{
    
    const User  = await user.findById(req.params.id);

    if (!User) {
        return next(new ErrorHandler(`User does not exit with id : ${req.params.id}`))
    }
    
    await user.remove();
  
    res.status(200).json({
        success:true,
        message:"User Deleted Succussfully"
    })
 })

 