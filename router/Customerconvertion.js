const express = require('express');
const SalesOrder = require('../Model/SalesOrder');
const verifytoken = require('../VerifyToken');
const router = express.Router();
const Inventory = require('../Model/Inventory'); 
const HeadEnquiry = require('../Model/HeadEnquiry')
const Customerconverstion = require('../Model/Customerconvertion')
const CustomerNotConvert = require('../Model/CustomerNotConverted')

router.post('/customerconvert', verifytoken, async (req, res) => {
    try {
    
        const { EnquiryNo,PANnumber,GSTNnumber,CustomerDetails,BillingAddressDetails,DescriptionDetails,Convertedstatus,Eid } = req.body;
        
        if (!EnquiryNo) {
            return res.status(400).json('Missing required field: EnquiryNo');
        }

        if (!PANnumber || !GSTNnumber) {
            return res.status(400).json('Missing required CustomerDetails fields: PANnumber or GSTNnumber');
        }

        if (!CustomerDetails || !CustomerDetails.opportunitynumber) {
            return res.status(400).json('Missing required CustomerDetails field: opportunitynumber');
        }

        if (!BillingAddressDetails || !BillingAddressDetails.BillingAddress || !BillingAddressDetails.BillingCountry|| !BillingAddressDetails.BillingCity || !BillingAddressDetails.BillingPostalCode || !BillingAddressDetails.BillingState) {
            return res.status(400).json('Missing required BillingAddressDetails fields');
        }

        if (!DescriptionDetails) {
            return res.status(400).json('Missing required DescriptionDetails');
        }

        if (!Convertedstatus) {
            return res.status(400).json('Missing required field: Convertedstatus');
        }

        const customerDetails = await HeadEnquiry.findOne({ EnquiryNo: req.body.EnquiryNo });
        console.log("i get the enquirydetails",customerDetails);

        if (!customerDetails || !customerDetails.ContactDetails.MobileNumber || !customerDetails.ContactDetails.PrimaryMail) {
            return res.status(400).json('Missing required CustomerDetails: MobileNumber or PrimaryMail');
        }
        const existingCustomer = await Customerconverstion.findOne({
            PANnumber,
            GSTNnumber,
        });

        if (existingCustomer) {
            // Check if the EnquiryNo already exists in the customer's customerconvert array
            const existingConversion = existingCustomer.customerconvert.find(c => c.EnquiryNo === EnquiryNo);
            if (existingConversion) {
                return res.status(400).json('This enquiry has already been added to the customer');
            }

            // Prepare the new conversion data
            const newConversionData = {
                EnquiryNo,
                clientName: customerDetails.LeadDetails.clientName,
                CustomerDetails: {
                    MobileNumber: customerDetails.ContactDetails.MobileNumber,
                    PrimaryMail: customerDetails.ContactDetails.PrimaryMail,
                    opportunitynumber: req.body.CustomerDetails.opportunitynumber,
                },
                DescriptionDetails,
                BillingAddressDetails,
                Convertedstatus,
                Eid:req.body.Eid,
                Status: 'Enquiry-4thstage',
            };

            // Append the new conversion to the existing customerconvert array
            existingCustomer.customerconvert.push(newConversionData);

            // Save the updated customer document
            await existingCustomer.save();

            return res.status(200).json({
                message: 'Customer conversion added successfully',
                customer: existingCustomer, });
            } else {
                const randomId = Math.floor(Math.random() * 1000000);
                const customid = `CUS-${randomId.toString().padStart(5, '0')}`;
                const newCustomer = new Customerconverstion({
                    PANnumber,
                    GSTNnumber,
                    companyName: customerDetails.LeadDetails.companyName,
                    AddressDetails: customerDetails.AddressDetails,
                    CustomerId: customid,
                    customerconvert: [{
                        EnquiryNo,
                        clientName: customerDetails.LeadDetails.clientName,
                        CustomerDetails: {
                            MobileNumber: customerDetails.ContactDetails.MobileNumber,
                            PrimaryMail: customerDetails.ContactDetails.PrimaryMail,
                            opportunitynumber: req.body.CustomerDetails.opportunitynumber,
                        },
                        DescriptionDetails,
                        Convertedstatus,
                        BillingAddressDetails,
                        Eid:req.body.Eid,
                        Status: 'Enquiry-4thstage',
                    }],
                });
                await newCustomer.save();
    
                return res.status(201).json({
                    message: 'Customer conversion successful',
                    customer: newCustomer,
                });
            }
        } catch (err) {
            console.error("Error occurred:", err);
            return res.status(500).json({
                message: 'Internal server error',
                error: err.message || err,
            }); }
        });

        router.put('/getcustomerconverstion/:Eid/:EnquiryNo/:CustomerId', verifytoken , async (req, res) => {
            const { Eid, EnquiryNo, CustomerId } = req.params;  
            const { DescriptionDetails, clientName, companyName, Address, Country, City, PostalCode, State, MobileNumber, opportunitynumber, PrimaryMail, BillingAddress, BillingCountry, BillingCity, BillingPostalCode, BillingState } = req.body; 
            
            console.log('Eid:', Eid, 'EnquiryNo:', EnquiryNo, 'CustomerId:', CustomerId);
        
            try {
                // Debug: Check if the customer data exists
                const customerData = await Customerconverstion.findOne({
                    CustomerId: CustomerId,
                    "customerconvert.EnquiryNo": EnquiryNo
                });
        
                if (!customerData) {
                    console.log('No matching document found');
                    return res.status(404).json({ message: 'No matching customer conversation found' });
                }
        
                const updateFields = {};
        
                // Correct the references to use request body variables (not `customerconvert` itself)
                if (DescriptionDetails) updateFields["customerconvert.$.DescriptionDetails"] = DescriptionDetails;
                if (clientName) updateFields["customerconvert.$.clientName"] = clientName;
                if (companyName) updateFields["companyName"] = companyName;
        
                // Update Address details (correcting the path)
                if (Address) updateFields["customerconvert.$.AddressDetails.Address"] = Address;
                if (Country) updateFields["customerconvert.$.AddressDetails.Country"] = Country;
                if (City) updateFields["customerconvert.$.AddressDetails.City"] = City;
                if (PostalCode) updateFields["customerconvert.$.AddressDetails.PostalCode"] = PostalCode;
                if (State) updateFields["customerconvert.$.AddressDetails.State"] = State;
        
                // Update Customer details
                if (MobileNumber) updateFields["customerconvert.$.CustomerDetails.MobileNumber"] = MobileNumber;
                if (opportunitynumber) updateFields["customerconvert.$.CustomerDetails.opportunitynumber"] = opportunitynumber;
                if (PrimaryMail) updateFields["customerconvert.$.CustomerDetails.PrimaryMail"] = PrimaryMail;
        
                // Update Billing details
                if (BillingAddress) updateFields["customerconvert.$.BillingAddressDetails.BillingAddress"] = BillingAddress;
                if (BillingCountry) updateFields["customerconvert.$.BillingAddressDetails.BillingCountry"] = BillingCountry;
                if (BillingCity) updateFields["customerconvert.$.BillingAddressDetails.BillingCity"] = BillingCity;
                if (BillingPostalCode) updateFields["customerconvert.$.BillingAddressDetails.BillingPostalCode"] = BillingPostalCode;
                if (BillingState) updateFields["customerconvert.$.BillingAddressDetails.BillingState"] = BillingState;
        
                console.log('Update fields:', updateFields);
        
                const updateData = await Customerconverstion.updateOne(
                    { 
                        CustomerId: CustomerId, 
                        "customerconvert.EnquiryNo": EnquiryNo,
                    },
                    { 
                        $set: updateFields
                    }
                );
        
                console.log('Update result:', updateData);
        
                // If no matching document is found
                if (updateData.matchedCount === 0) {
                    return res.status(404).json({ message: 'No matching customer conversation found to update' });
                }
        
                // If document is updated successfully
                res.status(200).json({ message: 'Successfully updated the customer conversation', updateData });
        
            } catch (err) {
                console.error("Error:", err);  
                return res.status(500).json({ message: 'Internal server error', error: err.message || err });
            }
        });
        
        
        router.get('/Enquiryget/:EnquiryNo', verifytoken , async (req, res) => {
            const { EnquiryNo } = req.params;  
        
            try {
                const customerData = await Customerconverstion.findOne({ 
                    "customerconvert.EnquiryNo": EnquiryNo 
                });
        
                console.log("I can get customerData:", customerData);
        
                if (!customerData) {
                    return res.status(404).json({ message: 'Customer conversation not found for the provided EnquiryNo' });
                }
                const conversation = customerData.customerconvert.find(item => item.EnquiryNo === EnquiryNo);
        
                console.log("I get customerconvert:", conversation);
        
                if (!conversation) {
                    return res.status(404).json({ message: 'Conversation not found for the provided EnquiryNo' });
                }
                const response = {
                    customerData: {
                        AddressDetails: customerData.AddressDetails,
                        _id: customerData._id,
                        CustomerId: customerData.CustomerId,
                        PANnumber: customerData.PANnumber,
                        GSTNnumber: customerData.GSTNnumber,
                        companyName: customerData.companyName,
                        customerconvert: [conversation]  
                    }
                };
        
                return res.status(200).json(response);
        
            } catch (err) {
                console.error("Error:", err);
                return res.status(500).json({ message: 'Internal server error', error: err.message || err });
            }
        });

        router.get('/todayviewyescustomer', verifytoken, async (req, res) => {

            try {
                const todayStart = new Date();
                todayStart.setHours(0, 0, 0, 0);  
                const todayEnd = new Date();
                todayEnd.setHours(23, 59, 59, 999);  
                const viewenquiries = await Customerconverstion.find({  
                    createdAt: { $gte: todayStart, $lte: todayEnd },
                    "customerconvert.Convertedstatus": "yes"   
                }).select(' customerconvert AddressDetails createdAt');  
        
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
        router.get('/todayviewnocustomer', verifytoken, async (req, res) => {
            try {
              const todayStart = new Date();
              todayStart.setHours(0, 0, 0, 0);  
              const todayEnd = new Date();
              todayEnd.setHours(23, 59, 59, 999);  
          
              const viewenquiries = await CustomerNotConvert.find({  
                createdAt: { $gte: todayStart, $lte: todayEnd },
              })
          
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
