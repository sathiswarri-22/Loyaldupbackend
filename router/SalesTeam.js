const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const CommonTeam = require('../Model/CommonTeam');
const verifyToken = require('../VerifyToken');
const HeadEnquiry = require('../Model/HeadEnquiry');
const Customerconvertion = require('../Model/Customerconvertion')
const ServiceEngineervist = require('../Model/ServiceEngineervisit');
const Productrequest = require('../Model/Productrequest');
const Headregi = require('../Model/Headregi');
const {loginvalidation,registervalidation,headregistervalidation,passwordvalidation,Servicevalidation,Productvalidation,ResetPasswordvalidation, Headvalidation , emailvalidation} = require('../validation/Registervalidation');
const CustomerNotConverted = require('../Model/CustomerNotConverted');
require('dotenv').config();
const router = express.Router();


const uploadDir = path.join(__dirname, '..', 'Assests');


if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));  
  }
});

const upload = multer({ storage });
router.use('/uploads',express.static(uploadDir));
 
  


const JWT_SECRET =  '4f6d897fe9c2b90f931d57bb9e12345c97'; 

    

router.post('/adminregistration',async (req, res) => {
    try {

        const { error,value } = headregistervalidation(req.body);
        if (error) {
          return res.status(400).json({
            message: error.details[0].message
          });
        }
        const { name, email, password, role} = value;
        console.log(req.body);
        

        if (!name || !email || !password || !role) {
            return res.status(400).json({
                message: 'Name, email, password, role, are required'
            });
        }

        let header = await Headregi.findOne({ email });
        if (header) {
            return res.status(400).json({
                message: 'Email already exists'
            });
        }
        const hashPassword = await bcrypt.hash(password, 15);
       
        const newEmployee = new Headregi({
           
            name,
            email,
            password: hashPassword,
            role,

        });

        const savedEmployee = await newEmployee.save();
        
        return res.status(200).json({
            message: "Head  Registration  is Successful",
            head: {
                name: savedEmployee.name,
                email: savedEmployee.email,
                role: savedEmployee.role,
               
              
            }
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
});
router.post('/login', async (req, res) => {
    const { error, value } = loginvalidation(req.body);
    if (error) {
      return res.status(400).json({
        message: error.details[0].message
      });
    }

    const { email, password } = value;
    
    if (!email || !password ) {
        return res.status(400).json({
            message: 'Email and password are required'
        });
    }

    try {
        console.log('Email received for login:', email);

       
        const header = await Headregi.findOne({ email });
        if (!header) {
            console.log('No header found with this email');
            
            
            const user = await CommonTeam.findOne({ email });
            if (!user) {
                console.log('No user found with this email');
                return res.status(400).json({ message: 'User not found' });
            }
            console.log('User found in CommonTeam:', user);
            
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({
                    message: 'Invalid password'
                });
            }
            
            const token = jwt.sign({ email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '2h' });
            return res.status(200).json({
                message: 'User login successful',
                role: user.role,
                token: token,
                Eid: user.Eid
            });
        } else {
            console.log('Header found:', header);

            const ismatch = await bcrypt.compare(password, header.password);
            if (!ismatch) {
                return res.status(400).json({
                    message: 'Invalid password'
                });
            }
            
            const token = jwt.sign({ email: header.email, role: header.role }, JWT_SECRET, { expiresIn: '1h' });
            return res.status(200).json({
                message: 'Admin Head Login Successful',
                token: token,
                role: header.role,
            });
        }
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Server error'
        });
    }
});


    router.put('/updateProfileImage/:Eid', verifyToken, upload.single('profileimg'), async (req, res) => {
        try {
            const Eid = req.params.Eid;  
            const user = await CommonTeam.findOne({Eid:Eid});
    
            if (!user) {
                return res.status(404).json({
                    message: 'User not found'
                });
            }
    
           
            if (!req.file) {
                return res.status(400).json({
                    message: 'Profile image is required'
                });
            }
    
            if (user.profileimg) {
                const oldImagePath = path.join(__dirname, '..', 'Assests', user.profileimg);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath); 
                }
            }
            
            
            const profileImgPath = req.file.filename;
    
            
            user.profileimg = profileImgPath;
            await user.save();
    
            return res.status(200).json({
                message: 'Profile image updated successfully',
                user: {
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    profileimg: user.profileimg,
                }
            });
        } catch (error) {
            return res.status(500).json({
                message: error.message
            });
        }
    });
    router.post('/registration', verifyToken, upload.fields([{ name: 'Fileupload', maxCount: 1 }, { name: 'profileimg', maxCount: 1 }]), async (req, res) => {
        console.log("req.body:", req.body);  
        
    
        const { error, value } = registervalidation(req.body); 
    
        if (error) {
            return res.status(400).json({
                message: error.details[0].message
            });
        }
    
        const { name, email, password, role, JOD, EOD, address, Currentsalary, CompanyResources, Remarks, contactnumber } = value;
        
        console.log("Files:", req.files);
        console.log('name',name);
    
        try {
            if (req.user.role !== "md") {
                return res.status(403).json({
                    message: 'Permission Denied, Only Admin Head can register'
                });
            }
    
            if (!name || !email || !password || !role || !contactnumber || !req.files['Fileupload']) {
                return res.status(400).json({
                    message: 'Name, email, password, role, contactnumber and resume are required'
                });
            }
    
            let employee = await CommonTeam.findOne({ email });
            if (employee) {
                return res.status(400).json({
                    message: 'Email already exists'
                });
            }
    
            const randomId = Math.floor(Math.random() * 1000000);
            const eid = `LOY-${randomId.toString().padStart(5, '0')}`;
            const hashPassword = await bcrypt.hash(password, 15);
            const fileUploadPath = req.files['Fileupload'] ? req.files['Fileupload'][0].filename : null;
            const profileImgPath = req.files['profileimg'] ? req.files['profileimg'][0].filename : null;
    
            const newEmployee = new CommonTeam({
                Eid: eid,
                name,
                email,
                password: hashPassword,
                role,
                address,
                Currentsalary,
                CompanyResources,
                Remarks,
                JOD,
                EOD,
                contactnumber,
                Fileupload: fileUploadPath,
                profileimg: profileImgPath,
                createdBy: req.user.email
            });
    
            const savedEmployee = await newEmployee.save();
    
            return res.status(200).json({
                message: " Registration Successful",
                user: {
                    name: savedEmployee.name,
                    email: savedEmployee.email,
                    role: savedEmployee.role,
                    Eid: savedEmployee.Eid,
                    createdBy: savedEmployee.createdBy,
                }
            });
    
        } catch (error) {
            return res.status(500).json({
                message: error.message
            });
        }
    });
    
router.put('/reset-password', async(req,res) =>{
    const { error, value } = ResetPasswordvalidation(req.body);
    if (error) {
      return res.status(400).json({
        message: error.details[0].message
      });
    }

     const {password,confirmPassword} = value;
     const {Eid} = req.body;

     if (!password||!confirmPassword ||!Eid) {
        return res.status(400).json({ message: 'Password is required' });
    }
    if(password !== confirmPassword){
        return res.status(400).json({message:'password do not match'});
    }
     try{
        
           
            const user = await CommonTeam.findOne({Eid});
            if (!user) {
                return res.status(400).json({ message: 'Invalid .' });
              }
              const hashedPassword = await bcrypt.hash(password, 10);
    
       const reset = await CommonTeam.updateOne({Eid },{$set:{password:hashedPassword}});
   
       if (reset.nModified === 0) {
        return res.status(404).json({ message: 'User not found or password is the same as before' });
    }
       return res.status(200).json({message:'successfully password is reseted'});

     }catch(err){
        return res.status(500).json('Internal error is occured',err)
     }
});
router.put('/reset-headerpassword',verifyToken,async(req,res) =>{
    
    if(req.user.role !== 'md'){
    
        return res.status(403).json({
            message: 'Permission Denied, Only Admin Head can register '
        });
    }
    const { error, value } = Headvalidation(req.body);
    if (error) {
      return res.status(400).json({
        message: error.details[0].message
      });
    }

    const {password,confirmpassword} = value;
   

    if (!password||!confirmpassword) {
       return res.status(400).json({ message: 'Password is required' });
   }
    try{
       
          
           const user = await Headregi.findOne({role: 'md'});
           if (!user) {
               return res.status(400).json({ message: 'Invalid .' });
             }
             const hashedPassword = await bcrypt.hash(password, 10);
   
      const reset = await Headregi.updateOne({role:'md'},{$set:{password:hashedPassword}});
  
      if (reset.nModified === 0) {
       return res.status(404).json({ message: 'User not found or password is the same as before' });
   }
      return res.status(200).json({message:'successfully password is reseted',reset});

    }catch(err){
       return res.status(500).json('Internal error is occured',err)
    }
});
router.put('/reset-email', verifyToken, async (req, res) => {
    if (req.user.role !== 'md') {
        return res.status(403).json({
            message: 'Permission Denied, Only Admin Head can register'
        });
    }
 
    const { error, value } = passwordvalidation(req.body);
    if (error) {
        return res.status(400).json({
            message: error.details[0].message
        });
    }
 
    const { email,name } = value;
    
 
    if (!name || !email) {
        return res.status(400).json({ message: 'Email  are required' });
    }
 
    try {
        const user = await Headregi.findOne({name:req.body.name,role: 'md' });
        if (!user) {
            return res.status(400).json({ message: 'User with the specified name not found.' });
        }
 
        const reset = await Headregi.updateOne({name,role: 'md' }, { $set: { email } });
 
        if (reset.nModified === 0) {
            return res.status(404).json({ message: 'User not found or email is the same' });
        }
 
        return res.status(200).json({ message: 'Email successfully updated' });
 
    } catch (err) {
        return res.status(500).json({ message: 'Internal error occurred', error: err });
    }
 });
 

router.get('/commonprofile/:Eid', verifyToken,async(req,res)=>{
    try{
      const getdata = await CommonTeam.findOne({Eid: req.params.Eid});
      if(getdata){
        const filepath = getdata. Fileupload;
        console.log({data:getdata,fileUrl:filepath});
       return res.status(200).json({message:'successfully the data is getted',data:getdata,fileUrl: filepath})
       
      }else{
        return res.status(404).json('no data is getted');
      }
       
    }catch(err){
        return res.status(500).json({messgae:'Internal server error'},err);
    }
});

router.get('/adminviewallprofile',verifyToken,async(req,res)=>{
    if (req.user.role !== 'md') {
        return res.status(403).json({
            message: 'Permission Denied, Only Admin Head can register '
        });
    }
    try{
      const getallprofile = await  CommonTeam.find({});
      if(!getallprofile){
        res.status(400).json({message:'No data found'});
      } 
       return res.status(200).json({message:'sucessfully getted data',getallprofile});
    }catch(err){
        return res.status(500).json({messgae:'Internal server error'},err);
    }
})
router.get('/saleshead/:Eid',verifyToken,async(req,res)=>{
     
  try{
     const Allenquires = await CommonTeam.find(req.params.Eid)
     if (Allenquires && Allenquires.length > 0) {
        return res.status(200).json({ message: 'Successfully the data is fetched', data: Allenquires

         });
      } else {
        return res.status(404).json({ message: 'No data found' });
      }
  }catch(err){
    return res.status(500).json({messgae:'Internal server error'},err);
  }
})
router.post('/leadentry',verifyToken,async(req,res)=>{
    if(req.user.role!=='Lead filler'){
        return res.status(403).json({
            message: 'Permission Denied, Only Lead person can register '
        });
    }
    const {  LeadDetails, ContactDetails,AddressDetails,DescriptionDetails,Eid} = req.body;
     console.log(req.body);
    try{
     const randomId = Math.floor(Math.random()*1000000);
     const enquirynumber =  `ENQ-${randomId.toString().padStart(5,'0')}`;  

     const headEnquiry = new HeadEnquiry({
            LeadDetails,
            ContactDetails,
            AddressDetails,
            DescriptionDetails,
            Status:'Enquiry-1stage',
            EnquiryNo:enquirynumber,
            Eid,
            createdBy: req.user.role,
     })
     await headEnquiry.save();
       console.log(headEnquiry);
        res.status(200).json({message:'successfully posted',data:headEnquiry});
    }catch(err){
        return res.status(500).json({messgae:'Internal server error',err});
    }
})
router.put('/assignedto', verifyToken, async (req, res) => {
    const { Eid, EnquiryNo } = req.body;
    console.log('Received Eid:', Eid);
    console.log('Received EnquiryNo:', EnquiryNo);

    
    if (!Eid || !EnquiryNo) {
        return res.status(400).json({ message: 'Eid and EnquiryNos are required.' });
    }
    let enquiryNumbers = [];
    if (Array.isArray(EnquiryNo)) {
        enquiryNumbers = EnquiryNo;
    } else if (typeof EnquiryNo === 'string') {
        enquiryNumbers = [EnquiryNo];  
    } else {
        return res.status(400).json({ message: 'EnquiryNos must be a string or an array.' });
    }

    try {
        console.log('Querying for EnquiryNos:', enquiryNumbers);
        const enquiriesToUpdate = await HeadEnquiry.find({
            EnquiryNo: { $in: enquiryNumbers },
            Status: 'Enquiry-1stage'
        });
        console.log('Enquiries found:', enquiriesToUpdate);
        if (enquiriesToUpdate.length === 0) {
            return res.status(404).json({ message: 'No enquiries found to update with the specified EnquiryNos and Status.' });
        }
        const updateAllocated = await HeadEnquiry.updateMany(
            { 
                EnquiryNo: { $in: enquiryNumbers },
                Status: 'Enquiry-1stage' 
            },
            { $set: { Eid, Status: 'Enquiry-2stage' } }
        );

        
        console.log('Update result:', updateAllocated);

       
        if (updateAllocated.nModified > 0) {
            const message = updateAllocated.nModified === 1 
                ? 'One enquiry updated successfully' 
                : `${updateAllocated.nModified} enquiries updated successfully`;
                console.log(message);
        } 

        return res.status(200).json({updateAllocated });
    } catch (err) {
        console.error('Error occurred:', err);
        return res.status(500).json({ message: 'Internal server error', error: err });
    }
});

router.get('/getenquiry/:Eid',verifyToken,async(req,res)=>{
    const {Eid} = req.params;
    console.log(req.params)
    try{
     const getdata = await HeadEnquiry.find({Eid:Eid , Status: 'Enquiry-1stage'});
     console.log(Eid);
     console.log(getdata);
     if (getdata && getdata.length > 0) {
        return res.status(200).json({
            message: 'Successfully retrieved data',
            totalResults: getdata.length,
            getdata
        });
    } else {
        return res.status(404).json({
            message: 'Enquiry data not found'
        });
    }
    }catch(err){
        return res.status(500).json({ message: 'Internal server error', error: err });
    }
})
router.get('/getenquiryforsaletam/:Eid',verifyToken,async(req,res)=>{
    const {Eid} = req.params;
    console.log(req.params)
    try{
     const getdatas = await HeadEnquiry.find({Eid:Eid });
     console.log(Eid);
     console.log(getdatas);
     if (getdatas && getdatas.length > 0) {
        return res.status(200).json({
            message: 'Successfully retrieved data',
            getdatas
        });
    } else {
        return res.status(404).json({
            message: 'Enquiry data not found'
        });
    }
    }catch(err){
        return res.status(500).json({ message: 'Internal server error', error: err });
    }
})
router.post('/customerconversion', verifyToken, async (req, res) => {
   
    try {
        console.log("Request Body:", req.body);
      const convertcustomer = await HeadEnquiry.findOne({ EnquiryNo: req.body.EnquiryNo });
      console.log("Found Customer:", convertcustomer);
      console.log("Eid from convertcustomer:", convertcustomer.Eid);
      if (!convertcustomer) {
        return res.status(400).json('No data found');
      }
      if (!convertcustomer.ContactDetails || !convertcustomer.ContactDetails.MobileNumber || !convertcustomer.ContactDetails.PrimaryMail) {
        return res.status(400).json('Contact details missing');
      }
      const randomId = Math.floor(Math.random() * 1000000);
      const customid = `CUS-${randomId.toString().padStart(5, '0')}`;
      const customer = new Customerconverstion({
        EnquiryNo: req.body.EnquiryNo,
        CustomerDetails: {
          MobileNumber: convertcustomer.ContactDetails.MobileNumber,
          PrimaryMail: convertcustomer.ContactDetails.PrimaryMail,
          PANnumber: req.body.CustomerDetails.PANnumber,
          opportunitynumber: req.body.CustomerDetails.opportunitynumber,
          GSTNnumber: req.body.CustomerDetails.GSTNnumber,
        },
        AddressDetails: convertcustomer.AddressDetails,
        BillingAddressDetails: req.body.BillingAddressDetails,
        DescriptionDetails: req.body.DescriptionDetails,
        Eid: convertcustomer.Eid,
        Convertedstatus: req.body.Convertedstatus,
        CustomerId:customid,
        Status: 'Enquiry-4thstage'
      });
  
      console.log("Successfully customer is converted:", customer);
      await customer.save();
      return res.status(201).json({ message: 'Customer conversion successful', customer });
    } catch (err) {
      console.error("Error:", err);
      return res.status(500).json({ message: 'Internal server error', error: err.message || err });
    }
  });

  router.post('/customernotconverted', verifyToken, async (req, res) => {
    const { EnquiryNo, remarks } = req.body;
  
    try {
      const notConverted = new CustomerNotConverted({
        EnquiryNo,
        remarks
      });
  
      await notConverted.save();
  
      res.status(200).json({
        message: "Lead submitted successfully"
      });
    } catch (error) {
      console.error(error); 
      res.status(500).json({ error: 'Server error. Lead submission failed.' });
    }
  });
  
  
  router.get('/getcustomerconverstion', verifyToken, async (req, res) => {
    const {Eid,EnquiryNo} = req.query;
    
    
    console.log("Received Eid:", Eid);
    console.log("Received EnquiryNo:", EnquiryNo);

    try {
        console.log("Received Eid:", Eid);
    console.log("Received EnquiryNo:", EnquiryNo);
        const getcustomerdata = await Customerconverstion.findOne({
            Eid: Eid,
            EnquiryNo: EnquiryNo,
            Status: 'Enquiry-4thstage'
        }).exec(); 
        if (!getcustomerdata) {
            return res.status(404).json({ message: 'No customer data found for the given enquiry' });
        }
         console.log('get the data',getcustomerdata);
        res.status(200).json({ message: 'Successfully fetched the data', getcustomerdata });
    } catch (err) {
        console.error("Error:", err);
        return res.status(500).json({ message: 'Internal server error', error: err.message || err });
    }
});



router.get('/getcustomerdetails/:Eid', verifyToken, async (req, res) => {
    try {
        const { Eid } = req.params;  // Capture Eid from the URL parameter
        console.log("Received Eid:", Eid);

        const getcustomerdata = await Customerconverstion.find({
            Eid,
            Status: 'Enquiry-4thstage'
        }).exec();

        if (getcustomerdata.length === 0) {
            return res.status(404).json({ message: 'No customer data found for the given enquiry' });
        }

        console.log('Fetched data:', getcustomerdata);
        res.status(200).json({ message: 'Successfully fetched the data', getcustomerdata });
    } catch (err) {
        console.error("Error:", err);
        return res.status(500).json({ message: 'Internal server error', error: err.message || err });
    }
});

router.get('/getsalesheadEid',verifyToken,async(req,res)=>{
    try{
        const getallprofile = await  CommonTeam.find({role: 'sales head'});
        
        if(!getallprofile || getallprofile.length === 0){
          res.status(400).json({message:'No data found'});
        } 

        const eids = getallprofile.map(profile => profile.Eid);
        console.log(eids);
         return res.status(200).json({message:'sucessfully getted data',Eid:eids});
    }catch(err){
        console.error("Error:", err);
        return res.status(500).json({ message: 'Internal server error', error: err.message || err });
    }
});
router.get('/getsalesemployeeEid',verifyToken,async(req,res)=>{
    try{
        const getallEid = await  CommonTeam.find({role: 'Sales Employee'});
        if(!getallEid){
          res.status(400).json({message:'No data found'});
        } 
         return res.status(200).json({message:'sucessfully getted data',getallEid});
    }catch(err){
        console.error("Error:", err);
        return res.status(500).json({ message: 'Internal server error', error: err.message || err });
    }
});
router.get('/salesheadviewallprofile',verifyToken,async(req,res)=>{
    if (req.user.role === 'sales head') {
        return res.status(403).json({
            message: 'Permission Denied, Only Admin Head can register '
        });
    }
    try{
      const getallprofile = await  CommonTeam.find({role:'Sales Employee'});
      if(!getallprofile){
        res.status(400).json({message:'No data found'});
      } 
       return res.status(200).json({message:'sucessfully getted data',getallprofile});
    }catch(err){
        return res.status(500).json({messgae:'Internal server error'},err);
    }
})
router.post('/service&project', verifyToken, upload.single('File'), async (req, res) => {
    
    console.log("req.body:", req.body);  
        
    
        const { error, value } = Servicevalidation(req.body); 
    
        if (error) {
            return res.status(400).json({
                message: error.details[0].message
            });
        }
    
    
    const { name, email, Employeeid,Eid,Description } = value;
    console.log("req.body:", req.body);
    try {   
        const user = req.user;
        console.log(user); 

        if (!name || !email || !Employeeid ||!Eid ||!req.file) {
            return res.status(400).json({
                message: 'Name, email, Fileupload, and assigningId are required'
            });
        }
        const fileUploadPath = req.file ? req.file.filename : null;

        const newWork = new ServiceEngineervist({
            Eid,  
            name,
            email,
            File: fileUploadPath,
            Description,
            Employeeid,
            Status: 'work-status',
            role: user.role
        });

        const savedEmployee = await newWork.save();

        return res.status(200).json({
            message: "Registration Successful",
            user: {
                name: savedEmployee.name,
                email: savedEmployee.email,
                Eid: savedEmployee.Eid,
                Fileupload: savedEmployee.Fileupload,
                Description: savedEmployee.Description,
                Employeeid: savedEmployee.Employeeid
            }
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
});
router.post('/productrequest', verifyToken, async (req, res) => {
    
    console.log("req.body:", req.body);  
        
    
        const { error, value } = Productvalidation(req.body); 
    
        if (error) {
            return res.status(400).json({
                message: error.details[0].message
            });
        }
    
    
    const { name, email, companyname,Eid,Description,contactpersonname,quantity,productname,Employeeid } = value;
    console.log("req.body:", req.body);
    try {   
        const user = req.user;
        console.log(user); 

        if (!name || !email || !Employeeid ||!Eid) {
            return res.status(400).json({
                message: 'Name, email, Fileupload, and assigningId are required'
            });
        }
       

        const newWork = new Productrequest({
            Eid,  
            name,
            email,
            companyname,
            Description,
            Employeeid,
            contactpersonname,
            quantity,
            productname,
            Status: 'products-status',
            
        });

        const savedEmployee = await newWork.save();

        return res.status(200).json({
            message: "Registration Successful",
            user: {
                name: savedEmployee.name,
                email: savedEmployee.email,
                Eid: savedEmployee.Eid,
                Description: savedEmployee.Description,
                Employeeid: savedEmployee.Employeeid
            }
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
});




router.get('/headenquiry', verifyToken, async (req, res) => {
    try {
      if (req.user.role !== 'sales head') {
        return res.status(403).json({
          message: 'Access denied. You must be a Sales Head to view this data.'
        });
      }
  
      const enquiries = await HeadEnquiry.find({
        status: { $ne: 'Enquiry-1stage' }  
      });
  
      if (enquiries.length === 0) {
        return res.status(404).json({
          message: 'No enquiries found except Stage 1'
        });
      }
  
      res.json(enquiries);
    } catch (error) {
      console.error('Error fetching enquiries:', error);
      res.status(500).json({
        message: 'Error fetching enquiries',
        error: error.message
      });
    }
  });
  
  
  router.put('/quotation', verifyToken, async (req, res) => {
    const { EnquiryNo } = req.body;

    if (!EnquiryNo) {
        return res.status(400).json({
            message: 'EnquiryNo is required',
        });
    }

    try {
        const quatation = await HeadEnquiry.updateOne(
            { EnquiryNo: EnquiryNo, Status: 'Enquiry-2stage' },
            { $set: { Status: 'Enquiry-3stage' } } 
        );

     

        return res.status(200).json({
            message: 'Quotation status updated successfully',
            enquiryNo: EnquiryNo,
        });
    } catch (err) {
        console.error('Error:', err);
        return res.status(500).json({
            message: 'Internal server error',
            error: err.message || err,
        });
    }
});
  
router.put('/Enquiries/:EnquiryNo', verifyToken, async (req, res) => {
    const EnquiryNo = req.params.EnquiryNo;
    console.log('Received enquiryNo:', EnquiryNo);

    try {
        // Check if enquiry exists in Customerconverstion collection (check the customerconvert array for EnquiryNo)
        const enquiryExists = await Customerconverstion.findOne({
            "customerconvert.EnquiryNo": EnquiryNo
        });

        console.log('Enquiry Found:', enquiryExists);

        if (!enquiryExists) {
            return res.status(404).json({ message: 'Enquiry not found in customerconvert collection' });
        }

        // Find the specific subdocument with EnquiryNo and Status "Enquiry-4thstage"
        const enquiryToUpdate = await Customerconverstion.findOne({
            "customerconvert.EnquiryNo": EnquiryNo,
            "customerconvert.Status": 'Enquiry-4thstage'
        });

        if (!enquiryToUpdate) {
            return res.status(404).json({ message: 'Enquiry not found or Status is not "Enquiry-4thstage"' });
        }

        // Update the Status of the matching subdocument inside the customerconvert array
        const updatedEnquiry = await Customerconverstion.findOneAndUpdate(
            { "customerconvert.EnquiryNo": EnquiryNo, "customerconvert.Status": "Enquiry-4thstage" },
            { $set: { "customerconvert.$.Status": "completed" } },
            { new: true }
        );
        
        // Find the specific subdocument you just updated
        const updatedSubdocument = updatedEnquiry.customerconvert.find(enquiry => enquiry.EnquiryNo === EnquiryNo);
        
        if (!updatedSubdocument) {
            return res.status(404).json({ message: 'Enquiry subdocument not found after update' });
        }
        
        res.status(200).json(updatedSubdocument);
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/getenquiries/:Eid', verifyToken, async (req, res) => {
    const { Eid } = req.params;

    if (!Eid) {
        return res.status(400).json({ message: 'Eid is required' });
    }

    console.log("Received Eid:", Eid);  

    try {
        const customerData = await Customerconvertion.find({
            "customerconvert": {
                $elemMatch: {
                    "Eid": Eid,  
                    "Status": "Enquiry-4thstage"  
                }
            }
        });

        if (!customerData || customerData.length === 0) {
            return res.status(404).json({ message: 'No customer conversation found for the provided Eid and Enquiry Stage 4' });
        }

        const allConversations = [];

        customerData.forEach(customer => {
            const conversations = customer.customerconvert.filter(item => item.Eid === Eid && item.Status === "Enquiry-4thstage");

            if (conversations.length > 0) {
                allConversations.push(...conversations); 
            }
        });

        if (allConversations.length === 0) {
            return res.status(404).json({ message: 'No conversations found for the provided Eid and Enquiry Stage 4' });
        }

        const response = {
            customerData: {
                allConversations
            }
        };

        return res.status(200).json(response);

    } catch (err) {
        console.error("Error:", err);
        return res.status(500).json({ message: 'Internal server error', error: err.message || err });
    }
});



router.get('/Enquirystatus/:EnquiryNo',verifyToken,async(req,res) => {
    const {EnquiryNo} = req.params;

    try {
        const Enquiry1 = await HeadEnquiry.findOne({EnquiryNo});
        const Enquiry2 = await Customerconvertion.findOne({EnquiryNo});

if( Enquiry1 || Enquiry2 ) {
    const result = {
        EnquiryNo,
        Enquiry1 : Enquiry1 || null,
        Enquiry2 : Enquiry2 || null,
    };
    res.json(result)
}
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching enquiry status' });
    }
})
router.get('/todayviewleadenquiry', verifyToken, async (req, res) => {
    const user = req.user;  

    if (user.role !== 'Lead filler') {
        return res.status(403).json({
            message: 'Permission denied'
        });
    }

    try {
        
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);  

        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);  

        
        const viewenquiries = await HeadEnquiry.find({
            createdBy: user.role,  
            createdAt: { $gte: todayStart, $lte: todayEnd }  
        }).select(' EnquiryNo LeadDetails ContactDetails AddressDetails DescriptionDetails createdAt');  

        if (!viewenquiries || viewenquiries.length === 0) {
            return res.status(400).json({
                message: 'No data available'
            });
        }
        console.log('viewleadenquiryesdetails', viewenquiries);

        return res.status(200).json(viewenquiries);
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
});

module.exports = router;
