const Order = require('../models/orderModel')
const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncError = require("../middleware/catchAsyncError");

//Create new order
exports.newOrder = catchAsyncError( async(req,res,next)=>{

    const {shippingInfo,orderItems,paymentInfo,itemsPrice,taxPrice,shippingPrice,totalPrice} = req.body
    const order = await Order.create({
        shippingInfo,orderItems,paymentInfo,itemsPrice,taxPrice,shippingPrice,totalPrice,paidAt:Date.now(),user:req.user._id
    })
     
    res.status(201).json({
        success:true,
        order
    })
})


//get single order
exports.getSingleOrder = catchAsyncError(async(req,res,next)=>{
    const order = await Order.findById(req.params.id).populate("user","name email");

    if (!order) {
        return next(new ErrorHandler("Order not found with this id", 404))
    }

    res.status(200).json({
        success:true,
        order
    })
})


//get logged user  orders
exports.myOrder = catchAsyncError(async(req,res,next)=>{
    const orders = await Order.find({user:req.user._id})
    
    res.status(200).json({
        success:true,
        orders  
    })
})

//get all orders --Admin
exports.getAllOrders = catchAsyncError(async(req,res,next)=>{
    const orders = await Order.find({user:req.user._id})
    if (!orders) {   
        return next(new ErrorHandler("Order not found with this id", 404))
    }
    let totalAmount=0;
    orders.forEach(order=>{
        totalAmount+=order.totalPrice
    });



    res.status(200).json({
        success:true,
        totalAmount,
        orders  
    })
})


//update Order Status --Admin
exports.updateOrder = catchAsyncError(async (req,res,next)=>{
    const orders = await Order.findById(req.params.id)
    
    if (!orders) {   
        return next(new ErrorHandler("Order not found with this id", 404))
    }

    if (orders.orderStatus==="Delivered") {
        return next( new ErrorHandler("You have already delivered this order" ,400) )
    }

 
    orders.orderItems.forEach(async(order)=>{
        console.log(order);
        await updateStock(order.product,order.quantity)
    })
    
    orders.orderStatus = req.body.status;
    
    if (req.body.status === "Delivered") {
        
        orders.deliveredAt = Date.now()
    }

    await orders.save({validateBeforeSave:false})
    res.status(200).json({
        success:true,
        orders  
    })
})

async function updateStock(id,quantity){
    const product = await Product.findById(id);

    if (product.Stock<0) {
        
        product.Stock-=quantity
    }

    await product.save({validateBeforeSave:false })
}


//Delete  orders --Admin
exports.deleteOrder = catchAsyncError(async(req,res,next)=>{
    const order= await Order.findById(req.params.id)
    if (!order) {   
        return next(new ErrorHandler("Order not found with this id", 404))
    }
    await order.remove()
    


    res.status(200).json({
        success:true,
        
    })
})
