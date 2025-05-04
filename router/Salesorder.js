const express = require('express');
const SalesOrder = require('../Model/SalesOrder');
const verifytoken = require('../VerifyToken');
const router = express.Router();
const Inventory = require('../Model/Inventory');

router.post('/create-salesorder', verifytoken, async (req, res) => {
  try {
    const { salesOrderDetails, termsAndConditions, items, summary,Eid } = req.body;

    if (!salesOrderDetails || !salesOrderDetails.customerName || !salesOrderDetails.quoteNumber || !salesOrderDetails.salesOrderDate || !salesOrderDetails.status) {
      return res.status(400).json({ error: 'Missing required sales order details.' });
    }

    const randomNum = Math.floor(100 + Math.random() * 900); 
    const salesOrderId = `ORD-${randomNum}`;

    // Step 1: Loop through the items and check inventory
    for (let item of items) {
      // Get the product from the inventory based on the item name
      const product = await Inventory.findOne({ Model: item.itemName });

      if (!product) {
        return res.status(400).json({ error: `Product ${item.itemName} not found in inventory.` });
      }

      // Ensure item quantity is an integer (force whole numbers) and handle as a number
      const itemQuantity = Math.floor(Number(item.quantity)); // Convert to number explicitly
      console.log('Item Quantity:', itemQuantity);

      // Step 2: Check if enough stock is available
      const availableStock = Math.floor(Number(product.Inward)) - Math.floor(Number(product.Outward));
      console.log('Available Stock:', availableStock);
      if (availableStock < itemQuantity) {
        return res.status(400).json({ error: `Not enough stock for ${item.itemName}. Available: ${availableStock}.` });
      }

      // Step 3: Update the inventory
      // Ensure both are treated as numbers for proper addition
      const currentOutward = Number(product.Outward); // Convert Outward to a number if it's a string
      console.log('Current Outward:', currentOutward);

      // Update Outward and Current stock
      product.Outward = currentOutward + itemQuantity; // Increase the outward stock
      console.log('Updated Product Outward:', product.Outward);

      // Recalculate the Current stock: Current = Inward - Outward
      product.Current = Math.max(0, Math.floor(Number(product.Inward)) - product.Outward); // Updated calculation for Current
      console.log('Updated Product Current:', product.Current);

      // Step 4: Save the updated product to the database
      await product.save();
    }

    // Step 5: Create a new sales order
    const newSalesOrder = new SalesOrder({
      salesOrderId,
      salesOrderDetails,
      termsAndConditions,
      items,
      summary,
      Eid
    });

    await newSalesOrder.save();

    // Return success response
    res.status(201).json({ message: 'Sales order created successfully', salesOrder: newSalesOrder });
  } catch (error) {
    console.error('Error creating sales order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to fetch sales orders by Eid
router.get('/salesorders/:eid', verifytoken, async (req, res) => {
  try {
    const { eid } = req.params;

    const salesOrders = await SalesOrder.find({ Eid: eid });

    if (salesOrders.length === 0) {
      return res.status(404).json({ message: 'No sales orders found for this Eid' });
    }

    res.status(200).json(salesOrders);
  } catch (error) {
    console.error('Error fetching sales orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to fetch ALL sales orders (no filtering by Eid)
router.get('/salesorders', verifytoken, async (req, res) => {
  try {
    const salesOrders = await SalesOrder.find().sort({ createdAt: -1 }); // Optional: newest first
    res.status(200).json(salesOrders);
  } catch (error) {
    console.error('Error fetching all sales orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


module.exports = router;
