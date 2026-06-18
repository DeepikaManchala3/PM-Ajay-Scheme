import React from 'react';
import { Home, IndianRupee, GraduationCap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import './ComponentsSection.css';

const ComponentsSection = () => {
    return (
        <div className="components-section">
            <div className="container">
                <div className="components-container">
                    <h2 className="section-heading">Components</h2>

                    <div className="cards-grid">
                        {/* Card 1 */}
                        <div className="component-card">
                            <div className="card-icon">
                                <Home size={40} color="#000080" strokeWidth={1.5} />
                            </div>
                            <h3 className="card-title">Development of SC dominated villages into "Adarsh Gram"</h3>
                            <p className="card-content">
                                An 'Adarsh Gram' is one where in people have access to various basic services so that the minimum needs of all the sections of the society are fully met and disparities are reduced to a minimum. These villages would have all such infrastructure facilities and its residents will have access to all such basic services that are necessary for a dignified living, creating thereby an environment in which everyone is enabled to utilize his/her potential to the fullest.
                            </p>
                            <Link to="/adarsh-gram" className="card-link">
                                More <ArrowRight size={16} />
                            </Link>
                        </div>

                        {/* Card 2 */}
                        <div className="component-card">
                            <div className="card-icon">
                                <IndianRupee size={40} color="#000080" strokeWidth={1.5} />
                            </div>
                            <h3 className="card-title">Grants-in-aid to State/Districts</h3>
                            <br />
                            <br />
                            <div className="card-content">
                                The main objectives of this component are:
                                <ul className="card-list">
                                    <li>i) To increase the income of the target population by way of comprehensive livelihood projects.</li>
                                    <li>ii) Improve socio-economic developmental indicators by ensuring adequate infrastructure in the SC dominated villages.</li>
                                    <li>iii) Increase literacy and encourage enrolment of SCs in schools by providing residential schools where required.</li>
                                </ul>
                            </div>
                            <a href="https://pmajay.dosje.gov.in/Writereaddata/Guidelines.pdf" target="_blank" rel="noopener noreferrer" className="card-link">
                                More <ArrowRight size={16} />
                            </a>
                        </div>

                        {/* Card 3 */}
                        <div className="component-card">
                            <div className="card-icon">
                                <GraduationCap size={40} color="#000080" strokeWidth={1.5} />
                            </div>
                            <h3 className="card-title">Construction/Repair of Hostels</h3><br /><br />
                            <p className="card-content">
                                The construction of hostels is one of the means to enable and encourage students belonging to Scheduled Castes (SC) to attain quality education. Such hostels are immensely beneficial to the students hailing from rural and remote areas of the country. While the component of construction of hostels for SC girls is in operation from the Third Five Year Plan (1961–66), the same for boys was started with effect from the year 1989–90.
                            </p>
                            <a href="https://pmajay.dosje.gov.in/Writereaddata/Guidelines.pdf" target="_blank" rel="noopener noreferrer" className="card-link">
                                More <ArrowRight size={16} />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComponentsSection;
