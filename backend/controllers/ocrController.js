const Tesseract = require('tesseract.js');
const OpenAI = require('openai');
const fs = require('fs');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Extract structured data from OCR text using OpenAI
const extractStructuredData = async (ocrText) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return parseOCRTextManually(ocrText);
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{
        role: "system",
        content: "You are a receipt parser. Extract structured data from receipt text and return JSON with: merchantName, amount, date (YYYY-MM-DD), currency, items (array of {description, amount}), category."
      }, {
        role: "user",
        content: `Parse this receipt text: ${ocrText}`
      }],
      response_format: { type: "json_object" }
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error('OpenAI extraction error:', error);
    return parseOCRTextManually(ocrText);
  }
};

// Fallback manual parsing
const parseOCRTextManually = (text) => {
  const lines = text.split('\n').filter(line => line.trim());
  
  // Extract amount (look for currency symbols and numbers)
  const amountRegex = /[$€£¥₹]\s*(\d+[\.,]\d{2})|(\d+[\.,]\d{2})\s*[$€£¥₹]/g;
  const amounts = [];
  let match;
  while ((match = amountRegex.exec(text)) !== null) {
    const amount = parseFloat((match[1] || match[2]).replace(',', '.'));
    amounts.push(amount);
  }

  // Extract date
  const dateRegex = /(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})|(\d{4}[-\/]\d{1,2}[-\/]\d{1,2})/g;
  const dateMatch = text.match(dateRegex);

  // Extract merchant name (usually first or second line)
  const merchantName = lines[0] || 'Unknown Merchant';

  return {
    merchantName,
    amount: amounts.length > 0 ? Math.max(...amounts) : 0,
    date: dateMatch ? dateMatch[0] : new Date().toISOString().split('T')[0],
    currency: 'USD',
    items: [],
    category: 'Other'
  };
};

exports.scanReceipt = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No receipt image provided' });
    }

    const imagePath = req.file.path;

    // Perform OCR
    const { data: { text } } = await Tesseract.recognize(imagePath, 'eng', {
      logger: m => console.log(m)
    });

    // Extract structured data
    const extractedData = await extractStructuredData(text);

    // Clean up uploaded file if needed (optional)
    // fs.unlinkSync(imagePath);

    res.json({
      success: true,
      receipt: {
        filename: req.file.filename,
        path: imagePath,
        ocrText: text,
        extractedData
      }
    });
  } catch (error) {
    console.error('OCR scan error:', error);
    res.status(500).json({ success: false, message: 'OCR processing failed' });
  }
};
