import React, { useState } from 'react';

const MonitorProgress = () => {
    const [projects, setProjects] = useState([
        {
            id: 1,
            title: 'Community Hall Construction',
            location: 'Shirur Village',
            department: 'PWD',
            cost: '50 Lakhs',
            status: 'Ongoing',
            progress: 65,
            startDate: '2024-01-15',
            completionDate: 'June 2025'
        },
        {
            id: 2,
            title: 'Water Supply System',
            location: 'Khed Village',
            department: 'PHED',
            cost: '85 Lakhs',
            status: 'Ongoing',
            progress: 73,
            startDate: '2024-02-01',
            completionDate: 'March 2025'
        },
        {
            id: 3,
            title: 'Village Road Repair',
            location: 'Shirur Main Road',
            department: 'PWD',
            cost: '12 Lakhs',
            status: 'Completed',
            progress: 100,
            startDate: '2023-11-01',
            completionDate: '2023-12-15'
        }
    ]);

    const [uploadingId, setUploadingId] = useState(null);

    const handleViewPDF = (project) => {
        const printWindow = window.open('', '_blank');
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Project Report - ${project.title}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
                    .header { text-align: center; border-bottom: 3px solid #3498db; padding-bottom: 20px; margin-bottom: 30px; }
                    h1 { color: #2c3e50; margin: 0; }
                    .meta { color: #666; font-size: 14px; margin-top: 5px; }
                    .section { margin-bottom: 25px; }
                    .section-title { font-weight: bold; color: #2c3e50; font-size: 16px; margin-bottom: 8px; border-bottom: 2px solid #ecf0f1; padding-bottom: 5px; }
                    .info-row { display: flex; margin-bottom: 10px; }
                    .info-label { font-weight: bold; width: 200px; color: #555; }
                    .progress-bar { background: #eee; height: 20px; border-radius: 10px; overflow: hidden; width: 100%; }
                    .progress-fill { background: #2ecc71; height: 100%; }
                    .footer { margin-top: 50px; padding-top: 20px; border-top: 2px solid #ecf0f1; text-align: center; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Project Progress Report</h1>
                    <div class="meta">Generated on: ${new Date().toLocaleDateString()}</div>
                </div>

                <div class="section">
                    <div class="section-title">Project Details</div>
                    <div class="info-row"><div class="info-label">Project Title:</div><div>${project.title}</div></div>
                    <div class="info-row"><div class="info-label">Location:</div><div>${project.location}</div></div>
                    <div class="info-row"><div class="info-label">Department:</div><div>${project.department}</div></div>
                    <div class="info-row"><div class="info-label">Estimated Cost:</div><div>₹${project.cost}</div></div>
                    <div class="info-row"><div class="info-label">Start Date:</div><div>${project.startDate}</div></div>
                    <div class="info-row"><div class="info-label">Expected Completion:</div><div>${project.completionDate}</div></div>
                </div>

                <div class="section">
                    <div class="section-title">Current Status</div>
                    <div class="info-row"><div class="info-label">Status:</div><div>${project.status}</div></div>
                    <div class="info-row"><div class="info-label">Progress:</div><div>${project.progress}%</div></div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${project.progress}%"></div>
                    </div>
                </div>

                <div class="footer">
                    <p>Gram Panchayat Monitoring System</p>
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

    const handleUploadClick = (id) => {
        setUploadingId(id);
        document.getElementById(`file-input-${id}`).click();
    };

    const handleFileChange = (e, id) => {
        if (e.target.files.length > 0) {
            alert(`Photos uploaded successfully for Project ID: ${id}`);
            // Here you would typically upload the file to a server
        }
        setUploadingId(null);
    };

    return (
        <div className="dashboard-panel">
            <div className="dashboard-section">
                <div className="section-header">
                    <h2 className="section-title">Ongoing Projects</h2>
                </div>

                <div className="table-wrapper">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Project Name</th>
                                <th>Location</th>
                                <th>Department</th>
                                <th>Cost</th>
                                <th>Progress</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {projects.map(project => (
                                <tr key={project.id}>
                                    <td>
                                        <div style={{ fontWeight: 'bold' }}>{project.title}</div>
                                        <div style={{ fontSize: '12px', color: '#666' }}>Started: {project.startDate}</div>
                                    </td>
                                    <td>{project.location}</td>
                                    <td>{project.department}</td>
                                    <td>₹{project.cost}</td>
                                    <td style={{ width: '200px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '12px' }}>
                                            <span>{project.progress}%</span>
                                            <span>{project.status}</span>
                                        </div>
                                        <div className="progress-bar" style={{ height: '8px' }}>
                                            <div className="progress-fill" style={{ width: `${project.progress}%`, backgroundColor: project.progress === 100 ? 'var(--color-success)' : 'var(--color-primary)' }}></div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                className="btn btn-sm btn-outline"
                                                onClick={() => handleViewPDF(project)}
                                                title="View Report PDF"
                                            >
                                                📄 View
                                            </button>
                                            <button
                                                className="btn btn-sm btn-primary"
                                                onClick={() => handleUploadClick(project.id)}
                                                title="Upload Site Photos"
                                            >
                                                📷 Upload
                                            </button>
                                            <input
                                                type="file"
                                                id={`file-input-${project.id}`}
                                                style={{ display: 'none' }}
                                                accept="image/*"
                                                multiple
                                                onChange={(e) => handleFileChange(e, project.id)}
                                            />
                                        </div>
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

export default MonitorProgress;
