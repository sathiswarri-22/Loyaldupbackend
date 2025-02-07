const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const CommonTeam = require('../Model/CommonTeam');
const verifyToken = require('../VerifyToken');
const HeadEnquiry = require('../Model/HeadEnquiry');
const Customerconverstion = require('../Model/Customerconvertion');
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
const Adminemail = process.env.ADMINEMAIL ;
const Adminpassword =process.env.ADMINPASSWORD ; 
    


router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    
    if (!email || !password ) {
        return res.status(400).json({
            message: 'Email and password are required'
        });
    }

    try {

        
  if(email == Adminemail && password == Adminpassword ){
    const token = jwt.sign({ email: Adminemail}, JWT_SECRET, { expiresIn: '1h' });
  
    return res.status(200).json({
        message: ' Admin Head Login Successful',
        token: token,
        role: 'Admin',
    })};

        const user = await CommonTeam.findOne({email})
            if (!user) {
                return res.status(400).json({
                    message: 'User not found'
                });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({
                    message: 'Invalid password'
                });
            } 
           
            const token = jwt.sign({ email: user.email , role:user.role}, JWT_SECRET, { expiresIn: '2h' });
            
            return res.status(200).json({
                message: 'User login successful',
                role:user.role,
                token: token,
                Eid:user.Eid
            }); 
        
           
    
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Server error'
        });
    }
});

    router.put('/updateProfileImage', verifyToken, upload.single('profileimg'), async (req, res) => {
        try {
            const userId = req.user.id;  
            const user = await CommonTeam.findOne(userId);
    
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
router.post('/registration', verifyToken,upload.fields([{name:'Fileupload',maxCount:1},{name:'profileimg',maxCount:1}]), async (req, res) => {
    try {
        const { name, email, password,role ,JOD, EOD ,address,Currentsalary, CompanyResources,  Remarks,contactnumber} = req.body;
        console.log(req.body);
        console.log("File:", req.files);
        if (req.user.email !== Adminemail) {
            return res.status(403).json({
                message: 'Permission Denied, Only Admin Head can register '
            });
        }

        if (!name || !email || !password || !role ||!contactnumber ||!req.files['Fileupload'] ) {
            return res.status(400).json({
                message: 'Name, email, password, role,contactnumber and resume are required'
            });
        }

        let employee = await CommonTeam.findOne({ email });
        if (employee) {
            return res.status(400).json({
                message: 'Email already exists'
            });
        }
        const randomId = Math.floor(Math.random()*1000000);
        const eid = `LOY-${randomId.toString().padStart(5,'0')}`;
        const hashPassword = await bcrypt.hash(password, 15);
        const fileUploadPath = req.files['Fileupload'] ? req.files['Fileupload'][0].filename : null;
        const profileImgPath = req.files['profileimg'] ? req.files['profileimg'][0].filename : null;

        const newEmployee = new CommonTeam({
            Eid:eid,
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
            message: "Sales Executive Registration Successful",
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
     const {Eid,password,confirmpassword} = req.body;

     if (!password||!confirmpassword ||!Eid) {
        return res.status(400).json({ message: 'Password is required' });
    }
    if(password !== confirmpassword){
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
    if (req.user.email !== Adminemail) {
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

    // Log received data for debugging
    console.log('Received Eid:', Eid);
    console.log('Received EnquiryNo:', EnquiryNo);

    // Validate the input
    if (!Eid || !EnquiryNo) {
        return res.status(400).json({ message: 'Eid and EnquiryNos are required.' });
    }

    // Ensure EnquiryNo is an array
    let enquiryNumbers = [];
    if (Array.isArray(EnquiryNo)) {
        enquiryNumbers = EnquiryNo;
    } else if (typeof EnquiryNo === 'string') {
        enquiryNumbers = [EnquiryNo];  // Convert single enquiry string to an array
    } else {
        return res.status(400).json({ message: 'EnquiryNos must be a string or an array.' });
    }

    try {
        // Log the final EnquiryNo array after conversion
        console.log('Querying for EnquiryNos:', enquiryNumbers);
        
        // Find enquiries to update based on the provided EnquiryNos and Status
        const enquiriesToUpdate = await HeadEnquiry.find({
            EnquiryNo: { $in: enquiryNumbers },
            Status: 'Enquiry-1stage'
        });

        // Log the result of the query
        console.log('Enquiries found:', enquiriesToUpdate);

        // If no enquiries found to update
        if (enquiriesToUpdate.length === 0) {
            return res.status(404).json({ message: 'No enquiries found to update with the specified EnquiryNos and Status.' });
        }

        // Update the status of the found enquiries
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
     const getdatas = await HeadEnquiry.find({Eid:Eid , Status: 'Enquiry-2stage'});
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
      if (!req.body.DescriptionDetails) {
        return res.status(400).json('Description details missing');
      }
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
  
  router.get('/getcustomerconverstion', verifyToken, async (req, res) => {
    const {Eid,EnquiryNo} = req.query;
    
    
    console.log("Received Eid:", Eid);
    console.log("Received EnquiryNo:", EnquiryNo);

    try {
        const getcustomerdata = await Customerconverstion.findOne({
            Eid: Eid,
            EnquiryNo: EnquiryNo,
            Status: 'Enquiry-4thstage'
        }).exec(); 
        if (!getcustomerdata) {
            return res.status(404).json({ message: 'No customer data found for the given enquiry' });
        }

        res.status(200).json({ message: 'Successfully fetched the data', getcustomerdata });
    } catch (err) {
        console.error("Error:", err);
        return res.status(500).json({ message: 'Internal server error', error: err.message || err });
    }
});

  
module.exports = router;