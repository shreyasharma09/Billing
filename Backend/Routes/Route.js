const express = require("express")
const { generateotp, verifyotp } = require("../Services/OtpService/OtpService")
const { otptoemailforverification } = require("../Services/EmailService/EmailService")
const { User, Shopkeeper , Executive } = require("../Model/UserModel/UserModel")
const Product = require("../Model/ProductModel/ProductModel")
const Customer= require("../Model/CustomerModel/CustomerModel")
const OrderedItems= require("../Model/OrderedItemModel/OrderedItemModel")
const { Invoice, Transaction } = require("../Model/TransactionModel/TransactionModel");
require("dotenv").config()
const { default: mongoose } = require("mongoose");
const HandleSuccessResponse = require("../HandleResponse/HandleResponse")
const jwt = require("jsonwebtoken")                     //install it | helps in login | helps to secure id in an another obj called payload | make string of 30-40 words  |Format--> _._._  ==>1) id(in hash string format) 2)security 3)secret key which is defined by us
const checkuserdetails = require("../Middleswares/Checkuserdetails")
const Routes = express.Router()


Routes.get("/HealthCheckApi", async (req, resp) => {
    return HandleSuccessResponse(resp, 200, "Server Health is OK")
})

Routes.post("/verifyuser",checkuserdetails, async (req, resp) => {
    try {
        const { name, phone, email, password, address, state, city ,role} = req.body
        if (!name || !phone || !email || !password || !address || !state || !state==="None" || !city || !city==="None" || !role) return HandleSuccessResponse(resp, 404, "Field is empty")
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

Routes.post("/createuser",checkuserdetails, async (req, resp) => {
    try {
        const { name, phone, email, password, address, state, city, role, otp } = req.body
        if (!name || !phone || !email || !password || !address || !state || !state==="None" || !city || !city==="None" || !role) return HandleSuccessResponse(resp, 404, "Field is empty")
        if (!otp) return HandleSuccessResponse(resp, 404, "Enter the otp")

        const existinguser = await User.findOne({ email })
        if (existinguser) return HandleSuccessResponse(resp, 400, "Account already exists")

        //verify otp then create acc
        const response = verifyotp(email, otp)
        if (!response.status) return HandleSuccessResponse(resp, 404, response.message)

        const result = await User.create({ name, phone, email, password, address, state, city, role })

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

            return HandleSuccessResponse(resp, 202, "Login Successsfully", { token, role: result.role })
        }

        return HandleSuccessResponse(resp, 401, "Invalid Password")

    } catch (error) {
        return HandleSuccessResponse(resp, 500, "Internal Server Error", null, error)

    }
})

Routes.put("/enable",checkuserdetails, async (req, resp) => {
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

Routes.put("/disable",checkuserdetails, async (req, resp) => {
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

Routes.get("/getallusers",checkuserdetails,async(req,resp)=>{
    try {
        const users=await User.find({role:{$ne:"Superadmin"}}).select("-password")    //superadmin vale role ko chodke or pss b ni nikale ga
        if(users.length===0) return HandleSuccessResponse(resp,400,"No user found")
        return HandleSuccessResponse(resp,202,"Users fetched successfully",users)
    } catch (error) {
       return HandleSuccessResponse(resp,500,"Internal Server Error",null,error) 
    }
})

Routes.post("/fetchuserdetails", checkuserdetails, async (req, resp) => {
    const payload = { id: req.user._id }
    const token = jwt.sign(payload, process.env.JSON_SECRET_KEY)
    return HandleSuccessResponse(resp, 202, "Login Successfully", { role: req.user.role, token })
})

Routes.get("/getallshopkeepers",checkuserdetails,async(req,resp)=>{
    try {
        const result=await Shopkeeper.find().select("email _id")   
        if(result.length===0) return HandleSuccessResponse(resp,400,"No Shopkeeper found")
        return HandleSuccessResponse(resp,202,"Shopkeeper fetched successfully",result)
    } catch (error) {
       return HandleSuccessResponse(resp,500,"Internal Server Error",null,error) 
    }
})




Routes.post("/addproduct", checkuserdetails, async (req, resp) => {
    try {
        const { name, company, model, description, price, discount, rate, tax, stock } = req.body
        if (!name || !company || !model || !description || !price || !discount || !rate || !tax) return HandleSuccessResponse(resp, 404, "Field is empty")

        const existinguser = await Product.findOne({ model })
        if (existinguser) return HandleSuccessResponse(resp, 400, "Product of this model already exists")

        const newproduct = await Product.create({ userid: req.user._id, name, company, model, description, price, discount, rate, tax, stock })
        return HandleSuccessResponse(resp, 201, "Product added Successfully", newproduct)

    } catch (error) {
        return HandleSuccessResponse(resp, 500, "Internal Server Error", null, error)
    }
})

Routes.get("/getproducts", checkuserdetails, async (req, resp) => {
    try {
        const allproducts = await Product.find({ userid: req.user._id })

        if (allproducts.length === 0) return HandleSuccessResponse(resp, 404, "Your Product list is empty")

        return HandleSuccessResponse(resp, 202, "All Products are fetched Successfully", allproducts)

    } catch (error) {
        return HandleSuccessResponse(resp, 500, "Internal Server Error", null, error)
    }
})

Routes.delete("/deleteproduct/:id", checkuserdetails, async (req, resp) => {
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

Routes.put("/updateproduct/:id", checkuserdetails, async (req, resp) => {
    try {
        const { name, company, model, stock, description, price, discount, rate, tax } = req.body
        if (!name || !company || !model || !description || !price || !discount || !rate || !tax || !stock) return HandleSuccessResponse(resp, 404, "Field is empty")

        const { id } = req.params;
        if (!id) return HandleSuccessResponse(resp, 404, "Plz select the product")

        const existingproduct = await Product.findOne({ _id: id });
        if (!existingproduct) return HandleSuccessResponse(resp, 404, "This product is not found in your product list")

        const response = await Product.findOne({ model });
        if (response && response._id.toString()!==id) return HandleSuccessResponse(resp, 400, "Product of this model is already exists in your product list")

        const updatedproduct = await Product.updateOne({ _id: id }, {
            $set: { name, company, model, description, price, discount, rate, tax, stock }
        });
        return HandleSuccessResponse(resp, 202, "Product updated successfully", updatedproduct)
    } catch (error) {
        return HandleSuccessResponse(resp, 500, "Internal Server Error", null, error)
    }
});


const validateObjectKeys = (object, schema) => {
    const schemaKeys = Object.keys(schema.paths).filter((key) => key !== '__v' && key !== '_id' && key !== 'createdat'); //schema ki keys===>schema.path==name,model,price(key)..
    const objectKeys = Object.keys(object);        //object ki keys

    for (const key of schemaKeys) {   //for of loop==>schema keys ki eyes
      if (!object.hasOwnProperty(key) || object[key] === null || object[key] === '') return "The key "+key+" is missing or empty." //obj m schema ki key h y ni
    }
  
    for (const key of objectKeys) {
      if (!schemaKeys.includes(key)) return "The key "+key+" is not declared in the schema." // schemakey m objkey available h ya ni =check=include
    }

    return null;
};

Routes.post("/addmultipleproducts",checkuserdetails,async (req,resp)=>{
    try {
        const {items}=req.body            //array of obj
        //check if item is array or not
        if(!Array.isArray(items) || items.length===0) return HandleSuccessResponse(resp,400,"Invalid input.Provide an array of items")

        const updateditems= items.map(item=>{return {...item,userid:req.user._id}})
        const errors=[]
        updateditems.map(async(item,index)=>{
            const validationError = validateObjectKeys(item, Product.schema);
            if (validationError) errors.push({ index, error: validationError })
        
            const existingproduct = await Product.findOne({ model: item.model });
            if(existingproduct) errors.push({ index, error: "The modelNumber " +item.model+" already exists."})
        })    
    
        if(errors.length > 0) return HandleSuccessResponse(resp,400,'Validation errors occurred.',null,errors);
    
        const result = await Product.insertMany(updateditems);
        return HandleSuccessResponse(resp,201,'All products are added successfully',result)
      

    } catch (error) {
        return HandleSuccessResponse(resp,500,'Internal Server Error',null,error)
    }
})



Routes.get("/getallcitiesandstates",checkuserdetails,async(req,resp)=>{
    try {
     const response=await fetch("https://city-state.netlify.app/index.json")
     const result=await response.json()
     if(response.status===200 && result.length!==0) return HandleSuccessResponse(resp,202,"Cities & States fetched successfully",result)
     return HandleSuccessResponse(resp,400,"Cities & States are not fetched successfully")
    } catch (error) {
     return HandleSuccessResponse(resp,500,"Internal Server error",null,error)
    }
})




Routes.post("/verifyexecutive",checkuserdetails,async (req, resp) => {
    try {
      const { name, phone, email, password, address, city, state } = req.body;
      if (!name || !phone || !email || !password || !city || city==="None" || !address || !state || state==="None") return HandleSuccessResponse(resp,404,"Field is Empty")
      const existinguser = await User.findOne({ email });
      if (existinguser) return HandleSuccessResponse(resp,400,"Account already exists")
      const otp = generateotp(email);
      return await otptoemailforverification(resp, email, otp);
    } catch (error) {
      return HandleSuccessResponse(resp,500,"Internal Server Error",null,error);
    }
  });

  Routes.post("/createexecutive",checkuserdetails,async (req, resp) => {
    try {
      const { name, phone, email, address, password, city, state, otp } =req.body;
      if (!name || !phone || !email || !password || !address || !city || city==="None" || !state || state==="None" ) return HandleSuccessResponse(resp,404,"Field is Empty")
      if (!otp) return HandleSuccessResponse(resp,404,"Enter the otp");
      const existinguser = await User.findOne({ email });
      if (existinguser) return HandleSuccessResponse(resp,400,"Account already exists")
      const response = verifyotp(email, otp);
      if (!response.status) return HandleSuccessResponse(resp,404,response.message);
      const result = await Executive.create({name,phone,email,password,address,city,state,executiveof:req.user._id});
      return HandleSuccessResponse(resp,201,"Account created successfully",result);
    } catch (error) {
      return HandleSuccessResponse(resp,500,"Internal Server error",null,error)
    }
  });

  Routes.get("/getallexecutives",checkuserdetails,async(req,resp)=>{
    try {
      const users = await Executive.find({executiveof:req.user._id}).select("-password")
      if(users.length===0) return HandleSuccessResponse(resp,400,"No user found")
      return HandleSuccessResponse(resp,202,"Users fetched successfully",users)
    } catch (error) {
      return HandleSuccessResponse(resp,500,"Internal Server error",null,error)
    }
  })

  Routes.put("/enableexecutive",checkuserdetails, async (req, resp) => {
    try {
      const { id } = req.body;
      if (!id) return HandleSuccessResponse(resp,404,"Plz Select the Executive");
      const existinguser = await Executive.findOne({ _id: id });
      if (!existinguser) return HandleSuccessResponse(resp,404,"Executive is not found");
      const result = await Executive.updateOne({ _id: id },{ $set: { service: true } });
      return HandleSuccessResponse(resp,202,"Service is enabled",result)
    } catch (error) {
      return HandleSuccessResponse(resp,500,"Internal Server error",null,error)
    }
  });

  Routes.put("/disableexecutive",checkuserdetails, async (req, resp) => {
    try {
      const { id } = req.body;
      if (!id) return HandleSuccessResponse(resp,404,"Plz Select the Executive");
      const existinguser = await Executive.findOne({ _id: id });
      if (!existinguser) return HandleSuccessResponse(resp,404,"Executive is not found");
      const result = await Executive.updateOne({ _id: id },{ $set: { service: false } });
      return HandleSuccessResponse(resp,202,"Service is disabled",result)
    } catch (error) {
      return HandleSuccessResponse(resp,500,"Internal Server error",null,error)
    }
  });
  
  

Routes.post("/createcustomer",checkuserdetails,async(req,resp)=>{
    try {
        const{name,phone,address}=req.body
        if(!name || !phone || !address) return HandleSuccessResponse(resp,404,"Field is empty")
        const existingcustomer=await Customer.findOne({phone,customerof:req.user._id})         //customerof:to fasten the searching
        if (existingcustomer) return HandleSuccessResponse(resp,400,"Customer already exists")
        const newCustomer=await Customer.create({name,phone,address,customerof:req.user._id})
        return HandleSuccessResponse(resp,201,"Customer created successfully",newCustomer)
    } catch (error) {
        return HandleSuccessResponse(resp,500,"Internal Server Error",null,error)
    }
})

Routes.get("/getallcustomers",checkuserdetails,async(req,resp)=>{
    try {
        const existingcustomers=await Customer.find({customerof:req.user._id})
        if(!existingcustomers || existingcustomers.length===0) return HandleSuccessResponse(resp,404,"Customers list is empty")
        return HandleSuccessResponse(resp,202,"Customers fetched successfully",existingcustomers)
    } catch (error) {
        return HandleSuccessResponse(resp,500,"Internal Server Error",null,error)
    }
})




async function generateInvoiceNumber() {
    const lastInvoice = await Invoice.findOne().sort({ _id: -1 });     //last invoice bna h uski id utha ke le aay
  
    let newInvoiceNumber;
    if (lastInvoice) {
      let lastNumber = parseInt(lastInvoice.InvoiceNo.split('-')[1]) + 1;
      newInvoiceNumber = `INV-${lastNumber.toString().padStart(5, '0')}`;
    } else {
      newInvoiceNumber = 'INV-00001';
    }
  
     return newInvoiceNumber;
  }
  
  const validateordereditems = (object, schema) => {
    const schemaKeys = Object.keys(schema.paths).filter((key) => key !== '__v' && key !== '_id' && key !== 'createdat' && key !== 'subtotal');
    const objectKeys = Object.keys(object);
  
    for (const key of schemaKeys) { // obj ke andr h y ni
      if (!object.hasOwnProperty(key) || object[key] === null || object[key] === '') return "The key "+key+" is missing or empty."
    }
  
    for (const key of objectKeys) {   // schema k andr h y ni
      if (!schemaKeys.includes(key)) return "The key "+key+" is not declared in the schema."
    }
  
    return null;
  };


  Routes.post("/createInvoice/:id",checkuserdetails,async(req, resp) => {    //shopkeeper's id= middleware(req.user._id)   customer's id = pass through params
   try {
    const {id} =req.params   //customer select krnge to vha s id aa jaygi
   if(!id || !mongoose.isValidObjectId(id)) return HandleSuccessResponse(resp,404,"Customer is not valid")
   const existingCustomer=await Customer.findOne({_id:id})
   if(!existingCustomer) return HandleSuccessResponse(resp,404,"Customer not found")
  
    const {ordereditems}=req.body   //orderitem select krnge to vha s id aa jaygi(frontend s aa jaynge)
    if(!ordereditems) return HandleSuccessResponse(resp,404,"Select the items")
    if (!Array.isArray(ordereditems) || ordereditems.length === 0) return HandleSuccessResponse(resp,400,'Invalid input. Provide an array of items.')
    
    const errors=[]
    ordereditems.map(async(item,index)=>{
      const validationError = validateordereditems(item, OrderedItems.schema);
      if (validationError) errors.push({ index, error: validationError })
    })
    if(errors.length > 0) return HandleSuccessResponse(resp,400,'Validation errors occurred.',null,errors);
    
    let totaltax=0
    let totaldiscount=0
    let totalprofit=0
    let totalamount=0
    ordereditems.map(item =>{
      const taxamount=((item.price*item.tax)/100)*item.quantity  //15000 ke phn p tax be like 5% to 15000*5/100
      const discountamount=((item.price*item.discount)/100)*item.quantity // in percentage
      item.subtotal=(item.price*item.quantity)+taxamount-discountamount // tax customer se aa rha h phn mtlb customer de rhe h pr but discount ja rha h mtlb hm de rhe h 
      const profitamount=item.subtotal-taxamount-discountamount-(item.rate*item.quantity)
      totaltax+=taxamount   //totaltax=totaltax+taxamount
      totaldiscount+=discountamount
      totalprofit+=profitamount
      totalamount+=item.subtotal
    })
    
    const orders=await OrderedItems.insertMany(ordereditems)
    const allid=orders.map(obj=>obj._id)
    const invoiceNumber = await generateInvoiceNumber();
    const updatedCustomer=await Customer.updateOne({_id:id},{$set:{balance:existingCustomer.balance+parseInt(totalamount)}})
    const result = await Invoice.create({InvoiceNo: invoiceNumber,OrderItems:allid,TotalAmount:parseInt(totalamount),TotalProfit:totalprofit,TotalDiscount:totaldiscount,TotalTax:totaltax,customerId:id,shopkeeperId:req.user._id});
    const resultingItems=await OrderedItems.find({_id:{$in:allid}})
    return HandleSuccessResponse(resp,201,'Invoice generated successfully',{result,ordereditems:resultingItems});
   } catch (error) {
    return HandleSuccessResponse(resp,500,"Internal Server Error",null,error)
   }
  })


  Routes.get("/getCustomer/:id",checkuserdetails,async(req,resp)=>{   //for showing in invoice ..have to fetch the address
    try {
      const {id}=req.params
      if(!id || !mongoose.isValidObjectId(id)) return HandleSuccessResponse(resp,404,"Customer is not valid")
        
      const existingCustomer=await Customer.findOne({_id:id,customerof:req.user._id})
      if(!existingCustomer) return HandleSuccessResponse(resp,404,"Customer is not found in your list")
      return HandleSuccessResponse(resp,202,"Customer fetched successfully",existingCustomer)
    } catch (error) {
      return HandleSuccessResponse(resp,500,"Internal Server Error",null,error)
    }
  })
  
  Routes.get("/getShopkeeper",checkuserdetails,async(req,resp)=>{        //for showing in invoice ..have to fetch the details
    try {
      const existingShopkeeper=await Shopkeeper.findOne({_id:req.user._id}).select("-password -_id")
      if(!existingShopkeeper) return HandleSuccessResponse(resp,404,"Shopkeeper is not found in your list")
      return HandleSuccessResponse(resp,202,"Shopkeeper fetched successfully",existingShopkeeper)
    } catch (error) {
      return HandleSuccessResponse(resp,500,"Internal Server Error",null,error)
    }
  })


  Routes.get("/getalltransactions/:id",checkuserdetails,async(req,resp)=>{
    try {
      const {id} =req.params
      if(!id || !mongoose.isValidObjectId(id)) return HandleSuccessResponse(resp,404,"Customer is not valid")
  
      const existingCustomer=await Customer.findOne({_id:id})
      if(!existingCustomer) return HandleSuccessResponse(resp,404,"Customer not found")
  
      const result=await Transaction.find({shopkeeperId:req.user._id,customerId:id})
      if(!result || result.length === 0) return HandleSuccessResponse(resp,404,"Transaction list is empty")
      return HandleSuccessResponse(resp,202,"Transactions fetched successfully",result)
    } catch (error) {
      return HandleSuccessResponse(resp,500,"Internal Server Error",null,error)
    }
  })

module.exports = Routes