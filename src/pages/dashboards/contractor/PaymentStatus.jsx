import React, { useState } from 'react';
import InteractiveButton from '../../../components/InteractiveButton';
import { Download } from 'lucide-react';

const PaymentStatus = () => {
    const [payments, setPayments] = useState([
        { id: 1, workId: 'WO-101', title: 'Community Hall Foundation', amount: '₹15,00,000', date: '2025-10-15', status: 'Paid', transactionId: 'TXN123456' },
        { id: 2, workId: 'WO-101', title: 'Community Hall Walls', amount: '₹10,00,000', date: '2025-11-20', status: 'Pending', transactionId: '-' },
        { id: 3, workId: 'WO-103', title: 'Solar Lights Supply', amount: '₹25,00,000', date: '2025-11-05', status: 'Paid', transactionId: 'TXN789012' },
    ]);

    const [toast, setToast] = useState(null);

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), 3000);
    };

    const handleDownloadInvoice = (payment) => {
        try {
            const printWindow = window.open('', '_blank');
            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Invoice - ${payment.workId}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
                        .invoice-header { text-align: center; margin-bottom: 40px; border-bottom: 3px solid #2c3e50; padding-bottom: 20px; }
                        .invoice-header h1 { margin: 0; color: #2c3e50; font-size: 32px; }
                        .invoice-header p { margin: 5px 0; color: #666; }
                        .invoice-details { display: flex; justify-content: space-between; margin-bottom: 30px; }
                        .detail-section { width: 48%; }
                        .detail-section h3 { color: #2c3e50; font-size: 16px; margin-bottom: 12px; border-bottom: 2px solid #ecf0f1; padding-bottom: 5px; }
                        .detail-row { display: flex; margin-bottom: 8px; }
                        .detail-label { font-weight: bold; width: 150px; color: #555; }
                        .detail-value { color: #333; }
                        .invoice-table { width: 100%; border-collapse: collapse; margin: 30px 0; }
                        .invoice-table th, .invoice-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                        .invoice-table th { background-color: #2c3e50; color: white; }
                        .total-section { text-align: right; margin-top: 20px; }
                        .total-amount { font-size: 24px; font-weight: bold; color: #2c3e50; }
                        .status-badge { display: inline-block; padding: 5px 15px; border-radius: 20px; font-weight: bold; }
                        .status-paid { background-color: #d4edda; color: #155724; }
                        .status-pending { background-color: #fff3cd; color: #856404; }
                        .footer { margin-top: 50px; padding-top: 20px; border-top: 2px solid #ecf0f1; text-align: center; color: #666; font-size: 12px; }
                        @media print { body { padding: 20px; } }
                    </style>
                </head>
                <body>
                    <div class="invoice-header">
                        <h1>PAYMENT INVOICE</h1>
                        <p>PM-AJAY Scheme Implementation</p>
                        <p>Contractor Payment Record</p>
                    </div>

                    <div class="invoice-details">
                        <div class="detail-section">
                            <h3>Work Details</h3>
                            <div class="detail-row"><div class="detail-label">Work Order ID:</div><div class="detail-value">${payment.workId}</div></div>
                            <div class="detail-row"><div class="detail-label">Description:</div><div class="detail-value">${payment.title}</div></div>
                            <div class="detail-row"><div class="detail-label">Invoice Date:</div><div class="detail-value">${payment.date}</div></div>
                        </div>
                        <div class="detail-section">
                            <h3>Payment Information</h3>
                            <div class="detail-row"><div class="detail-label">Payment Status:</div><div class="detail-value"><span class="status-badge status-${payment.status.toLowerCase()}">${payment.status}</span></div></div>
                            <div class="detail-row"><div class="detail-label">Transaction ID:</div><div class="detail-value">${payment.transactionId}</div></div>
                            <div class="detail-row"><div class="detail-label">Invoice #:</div><div class="detail-value">INV-${payment.id}-${new Date().getFullYear()}</div></div>
                        </div>
                    </div>

                    <table class="invoice-table">
                        <thead>
                            <tr>
                                <th>S.No</th>
                                <th>Description</th>
                                <th>Quantity</th>
                                <th>Rate</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>1</td>
                                <td>${payment.title}</td>
                                <td>1 Unit</td>
                                <td>${payment.amount}</td>
                                <td>${payment.amount}</td>
                            </tr>
                        </tbody>
                    </table>

                    <div class="total-section">
                        <p style="margin: 5px 0;">Subtotal: ${payment.amount}</p>
                        <p style="margin: 5px 0;">Tax (GST 18%): ₹0</p>
                        <p class="total-amount">Total Amount: ${payment.amount}</p>
                    </div>

                    <div class="footer">
                        <p>This is a computer-generated invoice and does not require a signature.</p>
                        <p>Generated on: ${new Date().toLocaleString()}</p>
                        <p>PM-AJAY Portal - Contractor Payment Management System</p>
                    </div>
                </body>
                </html>
            `;
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            showToast(`Invoice generated for ${payment.workId}`);
        } catch (error) {
            console.error('Error generating invoice:', error);
            showToast('Error generating invoice');
        }
    };

    return (
        <div className="dashboard-panel" style={{ padding: 20 }}>
            <div style={{ marginBottom: 20 }}>
                <h2 style={{ margin: 0 }}>Payment Status & History</h2>
            </div>

            {toast && (
                <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'inline-block', background: '#00B894', color: '#fff', padding: '8px 12px', borderRadius: 6 }}>{toast}</div>
                </div>
            )}

            <div className="table-wrapper">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Work ID</th>
                            <th>Description</th>
                            <th>Amount</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Transaction ID</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments.map(payment => (
                            <tr key={payment.id}>
                                <td><strong>{payment.workId}</strong></td>
                                <td>{payment.title}</td>
                                <td>{payment.amount}</td>
                                <td>{payment.date}</td>
                                <td>
                                    <span className={`badge badge-${payment.status === 'Paid' ? 'success' : 'warning'}`}>
                                        {payment.status}
                                    </span>
                                </td>
                                <td>{payment.transactionId}</td>
                                <td>
                                    <InteractiveButton
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => handleDownloadInvoice(payment)}
                                    >
                                        <Download size={16} style={{ marginRight: 'var(--space-1)' }} />
                                        Invoice
                                    </InteractiveButton>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PaymentStatus;
