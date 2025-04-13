const express = require("express");
const bodyParser = require("body-parser");
const verifytoken = require('../VerifyToken');
const PurchaseOrder = require('../Model/PI');
const router = express.Router();

router.post('/create-purchaseorder', verifytoken, async (req, res) => { 
    try {
        const { 
            goodsReturn, 
            interestRate, 
            jurisdiction, 
            certification, 
            Eid,
            EnquiryNo,
            rows, 
            freight, 
            gst, 
            subtotal, 
            roundOff, 
            totalPayable 
        } = req.body;

        // Ensure that the required fields are provided
        if (!goodsReturn || !interestRate || !jurisdiction || !certification ||  !rows || !freight || !gst || !subtotal || !roundOff || !totalPayable ||!Eid ||!EnquiryNo) {
            return res.status(400).json({ error: 'Missing required purchase order details.' });
        }

        // Create the new purchase order
        const newPurchaseOrder = new PurchaseOrder({
            goodsReturn,
            interestRate,
            jurisdiction,
            certification,
            Eid,
            EnquiryNo,
            rows,
            freight,
            gst,
            subtotal,
            roundOff,
            totalPayable,
            Status:"POreq"
        });

       
        await newPurchaseOrder.save();

        
        res.status(200).json({ message: 'Purchase order created successfully.' });
    } catch (error) {
        console.error('Error creating purchase order:', error);
        res.status(500).json({ error: error.message });
    }
});

       

module.exports = router;