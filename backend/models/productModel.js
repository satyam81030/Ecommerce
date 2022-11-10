const mongoose =  require('mongoose');
const { type } = require('os');

const productSchema = mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please Enter product Name"],
        trim:true
    },
    description:{
        type:String,
        required:[true,"Please Enter product Description"]
    },
    price:{
        type:Number,
        required:[true,"Please Enter product price"],
        maxlength:[8,"Price cannot be exceed 8 charcters"]
    },
    ratings:{
        type:Number,
        default:0
    },
    images:[{
        public_id:{
            type:String,
            required:true
        },
        url:{
            type:String,
            required:true
        }
    }],
    category:   {
        type:String,
        required:[true,"Please Enter Product Category"]
    },
    Stock:{
        type:Number,
        required:[true,"Please Enter product Stock"],
        maxlength:[4,"Stock cannot exceed 4 characters"],
        default:1
    },
    numofReviews:{
        type:Number,
        default:0
    },
    reviews:[
        {
            user:{
                type:mongoose.mongoose.Schema.ObjectId,
                ref:"User",
                required:true
            },
            name:{
                type:String,
                required:true,
            },
            rating:{
                type:Number,
                required:true
            },
            comment:{
                type:String,
                required:true
            }
        }
    ],  
    
    user:{
        type:mongoose.mongoose.Schema.ObjectId,
        ref:"User",
        required:true
    },
    createdAt:{
       type:Date,
       default:Date.now
    }
})

module.exports = mongoose.model("Products",productSchema)