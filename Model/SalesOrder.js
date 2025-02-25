const mongoose = require("mongoose");
const shortid = require ('shortid');

const SalesOrderSchema = new mongoose.Schema({

  salesOrderId: { 
    type: String, 
    unique: true 
  },
  salesOrderDetails: {
    customerName:{ 
      type: String,
      required: true 
    },
    quoteNumber: { 
      type: String, 
      required: true 
    },
    subject: { 
      type: String 
    },
    salesOrderDate: { 
      type: Date, 
      required: true 
    },
    status: { 
      type: String, 
      enum: ["Pending", "Confirmed", "Shipped", "Delivered"], 
      required: true 
    },
    assignedTo: { 
      type: String 
    },
    poNumber: { 
      type: String 
    },
    poDate: { 
      type: Date 
    },
    paymentTerms: { 
        type: String 
    },
  },
  termsAndConditions: { 
    text: { 
        type: String 
    } },
  items: [
    {
      itemName: { 
        type: String,
         required: true 
        },
      quantity: { 
        type: Number, 
        required: true 
    },
      listPrice: { 
        type: Number, 
        required: true 
    },
      discount: { 
        type: Number, 
        default: 0 
    },
      tax: { 
        type: Number, 
        default: 0 
    },
      totalPrice: { 
        type: Number, 
        required: true 
    },
    },
  ],
  summary: {
    itemsTotal: { 
        type: Number, 
        required: true 
    },
    discountTotal: { 
        type: Number, 
        default: 0 
    },
    shippingHandling: { 
        type: Number, 
        default: 0 
    },
    preTaxTotal: { 
        type: Number, 
        required: true 
    },
    taxesForShipping: { 
        type: Number, 
        default: 0 
    },
    transitInsurance: { 
        type: Number, 
        default: 0 
    },
    installationCharges: { 
        type: Number, 
        default: 0 
    },
    taxForInstallation: { 
        type: Number, 
        default: 0 
    },
    adjustments: { 
        type: Number, 
        default: 0 
    },
    grandTotal: { 
        type: Number, 
        required: true 
    }
  }
  
},{timestamps:true});

module.exports = mongoose.model("Sales-Order", SalesOrderSchema);
