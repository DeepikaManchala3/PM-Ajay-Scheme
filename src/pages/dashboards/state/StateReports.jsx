import React, { useState } from 'react';
import InteractiveButton from '../../../components/InteractiveButton';
import { Download } from 'lucide-react';

const StateReports = () => {
    const [reportType, setReportType] = useState('Financial');
    const [toast, setToast] = useState(null);

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), 3000);
    };

    // Sample data for different report types
    const reportData = {
        'Financial': {
            title: 'State Financial Report - Maharashtra',
            summary: { totalReceived: '₹500 Cr', totalReleased: '₹420 Cr', totalUtilized: '₹350 Cr', balance: '₹150 Cr' },
            details: [
                { name: 'Pune', received: '50.00', released: '42.00', utilized: '38.00', balance: '8.00' },
                { name: 'Mumbai City', received: '60.00', released: '55.00', utilized: '50.00', balance: '5.00' },
                { name: 'Nagpur', received: '45.00', released: '38.00', utilized: '35.00', balance: '7.00' },
                { name: 'Nashik', received: '40.00', released: '35.00', utilized: '30.00', balance: '5.00' },
                { name: 'Aurangabad', received: '35.00', released: '30.00', utilized: '28.00', balance: '2.00' },
            ]
        },
        'Progress': {
            title: 'State Project Progress Report - Maharashtra',
            summary: { totalProjects: 125, completed: 45, ongoing: 65, delayed: 15 },
            details: [
                { name: 'Pune', total: 25, completed: 10, ongoing: 12, delayed: 3 },
                { name: 'Mumbai City', total: 30, completed: 15, ongoing: 12, delayed: 3 },
                { name: 'Nagpur', total: 20, completed: 8, ongoing: 10, delayed: 2 },
                { name: 'Nashik', total: 18, completed: 5, ongoing: 10, delayed: 3 },
                { name: 'Aurangabad', total: 15, completed: 5, ongoing: 8, delayed: 2 },
            ]
        },
        'UCs': {
            title: 'UC Submission Status Report - Maharashtra',
            summary: { totalRequired: 85, submitted: 72, verified: 60, pending: 13 },
            details: [
                { name: 'Pune', required: 15, submitted: 14, pending: 1, status: 'Good' },
                { name: 'Mumbai City', required: 20, submitted: 18, pending: 2, status: 'Good' },
                { name: 'Nagpur', required: 12, submitted: 10, pending: 2, status: 'Average' },
                { name: 'Nashik', required: 10, submitted: 8, pending: 2, status: 'Average' },
                { name: 'Aurangabad', required: 8, submitted: 8, pending: 0, status: 'Excellent' },
            ]
        }
    };

    const handleExportPDF = () => {
        try {
            console.log('Exporting state report:', reportType);

            const printWindow = window.open('', '_blank');
            const data = reportData[reportType];

            let reportContent = '';

            // Generate content based on report type
            if (reportType === 'Financial') {
                reportContent = `
                    <div class="section">
                        <div class="section-title">Financial Summary - Maharashtra</div>
                        <div class="summary-box">
                            ${Object.entries(data.summary).map(([key, value]) => `
                                <div class="summary-item">
                                    <div class="summary-label">${key.replace(/([A-Z])/g, ' $1').trim()}</div>
                                    <div class="summary-value">${value}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="section">
                        <div class="section-title">District-wise Financial Breakdown</div>
                        <table>
                            <thead>
                                <tr>
                                    <th>District</th>
                                    <th>Received (Cr)</th>
                                    <th>Released (Cr)</th>
                                    <th>Utilized (Cr)</th>
                                    <th>Balance (Cr)</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.details.map(row => `
                                    <tr>
                                        <td>${row.name}</td>
                                        <td>₹${row.received}</td>
                                        <td>₹${row.released}</td>
                                        <td>₹${row.utilized}</td>
                                        <td>₹${row.balance}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `;
            } else if (reportType === 'Progress') {
                reportContent = `
                    <div class="section">
                        <div class="section-title">Project Progress - Maharashtra</div>
                        <div class="summary-box">
                            ${Object.entries(data.summary).map(([key, value]) => `
                                <div class="summary-item">
                                    <div class="summary-label">${key.replace(/([A-Z])/g, ' $1').trim()}</div>
                                    <div class="summary-value">${value}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div class="section">
                        <div class="section-title">District-wise Progress Breakdown</div>
                        <table>
                            <thead>
                                <tr>
                                    <th>District</th>
                                    <th>Total Projects</th>
                                    <th>Completed</th>
                                    <th>Ongoing</th>
                                    <th>Delayed</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.details.map(row => `
                                    <tr>
                                        <td>${row.name}</td>
                                        <td>${row.total}</td>
                                        <td>${row.completed}</td>
                                        <td>${row.ongoing}</td>
                                        <td style="color: ${row.delayed > 0 ? 'red' : 'green'}">${row.delayed}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `;
            } else if (reportType === 'UCs') {
                reportContent = `
                    <div class="section">
                        <div class="section-title">Utilization Certificates Status - Maharashtra</div>
                        <div class="summary-box">
                            ${Object.entries(data.summary).map(([key, value]) => `
                                <div class="summary-item">
                                    <div class="summary-label">${key.replace(/([A-Z])/g, ' $1').trim()}</div>
                                    <div class="summary-value">${value}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div class="section">
                        <div class="section-title">District-wise UC Status</div>
                        <table>
                            <thead>
                                <tr>
                                    <th>District</th>
                                    <th>Required</th>
                                    <th>Submitted</th>
                                    <th>Pending</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.details.map(row => `
                                    <tr>
                                        <td>${row.name}</td>
                                        <td>${row.required}</td>
                                        <td>${row.submitted}</td>
                                        <td>${row.pending}</td>
                                        <td>${row.status}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `;
            }

            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>${reportType} Report - Maharashtra State</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            padding: 40px;
                            max-width: 900px;
                            margin: 0 auto;
                        }
                        .header {
                            text-align: center;
                            border-bottom: 3px solid #3498db;
                            padding-bottom: 20px;
                            margin-bottom: 30px;
                        }
                        h1 {
                            color: #2c3e50;
                            margin: 0;
                        }
                        .state-name {
                            color: #666;
                            font-size: 16px;
                            margin-top: 5px;
                        }
                        .report-type {
                            color: #3498db;
                            font-size: 18px;
                            margin-top: 10px;
                            font-weight: bold;
                        }
                        .section {
                            margin-bottom: 30px;
                        }
                        .section-title {
                            font-weight: bold;
                            color: #2c3e50;
                            font-size: 18px;
                            margin-bottom: 15px;
                            border-bottom: 2px solid #ecf0f1;
                            padding-bottom: 8px;
                        }
                        .info-row {
                            display: flex;
                            margin-bottom: 12px;
                            padding: 8px;
                            background-color: #f9f9f9;
                        }
                        .info-label {
                            font-weight: bold;
                            width: 300px;
                            color: #555;
                        }
                        .info-value {
                            color: #333;
                        }
                        table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-top: 15px;
                        }
                        th {
                            background-color: #3498db;
                            color: white;
                            padding: 12px;
                            text-align: left;
                        }
                        td {
                            padding: 10px;
                            border: 1px solid #ddd;
                        }
                        tr:nth-child(even) {
                            background-color: #f9f9f9;
                        }
                        .footer {
                            margin-top: 50px;
                            padding-top: 20px;
                            border-top: 2px solid #ecf0f1;
                            text-align: center;
                            color: #666;
                            font-size: 12px;
                        }
                        @media print {
                            body {
                                padding: 20px;
                            }
                        }
                        .summary-box { display: flex; justify-content: space-between; background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px; border: 1px solid #e9ecef; }
                        .summary-item { text-align: center; }
                        .summary-label { font-size: 14px; color: #666; margin-bottom: 5px; }
                        .summary-value { font-size: 20px; font-weight: bold; color: #2c3e50; }
                </head>
                <body>
                    <div class="header">
                        <h1>PM-AJAY Portal</h1>
                        <div class="state-name">State Dashboard - Maharashtra</div>
                        <div class="report-type">${reportType} Report</div>
                    </div>

                    ${reportContent}

                    <div class="footer">
                        <p>Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
                        <p>State Administration - Maharashtra</p>
                    </div>
                </body>
                </html>
            `;

            printWindow.document.write(htmlContent);
            printWindow.document.close();

            printWindow.onload = function () {
                printWindow.print();
            };

            showToast('PDF preview opened! Use "Save as PDF" to download.');
            console.log('PDF window opened successfully');
        } catch (error) {
            console.error('Error generating PDF:', error);
            showToast('Error generating PDF. Please try again.');
        }
    };

    return (
        <div className="dashboard-panel" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ margin: 0 }}>Reports</h2>
                <div style={{ display: 'flex', gap: 12 }}>
                    <select
                        className="form-control"
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value)}
                        style={{ width: '200px' }}
                    >
                        <option value="Financial">Financial Reports</option>
                        <option value="Progress">Progress Reports</option>
                        <option value="UCs">UC Status Reports</option>
                    </select>
                    <InteractiveButton variant="secondary" size="sm" onClick={handleExportPDF}><Download size={16} /> Export Report</InteractiveButton>
                </div>
            </div>

            {toast && (
                <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'inline-block', background: '#00B894', color: '#fff', padding: '8px 12px', borderRadius: 6 }}>{toast}</div>
                </div>
            )}

            <div className="card" style={{ padding: 20 }}>
                <h3 style={{ marginTop: 0, marginBottom: 20, borderBottom: '1px solid #eee', paddingBottom: 10 }}>
                    {reportData[reportType].title}
                </h3>

                {/* Summary Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 30 }}>
                    {Object.entries(reportData[reportType].summary).map(([key, value], index) => {
                        const colors = [
                            { bg: '#EEF2FF', text: '#4F46E5', label: '#6366F1' },
                            { bg: '#FEF3C7', text: '#D97706', label: '#F59E0B' },
                            { bg: '#ECFDF5', text: '#059669', label: '#10B981' },
                            { bg: '#EFF6FF', text: '#2563EB', label: '#3B82F6' }
                        ];
                        const color = colors[index] || colors[0];

                        return (
                            <div key={key} style={{
                                padding: 20,
                                backgroundColor: color.bg,
                                borderRadius: 12,
                                textAlign: 'center',
                                border: `1px solid ${color.bg}`,
                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                            }}>
                                <div style={{ fontSize: '13px', color: color.label, marginBottom: 8, textTransform: 'capitalize', fontWeight: '600', letterSpacing: '0.05em' }}>
                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                </div>
                                <div style={{ fontSize: '32px', fontWeight: '800', color: color.text }}>{value}</div>
                            </div>
                        );
                    })}
                </div>

                {/* Data Table */}
                <div className="table-wrapper">
                    <table className="table">
                        <thead>
                            {reportType === 'Financial' && (
                                <tr>
                                    <th>District</th>
                                    <th>Received (Cr)</th>
                                    <th>Released (Cr)</th>
                                    <th>Utilized (Cr)</th>
                                    <th>Balance (Cr)</th>
                                </tr>
                            )}
                            {reportType === 'Progress' && (
                                <tr>
                                    <th>District</th>
                                    <th>Total Projects</th>
                                    <th>Completed</th>
                                    <th>Ongoing</th>
                                    <th>Delayed</th>
                                </tr>
                            )}
                            {reportType === 'UCs' && (
                                <tr>
                                    <th>District</th>
                                    <th>Required</th>
                                    <th>Submitted</th>
                                    <th>Pending</th>
                                    <th>Status</th>
                                </tr>
                            )}
                        </thead>
                        <tbody>
                            {reportData[reportType].details.map((row, index) => (
                                <tr key={index}>
                                    <td><strong>{row.name}</strong></td>
                                    {reportType === 'Financial' && (
                                        <>
                                            <td>₹{row.received}</td>
                                            <td>₹{row.released}</td>
                                            <td>₹{row.utilized}</td>
                                            <td>₹{row.balance}</td>
                                        </>
                                    )}
                                    {reportType === 'Progress' && (
                                        <>
                                            <td>{row.total}</td>
                                            <td>{row.completed}</td>
                                            <td>{row.ongoing}</td>
                                            <td style={{ color: row.delayed > 0 ? 'red' : 'inherit', fontWeight: row.delayed > 0 ? 'bold' : 'normal' }}>{row.delayed}</td>
                                        </>
                                    )}
                                    {reportType === 'UCs' && (
                                        <>
                                            <td>{row.required}</td>
                                            <td>{row.submitted}</td>
                                            <td>{row.pending}</td>
                                            <td>
                                                <span className={`badge badge-${row.status === 'Excellent' || row.status === 'Good' ? 'success' : row.status === 'Average' ? 'warning' : 'error'}`}>
                                                    {row.status}
                                                </span>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StateReports;
