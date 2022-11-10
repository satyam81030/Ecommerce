const ErrorHandler = require("../utils/errorHandler");

module.exports = (err, req, res, next) => {
  // console.log(err);
  err.statuscode = err.statuscode || 500;
  err.message = err.message || "Internal server Error";

  // wrong mongodb Id error
  if (err.name === "CastError") {
    const message = `Resource not found. Invalid: ${err.path}`;
    err = new ErrorHandler(message, 400);
  }

  // Mongoose duplicate key error
  // console.log(err.code);
  if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)} Entered`;
    err = new ErrorHandler(message, 400);
  }

  // Wrong web json token error
  if (err.name === "JsonWebToken") {
    const message = `Json web Token is Invalid, try again`;
    err = new ErrorHandler(message, 400);
  }

  // Wrong web json token Expire error
  if (err.name === "TokenExpiredError") {
    const message = `Json web Token is Expired, try again`;
    err = new ErrorHandler(message, 400);
  }

  res.status(err.statuscode).json({
    success: false,
    error: err.statuscode,
    message: err.message,
  });
};
