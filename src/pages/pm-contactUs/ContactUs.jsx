import React from 'react';
import Footer from '../../components/Footer';
import './ContactUs.css';

const ContactUs = () => {
    return (
        <>
            <div className="contact-us-container">

                <div className="support-grid">
                    <div>
                        <div className="section-title-wrapper">
                            <h2 className="section-title">Technical Support</h2>
                            <div className="title-underline"></div>
                        </div>
                        <table className="contact-table">
                            <thead>
                                <tr>
                                    <th>Email</th>
                                    <th>Contact</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>support[dot]pmagy-msje[at]gov[dot]in</td>
                                    <td>
                                        +91-11-24364468
                                        <span className="contact-info-highlight">Monday to Friday 9:00 AM to 6:00 PM</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div>
                        <div className="section-title-wrapper">
                            <h2 className="section-title">Administrative Support</h2>
                            <div className="title-underline"></div>
                        </div>
                        <table className="contact-table">
                            <thead>
                                <tr>
                                    <th>Email</th>
                                    <th>Contact</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>NA</td>
                                    <td>
                                        NA
                                        <span className="contact-info-highlight">NA</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="section-title-wrapper">
                    <h2 className="section-title">Officers Details</h2>
                    <div className="title-underline"></div>
                </div>
                <table className="contact-table">
                    <thead>
                        <tr>
                            <th style={{ width: '25%' }}>Name</th>
                            <th style={{ width: '25%' }}>Designation</th>
                            <th style={{ width: '25%' }}>Contact</th>
                            <th style={{ width: '25%' }}>Email</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Shri Amit Yadav</td>
                            <td>Secretary</td>
                            <td>
                                +91-11-23382683/84<br />
                                +91-11-23385180 (F)
                            </td>
                            <td>-</td>
                        </tr>
                        <tr>
                            <td>Ms. Caralyn Khongwar Deshmukh</td>
                            <td>Additional Secretary</td>
                            <td>011-23383956</td>
                            <td>as2-msje[at]gov.in</td>
                        </tr>
                        <tr>
                            <td>Shri Narender Singh</td>
                            <td>Deputy Secretary</td>
                            <td>011-23382857</td>
                            <td>narender.singh67[at]gov.in</td>
                        </tr>
                        <tr>
                            <td>Shri Sewak Paul</td>
                            <td>Under Secretary</td>
                            <td>-</td>
                            <td>sewak.paul[at]nic.in</td>
                        </tr>
                        <tr>
                            <td>Shri Anuj Kumar</td>
                            <td>Section Officer</td>
                            <td>-</td>
                            <td>anuj.kr88[at]gov.in</td>
                        </tr>
                        <tr>
                            <td>Shri Deepak Khoda</td>
                            <td>Section Officer</td>
                            <td>-</td>
                            <td>deepak.khoda[at]gov.in</td>
                        </tr>
                    </tbody>
                </table>

                <div className="section-title-wrapper">
                    <h2 className="section-title">NIC - DEPT. of Social Justice and Empowerment</h2>
                    <div className="title-underline"></div>
                </div>
                <table className="contact-table">
                    <thead>
                        <tr>
                            <th style={{ width: '25%' }}>Name</th>
                            <th style={{ width: '25%' }}>Designation</th>
                            <th style={{ width: '25%' }}>Contact</th>
                            <th style={{ width: '25%' }}>Email</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Shri Bhupinder Pathak</td>
                            <td>Senior Director (IT)</td>
                            <td>+91-11-24360791</td>
                            <td>hod-sje[at]nic.in</td>
                        </tr>
                        <tr>
                            <td>Shri Anand Verma</td>
                            <td>Joint Director (IT)</td>
                            <td>+91-11-24364468</td>
                            <td>officer1.sje[at]nic.in</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <Footer />
        </>
    );
};

export default ContactUs;
