const express = require('express');
const SalesOrder = require('../Model/SalesOrder');
const verifytoken = require('../VerifyToken');
const router = express.Router();
const Inventory = require('../Model/Inventory'); 
const HeadEnquiry = require('../Model/HeadEnquiry')
const Customerconverstion = require('../Model/Customerconvertion')
const CustomerNotConvert = require('../Model/CustomerNotConverted');
const CustomerNotConverted = require('../Model/CustomerNotConverted');
const { date } = require('joi');

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
          
          router.get('/not-converted/:Eid', verifytoken, async (req, res) => {
            try {
                const { Eid } = req.params; 
        
                const customers = await CustomerNotConverted.find({ Eid: Eid });
        
                if (customers.length === 0) {
                    return res.status(404).json({ message: 'No customers found for the provided Eid' });
                }
        
                res.status(200).json(customers);  
        
            } catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Server error. Please try again later.' });
            }
        });
        router.get('/getconverteddata', verifytoken , async (req, res) => {
            
            try {
                const customerData = await Customerconverstion.find();
        
                if (!customerData) {
                    console.log('No matching document found');
                    return res.status(404).json({ message: 'No matching customer conversation found' });
                }
        
                res.status(200).json({ message: 'Successfully get the customer conversation', customerData });
        
            } catch (err) {
                console.error("Error:", err);  
                return res.status(500).json({ message: 'Internal server error', error: err.message || err });
            }
        });
        router.get('/getcompanyname',verifytoken, async (req, res) => {
            try {
                const customerData = await Customerconverstion.find().select('companyName');
                if (!customerData || customerData.length === 0) {
                    console.log('No matching document found');
                    return res.status(404).json({ message: 'No customer conversations found' });
                }
                const companyNames = customerData.map(item => item.companyName);
                res.status(200).json({
                    message: 'Successfully fetched company names',
                    companyNames,  
                });
            } catch (err) {
                console.error("Error:", err);
                return res.status(500).json({ message: 'Internal server error', error: err.message || err });
            }
        });
        
        router.get('/getMultipleEnquiryStatuses', verifytoken, async (req, res) => {
            const enquiryNos = req.query.enquiryNos?.split(',') || [];
          
            if (enquiryNos.length === 0) {
              return res.status(400).json({ message: 'No enquiry numbers provided.' });
            }
          
            try {
              console.log("Received enquiryNos:", enquiryNos);
          
              const headEnquiries = await HeadEnquiry.find({ EnquiryNo: { $in: enquiryNos } }).lean();
          
              // Map EnquiryNo to corresponding head data
              const headMap = {};
              headEnquiries.forEach(enq => {
                headMap[enq.EnquiryNo] = enq;
              });
          
              const result = {};
          
              for (const EnquiryNo of enquiryNos) {
                const head = headMap[EnquiryNo];
          
                if (!head) {
                  result[EnquiryNo] = { shouldHideButtons: false };
                  continue;
                }
          
                // Extract required fields
                const headClientName = head?.LeadDetails?.clientName || '';
                const headMobile = head?.ContactDetails?.MobileNumber || '';
                const headAddress = head?.AddressDetails || {};
          
                const {
                  Address = '',
                  Country = '',
                  City = '',
                  PostalCode = '',
                  State = ''
                } = headAddress;
          
                console.log("Searching for matches with:", {
                  clientName: headClientName,
                  mobile: headMobile,
                  Address,
                  Country,
                  City,
                  PostalCode,
                  State
                });
          
                let shouldHide = false;
          
                const addressQuery = {
                  'AddressDetails.Address': Address,
                  'AddressDetails.Country': Country,
                  'AddressDetails.City': City,
                  'AddressDetails.PostalCode': PostalCode,
                  'AddressDetails.State': State
                };
          
                const matchingConversions = await Customerconverstion.find({
                  ...addressQuery,
                  customerconvert: {
                    $elemMatch: {
                      clientName: headClientName,
                      'CustomerDetails.MobileNumber': headMobile,
                      Status: 'Enquiry-4thstage',
                      Convertedstatus: 'yes'
                    }
                  }
                }).lean();
          
                console.log(`Found ${matchingConversions.length} matching conversions for EnquiryNo ${EnquiryNo}`);
          
                for (const match of matchingConversions) {
                  for (const convert of match.customerconvert || []) {
                    const customerClientName = convert?.clientName || '';
                    const customerMobile = convert?.CustomerDetails?.MobileNumber || '';
                    const customerStatus = convert?.Status || '';
                    const customerConverted = convert?.Convertedstatus || '';
          
                    const isMatching =
                      customerClientName === headClientName &&
                      customerMobile === headMobile &&
                      customerStatus === 'Enquiry-4thstage' &&
                      customerConverted === 'yes';
          
                    if (isMatching) {
                      shouldHide = true;
                      break;
                    }
                  }
                  if (shouldHide) break;
                }
          
                result[EnquiryNo] = { shouldHideButtons: shouldHide };
              }
          
              return res.json(result);
          
            } catch (err) {
              console.error("Error in /getMultipleEnquiryStatuses:", err);
              return res.status(500).json({ message: 'Server error' });
            }
          });
          
        
        
        router.delete('/customernotconverted/:EnquiryNo', verifytoken, async (req, res) => {
            const { EnquiryNo } = req.params;
            console.log("before deleteing the enquiryno",EnquiryNo);
            try {
                const result = await CustomerNotConverted.findOneAndDelete({EnquiryNo});
        
                if (!result) {
                    return res.status(404).json({ message: 'No record found with that EnquiryNo' });
                }
        
                res.status(200).json({ message: 'Record deleted successfully' });
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Server error. Could not delete record.' });
            }
        });
        router.get('/Enquirystatus/:EnquiryNo', verifytoken, async (req, res) => {
            const { EnquiryNo } = req.params;
          
            if (!EnquiryNo) {
              return res.status(400).json({ message: "Missing 'EnquiryNo' in query parameters." });
            }
          
            try {
              // Find the document where customerconvert array contains the EnquiryNo
              const customerData = await Customerconverstion.findOne({ "customerconvert.EnquiryNo": EnquiryNo });
              const headEnquiryData = await HeadEnquiry.findOne({ EnquiryNo });
    console.log("✅ headEnquiryData:", headEnquiryData);
          
              console.log("✅ customerData:", customerData);
          
              if (customerData && headEnquiryData) {
                // Find the specific customerconvert object with the matching EnquiryNo
                const convertEntry = customerData.customerconvert.find(c => c.EnquiryNo === EnquiryNo);
          
                if (!convertEntry) {
                  return res.status(404).json({
                    message: `EnquiryNo '${EnquiryNo}' found in document but not inside customerconvert array.`,
                  });
                }
          
                return res.json({
                  EnquiryNo,
                  source: "Customerconvertion",
                  data:convertEntry,
                  status: convertEntry.Status,
                });
              }else{
                if (headEnquiryData) {
                    return res.json({
                      EnquiryNo,
                      source: "Headenquiry",
                      data:headEnquiryData,
                      status: headEnquiryData.Status,
                    });
                  }
              }
          
              return res.status(404).json({
                message: `EnquiryNo '${EnquiryNo}' not found in Customerconvertion collection.`,
              });
          
            } catch (error) {
              console.error('❌ Error fetching enquiry status:', error);
              res.status(500).json({
                message: 'Internal Server Error while fetching enquiry status',
                error: error.message,
              });
            }
          });
          
        
module.exports = router;
