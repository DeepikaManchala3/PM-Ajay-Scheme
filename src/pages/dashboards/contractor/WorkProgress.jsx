import React, { useState } from 'react';
import Modal from '../../../components/Modal';
import InteractiveButton from '../../../components/InteractiveButton';
import { Camera } from 'lucide-react';

const WorkProgress = ({ works, onUpdateProgress }) => {
    const [selectedWorkId, setSelectedWorkId] = useState('');
    const [progressData, setProgressData] = useState({
        remarks: '',
        photos: [],
        fundsReleased: '',
        fundsUsed: '',
        fundsRemaining: '',
        progress: ''
    });
    const [toast, setToast] = useState(null);
    const [errors, setErrors] = useState({});
    const [showCameraModal, setShowCameraModal] = useState(false);
    const [stream, setStream] = useState(null);
    const [location, setLocation] = useState(null);
    const [locationStatus, setLocationStatus] = useState('idle'); // idle, fetching, success, error
    const videoRef = React.useRef(null);
    const canvasRef = React.useRef(null);

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), 3000);
    };

    const validate = () => {
        const errs = {};
        if (!selectedWorkId) errs.workId = 'Please select a work order.';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    // Auto-fill funds released when work order is selected
    React.useEffect(() => {
        if (!selectedWorkId) {
            // Reset form when no work order is selected
            setProgressData({
                remarks: '',
                photos: [],
                fundsReleased: '',
                fundsUsed: '',
                fundsRemaining: '',
                progress: ''
            });
            return;
        }

        const work = works.find(w => w.id === parseInt(selectedWorkId));
        if (!work) return;

        // Auto-fill funds released with the work order's allocated amount
        // Only set if not already set (to avoid overwriting user's manual entry)
        if (!progressData.fundsReleased) {
            setProgressData(prev => ({
                ...prev,
                fundsReleased: work.amount || '',
                fundsUsed: '',
                fundsRemaining: work.amount || '',
                progress: '0'
            }));
        }
    }, [selectedWorkId, works]);

    const handleFundsChange = (field, value) => {
        const newData = { ...progressData, [field]: value };

        const work = works.find(w => w.id === parseInt(selectedWorkId));
        if (work) {
            const released = parseFloat(field === 'fundsReleased' ? value : newData.fundsReleased) || 0;
            const used = parseFloat(field === 'fundsUsed' ? value : newData.fundsUsed) || 0;
            const totalAmount = parseFloat(work.amount) || 1;

            // Auto-calculate Remaining
            newData.fundsRemaining = (released - used).toFixed(2);

            // Auto-calculate Progress
            let calcProgress = (used / totalAmount) * 100;
            if (calcProgress > 100) calcProgress = 100;
            newData.progress = calcProgress.toFixed(2);
        }

        setProgressData(newData);
    };

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        const updatedWork = works.find(w => w.id === parseInt(selectedWorkId));
        if (updatedWork) {
            setIsSubmitting(true);
            try {
                // Mock officer details for now (In real app, fetch from user profile)
                const officerDetails = {
                    name: 'Rajesh Kumar', // This should come from auth/profile
                    phone: '9876543210'   // This should come from auth/profile
                };

                console.log("Submitting progress update for work:", updatedWork.id);
                console.log("Progress Data:", progressData);

                const payload = {
                    ...updatedWork,
                    fundsReleased: Number(progressData.fundsReleased) || 0,
                    fundsUsed: Number(progressData.fundsUsed) || 0,
                    fundsRemaining: Number(progressData.fundsRemaining) || 0,
                    remarks: progressData.remarks,
                    photos: progressData.photos, // Pass the File objects array
                    progress: Number(progressData.progress) || 0,
                    status: (Number(progressData.progress) >= 100)
                        ? 'Completed'
                        : 'In Progress' // Enforce 'In Progress' on any update unless completed
                };

                console.log("Payload to send:", payload);

                await onUpdateProgress(payload, officerDetails);

                showToast('Progress updated successfully!');
                setProgressData({
                    remarks: '',
                    photos: [],
                    fundsReleased: '',
                    fundsUsed: '',
                    fundsRemaining: '',
                    progress: ''
                });
                setSelectedWorkId('');
                setErrors({});
            } catch (error) {
                console.error("Submission error:", error);
                showToast(error.message || 'Failed to submit progress. Please try again.');
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const handlePhotoUpload = (e) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setProgressData({ ...progressData, photos: [...progressData.photos, ...files] });
        }
    };

    // Haversine formula to calculate distance in meters
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371e3; // Earth radius in meters
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // Distance in meters
    };

    const handleOpenCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' } // Use rear camera on mobile
            });
            setStream(mediaStream);
            setShowCameraModal(true);

            // Start fetching location immediately
            fetchLocation();

            // Wait for modal to render, then attach stream to video
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }
            }, 100);
        } catch (error) {
            console.error('Error accessing camera:', error);
            showToast('Unable to access camera. Please check permissions.');
        }
    };

    const fetchLocation = () => {
        setLocationStatus('fetching');
        if (!navigator.geolocation) {
            setLocationStatus('error');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const currentLat = position.coords.latitude;
                const currentLong = position.coords.longitude;

                // SIMULATED Project Location (For Demo: Set it 50m away from current location)
                // In production, this would come from the 'works' object: works.find(w => w.id === selectedWorkId).location_coords
                const demoProjectLat = currentLat + 0.0002;
                const demoProjectLong = currentLong + 0.0002;

                const dist = calculateDistance(currentLat, currentLong, demoProjectLat, demoProjectLong);

                setLocation({
                    lat: currentLat.toFixed(6),
                    long: currentLong.toFixed(6),
                    timestamp: new Date().toLocaleString(),
                    distance: dist.toFixed(0),
                    isVerified: dist < 500 // Threshold: 500 meters
                });
                setLocationStatus('success');
            },
            (error) => {
                console.error('Error getting location:', error);
                setLocationStatus('error');
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const handleCapturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;

            // Set canvas dimensions to match video
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            // Draw current video frame to canvas
            const context = canvas.getContext('2d');
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            // --- GPS & Fraud Check Overlay ---
            if (location) {
                const fontSize = Math.max(16, Math.floor(canvas.width / 25)); // Adaptive font size
                context.font = `bold ${fontSize}px sans-serif`;
                context.lineWidth = 3;
                context.shadowColor = "black";
                context.shadowBlur = 4;

                const textX = 20;
                let textY = canvas.height - 20; // Start from bottom
                const lineHeight = fontSize + 8;

                // Determine Validation Color/Status
                const matchColor = location.isVerified ? '#10B981' : '#EF4444'; // Green vs Red
                const matchText = location.isVerified ? 'VERIFIED (Within 500m)' : `MISMATCH (${location.distance}m away)`;

                const lines = [
                    `Lat: ${location.lat}, Long: ${location.long}`,
                    `Time: ${location.timestamp}`,
                    `Loc: ${matchText}`
                ];

                // Draw from bottom up
                lines.reverse().forEach((line, index) => {
                    context.strokeStyle = 'black';
                    context.fillStyle = (index === 0) ? matchColor : 'white'; // Color the verification line
                    context.strokeText(line, textX, textY);
                    context.fillText(line, textX, textY);
                    textY -= lineHeight;
                });
            }
            // -------------------

            // Convert canvas to blob and then to File
            canvas.toBlob((blob) => {
                const timestamp = Date.now();
                const file = new File([blob], `gps-photo-${timestamp}.jpg`, { type: 'image/jpeg' });
                setProgressData({ ...progressData, photos: [...progressData.photos, file] });

                if (location) {
                    showToast(location.isVerified ? '✅ Photo Verified & Captured!' : '⚠️ Warning: Location Mismatch captured.');
                } else {
                    showToast('Photo captured (No GPS)');
                }

                handleCloseCamera();
            }, 'image/jpeg', 0.9);
        }
    };

    const handleCloseCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setShowCameraModal(false);
    };

    const handleRemovePhoto = (index) => {
        const newPhotos = progressData.photos.filter((_, i) => i !== index);
        setProgressData({ ...progressData, photos: newPhotos });
    };

    return (
        <div className="dashboard-panel" style={{ padding: '2rem' }}>
            {toast && (
                <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'inline-block', background: 'var(--color-success)', color: '#fff', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)' }}>{toast}</div>
                </div>
            )}

            {/* Single Container Box */}
            <div className="card" style={{ padding: '2.5rem', maxWidth: '900px', margin: '0 auto', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                {/* Title and Subtitle */}
                <div style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1F2937', margin: '0 0 0.5rem 0' }}>
                        Update Work Progress
                    </h2>
                    <p style={{ color: '#6B7280', fontSize: '0.875rem', margin: 0 }}>
                        Submit site photos, financial progress, and remarks for your assigned work orders.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Select Work Order</label>
                        <select
                            className="form-control"
                            value={selectedWorkId}
                            onChange={(e) => setSelectedWorkId(e.target.value)}
                        >
                            <option value="">-- Select Work --</option>
                            {works.map(work => (
                                <option key={work.id} value={work.id}>
                                    WO-{work.id}: {work.title} ({work.location})
                                </option>
                            ))}
                        </select>
                        {errors.workId && <div className="form-error">{errors.workId}</div>}
                    </div>

                    {/* Physical Progress Removed as per request */}

                    <style>
                        {`
                            /* Hide spinners/arrows for ALL number inputs */
                            input[type=number]::-webkit-inner-spin-button, 
                            input[type=number]::-webkit-outer-spin-button { 
                                -webkit-appearance: none; 
                                margin: 0; 
                            }
                            input[type=number] {
                                -moz-appearance: textfield;
                                appearance: textfield;
                            }
                            /* Ensure no spinners appear on focus */
                            input[type=number]:focus::-webkit-inner-spin-button,
                            input[type=number]:focus::-webkit-outer-spin-button {
                                -webkit-appearance: none;
                                margin: 0;
                            }
                        `}
                    </style>

                    <div className="form-group">
                        <label className="form-label">Funds Released (₹)</label>
                        <input
                            type="number"
                            className="form-control"
                            placeholder="Enter amount released"
                            value={progressData.fundsReleased}
                            onChange={(e) => handleFundsChange('fundsReleased', e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Funds Used (₹)</label>
                        <input
                            type="number"
                            className="form-control"
                            placeholder="Enter amount used"
                            value={progressData.fundsUsed}
                            onChange={(e) => handleFundsChange('fundsUsed', e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Funds Remaining (₹) <span style={{ fontSize: '12px', color: '#666' }}>(Auto-calculated)</span></label>
                        <input
                            type="number"
                            className="form-control"
                            placeholder="Auto-calculated"
                            value={progressData.fundsRemaining}
                            readOnly
                            style={{ backgroundColor: '#f9f9f9' }}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Physical Progress (%) <span style={{ fontSize: '12px', color: '#666' }}>(Auto-calculated based on Funds Used)</span></label>
                        <input
                            type="number"
                            className="form-control"
                            placeholder="Auto-calculated"
                            value={progressData.progress}
                            readOnly
                            style={{ backgroundColor: '#f9f9f9' }}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Upload Site Photos</label>
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                className="form-control"
                                onChange={handlePhotoUpload}
                                style={{ padding: '8px', flex: 1 }}
                            />
                            <InteractiveButton
                                variant="secondary"
                                onClick={handleOpenCamera}
                                style={{ whiteSpace: 'nowrap' }}
                            >
                                <Camera size={18} style={{ marginRight: '8px' }} />
                                Take Photo
                            </InteractiveButton>
                        </div>
                        <div className="form-helper">Upload photos or capture from camera.</div>
                        {progressData.photos.length > 0 && (
                            <div style={{ marginTop: 15 }}>
                                <strong style={{ fontSize: '14px', color: '#2c3e50' }}>
                                    {progressData.photos.length} photo(s) selected:
                                </strong>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px', marginTop: '10px' }}>
                                    {progressData.photos.map((file, index) => (
                                        <div key={index} style={{ position: 'relative', border: '1px solid #ddd', borderRadius: '6px', overflow: 'hidden' }}>
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={`Preview ${index + 1}`}
                                                style={{ width: '100%', height: '120px', objectFit: 'cover' }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleRemovePhoto(index)}
                                                style={{
                                                    position: 'absolute',
                                                    top: '5px',
                                                    right: '5px',
                                                    background: 'rgba(220, 38, 38, 0.9)',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '50%',
                                                    width: '24px',
                                                    height: '24px',
                                                    cursor: 'pointer',
                                                    fontSize: '14px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                ×
                                            </button>
                                            <div style={{ padding: '5px', fontSize: '11px', color: '#666', textAlign: 'center', background: '#f9f9f9' }}>
                                                {file.name.length > 15 ? file.name.substring(0, 12) + '...' : file.name}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Remarks / Issues</label>
                        <textarea
                            className="form-control"
                            rows="3"
                            placeholder="Any issues faced or additional comments..."
                            value={progressData.remarks}
                            onChange={(e) => setProgressData({ ...progressData, remarks: e.target.value })}
                        />
                    </div>

                    <InteractiveButton
                        type="submit"
                        variant="primary"
                        style={{ marginTop: 10 }}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Progress Report'}
                    </InteractiveButton>
                </form>
            </div>

            {/* Second Container Box - Submission History */}
            <div className="card" style={{ padding: '2.5rem', maxWidth: '1200px', margin: '2rem auto 0', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}>
                {/* Title */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1F2937', margin: 0 }}>
                        Latest Submission Status
                    </h2>
                </div>

                {/* Submission History / Status */}
                <div>
                    {(() => {
                        const worksWithUpdates = works.filter(w => w.lastUpdated);

                        if (worksWithUpdates.length === 0) {
                            return (
                                <div style={{
                                    padding: '20px',
                                    background: '#f8f9fa',
                                    borderRadius: '6px',
                                    textAlign: 'center',
                                    color: '#666'
                                }}>
                                    <p style={{ margin: 0 }}>No progress submissions yet.</p>
                                    <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>
                                        Submit your first progress report above to see it here.
                                    </p>
                                </div>
                            );
                        }

                        return worksWithUpdates
                            .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated))
                            .map(work => (
                                <div key={work.id} style={{
                                    padding: '10px',
                                    background: '#f8f9fa',
                                    borderRadius: '6px',
                                    marginBottom: '10px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div>
                                        <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{work.title}</div>
                                        <div style={{ fontSize: '12px', color: '#666' }}>Updated: {work.lastUpdated}</div>
                                        <div style={{ marginTop: '8px', fontSize: '13px', color: '#444', background: '#fff', padding: '8px', borderRadius: '4px', border: '1px solid #eee' }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
                                                <div><strong>Released:</strong> <strong style={{ color: '#2563EB' }}>₹{work.fundsReleased?.toLocaleString('en-IN') || 0}</strong></div>
                                                <div><strong>Used:</strong> <strong style={{ color: '#F59E0B' }}>₹{work.fundsUsed?.toLocaleString('en-IN') || 0}</strong></div>
                                                <div style={{ gridColumn: 'span 2' }}><strong>Remaining:</strong> <strong style={{ color: '#10B981' }}>₹{work.fundsRemaining?.toLocaleString('en-IN') || 0}</strong></div>
                                            </div>
                                            {work.remarks && (
                                                <div style={{ marginTop: '6px', borderTop: '1px dashed #ddd', paddingTop: '4px', fontStyle: 'italic', color: '#666' }}>
                                                    "{work.remarks}"
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        {work.viewedByAgency ? (
                                            <span className="badge badge-success" style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}>
                                                Viewed by Agency
                                            </span>
                                        ) : (
                                            <span className="badge badge-warning" style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}>
                                                Pending Review
                                            </span>
                                        )}
                                        {work.viewedByAgency && work.viewedAt && (
                                            <div style={{ fontSize: '11px', color: '#999', marginTop: '0.25rem' }}>
                                                {new Date(work.viewedAt).toLocaleDateString()}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ));
                    })()}
                </div>

            </div>

            {/* Camera Modal */}
            {showCameraModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.9)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '12px',
                        padding: '20px',
                        maxWidth: '90%',
                        maxHeight: '90%',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '15px'
                    }}>
                        <h3 style={{ margin: 0, textAlign: 'center' }}>Take Photo</h3>

                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            style={{
                                width: '100%',
                                maxWidth: '600px',
                                borderRadius: '8px',
                                background: '#000'
                            }}
                        />

                        {/* Location Status Indicator */}
                        <div style={{ textAlign: 'center', fontSize: '12px' }}>
                            {locationStatus === 'fetching' && <span style={{ color: '#F59E0B' }}>📍 Fetching Location...</span>}
                            {locationStatus === 'success' && <span style={{ color: '#10B981' }}>✅ Location Found: {location?.lat}, {location?.long}</span>}
                            {locationStatus === 'error' && <span style={{ color: '#EF4444' }}>❌ Location unavailable (Photo will not be tagged)</span>}
                        </div>

                        <canvas ref={canvasRef} style={{ display: 'none' }} />

                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                            <InteractiveButton
                                variant="primary"
                                onClick={handleCapturePhoto}
                            >
                                <Camera size={18} style={{ marginRight: '8px' }} />
                                Capture
                            </InteractiveButton>
                            <InteractiveButton
                                variant="secondary"
                                onClick={handleCloseCamera}
                            >
                                Cancel
                            </InteractiveButton>
                        </div>
                    </div>
                </div>
            )}
        </div>

    );
};

export default WorkProgress;
