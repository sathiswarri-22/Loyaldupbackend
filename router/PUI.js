const express = require("express");
const verifytoken = require('../VerifyToken');
const Invoice = require('../Model/PI');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Generate unique piId using UUID
function generateUniquePiId() {
  return `Pi-${uuidv4().split('-')[0]}`;
}

// Generate next base reference number
async function getNewBaseRef(financialYear) {
  // Only get base invoices (not revisions)
  const baseInvoices = await Invoice.find({
    financialYear,
    referenceNumber: { $not: /R\d+$/ } // Ignore revisions
  })
    .sort({ createdAt: -1 })
    .limit(1);

  let nextNumber = 1;
  if (baseInvoices.length > 0) {
    const lastRef = baseInvoices[0].referenceNumber;
    const match = lastRef.match(/(\d{4})$/); // Get the last 4-digit number
    if (match) {
      nextNumber = parseInt(match[1]) + 1;
    }
  }

  const padded = String(nextNumber).padStart(4, '0');
  return `LAP/PI/${financialYear}/${padded}`;
}

// Generate revision reference number
async function getRevisionRef(baseRef) {
  const allVersions = await Invoice.find({
    referenceNumber: new RegExp(`^${baseRef}R\\d+$`)
  });

  let nextRevision = 1;
  if (allVersions.length > 0) {
    const revisions = allVersions.map(inv => {
      const match = inv.referenceNumber.match(/R(\d+)$/);
      return match ? parseInt(match[1]) : 0;
    });
    nextRevision = Math.max(...revisions) + 1;
  }

  return `${baseRef}R${nextRevision}`;
}

// POST method to create or edit invoice (versioned)
router.post('/invoice', verifytoken, async (req, res) => {
  try {
    const {
      isEdit,
      baseReferenceNumber,  // Required if isEdit is true
      financialYear,
      ...invoiceData
    } = req.body;
    console.log("i get the data before submit",req.body);
    let referenceNumber;

    if (isEdit) {
      if (!baseReferenceNumber) {
        return res.status(400).json({ message: "Base reference number is required for editing." });
      }
      referenceNumber = await getRevisionRef(baseReferenceNumber);
    } else {
      referenceNumber = await getNewBaseRef(financialYear);
    }

    const piId = generateUniquePiId();

    const newInvoice = new Invoice({
      ...invoiceData,
      referenceNumber,
      piId,
      financialYear
    });

    await newInvoice.save();

    res.status(200).json({
      message: isEdit ? "Invoice edited and saved as new version." : "Invoice created successfully.",
      referenceNumber,
      invoice: newInvoice
    });
  } catch (error) {
    console.error("Error creating/editing invoice:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// GET all invoices
// GET all invoices
router.get('/invoices', verifytoken, async (req, res) => {
  try {
    const invoices = await Invoice.find().sort({ createdAt: -1 });
    res.status(200).json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET invoice by piId
router.get('/byPiId/:piId', verifytoken, async (req, res) => {
  const { piId } = req.params;

  try {
    const invoice = await Invoice.findOne({ piId });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.status(200).json(invoice.toObject());
  } catch (error) {
    console.error('Error fetching invoice by piId:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT (versioning update)
router.put('/:piId', verifytoken, async (req, res) => {
  const { piId } = req.params;
  const updateData = req.body;

  try {
    const existingInvoice = await Invoice.findOne({ piId });

    if (!existingInvoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const originalRef = existingInvoice.referenceNumber;
    const revisionMatch = originalRef.match(/R(\d+)$/);
    let baseRef = originalRef;
    let revision = 1;

    if (revisionMatch) {
      revision = parseInt(revisionMatch[1], 10) + 1;
      baseRef = originalRef.replace(/R\d+$/, '');
    }

    const newRefNumber = `${baseRef}R${revision}`;
    const newPiId = generateUniquePiId();

    const newInvoice = new Invoice({
      ...existingInvoice.toObject(),
      ...updateData,
      _id: undefined,
      piId: newPiId,
      referenceNumber: newRefNumber,
      createdAt: undefined,
      updatedAt: undefined
    });

    await newInvoice.save();

    res.status(200).json({
      message: 'Invoice edited and saved as new version',
      referenceNumber: newRefNumber,
      piId: newPiId,
      invoice: newInvoice
    });
  } catch (error) {
    console.error('Error versioning invoice:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE invoice by piId
router.delete('/:piId', verifytoken, async (req, res) => {
  const { piId } = req.params;

  try {
    const deletedInvoice = await Invoice.findOneAndDelete({ piId });

    if (!deletedInvoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.status(200).json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;    