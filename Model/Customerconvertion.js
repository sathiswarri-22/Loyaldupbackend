const mongoose = require('mongoose');

// Define a subdocument schema for the customerconvert array items
const customerConvertSchema = new mongoose.Schema({
    EnquiryNo: {
        type: String,
        required: true,
    },
    clientName: {
        type: String,
        required: true,
    },
    CustomerDetails: {
        MobileNumber: {
            type: String,
        },
        opportunitynumber: {
            type: String,
        },
        PrimaryMail: {
            type: String,
        },
    },
    BillingAddressDetails: {
        BillingAddress: {
            type: String,
        },
        BillingCountry: {
            type: String,
        },
        BillingCity: {
            type: String,
        },
        BillingPostalCode: {
            type: String,
        },
        BillingState: {
            type: String,
        },
    },
    DescriptionDetails: {
        type: String,
    },
    Convertedstatus: {
        type: String,
        enum: ['yes'],
    },
    Eid: {
        type: String,
        required: true,
    },
    Status: {
        type: String,
        required: true,
    },
    // Add createdAt and updatedAt fields for each item in the array
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Define a pre-save middleware to update updatedAt before saving
customerConvertSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Define the main schema
const Customerconverstion = new mongoose.Schema({
    CustomerId: {
        type: String,
    },
    PANnumber: {
        type: String,
    },
    GSTNnumber: {
        type: String,
    },
    companyName: {
        type: String,
        required: true,
    },
    AddressDetails: {
        Address: {
            type: String,
        },
        Country: {
            type: String,
        },
        City: {
            type: String,
        },
        PostalCode: {
            type: String,
        },
        State: {
            type: String,
        },
    },
    
    customerconvert: [customerConvertSchema],
}, { timestamps: true }); 


module.exports = mongoose.model('CustomerConvert', Customerconverstion);