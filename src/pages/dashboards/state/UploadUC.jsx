import React, { useState } from 'react';
import InteractiveButton from '../../../components/InteractiveButton';
import { Download, Upload } from 'lucide-react';

const UploadUC = () => {
    const [ucs, setUcs] = useState([
        { id: 1, district: 'Pune', year: '2024-25', date: '2025-01-15', status: 'Uploaded' },
        { id: 2, district: 'Mumbai', year: '2024-25', date: '2025-02-01', status: 'Uploaded' },
    ]);

    const [formData, setFormData] = useState({ district: '', year: '2024-25', file: null });

    const [toast, setToast] = useState(null);

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), 3000);
    };

    const handleUpload = () => {
        if (formData.file) {
            setUcs([...ucs, {
                id: Date.now(),
                district: formData.district,
                year: formData.year,
                date: new Date().toISOString().split('T')[0],
                status: 'Uploaded'
            }]);
            setFormData({ district: '', year: '2024-25', file: null });
            showToast('Utilization Certificate uploaded successfully!');
        }
    };

    const handleDownloadPDF = (uc) => {
        try {
            const printWindow = window.open('', '_blank');
            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Utilization Certificate - ${uc.district}</title>
                    <style>
                        body { font-family: 'Times New Roman', serif; padding: 40px; max-width: 800px; margin: 0 auto; border: 5px double #333; height: 90vh; position: relative; }
                        .header { text-align: center; margin-bottom: 40px; }
                        h1 { font-size: 28px; text-transform: uppercase; margin-bottom: 10px; text-decoration: underline; }
                        h2 { font-size: 20px; font-weight: normal; margin-top: 0; }
                        .content { line-height: 2; font-size: 18px; text-align: justify; margin-bottom: 50px; }
                        .signature-section { display: flex; justify-content: space-between; margin-top: 100px; }
                        .signature { text-align: center; border-top: 1px solid #333; width: 200px; padding-top: 10px; }
                        .footer { position: absolute; bottom: 20px; left: 0; right: 0; text-align: center; font-size: 12px; color: #666; }
                        @media print { body { border: none; } }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>Utilization Certificate</h1>
                        <h2>For the Financial Year ${uc.year}</h2>
                    </div>
                    
                    <div class="content">
                        <p>
                            Certified that out of the total fund allocated to the district of <strong>${uc.district}</strong> 
                            under the PM-AJAY scheme, the entire amount has been utilized for the approved projects 
                            and purposes for which it was sanctioned.
                        </p>
                        <p>
                            It is further certified that the physical and financial progress reports have been 
                            verified and found to be correct. The balance amount remaining unutilized at the 
                            end of the year has been surrendered to the Government (or will be adjusted towards 
                            the grants-in-aid payable during the next year).
                        </p>
                    </div>

                    <div class="signature-section">
                        <div class="signature">
                            <strong>District Magistrate</strong><br>
                            ${uc.district} District
                        </div>
                        <div class="signature">
                            <strong>Accounts Officer</strong><br>
                            PM-AJAY Cell
                        </div>
                    </div>

                    <div class="footer">
                        Generated on: ${new Date().toLocaleString()} | Document ID: UC-${uc.id}-${uc.year}
                    </div>
                </body>
                </html>
            `;
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            // printWindow.onload = function () { printWindow.print(); };
            showToast('Certificate downloaded successfully');
        } catch (error) {
            console.error('Error generating PDF:', error);
            showToast('Error downloading certificate');
        }
    };

    return (
        <div className="dashboard-panel">
            <div className="section-header">
                <h2 className="section-title">Upload Utilization Certificate (UC)</h2>
            </div>

            {toast && (
                <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'inline-block', background: '#00B894', color: '#fff', padding: '8px 12px', borderRadius: '6px' }}>{toast}</div>
                </div>
            )}

            <div className="form-section" style={{ marginBottom: 'var(--space-4)' }}>
                <div className="form-group">
                    <label className="form-label required">Select District</label>
                    <select
                        className="form-control form-select"
                        value={formData.district}
                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    >
                        <option value="">Select District</option>
                        <option value="Pune">Pune</option>
                        <option value="Mumbai">Mumbai</option>
                        <option value="Nagpur">Nagpur</option>
                        <option value="Nashik">Nashik</option>
                    </select>
                </div>

                <div className="form-group">
                    <label className="form-label required">Financial Year</label>
                    <select
                        className="form-control form-select"
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    >
                        <option value="2024-25">2024-25</option>
                        <option value="2023-24">2023-24</option>
                    </select>
                </div>

                <div className="form-group">
                    <label className="form-label">Upload UC Document</label>
                    <div className="upload-area">
                        <input
                            type="file"
                            style={{ display: 'none' }}
                            id="uc-upload"
                            onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
                        />
                        <label htmlFor="uc-upload" style={{ cursor: 'pointer', textAlign: 'center', width: '100%' }}>
                            <div className="upload-area-icon">📄</div>
                            <div className="upload-area-text">
                                {formData.file ? formData.file.name : "Upload Utilization Certificate"}
                            </div>
                            <div className="upload-area-hint">PDF format, digitally signed</div>
                        </label>
                    </div>
                </div>

                <InteractiveButton
                    variant="primary"
                    onClick={handleUpload}
                    disabled={!formData.district || !formData.file}
                >
                    <Upload size={18} /> Submit UC to Ministry
                </InteractiveButton>
            </div>

            <div className="section-header">
                <h3 className="section-title">Uploaded Certificates History</h3>
            </div>
            <div className="table-wrapper">
                <table className="table">
                    <thead>
                        <tr>
                            <th>District</th>
                            <th>Financial Year</th>
                            <th>Upload Date</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ucs.map(uc => (
                            <tr key={uc.id}>
                                <td>{uc.district}</td>
                                <td>{uc.year}</td>
                                <td>{uc.date}</td>
                                <td><span className="badge badge-success">{uc.status}</span></td>
                                <td>
                                    <InteractiveButton
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => handleDownloadPDF(uc)}
                                    >
                                        <Download size={16} /> Download
                                    </InteractiveButton>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UploadUC;
