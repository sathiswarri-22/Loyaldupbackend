const Joi = require('joi');

  const registervalidation = (datas) => {
    const schema = Joi.object({
      name: Joi.string()
        .min(3)
        .required()
        .messages({
          'string.base': '"Name" should be a string',
          'string.empty': '"Name" cannot be empty',
          'string.min': '"Name" should have a minimum length of 3',
          'any.required': '"Name" is a required field',
        }),
      
      email: Joi.string()
        .email()
        .required()
        .messages({
          'string.base': '"Email" should be a string',
          'string.empty': '"Email" cannot be empty',
          'string.email': '"Email" must be a valid email address',
          'any.required': '"Email" is a required field',
        }),

      password: Joi.string()
        .min(6)
        .max(1024)
        .required()
        .messages({
          'string.base': '"Password" should be a string',
          'string.empty': '"Password" cannot be empty',
          'string.min': '"Password" should have a minimum length of 6 characters',
          'string.max': '"Password" should have a maximum length of 1024 characters',
          'any.required': '"Password" is a required field',
        }),

      role: Joi.string()
        .valid("sales head","Engineer","Service Engineer","Sales Employee","Inventory Manager","Lead filler")  
        .required()
        .messages({
          'string.base': '"Role" should be a string',
          'string.empty': '"Role" cannot be empty',
          'any.required': '"Role" is a required field',
          'any.only': '"Role" must be one of [Admin, Sales Head, Sales Employee]',
        }),

      contactnumber: Joi.string()
        .pattern(/^[0-9]{10}$/)
        .required()
        .messages({
          'string.pattern.base': '"Contact number" should be a valid 10-digit number',
          'any.required': '"Contact number" is required',
        }),

      address: Joi.string()
        .min(10)
        .max(500)
        .required()
        .messages({
          'string.base': '"Address" should be a string',
          'string.empty': '"Address" cannot be empty',
          'string.min': '"Address" should have a minimum length of 10 characters',
          'string.max': '"Address" should have a maximum length of 500 characters',
          'any.required': '"Address" is a required field',
        }),

      JOD: Joi.date()
        .required()
        .messages({
          'date.base': '"Joining date" must be a valid date',
          'any.required': '"Joining date" is required',
        }),

      EOD: Joi.date()
        .greater(Joi.ref('JOD')).optional()
        .messages({
          'date.base': '"End date" must be a valid date',
          'date.greater': '"End date" must be greater than "Joining date"',
        }),
        CompanyResources:Joi.string().optional(),
        Currentsalary:Joi.string().optional(),
        Fileupload:Joi.string().optional(),
        profileimg:Joi.string().optional(),
        Remarks:Joi.string().optional()
    });

    return schema.validate(datas);
  };
  const headregistervalidation = datas =>{
    const headregschema = Joi.object({
      name:Joi.string().min(3).required(),
      email: Joi.string().min(3).required(),
      password: Joi.string().min(3).required(),
      role: Joi.string().required()
    });
    return  headregschema.validate(datas); 
  }
  const loginvalidation = datas => {
    const LoginSchema = Joi.object({
      email: Joi.string().min(3).required(),
      password: Joi.string().min(3).required(),
     
    });

    return LoginSchema.validate(datas);
  };
  const passwordvalidation = datas => {
    const resetSchema = Joi.object({
      email: Joi.string().min(3).optional(),
      password: Joi.string().min(3).optional(),
      confirmpassword: Joi.string().min(3).optional(),
      name: Joi.string().min(3).optional()
    });

    return resetSchema.validate(datas);
  };
  const Servicevalidation = datas => {
    const serviceSchema = Joi.object({
      email: Joi.string().min(3).required(),
      Description: Joi.string().min(3).optional(),
      File:Joi.string().optional(),
      name: Joi.string().min(3).required(),
      Employeeid: Joi.string().required(),
      Eid: Joi.string().optional()
    });

    return serviceSchema.validate(datas);
  }

  const ResetPasswordvalidation = datas => {
    const ResetpasswordSchema = Joi.object({
      Eid : Joi.string().min(3).optional(),
      password: Joi.string().min(3).optional(),
      confirmPassword: Joi.string().min(3).optional(),
    });

    return ResetpasswordSchema.validate(datas);
  }

  const Headvalidation = datas => {
    const HeadSchema = Joi.object({
      password: Joi.string().min(3).optional(),
      confirmpassword: Joi.string().min(3).optional(),
    });

    return HeadSchema.validate(datas);
  }

  module.exports.loginvalidation = loginvalidation;
  module.exports.registervalidation = registervalidation;
  module.exports.headregistervalidation = headregistervalidation;
  module.exports.passwordvalidation = passwordvalidation;
  module.exports.Servicevalidation = Servicevalidation;
  module.exports.ResetPasswordvalidation = ResetPasswordvalidation;
  module.exports.Headvalidation = Headvalidation;
