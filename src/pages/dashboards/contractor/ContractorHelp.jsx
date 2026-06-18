import React, { useState } from 'react';
import InteractiveButton from '../../../components/InteractiveButton';
import { Send } from 'lucide-react';

const ContractorHelp = () => {
    const [formData, setFormData] = useState({
        subject: '',
        category: 'Payment Issue',
        priority: 'Medium',
        message: '',
        email: '',
        phone: ''
    });
    const [tickets, setTickets] = useState([
        { id: 1, subject: 'Payment Delay for WO-101', category: 'Payment Issue', status: 'Open', date: '2025-11-24', priority: 'High' },
    ]);
    const [toast, setToast] = useState(null);

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), 3000);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.subject || !formData.message) return;

        const newTicket = {
            id: Date.now(),
            subject: formData.subject,
            category: formData.category,
            priority: formData.priority,
            status: 'Open',
            date: new Date().toISOString().split('T')[0]
        };

        setTickets([newTicket, ...tickets]);
        showToast('Support ticket submitted successfully!');
        setFormData({
            subject: '',
            category: 'Payment Issue',
            priority: 'Medium',
            message: '',
            email: '',
            phone: ''
        });
    };

    return (
        <div className="dashboard-panel" style={{ padding: 20 }}>
            <div style={{ marginBottom: 20 }}>
                <h2 style={{ margin: 0 }}>Help & Support</h2>
                <p style={{ color: '#666', fontSize: '14px', marginTop: '5px' }}>Contact department for issues related to works or payments</p>
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
                                How to upload site photos?
                            </summary>
                            <p style={{ marginTop: 10, color: '#666', paddingLeft: 10, lineHeight: 1.6 }}>
                                Go to <strong>Update Progress</strong>, select the specific work order, click the <strong>"Upload Photos"</strong> button, choose your site images, and click Submit.
                            </p>
                        </details>

                        <details style={{ marginBottom: 15, cursor: 'pointer' }}>
                            <summary style={{ fontWeight: 600, padding: '10px', backgroundColor: '#f9f9f9', borderRadius: 6 }}>
                                How to check payment status?
                            </summary>
                            <p style={{ marginTop: 10, color: '#666', paddingLeft: 10, lineHeight: 1.6 }}>
                                Navigate to the <strong>Payment Status</strong> tab. You will see a list of all your claims and their current status (e.g., Pending, Approved, Released).
                            </p>
                        </details>

                        <details style={{ marginBottom: 15, cursor: 'pointer' }}>
                            <summary style={{ fontWeight: 600, padding: '10px', backgroundColor: '#f9f9f9', borderRadius: 6 }}>
                                How to raise an issue?
                            </summary>
                            <p style={{ marginTop: 10, color: '#666', paddingLeft: 10, lineHeight: 1.6 }}>
                                Use the <strong>Submit Issue</strong> form on the right side of this page. Select the category (Payment, Site, etc.), describe the problem, and click Submit Ticket.
                            </p>
                        </details>

                        <details style={{ marginBottom: 15, cursor: 'pointer' }}>
                            <summary style={{ fontWeight: 600, padding: '10px', backgroundColor: '#f9f9f9', borderRadius: 6 }}>
                                How to view assigned works?
                            </summary>
                            <p style={{ marginTop: 10, color: '#666', paddingLeft: 10, lineHeight: 1.6 }}>
                                Go to the <strong>Assigned Works</strong> section to view a complete list of projects allocated to you, along with their details and status.
                            </p>
                        </details>
                    </div>
                </div>

                {/* Submit Issue Form - Right Box */}
                <div className="card" style={{ padding: '2.5rem', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)', borderRadius: '12px' }}>
                    <div style={{ marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1F2937', margin: '0 0 0.5rem 0' }}>
                            Submit Support Ticket
                        </h2>
                        <p style={{ color: '#6B7280', fontSize: '0.875rem', margin: 0 }}>
                            Report issues related to payments, site conditions, or materials.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Subject</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Brief description of issue"
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div className="form-group">
                                <label className="form-label">Category</label>
                                <select
                                    className="form-control"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option value="Payment Issue">Payment Issue</option>
                                    <option value="Site Issue">Site Issue</option>
                                    <option value="Material Shortage">Material Shortage</option>
                                    <option value="Other">Other</option>
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
                            <label className="form-label">Description</label>
                            <textarea
                                className="form-control"
                                rows="4"
                                placeholder="Describe your issue in detail..."
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    placeholder="your.email@agency.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
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
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 12, marginTop: 20, justifyContent: 'flex-end' }}>
                            <InteractiveButton
                                type="button"
                                variant="outline"
                                onClick={() => setFormData({
                                    subject: '',
                                    category: 'Payment Issue',
                                    priority: 'Medium',
                                    message: '',
                                    email: '',
                                    phone: ''
                                })}
                                style={{ borderColor: '#FF9933', color: '#FF9933', minWidth: '120px' }}
                            >
                                Cancel
                            </InteractiveButton>
                            <InteractiveButton
                                type="submit"
                                variant="saffron"
                                style={{ minWidth: '200px' }}
                            >
                                Submit Support Ticket
                            </InteractiveButton>
                        </div>
                    </form>
                </div>
            </div>

            {/* My Tickets Section */}
            <div>
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: 15 }}>My Tickets</h3>
                <div className="card" style={{ borderRadius: '12px' }}>
                    <div className="table-wrapper">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Subject</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tickets.map(ticket => (
                                    <tr key={ticket.id}>
                                        <td><strong>#{ticket.id}</strong></td>
                                        <td>{ticket.subject}</td>
                                        <td>
                                            <span className={`badge badge-${ticket.status === 'Resolved' ? 'success' : 'warning'}`}>
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
            </div>
        </div>
    );
};

export default ContractorHelp;
