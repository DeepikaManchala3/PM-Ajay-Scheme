import React, { useState } from 'react';

const UploadSurvey = () => {
    const [uploadedPhotos, setUploadedPhotos] = useState([]);

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        const newPhotos = files.map(file => ({
            name: file.name,
            date: new Date().toLocaleDateString(),
            location: 'Shirur GP'
        }));
        setUploadedPhotos([...uploadedPhotos, ...newPhotos]);
    };

    return (
        <div className="dashboard-panel">
            <div className="form-section">
                <div className="form-section-header">
                    <h3 className="form-section-title">Upload Progress Photos</h3>
                </div>

                <div className="upload-area" onClick={() => document.getElementById('photoInput').click()}>
                    <div className="upload-area-icon">📷</div>
                    <div className="upload-area-text">Upload geo-tagged photos</div>
                    <div className="upload-area-hint">JPG, PNG with location data</div>
                    <input
                        id="photoInput"
                        type="file"
                        multiple
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleFileUpload}
                    />
                </div>

                {uploadedPhotos.length > 0 && (
                    <div className="photo-grid">
                        {uploadedPhotos.map((photo, index) => (
                            <div key={index} className="photo-item">
                                <div className="photo-item-overlay">
                                    <div>{photo.name}</div>
                                    <div>{photo.date} • {photo.location}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UploadSurvey;
