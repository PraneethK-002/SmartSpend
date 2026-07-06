import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';
import { generateMonthlyPDF } from '../services/pdfService.js';

// Get transactions list with filters
export const getTransactions = async (req, res) => {
  try {
    const { search, category, bank, type, sortBy = 'date', sortOrder = 'desc', page = 1, limit = 50 } = req.query;
    
    const query = { userId: req.user._id };
    
    // Search filter (merchant or reference)
    if (search) {
      query.$or = [
        { merchant: { $regex: search, $options: 'i' } },
        { referenceNumber: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Category filter
    if (category) {
      query.category = category;
    }
    
    // Bank filter
    if (bank) {
      query.bankName = bank;
    }
    
    // Type filter (debit / credit)
    if (type) {
      query.type = type;
    }
    
    // Build sort option
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    // Execution
    const count = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));
      
    res.json({
      transactions,
      page: Number(page),
      pages: Math.ceil(count / limit),
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching transactions' });
  }
};

// Manually update transaction category
export const updateTransactionCategory = async (req, res) => {
  try {
    const { category } = req.body;
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { category },
      { new: true }
    );
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error updating category' });
  }
};

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const transactions = await Transaction.find({ userId });
    
    const debits = transactions.filter(t => t.type === 'debit');
    const credits = transactions.filter(t => t.type === 'credit');
    
    // 1. Core aggregates
    const totalExpenses = debits.reduce((sum, t) => sum + t.amount, 0);
    
    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    const monthlyExpenses = debits
      .filter(t => {
        const d = new Date(t.date);
        const mStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        return mStr === currentMonthStr;
      })
      .reduce((sum, t) => sum + t.amount, 0);
      
    // 2. Category spending
    const categorySpendingMap = {};
    debits.forEach(t => {
      categorySpendingMap[t.category] = (categorySpendingMap[t.category] || 0) + t.amount;
    });
    const categorySpending = Object.entries(categorySpendingMap).map(([name, value]) => ({ name, value }));
    
    // 3. Top Merchants
    const merchantMap = {};
    debits.forEach(t => {
      merchantMap[t.merchant] = (merchantMap[t.merchant] || 0) + t.amount;
    });
    const topMerchants = Object.entries(merchantMap)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
      
    // 4. Monthly bar chart (Last 6 months)
    const monthlyBarChartMap = {};
    debits.forEach(t => {
      const d = new Date(t.date);
      const mLabel = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      monthlyBarChartMap[mLabel] = (monthlyBarChartMap[mLabel] || 0) + t.amount;
    });
    
    // Sort month labels Chronologically
    const monthlyBarChart = Object.entries(monthlyBarChartMap)
      .map(([name, amount]) => ({ name, amount }))
      .reverse() // Order past months
      .slice(0, 6)
      .reverse();

    // 5. Weekly Trend (Last 4 weeks)
    const weeklyTrendsMap = { 'Week 1': 0, 'Week 2': 0, 'Week 3': 0, 'Week 4': 0 };
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    debits
      .filter(t => new Date(t.date) >= thirtyDaysAgo)
      .forEach(t => {
        const diffDays = Math.floor((now - new Date(t.date)) / (1000 * 60 * 60 * 24));
        if (diffDays <= 7) weeklyTrendsMap['Week 4'] += t.amount;
        else if (diffDays <= 14) weeklyTrendsMap['Week 3'] += t.amount;
        else if (diffDays <= 21) weeklyTrendsMap['Week 2'] += t.amount;
        else if (diffDays <= 30) weeklyTrendsMap['Week 1'] += t.amount;
      });
      
    const weeklyTrends = Object.entries(weeklyTrendsMap).map(([name, amount]) => ({ name, amount }));

    // 6. Daily spending timeline (Last 15 days)
    const timelineMap = {};
    for (let i = 14; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      timelineMap[dStr] = 0;
    }
    
    debits.forEach(t => {
      const dStr = new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      if (timelineMap[dStr] !== undefined) {
        timelineMap[dStr] += t.amount;
      }
    });
    
    const spendingTimeline = Object.entries(timelineMap).map(([date, amount]) => ({ date, amount }));

    // 7. Budget Status for Category Progress
    const budgets = await Budget.find({ userId, month: currentMonthStr });
    const budgetProgress = budgets.map(b => {
      const spent = debits
        .filter(t => t.category === b.category && `${new Date(t.date).getFullYear()}-${String(new Date(t.date).getMonth() + 1).padStart(2, '0')}` === currentMonthStr)
        .reduce((sum, t) => sum + t.amount, 0);
      return {
        category: b.category,
        limit: b.limit,
        spent,
        percentage: b.limit > 0 ? Math.min((spent / b.limit) * 100, 100) : 0
      };
    });

    res.json({
      totalExpenses,
      monthlyExpenses,
      categorySpending,
      topMerchants,
      monthlyBarChart,
      weeklyTrends,
      spendingTimeline,
      budgetProgress
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error compiling dashboard statistics' });
  }
};

// Detect potential recurring payments
export const getRecurringPayments = async (req, res) => {
  try {
    const userId = req.user._id;
    const transactions = await Transaction.find({ userId, type: 'debit' });
    
    const merchantMap = {};
    transactions.forEach(t => {
      if (!merchantMap[t.merchant]) merchantMap[t.merchant] = [];
      merchantMap[t.merchant].push(t);
    });
    
    const recurring = [];
    const now = new Date();
    
    for (const [merchant, txs] of Object.entries(merchantMap)) {
      if (txs.length < 2) continue;
      
      // Sort chronologically
      txs.sort((a, b) => new Date(a.date) - new Date(b.date));
      
      const intervals = [];
      const amountDiffs = [];
      
      for (let i = 1; i < txs.length; i++) {
        const diffTime = Math.abs(new Date(txs[i].date) - new Date(txs[i-1].date));
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        intervals.push(diffDays);
        
        const amtDiff = Math.abs(txs[i].amount - txs[i-1].amount) / txs[i-1].amount;
        amountDiffs.push(amtDiff);
      }
      
      const averageInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const averageAmtDiff = amountDiffs.reduce((a, b) => a + b, 0) / amountDiffs.length;
      
      // If average interval is roughly monthly (30 days) or weekly (7 days), and price deviation is small (<15%)
      const isMonthly = averageInterval >= 25 && averageInterval <= 35;
      const isWeekly = averageInterval >= 5 && averageInterval <= 9;
      
      if ((isMonthly || isWeekly) && averageAmtDiff < 0.15) {
        const lastPaid = txs[txs.length - 1].date;
        const nextExpected = new Date(new Date(lastPaid).getTime() + (Math.round(averageInterval) * 24 * 60 * 60 * 1000));
        
        recurring.push({
          merchant,
          frequency: isMonthly ? 'Monthly' : 'Weekly',
          averageAmount: txs.reduce((sum, t) => sum + t.amount, 0) / txs.length,
          lastPaid,
          nextExpected,
          status: nextExpected > now ? 'Active' : 'Overdue'
        });
      }
    }
    
    res.json(recurring);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error detecting recurring payments' });
  }
};

// Export transactions to PDF
export const exportTransactionsPDF = async (req, res) => {
  try {
    const userId = req.user._id;
    const { month } = req.query; // format: YYYY-MM
    
    if (!month) {
      return res.status(400).json({ message: 'Month query parameter is required (Format: YYYY-MM)' });
    }
    
    const transactions = await Transaction.find({ userId }).sort({ date: -1 });
    
    // Filter transactions by requested month
    const filtered = transactions.filter(t => {
      const d = new Date(t.date);
      const mStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      return mStr === month;
    });

    if (filtered.length === 0) {
      return res.status(404).json({ message: 'No transactions found for the specified month.' });
    }
    
    generateMonthlyPDF(res, req.user, filtered, month);
  } catch (error) {
    console.error('PDF Export Error:', error.message);
    res.status(500).json({ message: error.message || 'PDF export failed' });
  }
};
