const express = require("express")
const { generateotp, verifyotp } = require("../Services/OtpService/OtpService")
const { otptoemailforverification } = require("../Services/EmailService/EmailService")
const { User, Shopkeeper } = require("../Model/UserModel/UserModel")
const Product = require("../Model/ProductModel/ProductModel")
require("dotenv").config()
const HandleSuccessResponse = require("../HandleResponse/HandleResponse")
const jwt = require("jsonwebtoken")                     //install it | helps in login | helps to secure id in an another obj called payload | make string of 30-40 words  |Format--> _._._  ==>1) id(in hash string format) 2)security 3)secret key which is defined by us
const checkuserdetails = require("../Middleswares/Checkuserdetails")
const Routes = express.Router()


Routes.get("/HealthCheckApi", async (req, resp) => {
    return HandleSuccessResponse(resp, 200, "Server Health is OK")
})

Routes.post("/verifyshopkeeper", async (req, resp) => {
    try {
        const { name, phone, email, password, address, state, city } = req.body
        if (!name || !phone || !email || !password || !address || !state || !city) return HandleSuccessResponse(resp, 404, "Field is empty")
        const existinguser = await User.findOne({ email })
        if (existinguser) return HandleSuccessResponse(resp, 400, "Account already exists")

        //generate otp,send to email,verify it
        //to Generate ===>otpservice se kia h... call yha krenge
        const otp = generateotp(email)    //is email ke lie otp generate kr dega
        //to send
        return await otptoemailforverification(resp, email, otp)

    } catch (error) {
        return HandleSuccessResponse(resp, 500, "Internal Server Error", null, error)
    }
})

Routes.post("/createshopkeeper", async (req, resp) => {
    try {
        const { name, phone, email, password, address, state, city, otp } = req.body
        if (!name || !phone || !email || !password || !address || !state || !city) return HandleSuccessResponse(resp, 404, "Field is empty")
        if (!otp) return HandleSuccessResponse(resp, 404, "Enter the otp")

        const existinguser = await User.findOne({ email })
        if (existinguser) return HandleSuccessResponse(resp, 400, "Account already exists")

        //verify otp then create acc
        const response = verifyotp(email, otp)
        if (!response.status) return HandleSuccessResponse(resp, 404, response.message)

        const result = await Shopkeeper.create({ name, phone, email, password, address, state, city })

        return HandleSuccessResponse(resp, 201, "Acc created successfully", result)

    } catch (error) {
        return HandleSuccessResponse(resp, 500, "Internal Server Error", null, error)
    }
})

Routes.post("/login", async (req, resp) => {
    try {
        const { email, password } = req.body
        
        if (!email || !password) return HandleSuccessResponse(resp, 404, "Field is empty")

        const result = await User.findOne({ email })
        if (!result) return HandleSuccessResponse(resp, 401, "Invalid Email")

        if (password === result.password) {
            if (!result.service) return HandleSuccessResponse(resp, 401, "Your Service is Disable")

            const payload = { id: result._id }      //obj of id only for security
            const token = jwt.sign(payload, process.env.JSON_SECRET_KEY)     //id(payload),secret key==>token

            return HandleSuccessResponse(resp, 202, "Login Successsfully", {token,role:result.role})
        }

        return HandleSuccessResponse(resp, 401, "Invalid Password")

    } catch (error) {
        return HandleSuccessResponse(resp, 500, "Internal Server Error", null, error)

    }
})

Routes.post("/enable", async (req, resp) => {
    try {
        const { id } = req.body
        if (!id) return HandleSuccessResponse(resp, 404, "Please select the user first")

        const existinguser = await User.findOne({ _id: id })
        if (!existinguser) return HandleSuccessResponse(resp, 404, "User is not found")

        const result = await User.updateOne({ _id: id }, { $set: { service: true } })
        return HandleSuccessResponse(resp, 202, "Service is Enabled", result)

    } catch (error) {
        return HandleSuccessResponse(resp, 500, "Internal Server Error", null, error)
    }
})

Routes.post("/disable", async (req, resp) => {
    try {
        const { id } = req.body
        if (!id) return HandleSuccessResponse(resp, 404, "Please select the user first")

        const existinguser = await User.findOne({ _id: id })
        if (!existinguser) return HandleSuccessResponse(resp, 404, "User is not found")

        const result = await User.updateOne({ _id: id }, { $set: { service: false } })
        return HandleSuccessResponse(resp, 202, "Service is Disabled", result)

    } catch (error) {
        return HandleSuccessResponse(resp, 500, "Internal Server Error", null, error)
    }
})

 Routes.post("/fetchuserdetails",checkuserdetails,async(req,resp)=>{
        const payload={id:req.user._id}
        const token= jwt.sign(payload,process.env.JSON_SECRET_KEY)
        return HandleSuccessResponse(resp,202,"Login Successfully", {role:req.user.role, token})
 })





Routes.post("/addproduct",checkuserdetails, async (req, resp) => {
    try {
        const { name, company, model, description, price, discount, rate, tax , stock } = req.body
        if (!name || !company || !model || !description || !price || !discount || !rate || !tax ) return HandleSuccessResponse(resp, 404, "Field is empty")

        const existinguser = await Product.findOne({ model })
        if (existinguser) return HandleSuccessResponse(resp, 400, "Product of this model already exists")

        const newproduct = await Product.create({userid : req.user._id, name, company, model, description, price, discount, rate, tax, stock})
        return HandleSuccessResponse(resp, 201, "Product added Successfully", newproduct)

    } catch (error) {
        return HandleSuccessResponse(resp, 500, "Internal Server Error", null, error)
    }
})

Routes.get("/getproducts",checkuserdetails, async (req, resp) => {
    try {
        const allproducts = await Product.find({ userid: req.user._id })         

        if (allproducts.length === 0) return HandleSuccessResponse(resp, 404, "Your Product list is empty")

        return HandleSuccessResponse(resp, 202, "All Products are fetched Successfully", allproducts)

    } catch (error) {
        return HandleSuccessResponse(resp, 500, "Internal Server Error", null, error)
    }
})

Routes.delete("/deleteproduct/:id",checkuserdetails, async (req, resp) => {
    try {
        const { id } = req.params;
        if (!id) return HandleSuccessResponse(resp, 404, "Plz select the product")

        const existingproduct = await Product.findOne({ _id: id, userid: req.user._id }); 
        if (!existingproduct) return HandleSuccessResponse(resp, 404, "This product is not found in your product list")

        const result = await Product.deleteOne({ _id: id, userid: req.user._id }); 
        return HandleSuccessResponse(resp, 202, "Product deleted successfully", result)
    }
    catch (error) {
        return HandleSuccessResponse(resp, 500, "Internal Server Error", null, error)
    }
});

Routes.put("/updateproduct/:id",checkuserdetails, async (req, resp) => {
    try {
        const { name, company, model, stock, description, price, discount, rate, tax } = req.body
        if (!name || !company || !model || !description || !price || !discount || !rate || !tax) return HandleSuccessResponse(resp, 404, "Field is empty")

        const { id } = req.params;
        if (!id) return HandleSuccessResponse(resp, 404, "Plz select the product")

        const existingproduct = await Product.findOne({ _id: id });
        if (!existingproduct) return HandleSuccessResponse(resp, 404, "This product is not found in your product list")

        const response = await Product.findOne({ model });
        if (response) return HandleSuccessResponse(resp, 400, "Product of this model is already exists in your product list")

        const updatedproduct = await Product.updateOne({ _id: id }, {
            $set: { name, company, model, description, price, discount, rate, tax, stock }
        });
        return HandleSuccessResponse(resp, 202, "Product updated successfully", updatedproduct)
    } catch (error) {
        return HandleSuccessResponse(resp, 500, "Internal Server Error", null, error)
    }
});

module.exports = Routes