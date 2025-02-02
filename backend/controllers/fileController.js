const XLSX = require("xlsx");
const Transaction = require("../models/transactionModel.js");
const validationRules = require("../config/validationRules.js");

// 📌 Function to check if a date is in the current month
const isCurrentMonth = (date) => {
  const now = new Date();
  return (
    date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
  );
};

// 📌 Validate a row based on configured rules
const validateRow = (row, sheetName, rowIndex) => {
  const errors = [];
  const rules = validationRules.default.validationRules;

  Object.keys(rules).forEach((field) => {
    const rule = rules[field];
    const value = row[field];

    if (rule.required && !value) {
      errors.push(`Missing value in column "${field}"`);
    }
    if (rule.numeric && isNaN(value)) {
      errors.push(`Column "${field}" must be a numeric value`);
    }
    if (rule.min !== undefined && value < rule.min) {
      errors.push(`Column "${field}" must be greater than ${rule.min}`);
    }
    if (rule.currentMonthOnly && !isCurrentMonth(new Date(value))) {
      errors.push(`Column "${field}" must be within the current month`);
    }
    if (rule.allowedValues && !rule.allowedValues.includes(value)) {
      errors.push(`Column "${field}" must be Yes or No`);
    }
  });

  return errors.length > 0 ? { row: rowIndex + 1, sheet: sheetName, errors } : null;
};

// 📌 Process and validate Excel file
let progress = 0;
const processFile = async (req, res) => {
  try {
    progress = 0;
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    progress = 10;

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheets = workbook.SheetNames;
    const allErrors = [];
    const validData = [];
    progress = 30;

    sheets.forEach((sheetName) => {
      const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
      if (!sheet.length) return;

      const headers = sheet[0];
      const data = sheet.slice(1).map((row) => {
        let obj = {};
        headers.forEach((header, i) => {
          obj[header] = row[i];
        });
        return obj;
      });
      progress = 50;

      data.forEach((row, index) => {
        const error = validateRow(row, sheetName, index);
        if (error) {
          allErrors.push(error);
        } else {
          validData.push(row);
        }
      });
    });

    progress = 70;

    if (allErrors.length > 0) {
      progress = 100;
      return res.status(400).json({ errors: allErrors });
    }

    // Simulate saving delay and update progress
    setTimeout(async () => {
      await Transaction.insertMany(validData);
      progress = 100;
      res.json({ message: "File processed successfully", inserted: validData.length });
    }, 1000); // Simulates MongoDB insert delay

  } catch (error) {
    progress = 100; // Mark completion even on failure
    res.status(500).json({ error: error.message });
  }
};



// 📌 progress report
const progressReport = (req , res)=> {
  res.json({progress});
}


// 📌 get data
const getData = async(req , res)=> {
  try {
    const transactions = await Transaction.find();
    res.json(transactions);
  } catch (error) {
    console.log(error);
  }
}


module.exports = { processFile , getData , progressReport };
