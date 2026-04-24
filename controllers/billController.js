const Bill = require('../models/Bill');

// Function to format date to DD/MM/YYYY
const formatDate = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

exports.storeBill = async (req, res) => {
  try {
    const userId = req.userId;
    const { generatedBillData} = req.body;

    // Validate required fields
    if (!generatedBillData) {
      return res.status(400).json({
        message: 'generatedBillData is required'
      });
    }

    // Create bill object
    const billObject = {
      userId,
      billData: generatedBillData,
      name : formatDate(new Date()),
    };

    // Store bill
    const newBill = await Bill.create(billObject);

    return res.status(201).json({
      message: 'Bill stored successfully',
      bill: newBill
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error storing bill',
      error: error.message
    });
  }
};

exports.getBills = async (req, res) => {
  try {
    const userId = req.userId;

    // Fetch all bills for the user
    const bills = await Bill.find({ userId }).sort({ createdAt: -1 });

    if (bills.length === 0) {
      return res.status(200).json({
        message: 'No bills found',
        bills: []
      });
    }

    return res.status(200).json({
      message: 'Bills retrieved successfully',
      bills
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error retrieving bills',
      error: error.message
    });
  }
};

exports.getBillById = async (req, res) => {
  try {
    const userId = req.userId;
    const { billId } = req.params;

    // Fetch specific bill
    const bill = await Bill.findOne({ _id: billId, userId });

    if (!bill) {
      return res.status(404).json({
        message: 'Bill not found'
      });
    }

    return res.status(200).json({
      message: 'Bill retrieved successfully',
      bill
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error retrieving bill',
      error: error.message
    });
  }
};
