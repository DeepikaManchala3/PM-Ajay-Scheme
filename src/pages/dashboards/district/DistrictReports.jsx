import React, { useState } from 'react';
import InteractiveButton from '../../../components/InteractiveButton';

import { Download } from 'lucide-react';

const DistrictReports = () => {
    const [reportType, setReportType] = useState('Financial');
    const [toast, setToast] = useState(null);

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), 3000);
    };

    // Sample Data for Reports
    const reportData = {
        'Financial': {
            title: 'District Financial Report - Pune',
            summary: { totalAllocated: '₹50.00 Cr', totalReleased: '₹35.50 Cr', totalUtilized: '₹28.75 Cr', balance: '₹6.75 Cr' },
            details: [
                { gp: 'Shirur', allocated: '5.00', released: '3.50', utilized: '3.00', pending: '0.50' },
                { gp: 'Khed', allocated: '4.50', released: '3.00', utilized: '2.50', pending: '0.50' },
                { gp: 'Baramati', allocated: '6.00', released: '5.00', utilized: '4.80', pending: '0.20' },
                { gp: 'Haveli', allocated: '4.00', released: '2.50', utilized: '2.00', pending: '0.50' },
                { gp: 'Mulshi', allocated: '3.50', released: '2.00', utilized: '1.50', pending: '0.50' },
            ]
        },
        'Progress': {
            title: 'District Project Progress Report - Pune',
            summary: { totalProjects: 145, completed: 85, ongoing: 40, delayed: 20 },
            details: [
                { gp: 'Shirur', total: 20, completed: 12, ongoing: 5, delayed: 3 },
                { gp: 'Khed', total: 18, completed: 10, ongoing: 6, delayed: 2 },
                { gp: 'Baramati', total: 25, completed: 18, ongoing: 5, delayed: 2 },
                { gp: 'Haveli', total: 15, completed: 8, ongoing: 4, delayed: 3 },
                { gp: 'Mulshi', total: 12, completed: 6, ongoing: 4, delayed: 2 },
            ]
        },
        'UCs': {
            title: 'UC Submission Status Report - Pune',
            summary: { totalDue: 50, submitted: 35, pending: 15, verified: 30 },
            details: [
                { gp: 'Shirur', due: 5, submitted: 4, pending: 1, status: 'Good' },
                { gp: 'Khed', due: 4, submitted: 3, pending: 1, status: 'Average' },
                { gp: 'Baramati', due: 6, submitted: 6, pending: 0, status: 'Excellent' },
                { gp: 'Haveli', due: 4, submitted: 2, pending: 2, status: 'Poor' },
                { gp: 'Mulshi', due: 3, submitted: 2, pending: 1, status: 'Average' },
            ]
        }
    };

    const handleExportPDF = () => {
        const data = reportData[reportType];
        try {
            const printWindow = window.open('', '_blank');

            let tableHeaders = '';
            let tableRows = '';

            if (reportType === 'Financial') {
                tableHeaders = '<th>Gram Panchayat</th><th>Allocated (Cr)</th><th>Released (Cr)</th><th>Utilized (Cr)</th><th>Pending UC (Cr)</th>';
                tableRows = data.details.map(row => `
                    <tr>
                        <td>${row.gp}</td>
                        <td>₹${row.allocated}</td>
                        <td>₹${row.released}</td>
                        <td>₹${row.utilized}</td>
                        <td>₹${row.pending}</td>
                    </tr>
                `).join('');
            } else if (reportType === 'Progress') {
                tableHeaders = '<th>Gram Panchayat</th><th>Total Projects</th><th>Completed</th><th>Ongoing</th><th>Delayed</th>';
                tableRows = data.details.map(row => `
                    <tr>
                        <td>${row.gp}</td>
                        <td>${row.total}</td>
                        <td>${row.completed}</td>
                        <td>${row.ongoing}</td>
                        <td style="color: ${row.delayed > 0 ? 'red' : 'green'}">${row.delayed}</td>
                    </tr>
                `).join('');
            } else {
                tableHeaders = '<th>Gram Panchayat</th><th>UCs Due</th><th>Submitted</th><th>Pending</th><th>Performance</th>';
                tableRows = data.details.map(row => `
                    <tr>
                        <td>${row.gp}</td>
                        <td>${row.due}</td>
                        <td>${row.submitted}</td>
                        <td>${row.pending}</td>
                        <td><span class="badge badge-${row.status === 'Excellent' || row.status === 'Good' ? 'success' : row.status === 'Average' ? 'warning' : 'error'}">${row.status}</span></td>
                    </tr>
                `).join('');
            }

            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>${data.title}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 40px; }
                        h1 { text-align: center; color: #2c3e50; margin-bottom: 10px; }
                        .subtitle { text-align: center; color: #666; margin-bottom: 30px; }
                        .summary-box { display: flex; justify-content: space-between; background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px; border: 1px solid #e9ecef; }
                        .summary-item { text-align: center; }
                        .summary-label { font-size: 14px; color: #666; margin-bottom: 5px; }
                        .summary-value { font-size: 20px; font-weight: bold; color: #2c3e50; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                        th { background-color: #3498db; color: white; }
                        tr:nth-child(even) { background-color: #f9f9f9; }
                        .footer { margin-top: 50px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #ddd; padding-top: 20px; }
                        .badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
                        .badge-success { background-color: #d4edda; color: #155724; }
                        .badge-warning { background-color: #fff3cd; color: #856404; }
                        .badge-error { background-color: #f8d7da; color: #721c24; }
                    </style>
                </head>
                <body>
                    <h1>${data.title}</h1>
                    <div class="subtitle">Generated on: ${new Date().toLocaleDateString()}</div>

                    <div class="summary-box">
                        ${Object.entries(data.summary).map(([key, value]) => `
                            <div class="summary-item">
                                <div class="summary-label">${key.replace(/([A-Z])/g, ' $1').trim()}</div>
                                <div class="summary-value">${value}</div>
                            </div>
                        `).join('')}
                    </div>

                    <table>
                        <thead>
                            <tr>${tableHeaders}</tr>
                        </thead>
                        <tbody>${tableRows}</tbody>
                    </table>

                    <div class="footer">
                        <p>This is an official report generated from PM-AJAY District Dashboard.</p>
                    </div>
                </body>
                </html>
            `;

            printWindow.document.write(htmlContent);
            printWindow.document.close();
            printWindow.onload = function () { printWindow.print(); };
            showToast('Report generated successfully!');
        } catch (error) {
            console.error('Error generating PDF:', error);
            showToast('Error generating report');
        }
    };

    return (
        <div className="dashboard-panel" style={{ padding: '0px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ margin: 0 }}>Reports & Analytics</h3>
                <div style={{ display: 'flex', gap: 12 }}>
                    <select
                        className="form-control"
                        style={{ width: '200px' }}
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value)}
                    >
                        <option value="Financial">Financial Report</option>
                        <option value="Progress">Project Progress</option>
                        <option value="UCs">UC Status Report</option>
                    </select>
                    <InteractiveButton variant="secondary" size="sm" onClick={handleExportPDF}><Download size={16} /> Export Report</InteractiveButton>
                </div>
            </div>

            {toast && (
                <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'inline-block', background: '#00B894', color: '#fff', padding: '8px 12px', borderRadius: 6 }}>{toast}</div>
                </div>
            )}

            {/* Report Preview */}
            <div className="card" style={{ padding: 20 }}>
                <h3 style={{ marginTop: 0, marginBottom: 20, borderBottom: '1px solid #eee', paddingBottom: 10 }}>
                    {reportData[reportType].title}
                </h3>

                {/* Summary Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 30 }}>
                    {Object.entries(reportData[reportType].summary).map(([key, value], index) => {
                        const colors = [
                            { bg: '#EEF2FF', text: '#4F46E5', label: '#6366F1' },  // Purple for Total Allocated
                            { bg: '#FEF3C7', text: '#D97706', label: '#F59E0B' },  // Amber for Total Released
                            { bg: '#ECFDF5', text: '#059669', label: '#10B981' },  // Green for Total Utilized
                            { bg: '#EFF6FF', text: '#2563EB', label: '#3B82F6' }   // Blue for Balance
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
                                    <th>Gram Panchayat</th>
                                    <th>Allocated (Cr)</th>
                                    <th>Released (Cr)</th>
                                    <th>Utilized (Cr)</th>
                                    <th>Pending (Cr)</th>
                                </tr>
                            )}
                            {reportType === 'Progress' && (
                                <tr>
                                    <th>Gram Panchayat</th>
                                    <th>Total Projects</th>
                                    <th>Completed</th>
                                    <th>Ongoing</th>
                                    <th>Delayed</th>
                                </tr>
                            )}
                            {reportType === 'UCs' && (
                                <tr>
                                    <th>Gram Panchayat</th>
                                    <th>UCs Due</th>
                                    <th>Submitted</th>
                                    <th>Pending</th>
                                    <th>Status</th>
                                </tr>
                            )}
                        </thead>
                        <tbody>
                            {reportData[reportType].details.map((row, index) => (
                                <tr key={index}>
                                    <td><strong>{row.gp}</strong></td>
                                    {reportType === 'Financial' && (
                                        <>
                                            <td>₹{row.allocated}</td>
                                            <td>₹{row.released}</td>
                                            <td>₹{row.utilized}</td>
                                            <td>₹{row.pending}</td>
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
                                            <td>{row.due}</td>
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

export default DistrictReports;
