import Budget from '../models/Budget.js';

// Get budgets for a given month
export const getBudgets = async (req, res) => {
  try {
    const { month } = req.query; // format: YYYY-MM
    const targetMonth = month || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    
    const budgets = await Budget.find({ userId: req.user._id, month: targetMonth });
    res.json(budgets);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching budgets' });
  }
};

// Set or update a budget limit
export const setBudget = async (req, res) => {
  try {
    const { category, limit, month } = req.body;
    
    if (!category || limit === undefined || !month) {
      return res.status(400).json({ message: 'Category, limit, and month (YYYY-MM) are required.' });
    }
    
    const budget = await Budget.findOneAndUpdate(
      { userId: req.user._id, category, month },
      { limit },
      { upsert: true, new: true, runValidators: true }
    );
    
    res.json(budget);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error configuring budget' });
  }
};
