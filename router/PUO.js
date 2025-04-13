const express = require("express");
const bodyParser = require("body-parser");
const verifytoken = require('../VerifyToken');
const Purchase = require('../Model/PO');
const router = express.Router();


router.post('/create-PO', verifytoken, async (req, res) => {
    try {
      const {
        EnquiryNo,
        deliveryTerms,
        warrantyTerms,
        paymentTerms,
        rows,
        payableAmount,
        Eid,
        totalAmount,
        gst,
        gstAmount,


      } = req.body;
  
      console.log("before submitting the data",req.body);
      if (!EnquiryNo || !deliveryTerms || !warrantyTerms || !paymentTerms || !rows || !payableAmount) {
        return res.status(400).json({ error: 'Missing required purchase order details.' });
      }
  
      // Validate the rows (Check if every product in rows has the necessary fields)
      for (let i = 0; i < rows.length; i++) {
        const { hsnCode, unitDescription, uom, quantity, unitPrice,amount, } = rows[i];
        if (!hsnCode || !unitDescription || !uom || quantity <= 0 || unitPrice <= 0 || gst < 0 || amount <= 0 || totalAmount <= 0 || gstAmount < 0) {
          return res.status(400).json({ error: `Missing or invalid product details in row ${i + 1}` });
        }
      }
  
      // Create a new Purchase Order
      const newPurchaseOrder = new Purchase({
        EnquiryNo,
        Eid,
        deliveryTerms,
        warrantyTerms,
        paymentTerms,
        rows,
        payableAmount,
        totalAmount,
        gst,
        gstAmount
      });
  
      await newPurchaseOrder.save();
      res.status(201).json({ message: 'Purchase order created successfully.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error while creating the purchase order.' });
    }
});

  
  
  router.get('/POGetOne/:EnquiryNo/:Eid', verifytoken, async (req, res) => {
    const { EnquiryNo, Eid } = req.params;

    try {
        // Fetch the quotation from the database based on EnquiryNo, Eid, and Status
        const getPOData = await Purchase.findOne({
            EnquiryNo: EnquiryNo,
            Eid: Eid,
            
        });

        // Check if quotation was not found
        if (!getPOData) {
            return res.status(404).json({
                message: "Purchase order not found",
                data: null
            });
        }

        // Successfully fetched data
        console.log("Successfully fetched the data:", getPOData);

        // Respond with the fetched quotation data
        return res.status(200).json({
            message: "Purchase order fetched successfully",
            data: getPOData // Return the data directly
        });
    } catch (err) {
        // Catch any error that occurred while fetching the data
        console.error("Error fetching the data:", err);

        // Send the error response with the error message
        return res.status(500).json({
            message: "Error fetching the data",
            error: err.message
        });
    }
});

router.get('/getPO', verifytoken, async (req, res) => {
    try {
        const getPO = await Purchase.find({});
        if (!getPO || getPO.length === 0) {
            return res.status(404).json({ message: "No data found" });
        }
        res.status(200).json(getPO);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error getting the purchase order.' });
    }
});

         

module.exports = router;