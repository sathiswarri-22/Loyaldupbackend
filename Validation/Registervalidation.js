const Joi = require('joi');

const registervalidation = (datas) => {
  const schema = Joi.object({
    name: Joi.string().min(3).required().messages({
      'string.base': '"Name" should be a string',
      'string.empty': '"Name" cannot be empty',
      'string.min': '"Name" should have a minimum length of 3',
      'any.required': '"Name" is a required field',
    }),

    email: Joi.string().email().required().messages({
      'string.base': '"Email" should be a string',
      'string.empty': '"Email" cannot be empty',
      'string.email': '"Email" must be a valid email address',
      'any.required': '"Email" is a required field',
    }),

    password: Joi.string().min(6).max(1024).required().messages({
      'string.base': '"Password" should be a string',
      'string.empty': '"Password" cannot be empty',
      'string.min': '"Password" should have a minimum length of 6 characters',
      'string.max': '"Password" should have a maximum length of 1024 characters',
      'any.required': '"Password" is a required field',
    }),

    role: Joi.string()
      .valid("sales head", "Engineer", "Service Engineer", "Sales Employee", "Inventory Manager", "Lead filler", "Stock Filler")
      .required()
      .messages({
        'string.base': '"Role" should be a string',
        'string.empty': '"Role" cannot be empty',
        'any.required': '"Role" is a required field',
        'any.only': '"Role" must be one of [sales head, Engineer, Service Engineer, Sales Employee, Inventory Manager, Lead filler, Stock Filler]',
      }),

    contactnumber: Joi.string()
      .pattern(/^[0-9]{10}$/)
      .required()
      .messages({
        'string.pattern.base': '"Contact number" should be a valid 10-digit number',
        'any.required': '"Contact number" is required',
      }),

    address: Joi.string().min(10).max(500).required().messages({
      'string.base': '"Address" should be a string',
      'string.empty': '"Address" cannot be empty',
      'string.min': '"Address" should have a minimum length of 10 characters',
      'string.max': '"Address" should have a maximum length of 500 characters',
      'any.required': '"Address" is a required field',
    }),

    JOD: Joi.date().required().messages({
      'date.base': '"Joining date" must be a valid date',
      'any.required': '"Joining date" is required',
    }),

    EOD: Joi.date().greater(Joi.ref('JOD')).optional().messages({
      'date.base': '"End date" must be a valid date',
      'date.greater': '"End date" must be greater than "Joining date"',
    }),

    CompanyResources: Joi.array()
      .items(
        Joi.object({
          Thingsname: Joi.string().min(1).optional(),
          productnumber: Joi.string().min(1).optional(),
          givenStatus:Joi.string().valid("provided","handover","bending","nothandover").optional()
        })
      )
      .min(1)
      .optional(),

    Currentsalary: Joi.number().optional().messages({
      'number.base': '"Currentsalary" should be a number',
    }),

    Fileupload: Joi.string().optional(),
    profileimg: Joi.string().optional(),

    Remarks: Joi.string().optional().messages({
      'string.base': '"Remarks" should be a string',
    }),
  });

  return schema.validate(datas);
};

  const headregistervalidation = datas =>{
    const headregschema = Joi.object({
      name:Joi.string().min(3).required().messages({
        'string.base': '"Name" should be a string',
        'string.empty': '"Name" cannot be empty',
        'string.min': '"Name" should have a minimum length of 3',
        'any.required': '"Name" is a required field',
      }),
      email: Joi.string().min(3).required().messages({
        'string.base': '"Email" should be a string',
        'string.empty': '"Email" cannot be empty',
        'string.email': '"Email" must be a valid email address',
        'any.required': '"Email" is a required field',
      }),
      password: Joi.string().min(3).required().messages({
        'string.base': '"Password" should be a string',
        'string.empty': '"Password" cannot be empty',
        'string.min': '"Password" should have a minimum length of 6 characters',
        'string.max': '"Password" should have a maximum length of 1024 characters',
        'any.required': '"Password" is a required field',
      }),
      role: Joi.string().required().messages({
        'string.base': '"Role" should be a string',
        'string.empty': '"Role" cannot be empty',
        'any.required': '"Role" is a required field',
        'any.only': '"Role" must be one of [Admin, Sales Head, Sales Employee]',
      })
    });
    return  headregschema.validate(datas); 
  }
  const loginvalidation = datas => {
    const LoginSchema = Joi.object({
      email: Joi.string().min(3).required().messages({
        'string.base': '"Email" should be a string',
        'string.empty': '"Email" cannot be empty',
        'string.email': '"Email" must be a valid email address',
        'any.required': '"Email" is a required field',
      }),
      password: Joi.string().min(3).required().messages({
        'string.base': '"Password" should be a string',
        'string.empty': '"Password" cannot be empty',
        'string.min': '"Password" should have a minimum length of 6 characters',
        'string.max': '"Password" should have a maximum length of 1024 characters',
        'any.required': '"Password" is a required field',
      }),
     
    });

    return LoginSchema.validate(datas);
  };
  const passwordvalidation = datas => {
    const resetSchema = Joi.object({
      email: Joi.string().min(3).optional().messages({
        'string.base': '"Email" should be a string',
        'string.empty': '"Email" cannot be empty',
        'string.email': '"Email" must be a valid email address',
        'any.required': '"Email" is a required field',
      }),
      password: Joi.string().min(3).optional().messages({
        'string.base': '"Password" should be a string',
        'string.empty': '"Password" cannot be empty',
        'string.min': '"Password" should have a minimum length of 6 characters',
        'string.max': '"Password" should have a maximum length of 1024 characters',
        'any.required': '"Password" is a required field',
      }),
      confirmpassword: Joi.string().min(3).optional().messages({
        'string.base': '"confirmpassword" should be a string',
        'string.empty': '"confirmpassword" cannot be empty',
        'string.min': '"confirmpassword" should have a minimum length of 6 characters',
        'string.max': '"confirmpassword" should have a maximum length of 1024 characters',
        'any.required': '"confirmpassword" is a required field',
      }),
      name: Joi.string().min(3).optional().messages({
        'string.base': '"Name" should be a string',
        'string.empty': '"Name" cannot be empty',
        'string.min': '"Name" should have a minimum length of 3',
        'any.required': '"Name" is a required field',
      }),
    });

    return resetSchema.validate(datas);
  };
  const Servicevalidation = (data) => {
    const serviceSchema = Joi.object({
      name: Joi.string().min(3).required().messages({
        'string.base': '"Name" should be a string',
        'string.empty': '"Name" cannot be empty',
        'string.min': '"Name" should have at least 3 characters',
        'any.required': '"Name" is a required field'
      }),
      companyName: Joi.string().min(3).required(),
      clientName: Joi.string().min(3).required(),
      Eid: Joi.string().required(),
      Date: Joi.date().required(),
      Location: Joi.string().optional(),
      MachineName: Joi.string().optional(),
      ProductDescription: Joi.string().optional(),
      Problems: Joi.array().items(Joi.object({
        description: Joi.string().min(3).required()
      })).optional(),
      Assessment: Joi.string().optional()
    });
  
    return serviceSchema.validate(data);
  };
  
  const ResetPasswordvalidation = datas => {
    const ResetpasswordSchema = Joi.object({
      Eid : Joi.string().min(3).optional(),
      password: Joi.string().min(3).optional().messages({
        'string.base': '"Password" should be a string',
        'string.empty': '"Password" cannot be empty',
        'string.min': '"Password" should have a minimum length of 6 characters',
        'string.max': '"Password" should have a maximum length of 1024 characters',
        'any.required': '"Password" is a required field',
      }),
      confirmPassword: Joi.string().min(3).optional().messages({
        'string.base': '"confirmPassword" should be a string',
        'string.empty': '"confirmPassword" cannot be empty',
        'string.min': '"confirmPassword" should have a minimum length of 6 characters',
        'string.max': '"confirmPassword" should have a maximum length of 1024 characters',
        'any.required': '"confirmPassword" is a required field',
      }),
    });

    return ResetpasswordSchema.validate(datas);
  }

  const emailvalidation = datas => {
    const resetSchema = Joi.object({
      email: Joi.string().min(3).optional().messages({
        'string.base': '"Email" should be a string',
        'string.empty': '"Email" cannot be empty',
        'string.email': '"Email" must be a valid email address',
        'any.required': '"Email" is a required field',
      }),
      name: Joi.string().min(3).optional().messages({
        'string.base': '"Name" should be a string',
        'string.empty': '"Name" cannot be empty',
        'string.min': '"Name" should have a minimum length of 3',
        'any.required': '"Name" is a required field',
      }),
    });

    return resetSchema.validate(datas);
  };


  const Headvalidation = datas => {
    const HeadSchema = Joi.object({
      password: Joi.string().min(3).optional().messages({
        'string.base': '"Password" should be a string',
        'string.empty': '"Password" cannot be empty',
        'string.min': '"Password" should have a minimum length of 6 characters',
        'string.max': '"Password" should have a maximum length of 1024 characters',
        'any.required': '"Password" is a required field',
      }),
      confirmpassword: Joi.string().min(3).optional().messages({
        'string.base': '"confirmPassword" should be a string',
        'string.empty': '"confirmPassword" cannot be empty',
        'string.min': '"confirmPassword" should have a minimum length of 6 characters',
        'string.max': '"confirmPassword" should have a maximum length of 1024 characters',
        'any.required': '"confirmPassword" is a required field',
      }),
    });

    return HeadSchema.validate(datas);
  }



  const servicedetailsvalidation = datas => {
    const Servicedetails = Joi.object({
      clientName:Joi.string().optional().messages({
        'string.base': '"clientName" should be a string',
        'string.empty': '"clientName" cannot be empty',
        'any.required': '"clientName" is a required field',
      }),  
      Eid:Joi.string().optional().messages({
        'string.base': '"Eid" should be a string',
        'string.empty': '"Eid" cannot be empty',
        'any.required': '"Eid" is a required field',
      }),  
      Customerinward:Joi.string().optional().messages({
         'string.base': '"Customerinward" should be a string',
        'string.empty': '"Customerinward" cannot be empty',
        'any.required': '"Customerinward" is a required field',
      }),
      quantity:Joi.string().optional().messages({
        'string.base': '"quantity" should be a string',
        'string.empty': '"quantity" cannot be empty',
      }),
      servicestartdate:Joi.string().optional().messages({
        'string.base': '"servicestartdate" should be a string',
        'string.empty': '"servicestartdate" cannot be empty',
        'any.required': '"servicestartdate" is a required field',

      }),
      serviceenddate:Joi.string().optional().messages({
        'string.base': '"serviceenddate" should be a string',
        'string.empty': '"serviceenddate" cannot be empty',
        'any.required': '"serviceenddate" is a required field',

      }),
      Employeeid:Joi.string().optional().messages({
        'string.base': '"Employeeid" should be a string',
        'string.empty': '"Employeeid" cannot be empty',
        'any.required': '"Employeeid" is a required field',

      }),
      Material:Joi.string().optional().messages({
        'string.base': '"Material" should be a string',
      }),
      Model:Joi.string().optional().messages({
        'string.base': '"Model" should be a string',
      }),
      SerialNo:Joi.string().optional().messages({
        'string.base': '"SerialNo" should be a string',
      }),
      powerconsumption:Joi.string().optional().messages({
        'string.base': '"powerconsumption" should be a string',
      }),
      serviceStatus:Joi.string().optional().messages({
        'string.base': '"serviceStatus" should be a string',
      }),
      BillingStatus:Joi.string().optional().messages({
        'string.base': '" BillingStatus" should be a string',
      })
    });

    return Servicedetails.validate(datas);
  }

  module.exports.loginvalidation = loginvalidation;
  module.exports.registervalidation = registervalidation;
  module.exports.headregistervalidation = headregistervalidation;
  module.exports.passwordvalidation = passwordvalidation;
  module.exports.Servicevalidation = Servicevalidation;
  module.exports.ResetPasswordvalidation = ResetPasswordvalidation;
  module.exports.Headvalidation = Headvalidation;
  module.exports.emailvalidation = emailvalidation;
  module.exports.servicedetailsvalidation = servicedetailsvalidation;
