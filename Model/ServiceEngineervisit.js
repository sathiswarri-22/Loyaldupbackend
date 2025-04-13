const mongoose = require('mongoose');

const ServiceEngineerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  ReportNo: {
    type: String
  },
  companyName: {
    type: String,
    required: true
  },
  clientName: {
    type: String,
    required: true
  },
  Eid: {
    type: String,
    required: true
  },
  Date: {
    type: Date,
    required: true
  },
  Location: {
    type: String
  },
  MachineName: {
    type: String
  },
  ProductDescription: {
    type: String
  },
  Problems: [{
    description: {
      type: String,
      required: true
    }
  }],
  Assessment: {
    type: String
  },
  Status: {
    type: String,
  }
});

module.exports = mongoose.model('Workvisitform', ServiceEngineerSchema);
