const express = require('express');
const SalesOrder = require('../Model/SalesOrder');
const router = express.Router();
const { nanoid } = require('nanoid');

router.post('/create-salesorder', async (req, res) => {
    try {
        const { customername, subject , POnumber , paymentTerms, Quotenumber, salesOrderDate, AssignedTo ,POdate} = req.body;

        if (!customername || !subject || !salesOrderDate || !AssignedTo) {
            return res.status(400).json({ message: 'Missing required client details' });
        }

        const orderId = `ORD-${nanoid()}`;

        const salesOrder = new SalesOrder({
            orderId,
            customername,
            subject,
            status: 'PO Recieved',
            POnumber, 
            paymentTerms,
            Quotenumber,
            salesOrderDate,
            AssignedTo,
            leadStatus: 'Customer',
            POdate  
        });

        await salesOrder.save();

        return res.status(200).json({ message: 'Sales Order created successfully (PO Recieved)', orderId: salesOrder.orderId });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
});


module.exports = router;