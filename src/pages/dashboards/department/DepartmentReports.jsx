import React, { useState, useEffect } from 'react';
import Modal from '../../../components/Modal';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabaseClient.js';
import InteractiveButton from '../../../components/InteractiveButton';
import { Eye } from 'lucide-react';

const DepartmentReports = () => {
    const { user } = useAuth();
    const [reports, setReports] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        reportType: 'Execution',
        month: new Date().toLocaleString('default', { month: 'long' }),
        year: new Date().getFullYear(),
        description: ''
    });

    useEffect(() => {
        fetchReports();
    }, [user?.id]);

    const fetchReports = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('reports')
                .select('*')
                .eq('submitted_by', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setReports(data || []);
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), 3000);
    };

    const handleSubmit = async () => {
        console.log('Submitting report...', formData);
        if (!formData.title || !formData.description) {
            showToast('Please fill in all required fields');
            return;
        }

        if (!user || !user.id) {
            console.error('User not authenticated');
            showToast('User not authenticated');
            return;
        }

        try {
            const payload = {
                title: formData.title,
                report_type: formData.reportType,
                reporting_month: formData.month,
                reporting_year: parseInt(formData.year),
                description: formData.description,
                submitted_by: user.id
            };

            console.log('Payload:', payload);

            const { data, error } = await supabase
                .from('reports')
                .insert([payload])
                .select();

            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }

            console.log('Success:', data);
            fetchReports();
            showToast('Report submitted successfully');
            setIsModalOpen(false);
            setFormData({
                title: '',
                reportType: 'Execution',
                month: new Date().toLocaleString('default', { month: 'long' }),
                year: new Date().getFullYear(),
                description: ''
            });

        } catch (error) {
            console.error('Error submitting report:', error);
            showToast(`Error: ${error.message}`);
        }
    };

    const handleViewReport = (report) => {
        try {
            const printWindow = window.open('', '_blank');
            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>${report.title}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 40px; max-width: 900px; margin: 0 auto; }
                        .header { text-align: center; border-bottom: 3px solid #2c3e50; padding-bottom: 20px; margin-bottom: 30px; }
                        h1 { font-size: 26px; text-transform: uppercase; margin: 0; color: #2c3e50; }
                        .subtitle { color: #666; font-size: 14px; margin-top: 8px; }
                        .section { margin-bottom: 30px; }
                        .section-title { font-weight: bold; color: #2c3e50; font-size: 18px; margin-bottom: 12px; border-bottom: 2px solid #ecf0f1; padding-bottom: 8px; }
                        .info-row { display: flex; margin-bottom: 12px; line-height: 1.6; }
                        .info-label { font-weight: bold; width: 200px; color: #555; }
                        .info-value { color: #333; }
                        .description { background-color: #f9f9f9; padding: 20px; border-left: 4px solid #3498db; margin-top: 15px; line-height: 1.8; }
                        .footer { margin-top: 60px; padding-top: 20px; border-top: 2px solid #ecf0f1; text-align: center; color: #666; font-size: 12px; }
                        @media print { body { border: none; padding: 20px; } }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>${report.title}</h1>
                        <div class="subtitle">PM-AJAY Scheme - Department Report</div>
                    </div>
                    
                    <div class="section">
                        <div class="section-title">Report Information</div>
                        <div class="info-row"><div class="info-label">Report Type:</div><div class="info-value">${report.report_type}</div></div>
                        <div class="info-row"><div class="info-label">Reporting Period:</div><div class="info-value">${report.reporting_month} ${report.reporting_year}</div></div>
                        <div class="info-row"><div class="info-label">Submitted On:</div><div class="info-value">${new Date(report.created_at).toLocaleDateString('en-IN')}</div></div>
                        <div class="info-row"><div class="info-label">Report ID:</div><div class="info-value">RPT-${report.id}</div></div>
                    </div>

                    <div class="section">
                        <div class="section-title">Description & Remarks</div>
                        <div class="description">
                            ${report.description}
                        </div>
                    </div>

                    <div class="footer">
                        <p>Generated on: ${new Date().toLocaleString()}</p>
                        <p>PM-AJAY Portal - Department Dashboard</p>
                    </div>
                </body>
                </html>
            `;
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            showToast(`Opening report: ${report.title}`);
        } catch (error) {
            console.error('Error generating report view:', error);
            showToast('Error opening report');
        }
    };

    return (
        <div className="dashboard-panel" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ margin: 0 }}>Reports & Analytics</h2>
                <InteractiveButton variant="primary" onClick={() => setIsModalOpen(true)}>+ Submit New Report</InteractiveButton>
            </div>

            {toast && (
                <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'inline-block', background: '#00B894', color: '#fff', padding: '8px 12px', borderRadius: 6 }}>{toast}</div>
                </div>
            )}

            <div className="card" style={{ borderRadius: '12px' }}>
                <div className="table-wrapper">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Report Title</th>
                                <th>Type</th>
                                <th>Period</th>
                                <th>Description</th>
                                <th>Submitted On</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" style={{ textAlign: 'center' }}>Loading...</td></tr>
                            ) : reports.length > 0 ? (
                                reports.map(report => (
                                    <tr key={report.id}>
                                        <td><strong>{report.title}</strong></td>
                                        <td><span className="badge badge-primary">{report.report_type}</span></td>
                                        <td>{report.reporting_month} {report.reporting_year}</td>
                                        <td>{report.description.substring(0, 50)}...</td>
                                        <td>{new Date(report.created_at).toLocaleDateString()}</td>
                                        <td>
                                            <InteractiveButton variant="info" size="sm" onClick={() => handleViewReport(report)}>
                                                <Eye size={16} style={{ marginRight: '4px' }} />
                                                View
                                            </InteractiveButton>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: 20 }}>No reports submitted yet.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Submit New Report"
                footer={
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                        <InteractiveButton variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</InteractiveButton>
                        <InteractiveButton variant="primary" onClick={handleSubmit}>Submit Report</InteractiveButton>
                    </div>
                }
            >
                <div className="form-group" style={{ marginBottom: 15 }}>
                    <label className="form-label">Report Title</label>
                    <input
                        type="text"
                        className="form-control"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g. Monthly Progress Report - Nov 2025"
                    />
                </div>

                <div className="form-group" style={{ marginBottom: 15 }}>
                    <label className="form-label">Report Type</label>
                    <select
                        className="form-control"
                        value={formData.reportType}
                        onChange={(e) => setFormData({ ...formData, reportType: e.target.value })}
                    >
                        <option value="Execution">Execution Report</option>
                        <option value="Financial">Financial Report</option>
                        <option value="MPR">Monthly Progress Report (MPR)</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                <div className="form-group" style={{ marginBottom: 15, display: 'flex', gap: 10 }}>
                    <div style={{ flex: 1 }}>
                        <label className="form-label">Month</label>
                        <select
                            className="form-control"
                            value={formData.month}
                            onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                        >
                            {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                                <option key={m} value={m}>{m}</option>
                            ))}
                        </select>
                    </div>
                    <div style={{ flex: 1 }}>
                        <label className="form-label">Year</label>
                        <input
                            type="number"
                            className="form-control"
                            value={formData.year}
                            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                        />
                    </div>
                </div>

                <div className="form-group" style={{ marginBottom: 15 }}>
                    <label className="form-label">Description / Remarks</label>
                    <textarea
                        className="form-control"
                        rows="4"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Enter report details..."
                    ></textarea>
                </div>
            </Modal>
        </div>
    );
};

export default DepartmentReports;
