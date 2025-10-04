const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { User, Company, sequelize } = require('../models');
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
  const token = signToken(user.id);

  const cookieOptions = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  };

  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  const userObj = user.toJSON();
  delete userObj.password;

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user.id,
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
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    return next(new AppError('User already exists with this email', 400));
  }

  // Get currency for selected country
  const currency = await getCurrencyForCountry(country);

  // Create user in a transaction
  const t = await sequelize.transaction();

  try {
    const user = await User.create({
      email,
      password,
      name,
      role: 'Admin',
      companyId: null
    }, { transaction: t });

    const company = await Company.create({
      name: companyName,
      country,
      currency,
      adminUserId: user.id
    }, { transaction: t });

    await user.update({ companyId: company.id }, { transaction: t });

    await t.commit();

    logger.info(`New company created: ${companyName} by ${email}`);

    createSendToken(user, 201, res, {
      id: company.id,
      name: company.name,
      currency: company.currency
    });
  } catch (error) {
    await t.rollback();
    throw error;
  }
});

exports.login = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Please provide valid email and password', 400));
  }

  const { email, password } = req.body;

  const user = await User.findOne({ 
    where: { email },
    include: [{ model: Company, as: 'company' }]
  });
  
  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  if (!user.isActive) {
    return next(new AppError('Your account has been deactivated. Please contact administrator.', 401));
  }

  logger.info(`User logged in: ${email}`);

  createSendToken(user, 200, res, {
    id: user.company.id,
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
