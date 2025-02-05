const mongoose=require("mongoose")
require("dotenv").config()  
const CustomerSchema= new mongoose.Schema({
    customerof:{
        type:mongoose.Schema.Types.ObjectId,
        ref:process.env.MONGODB_USER_COLLECTION,
        required:true
    },
    name:{
        type:String,
        required:true
    },
    phone:{
        type:Number,
        required:true
    },
    address:{
        type:String,
        required:true
    },
    balance:{
        type:Number,
        default:0
    },
    createdat:{
        type:Date,
        default:Date.now
    }
})
const Customer=mongoose.model(process.env.MONGODB_CUSTOMER_COLLECTION,CustomerSchema)
module.exports=Customer