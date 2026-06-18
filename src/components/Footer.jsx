import React from 'react';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-section">
                        <h3>About PM-AJAY</h3>
                        <p style={{ color: '#f1f1f1', fontSize: 'var(--text-sm)' }}>
                            PM-AJAY is a comprehensive scheme for the welfare and empowerment of Scheduled Castes,
                            focusing on Adarsh Gram, Grant-in-Aid, and Hostel components.
                        </p>
                        <div className="header-logos">
                            <img src="/logos/logo-amrit.png" alt="PM-AJAY" className="logo-emblem" />
                        </div>
                    </div>

                    <div className="footer-section">
                        <h3>Quick Links</h3>
                        <ul>
                            <li><a href="https://socialjustice.gov.in" target="_blank" rel="noopener noreferrer">Ministry Website</a></li>
                            <li><a href="#">Scheme Guidelines</a></li>
                            <li><a href="#">FAQs</a></li>
                            <li><a href="#">Contact Us</a></li>
                            <li><a href="#">Grievance Redressal</a></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h3>Important Links</h3>
                        <ul>
                            <li><a href="https://india.gov.in" target="_blank" rel="noopener noreferrer">National Portal of India</a></li>
                            <li><a href="https://digitalindia.gov.in" target="_blank" rel="noopener noreferrer">Digital India</a></li>
                            <li><a href="https://mygov.in" target="_blank" rel="noopener noreferrer">MyGov</a></li>
                            <li><a href="#">RTI</a></li>
                            <li><a href="#">Privacy Policy</a></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h3>Contact Information</h3>
                        <ul style={{ listStyle: 'none' }}>
                            <li style={{ color: '#f1f1f1', marginBottom: 'var(--space-2)' }}>
                                📧 Email: pmajay@mosje.gov.in
                            </li>
                            <li style={{ color: '#f1f1f1', marginBottom: 'var(--space-2)' }}>
                                📞 Helpline: 1800-XXX-XXXX
                            </li>
                            <li style={{ color: '#f1f1f1', marginBottom: 'var(--space-2)' }}>
                                📍 Ministry of Social Justice & Empowerment<br />
                                Shastri Bhawan, New Delhi - 110001
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">

                    <p style={{ color: '#f1f1f1' }}>
                        © 2025 Ministry of Social Justice & Empowerment, Government of India. All Rights Reserved.
                    </p>
                    <p style={{ marginTop: 'var(--space-2)', fontSize: 'var(--text-xs)', color: '#f1f1f1' }}>
                        Last Updated: november 28, 2025 | Visitors: 1,234,567
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
