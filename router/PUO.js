const express = require("express");
const verifytoken = require('../VerifyToken');
const Purchase = require('../Model/PO');
const router = express.Router();
const mongoose = require('mongoose');

router.post('/create-PO', verifytoken, async (req, res) => {
  try {
    const {
      Eid,
      deliveryTerms,
      warrantyTerms,
      paymentTerms,
      rows,
      payableAmount,
      totalAmount,
      gst,
      gstAmount,
      financialYear,
      Address,
      SupplierName,
      RefQNo,
      QDate,
      GSTIN,
    } = req.body;

    console.log("➡️ Incoming PO data:", req.body);

    if ( !Eid || !deliveryTerms || !warrantyTerms || !paymentTerms || !rows || !payableAmount || !financialYear) {
      return res.status(400).json({ error: 'Missing required purchase order details.' });
    }

    for (let i = 0; i < rows.length; i++) {
      const { hsnCode, unitDescription, uom, quantity, unitPrice, amount } = rows[i];
      if (!hsnCode || !unitDescription || !uom || quantity <= 0 || unitPrice <= 0 || amount <= 0) {
        return res.status(400).json({ error: `Invalid or missing product details in row ${i + 1}` });
      }
    }

    if (gst < 0 || totalAmount <= 0 || gstAmount < 0) {
      return res.status(400).json({ error: 'Invalid GST or amount details.' });
    }

    const count = await Purchase.countDocuments({ financialYear });
    const nextNumber = (count + 1).toString().padStart(3, '0');
    const poNumber = `LAP/PO/${financialYear}/${nextNumber}`;
    const randomId = Math.floor(Math.random() * 1000000);
    const suppno = `SUP-${randomId.toString().padStart(5, '0')}`;

    const newPO = new Purchase({
      poNumber,
      Eid,
      deliveryTerms,
      warrantyTerms,
      paymentTerms,
      rows,
      payableAmount,
      totalAmount,
      gst,
      gstAmount,
      financialYear,
      Address,
      SupplierName,
      SuppNO:suppno,
      RefQNo,
      QDate,
      GSTIN,
    });

    await newPO.save();

    return res.status(201).json({
      message: 'Purchase order created successfully.',
      poNumber,
    });

  } catch (error) {
    console.error("Error creating PO:", error);
    return res.status(500).json({ error: 'Server error while creating the purchase order.' });
  }
});

router.get('/POGetOne/:Eid', verifytoken, async (req, res) => {
  try {
    const { Eid } = req.params;
    console.log("🔍 Fetching latest PO for Eid:", Eid);

    const purchaseOrder = await Purchase.findOne({ Eid })
      .sort({ createdAt: -1 }); // Get the latest one

    if (!purchaseOrder) {
      return res.status(404).json({ error: 'Purchase Order not found for the provided Eid.' });
    }

    return res.status(200).json(purchaseOrder);
  } catch (error) {
    console.error("❌ Error fetching PO:", error);
    return res.status(500).json({ error: 'Server error while fetching the purchase order.' });
  }
});


router.get('/getPO', verifytoken, async (req, res) => {
  try {
    console.log("Fetching all POs");

    const purchaseOrders = await Purchase.find().sort({ createdAt: -1 }); // Ensure createdAt exists in schema

    return res.status(200).json(purchaseOrders);
  } catch (error) {
    console.error("Error fetching all POs:", error);
    return res.status(500).json({ error: 'Server error while retrieving purchase orders.' });
  }
});
router.get('/POGetAllSuppier', verifytoken, async (req, res) => {
  try {
    const suppliers = await Purchase.aggregate([
      {
        $group: {
          _id: "$SuppNO", // group by SuppNO
          SupplierName: { $first: "$SupplierName" },
          GSTIN: { $first: "$GSTIN" },
          SuppNO: { $first: "$SuppNO" } // ensure it's returned explicitly
        }
      },
      {
        $project: {
          _id: 0, // remove MongoDB’s internal _id
          SupplierName: 1,
          GSTIN: 1,
          SuppNO: 1
        }
      }
    ]);

    if (!suppliers.length) {
      return res.status(404).json({ error: 'No suppliers found.' });
    }

    return res.status(200).json(suppliers);
  } catch (error) {
    console.error("❌ Error fetching unique suppliers:", error);
    return res.status(500).json({ error: 'Server error while fetching suppliers.' });
  }
});


router.get('/POGetAllSuppPO/:SuppNO', verifytoken, async (req, res) => {
  const { SuppNO } = req.params;
  try {
    const purchaseOrders = await Purchase.find({ SuppNO }, 'poNumber createdAt');

    if (!purchaseOrders.length) {
      return res.status(404).json({ error: 'No POs found for this supplier.' });
    }

    return res.status(200).json(purchaseOrders);
  } catch (error) {
    console.error("❌ Error fetching PO:", error);
    return res.status(500).json({ error: 'Server error while fetching purchase orders.' });
  }
});

router.get('/POGetAllPOfull', verifytoken, async (req, res) => {
  const { poNumber } = req.query;
  try {
    const purchaseOrder = await Purchase.findOne({ poNumber });
    if (!purchaseOrder) {
      return res.status(404).json({ error: 'Purchase Order not found.' });
    }
    return res.status(200).json(purchaseOrder);
  } catch (error) {
    console.error("❌ Error fetching PO:", error);
    return res.status(500).json({ error: 'Server error while fetching the purchase order.' });
  }
});




router.put('/updatePO', verifytoken, async (req, res) => {
  try {
    const { poNumber } = req.query;

    if (!poNumber) {
      return res.status(400).json({ message: "poNumber is required in query params" });
    }

    const existingPO = await Purchase.findOne({ poNumber });

    if (!existingPO) {
      return res.status(404).json({ message: "Purchase Order not found" });
    }

    const updateFields = req.body;

    if (updateFields.rows && !Array.isArray(updateFields.rows)) {
      return res.status(400).json({ error: "Rows must be an array." });
    }

    const editedPoNumber = updateFields.poNumber;

    if (!editedPoNumber) {
      return res.status(400).json({ message: "Updated poNumber is required in request body" });
    }

    // Clone and assign a new ID
    const clonedPO = {
      ...existingPO.toObject(),
      ...updateFields,
      _id: new mongoose.Types.ObjectId(), // Assign new unique _id
      poNumber: editedPoNumber,
      originalPoNumber: poNumber
    };
    delete clonedPO.createdAt;
    delete clonedPO.updatedAt;

    const newPO = new Purchase(clonedPO);
    const savedPO = await newPO.save();

    return res.status(201).json({
      message: "New PO created with updated poNumber",
      newPoNumber: editedPoNumber,
      data: savedPO
    });

  } catch (error) {
    console.error("❌ Error updating PO:", error);
    return res.status(500).json({ error: 'Server error while updating purchase order.' });
  }
});

router.get('/PONumberbased', verifytoken, async (req, res) => {
  try {
    const { poNumber } = req.query;
    console.log("🔍 Fetching latest PO for poNumber:", poNumber);

    const purchaseOrder = await Purchase.findOne({ poNumber })
      .sort({ createdAt: -1 }); // Get the latest one

    if (!purchaseOrder) {
      return res.status(404).json({ error: 'Purchase Order not found for the provided poNumber.' });
    }

    return res.status(200).json(purchaseOrder);
  } catch (error) {
    console.error("❌ Error fetching PO:", error);
    return res.status(500).json({ error: 'Server error while fetching the purchase order.' });
  }
});
router.delete('/deletePO', verifytoken, async (req, res) => {
  try {
    const { poNumber } = req.query;

    if (!poNumber) {
      return res.status(400).json({ message: "poNumber is required in query params" });
    }

    const deleted = await Purchase.findOneAndDelete({ poNumber });

    if (!deleted) {
      return res.status(404).json({ message: "Purchase Order not found" });
    }

    return res.status(200).json({ message: "Purchase Order deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting PO:", error);
    return res.status(500).json({ error: "Server error while deleting purchase order." });
  }
});


module.exports = router;