import PDFDocument from 'pdfkit';

export const generateMonthlyPDF = (res, user, transactions, month) => {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  
  // Set headers
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=SmartSpend-${month}-Report.pdf`);
  
  doc.pipe(res);
  
  // Header section
  doc.fillColor('#4f46e5').fontSize(26).text('SmartSpend Finance Report', { align: 'left' });
  doc.fillColor('#64748b').fontSize(11).text(`Generated for ${user.name} on ${new Date().toLocaleDateString('en-IN')}`, { align: 'left' });
  doc.moveDown(2);
  
  // Calculate summary metrics
  const totalDebit = transactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0);
  const totalCredit = transactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0);
  const netSavings = totalCredit - totalDebit;
  
  // Metrics container card
  doc.rect(50, doc.y, 500, 80).fill('#f8fafc');
  
  // Draw card border
  doc.strokeColor('#e2e8f0').lineWidth(1).rect(50, doc.y - 80, 500, 80).stroke();
  
  // Text inside card
  doc.fillColor('#0f172a').fontSize(12).text(`Summary for Month: ${month}`, 70, doc.y - 65);
  doc.fontSize(10).fillColor('#64748b');
  doc.text(`Total Spending: `, 70, doc.y - 45);
  doc.fillColor('#ef4444').text(`Rs. ${totalDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 160, doc.y - 45);
  
  doc.fillColor('#64748b').text(`Total Earnings: `, 70, doc.y - 30);
  doc.fillColor('#22c55e').text(`Rs. ${totalCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 160, doc.y - 30);
  
  doc.fillColor('#64748b').text(`Net Savings: `, 300, doc.y - 45);
  doc.fillColor(netSavings >= 0 ? '#22c55e' : '#ef4444')
     .text(`Rs. ${netSavings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 380, doc.y - 45);
  
  doc.moveDown(3);
  
  // Table Section
  doc.fillColor('#4f46e5').fontSize(14).text('Transaction History', 50, doc.y);
  doc.moveDown(0.5);
  
  // Table Headers
  doc.strokeColor('#cbd5e1').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown(0.4);
  
  let currentY = doc.y;
  doc.fontSize(9).fillColor('#475569');
  doc.text('Date', 50, currentY);
  doc.text('Bank', 120, currentY);
  doc.text('Merchant', 180, currentY);
  doc.text('Category', 340, currentY);
  doc.text('Amount (INR)', 440, currentY, { width: 110, align: 'right' });
  doc.moveDown(0.4);
  
  doc.strokeColor('#cbd5e1').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown(0.4);
  
  // Table rows
  transactions.forEach((tx) => {
    // Page overflow handler
    if (doc.y > 750) {
      doc.addPage();
      currentY = 50;
      doc.fontSize(9).fillColor('#475569');
      doc.text('Date', 50, currentY);
      doc.text('Bank', 120, currentY);
      doc.text('Merchant', 180, currentY);
      doc.text('Category', 340, currentY);
      doc.text('Amount (INR)', 440, currentY, { width: 110, align: 'right' });
      doc.moveDown(0.4);
      doc.strokeColor('#cbd5e1').moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.4);
    }
    
    const formattedDate = new Date(tx.date).toLocaleDateString('en-IN');
    const displayMerchant = tx.merchant.length > 24 ? tx.merchant.substring(0, 22) + '..' : tx.merchant;
    const isDebit = tx.type === 'debit';
    
    currentY = doc.y;
    doc.fillColor('#0f172a');
    doc.text(formattedDate, 50, currentY);
    doc.text(tx.bankName, 120, currentY);
    doc.text(displayMerchant, 180, currentY);
    doc.text(tx.category || 'Uncategorized', 340, currentY);
    
    doc.fillColor(isDebit ? '#ef4444' : '#22c55e');
    const amountText = `${isDebit ? '-' : '+'} Rs. ${tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    doc.text(amountText, 440, currentY, { width: 110, align: 'right' });
    doc.moveDown(0.8);
  });
  
  // Footer
  doc.end();
};
