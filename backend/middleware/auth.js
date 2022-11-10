const ErrorHandler = require("../utils/errorHandler");
const catchAsyncError = require("./catchAsyncError");
const jwt = require("jsonwebtoken");
const user = require('../models/userModel');

exports.isAuthenticatedUser = catchAsyncError(async (req, res, next) => {
  const { token } = req.cookies;
  
  if (!token) {
    return next(new ErrorHandler("Please login to Access this resource", 401));
  }

  const decodedData  = jwt.verify(token,process.env.JWT_SECRET)
  
   req.user = await user.findById(decodedData.id)
   if (!req.user) {
    return next(new ErrorHandler("Please login to Access this resource", 401)); 
   }
   next()
});

exports.authorizeRoles = (...roles)=>{

  return (req,res,next)=>{
      if(!roles.includes(req.user.role)){
        return next(new ErrorHandler(`Roles:${req.user.role} is not allowed this resource`,403)  )  }
      next();
  }
}
// exports.
