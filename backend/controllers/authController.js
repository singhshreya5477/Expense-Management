const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const Company = require('../models/Company');
const axios = require('axios');
const logger = require('../utils/logger');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const cache = require('../utils/cache');

// Get currency data from country with caching
const getCurrencyForCountry = async (countryName) => {
  const cacheKey = `currency_${countryName.toLowerCase()}`;
  const cached = cache.get(cacheKey);
  
  if (cached) {
    return cached;
  }

  try {
    const response = await axios.get('https://restcountries.com/v3.1/all?fields=name,currencies', {
      timeout: 5000
    });
    
    const country = response.data.find(c => 
      c.name.common.toLowerCase() === countryName.toLowerCase() ||
      c.name.official.toLowerCase() === countryName.toLowerCase()
    );
    
    if (country && country.currencies) {
      const currencyCode = Object.keys(country.currencies)[0];
      const currencyData = country.currencies[currencyCode];
      const result = {
        code: currencyCode,
        symbol: currencyData.symbol || currencyCode,
        name: currencyData.name
      };
      
      cache.set(cacheKey, result);
      return result;
    }
    
    const defaultCurrency = { code: 'USD', symbol: '$', name: 'US Dollar' };
    cache.set(cacheKey, defaultCurrency);
    return defaultCurrency;
  } catch (error) {
    logger.error('Currency fetch error:', error);
    return { code: 'USD', symbol: '$', name: 'US Dollar' };
  }
};

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

const createSendToken = (user, statusCode, res, company = null) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  };

  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      company: company || user.company
    }
  });
};

exports.signup = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError(`Validation failed: ${errors.array()[0].msg}`, 400));
  }

  const { email, password, name, companyName, country } = req.body;

  // Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('User already exists with this email', 400));
  }

  // Get currency for selected country
  const currency = await getCurrencyForCountry(country);

  // Create user in a transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = new User({
      email,
      password,
      name,
      role: 'Admin',
      company: null
    });

    await user.save({ session });

    const company = new Company({
      name: companyName,
      country,
      currency,
      adminUser: user._id
    });

    await company.save({ session });

    user.company = company._id;
    await user.save({ session });

    await session.commitTransaction();

    logger.info(`New company created: ${companyName} by ${email}`);

    createSendToken(user, 201, res, {
      id: company._id,
      name: company.name,
      currency: company.currency
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

exports.login = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Please provide valid email and password', 400));
  }

  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password').populate('company');
  
  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  if (!user.isActive) {
    return next(new AppError('Your account has been deactivated. Please contact administrator.', 401));
  }

  logger.info(`User logged in: ${email}`);

  createSendToken(user, 200, res, {
    id: user.company._id,
    name: user.company.name,
    currency: user.company.currency
  });
});

exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({ success: true, message: 'Logged out successfully' });
});
