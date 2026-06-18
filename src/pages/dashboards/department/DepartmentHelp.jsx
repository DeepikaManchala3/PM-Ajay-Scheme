import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabaseClient';
import InteractiveButton from '../../../components/InteractiveButton';

const DepartmentHelp = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        subject: '',
        category: 'Technical Issue',
        priority: 'Medium',
        message: '',
        email: '',
        phone: ''
    });
    const [tickets, setTickets] = useState([]);
    const [toast, setToast] = useState(null);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchTickets();
    }, [user?.id]);

    const fetchTickets = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('support_tickets')
                .select('*')
                .eq('submitted_by', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTickets(data || []);
        } catch (error) {
            console.error('Error fetching tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), 3000);
    };

    const validate = () => {
        const errs = {};
        if (!formData.subject.trim()) errs.subject = 'Please enter a subject.';
        if (!formData.message.trim()) errs.message = 'Please describe your issue.';
        if (!formData.email.trim()) errs.email = 'Please enter your email.';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = 'Please enter a valid email.';
        if (!formData.phone.trim()) errs.phone = 'Please enter your phone number.';
        else if (!/^[0-9]{10}$/.test(formData.phone)) errs.phone = 'Please enter a valid 10-digit phone number.';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) {
            showToast('Please fill in all required fields');
            return;
        }

        if (!user || !user.id) {
            showToast('User not authenticated');
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                subject: formData.subject,
                category: formData.category,
                priority: formData.priority,
                message: formData.message,
                email: formData.email,
                phone: formData.phone,
                status: 'Open',
                submitted_by: user.id
            };

            const { data, error } = await supabase
                .from('support_tickets')
                .insert([payload])
                .select();

            if (error) throw error;

            fetchTickets();
            showToast('Support ticket submitted successfully!');
            setFormData({
                subject: '',
                category: 'Technical Issue',
                priority: 'Medium',
                message: '',
                email: '',
                phone: ''
            });
            setErrors({});
        } catch (error) {
            console.error('Error submitting ticket:', error);
            showToast(`Error: ${error.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="dashboard-panel" style={{ padding: 20 }}>
            <div style={{ marginBottom: 20 }}>
                <h2 style={{ margin: 0 }}>Help & Support</h2>
                <p style={{ color: '#666', fontSize: '14px', marginTop: '5px' }}>Get help with PM-AJAY Portal or submit a support ticket</p>
            </div>

            {toast && (
                <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'inline-block', background: '#00B894', color: '#fff', padding: '8px 12px', borderRadius: 6 }}>{toast}</div>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 30 }}>
                {/* FAQ Section */}
                <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: 15 }}>Frequently Asked Questions</h3>
                    <div className="card" style={{ padding: 20, borderRadius: '12px' }}>
                        <details style={{ marginBottom: 15, cursor: 'pointer' }}>
                            <summary style={{ fontWeight: 600, padding: '10px', backgroundColor: '#f9f9f9', borderRadius: 6 }}>
                                How to upload a DPR?
                            </summary>
                            <p style={{ marginTop: 10, color: '#666', paddingLeft: 10, lineHeight: 1.6 }}>
                                Go to <strong>DPR Upload</strong>, click <strong>"+ Upload New DPR"</strong>, fill in the project details, attach the PDF file, and click Upload.
                            </p>
                        </details>

                        <details style={{ marginBottom: 15, cursor: 'pointer' }}>
                            <summary style={{ fontWeight: 600, padding: '10px', backgroundColor: '#f9f9f9', borderRadius: 6 }}>
                                How to update work order status?
                            </summary>
                            <p style={{ marginTop: 10, color: '#666', paddingLeft: 10, lineHeight: 1.6 }}>
                                Go to <strong>Work Orders</strong>, find the relevant order, and click <strong>"Update"</strong> to change the status or add progress details.
                            </p>
                        </details>

                        <details style={{ cursor: 'pointer' }}>
                            <summary style={{ fontWeight: 600, padding: '10px', backgroundColor: '#f9f9f9', borderRadius: 6 }}>
                                How to export reports?
                            </summary>
                            <p style={{ marginTop: 10, color: '#666', paddingLeft: 10, lineHeight: 1.6 }}>
                                Go to <strong>Reports</strong>, select the report type (Execution or Financial), and click <strong>"📥 Export Report"</strong> to download as PDF.
                            </p>
                        </details>
                    </div>
                </div>

                {/* Contact Support Form */}
                <div className="card" style={{ padding: '2.5rem', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)', borderRadius: '12px' }}>
                    <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1F2937', margin: '0 0 0.5rem 0' }}>Submit Support Ticket</h3>

                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Subject</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Brief description of your issue"
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            />
                            {errors.subject && <div className="form-error">{errors.subject}</div>}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div className="form-group">
                                <label className="form-label">Category</label>
                                <select
                                    className="form-control"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option value="Technical Issue">Technical Issue</option>
                                    <option value="General Query">General Query</option>
                                    <option value="Feature Request">Feature Request</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Priority</label>
                                <select
                                    className="form-control"
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Detailed Description</label>
                            <textarea
                                className="form-control"
                                rows="4"
                                placeholder="Please describe your issue in detail..."
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            />
                            {errors.message && <div className="form-error">{errors.message}</div>}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    placeholder="your.email@dept.gov.in"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                                {errors.email && <div className="form-error">{errors.email}</div>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Phone</label>
                                <input
                                    type="tel"
                                    className="form-control"
                                    placeholder="9876543210"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                                {errors.phone && <div className="form-error">{errors.phone}</div>}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 12, marginTop: 20, justifyContent: 'flex-end' }}>
                            <InteractiveButton
                                variant="outline"
                                onClick={() => {
                                    setFormData({
                                        subject: '',
                                        category: 'Technical Issue',
                                        priority: 'Medium',
                                        message: '',
                                        email: '',
                                        phone: ''
                                    });
                                    setErrors({});
                                }}
                                style={{ borderColor: '#FF9933', color: '#FF9933', minWidth: '120px' }}
                            >
                                Cancel
                            </InteractiveButton>
                            <InteractiveButton
                                variant="saffron"
                                onClick={handleSubmit}
                                style={{ opacity: submitting ? 0.7 : 1, minWidth: '200px' }}
                                disabled={submitting}
                            >
                                {submitting ? 'Submitting...' : 'Submit Support Ticket'}
                            </InteractiveButton>
                        </div>
                    </form>
                </div>
            </div>

            {/* My Tickets Section */}
            <div>
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: 15 }}>My Support Tickets</h3>
                <div className="card" style={{ borderRadius: '12px' }}>
                    <div className="table-wrapper">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Ticket ID</th>
                                    <th>Subject</th>
                                    <th>Category</th>
                                    <th>Priority</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="6" style={{ textAlign: 'center' }}>Loading...</td></tr>
                                ) : tickets.length > 0 ? (
                                    tickets.map(ticket => (
                                        <tr key={ticket.id}>
                                            <td><strong>#{ticket.id.substring(0, 8)}</strong></td>
                                            <td>{ticket.subject}</td>
                                            <td>{ticket.category}</td>
                                            <td>
                                                <span className={`badge badge-${ticket.priority === 'High' ? 'danger' : ticket.priority === 'Medium' ? 'warning' : 'info'}`}>
                                                    {ticket.priority}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge badge-${ticket.status === 'Resolved' ? 'success' : 'warning'}`}>
                                                    {ticket.status}
                                                </span>
                                            </td>
                                            <td>{new Date(ticket.created_at).toLocaleDateString()}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: 20 }}>No support tickets submitted yet.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DepartmentHelp;
