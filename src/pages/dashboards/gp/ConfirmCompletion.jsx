import React, { useState } from 'react';

const ConfirmCompletion = () => {
    const [completedProjects, setCompletedProjects] = useState([
        {
            id: 3,
            title: 'Village Road Repair',
            location: 'Shirur Main Road',
            completionDate: '2023-11-15',
            finalCost: '12 Lakhs',
            status: 'Completed',
            contractor: 'ABC Infra Ltd.'
        },
        {
            id: 4,
            title: 'Solar Street Lights',
            location: 'Market Area',
            completionDate: '2023-10-20',
            finalCost: '5 Lakhs',
            status: 'Completed',
            contractor: 'Solar Tech Solutions'
        }
    ]);

    const handleGenerateCertificate = (project) => {
        const printWindow = window.open('', '_blank');
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Completion Certificate - ${project.title}</title>
                <style>
                    body { font-family: 'Times New Roman', serif; padding: 40px; max-width: 900px; margin: 0 auto; border: 10px solid #34495e; min-height: 800px; position: relative; }
                    .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.05; font-size: 100px; font-weight: bold; z-index: -1; }
                    .header { text-align: center; margin-bottom: 50px; }
                    .emblem { font-size: 60px; margin-bottom: 10px; }
                    h1 { color: #2c3e50; margin: 0; font-size: 36px; text-transform: uppercase; letter-spacing: 2px; }
                    h2 { color: #7f8c8d; font-size: 18px; margin-top: 10px; font-weight: normal; }
                    .content { font-size: 18px; line-height: 1.8; text-align: justify; margin: 40px 0; }
                    .highlight { font-weight: bold; border-bottom: 1px dashed #333; }
                    .details-table { width: 100%; border-collapse: collapse; margin: 30px 0; }
                    .details-table td { border: 1px solid #ddd; padding: 12px; }
                    .details-table td:first-child { font-weight: bold; width: 40%; background: #f9f9f9; }
                    .footer { margin-top: 80px; display: flex; justify-content: space-between; align-items: flex-end; }
                    .signature { text-align: center; border-top: 1px solid #333; padding-top: 10px; width: 200px; }
                </style>
            </head>
            <body>
                <div class="watermark">COMPLETED</div>
                <div class="header">
                    <div class="emblem">🏛️</div>
                    <h1>Completion Certificate</h1>
                    <h2>Gram Panchayat: Shirur | District: Pune</h2>
                </div>

                <div class="content">
                    <p>This is to certify that the work titled <span class="highlight">${project.title}</span> located at <span class="highlight">${project.location}</span> has been successfully completed in all respects.</p>
                    
                    <p>The work has been inspected and found to be satisfactory and in accordance with the prescribed standards and specifications.</p>
                </div>

                <table class="details-table">
                    <tr><td>Project ID</td><td>GP-PROJ-${project.id}</td></tr>
                    <tr><td>Contractor/Agency</td><td>${project.contractor}</td></tr>
                    <tr><td>Completion Date</td><td>${project.completionDate}</td></tr>
                    <tr><td>Final Cost Incurred</td><td>₹${project.finalCost}</td></tr>
                </table>

                <div class="footer">
                    <div class="signature">
                        <p>Junior Engineer</p>
                        <small>(Signature & Seal)</small>
                    </div>
                    <div class="signature">
                        <p>Sarpanch / Gram Sevak</p>
                        <small>(Signature & Seal)</small>
                    </div>
                </div>

                <script>
                    window.onload = function() { window.print(); }
                </script>
            </body>
            </html>
        `;
        printWindow.document.write(htmlContent);
        printWindow.document.close();
    };

    return (
        <div className="dashboard-panel">
            <div className="dashboard-section">
                <div className="section-header">
                    <h2 className="section-title">Confirm Work Completion</h2>
                </div>

                <div className="table-wrapper">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Project Name</th>
                                <th>Completion Date</th>
                                <th>Final Cost</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {completedProjects.map(project => (
                                <tr key={project.id}>
                                    <td>
                                        <div style={{ fontWeight: 'bold' }}>{project.title}</div>
                                        <div style={{ fontSize: '12px', color: '#666' }}>{project.location}</div>
                                    </td>
                                    <td>{project.completionDate}</td>
                                    <td>₹{project.finalCost}</td>
                                    <td><span className="badge badge-success">{project.status}</span></td>
                                    <td>
                                        <button
                                            className="btn btn-sm btn-primary"
                                            onClick={() => handleGenerateCertificate(project)}
                                            title="Generate Completion Certificate"
                                        >
                                            📜 Generate Cert
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ConfirmCompletion;
