const Company = require('../models/Company');
const axios = require('axios');

exports.getCurrencies = async (req, res) => {
  try {
    const response = await axios.get('https://restcountries.com/v3.1/all?fields=name,currencies');
    
    const currenciesMap = new Map();
    
    response.data.forEach(country => {
      if (country.currencies) {
        Object.entries(country.currencies).forEach(([code, data]) => {
          if (!currenciesMap.has(code)) {
            currenciesMap.set(code, {
              code,
              name: data.name,
              symbol: data.symbol || code,
              countries: [country.name.common]
            });
          } else {
            currenciesMap.get(code).countries.push(country.name.common);
          }
        });
      }
    });

    const currencies = Array.from(currenciesMap.values());

    res.json({ success: true, currencies });
  } catch (error) {
    console.error('Get currencies error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch currencies' });
  }
};

exports.getMyCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.user.company)
      .populate('adminUser', 'name email');

    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    res.json({ success: true, company });
  } catch (error) {
    console.error('Get company error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateMyCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.user.company);

    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    const { name, country, currency } = req.body;

    if (name) company.name = name;
    if (country) company.country = country;
    if (currency) company.currency = currency;

    await company.save();

    res.json({ success: true, company });
  } catch (error) {
    console.error('Update company error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
