const express = require('express');
const SalesOrder = require('../Model/SalesOrder');
const verifytoken = require('../VerifyToken');
const router = express.Router();
const Inventory = require('../Model/Inventory'); 

router.post('/create-salesorder', verifytoken, async (req, res) => {
  try {
    const { salesOrderDetails, termsAndConditions, items, summary } = req.body;

    if (!salesOrderDetails || !salesOrderDetails.customerName || !salesOrderDetails.quoteNumber || !salesOrderDetails.salesOrderDate || !salesOrderDetails.status) {
      return res.status(400).json({ error: 'Missing required sales order details.' });
    }

    const randomNum = Math.floor(100 + Math.random() * 900); 
    const salesOrderId = `ORD-${randomNum}`;

    // Step 1: Loop through the items and check the inventory
    for (let item of items) {
      const product = await Inventory.findOne({ Model: item.itemName });

      if (!product) {
        return res.status(400).json({ error: `Product ${item.itemName} not found in inventory.` });
      }

      // Step 2: Check if enough stock is available
      if (product.Inward - product.Outward < item.quantity) {
        return res.status(400).json({ error: `Not enough stock for ${item.itemName}. Available: ${product.Inward - product.Outward}.` });
      }

      // Step 3: Reduce the inventory quantity
      product.Outward += item.quantity; // Increment the outward quantity by the ordered quantity

      // Recalculate the Current stock
      product.Current = product.Inward - product.Outward;

      // Make sure 'Current' is always a number (check if it's a number or set to zero if invalid)
      if (isNaN(product.Current)) {
        product.Current = 0;
      }

      await product.save();
    }

    // Step 4: Create the sales order
    const newSalesOrder = new SalesOrder({
      salesOrderId,
      salesOrderDetails,
      termsAndConditions,
      items,
      summary,
    });

    await newSalesOrder.save();

    res.status(201).json({ message: 'Sales order created successfully', salesOrder: newSalesOrder });
  } catch (error) {
    console.error('Error creating sales order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});




module.exports = router;