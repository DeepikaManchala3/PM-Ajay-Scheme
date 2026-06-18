import React, { useState } from 'react';
import InteractiveButton from '../../../components/InteractiveButton';

const StateHelp = () => {
    const [formData, setFormData] = useState({
        subject: '',
        category: 'Technical Issue',
        priority: 'Medium',
        message: '',
        email: '',
        phone: ''
    });
    const [tickets, setTickets] = useState([
        { id: 1, subject: 'Unable to release funds to district', category: 'Technical Issue', status: 'Resolved', date: '2025-11-20', priority: 'High' },
        { id: 2, subject: 'Question about district proposal approval', category: 'General Query', status: 'In Progress', date: '2025-11-22', priority: 'Medium' },
    ]);
    const [toast, setToast] = useState(null);
    const [errors, setErrors] = useState({});

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

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;

        const newTicket = {
            id: Date.now(),
            subject: formData.subject,
            category: formData.category,
            priority: formData.priority,
            status: 'Open',
            date: new Date().toISOString().split('T')[0]
        };

        setTickets([newTicket, ...tickets]);
        showToast('Support ticket submitted successfully! We will get back to you soon.');
        setFormData({
            subject: '',
            category: 'Technical Issue',
            priority: 'Medium',
            message: '',
            email: '',
            phone: ''
        });
        setErrors({});
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
                {/* FAQ Section - Left Box */}
                <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: 15 }}>Frequently Asked Questions</h3>
                    <div className="card" style={{ padding: 20, borderRadius: '12px' }}>
                        <details style={{ marginBottom: 15, cursor: 'pointer' }}>
                            <summary style={{ fontWeight: 600, padding: '10px', backgroundColor: '#f9f9f9', borderRadius: 6 }}>
                                How to release funds to districts?
                            </summary>
                            <p style={{ marginTop: 10, color: '#666', paddingLeft: 10, lineHeight: 1.6 }}>
                                Go to <strong>Fund Release to Districts</strong>, click the <strong>"+ Release New Funds"</strong> button, select the district and scheme component, enter the amount, officer ID, and click Confirm Release.
                            </p>
                        </details>

                        <details style={{ marginBottom: 15, cursor: 'pointer' }}>
                            <summary style={{ fontWeight: 600, padding: '10px', backgroundColor: '#f9f9f9', borderRadius: 6 }}>
                                How to approve district proposals?
                            </summary>
                            <p style={{ marginTop: 10, color: '#666', paddingLeft: 10, lineHeight: 1.6 }}>
                                Navigate to <strong>Approve District Proposals</strong>, filter by status if needed, click the blue <strong>"View"</strong> button (with eye icon) to see details, then click the green <strong>"Approve"</strong> button or red <strong>"Reject"</strong> button with appropriate reason.
                            </p>
                        </details>

                        <details style={{ marginBottom: 15, cursor: 'pointer' }}>
                            <summary style={{ fontWeight: 600, padding: '10px', backgroundColor: '#f9f9f9', borderRadius: 6 }}>
                                How to add a new District Admin?
                            </summary>
                            <p style={{ marginTop: 10, color: '#666', paddingLeft: 10, lineHeight: 1.6 }}>
                                Go to <strong>Manage District Admins</strong>, click the <strong>"+ Add New Admin"</strong> button, select the district, fill in admin details, username, password, and contact information, then click Save.
                            </p>
                        </details>

                        <details style={{ marginBottom: 15, cursor: 'pointer' }}>
                            <summary style={{ fontWeight: 600, padding: '10px', backgroundColor: '#f9f9f9', borderRadius: 6 }}>
                                How to upload Utilization Certificates?
                            </summary>
                            <p style={{ marginTop: 10, color: '#666', paddingLeft: 10, lineHeight: 1.6 }}>
                                Go to <strong>Upload Utilisation Certificates</strong>, click the <strong>"+ Upload New UC"</strong> button, select the district and component, choose the file, and click Upload.
                            </p>
                        </details>

                        <details style={{ cursor: 'pointer' }}>
                            <summary style={{ fontWeight: 600, padding: '10px', backgroundColor: '#f9f9f9', borderRadius: 6 }}>
                                How to export reports as PDF?
                            </summary>
                            <p style={{ marginTop: 10, color: '#666', paddingLeft: 10, lineHeight: 1.6 }}>
                                Go to <strong>Reports</strong>, select the report type (Financial, Progress, or UC Status), and click the <strong>"Export Report"</strong> button (with download icon). A print dialog will open where you can save as PDF.
                            </p>
                        </details>
                    </div>
                </div>

                {/* Submit Support Ticket - Right Box */}
                <div className="card" style={{ padding: '2.5rem', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)', borderRadius: '12px' }}>
                    <div style={{ marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1F2937', margin: '0 0 0.5rem 0' }}>
                            Submit Support Ticket
                        </h2>
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
                                    <option value="Bug Report">Bug Report</option>
                                    <option value="Account Issue">Account Issue</option>
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
                                    <option value="Urgent">Urgent</option>
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
                                    placeholder="your.email@mah.gov.in"
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

                        <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 10, justifyContent: 'flex-end' }}>
                            <InteractiveButton
                                variant="outline"
                                type="button"
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
                            >
                                Cancel
                            </InteractiveButton>
                            <InteractiveButton variant="primary" type="submit">
                                Submit Support Ticket
                            </InteractiveButton>
                        </div>
                    </form>
                </div>
            </div>

            {/* My Tickets Section */}
            <div>
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: 15 }}>My Support Tickets</h3>
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
                            {tickets.map(ticket => (
                                <tr key={ticket.id}>
                                    <td><strong>#{ticket.id}</strong></td>
                                    <td>{ticket.subject}</td>
                                    <td>{ticket.category}</td>
                                    <td>
                                        <span className={`badge badge-${ticket.priority === 'High' || ticket.priority === 'Urgent' ? 'error' : ticket.priority === 'Medium' ? 'warning' : 'info'}`}>
                                            {ticket.priority}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge badge-${ticket.status === 'Resolved' ? 'success' : ticket.status === 'In Progress' ? 'warning' : 'info'}`}>
                                            {ticket.status}
                                        </span>
                                    </td>
                                    <td>{ticket.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Contact Information */}
            <div style={{ marginTop: 30, padding: 20, backgroundColor: '#f9f9f9', borderRadius: 8 }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: 15 }}>Contact Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
                    <div>
                        <div style={{ fontWeight: 600, marginBottom: 5 }}>📧 Email Support</div>
                        <div style={{ color: '#666' }}>support@pmajay.gov.in</div>
                    </div>
                    <div>
                        <div style={{ fontWeight: 600, marginBottom: 5 }}>📞 Phone Support</div>
                        <div style={{ color: '#666' }}>1800-XXX-XXXX (Toll Free)</div>
                    </div>
                    <div>
                        <div style={{ fontWeight: 600, marginBottom: 5 }}>🕐 Support Hours</div>
                        <div style={{ color: '#666' }}>Mon-Fri: 9:00 AM - 6:00 PM</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StateHelp;
