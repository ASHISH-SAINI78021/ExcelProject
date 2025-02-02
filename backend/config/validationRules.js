module.exports = {
    default: {
      requiredFields: ["Name", "Amount", "Date", "Verified"],
      validationRules: {
        Name: { required: true },
        Amount: { required: true, numeric: true, min: 0 },
        Date: { required: true, currentMonthOnly: true },
        Verified: { required: true, allowedValues: ["Yes", "No"] }
      }
    }
  };
  