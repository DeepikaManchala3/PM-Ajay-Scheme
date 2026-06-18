import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import InteractiveButton from '../../../components/InteractiveButton';
import { ArrowLeft } from 'lucide-react';

const VillageFundReleaseForm = ({ onBack, onNavigate }) => {
    const [states, setStates] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [villages, setVillages] = useState([]);
    const [formData, setFormData] = useState({
        state: '',
        district: '',
        village: '',
        allocationAmount: '', // Now represents Total Allocation Amount
        releasedAmount: '',
        selectedComponent: '', // Changed from array 'components' to single string
        selectedProject: '',   // Changed from 'projects' array logic to single string
        otherProjectName: '',  // For "Other" input
        releaseDate: new Date().toISOString().split('T')[0],
        sanctionOrderNo: '',
        remarks: ''
    });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    // Fetch states on mount
    useEffect(() => {
        fetchStates();
    }, []);

    const fetchStates = async () => {
        try {
            const { data, error } = await supabase
                .from('states')
                .select('id, name')
                .order('name');

            if (error) throw error;
            setStates(data || []);
        } catch (error) {
            console.error('Error fetching states:', error);
        }
    };

    // Handle state change
    const handleStateChange = async (stateName) => {
        setFormData(prev => ({ ...prev, state: stateName, district: '', village: '' }));
        setDistricts([]);
        setVillages([]);

        if (!stateName) return;

        try {
            const { data: stateData, error: stateError } = await supabase
                .from('states')
                .select('id')
                .eq('name', stateName)
                .single();

            if (stateError) throw stateError;

            const { data, error } = await supabase
                .from('districts')
                .select('id, name')
                .eq('state_id', stateData.id)
                .order('name');

            if (error) throw error;
            setDistricts(data || []);
        } catch (error) {
            console.error('Error fetching districts:', error);
        }
    };

    // Handle district change
    const handleDistrictChange = async (districtName) => {
        console.log('🔄 District Selected:', districtName);
        setFormData(prev => ({ ...prev, district: districtName, village: '' }));
        setVillages([]);

        if (!districtName) {
            return;
        }

        try {
            const url = `http://localhost:5001/api/villages/district/${encodeURIComponent(districtName)}`;
            const response = await fetch(url);
            const result = await response.json();

            if (result.success) {
                setVillages(result.data || []);
            } else {
                console.error('❌ API Error:', result.message);
            }
        } catch (error) {
            console.error('❌ Network/Fetch Error:', error);
        }
    };

    // Helper for radio changes
    const handleRadioChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Validate form
    const validate = () => {
        const errs = {};
        if (!formData.state) errs.state = 'Please select a state';
        if (!formData.district) errs.district = 'Please select a district';
        if (!formData.village) errs.village = 'Please select a village';

        const alloc = parseFloat(formData.allocationAmount);
        const released = parseFloat(formData.releasedAmount);

        if (isNaN(alloc) || alloc <= 0) errs.allocationAmount = 'Enter valid allocation (> 0)';
        if (isNaN(released) || released <= 0) errs.releasedAmount = 'Enter valid amount (> 0)';
        if (released > alloc) errs.releasedAmount = 'Release cannot exceed allocation';

        if (!formData.selectedComponent) errs.selectedComponent = 'Select a component';
        if (!formData.selectedProject) errs.selectedProject = 'Select a project';

        if (formData.selectedProject === 'Other' && !formData.otherProjectName.trim()) {
            errs.selectedProject = 'Please specify the project name';
        }

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    // Handle submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        setSubmitting(true);

        try {
            const selectedVillage = villages.find(v => v.village_code === formData.village);

            // Determine final project name
            const finalProject = formData.selectedProject === 'Other'
                ? formData.otherProjectName
                : formData.selectedProject;

            const payload = {
                village_code: selectedVillage.village_code,
                village_name: selectedVillage.village_name,
                district_name: formData.district,
                state_name: formData.state,
                component: [formData.selectedComponent], // Backend expects array
                projects: [finalProject],               // Backend expects array
                amount_allocated: parseFloat(formData.allocationAmount),
                amount_released: parseFloat(formData.releasedAmount),
                release_date: formData.releaseDate,
                sanction_order_no: formData.sanctionOrderNo,
                remarks: formData.remarks
            };

            const response = await fetch('http://localhost:5001/api/villages/release-funds', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (result.success) {
                alert(`✅ Successfully released ₹${parseFloat(formData.releasedAmount).toLocaleString('en-IN')} to ${selectedVillage.village_name}!`);
                // Reset form
                setFormData({
                    state: '',
                    district: '',
                    village: '',
                    allocationAmount: '',
                    releasedAmount: '',
                    selectedComponent: '',
                    selectedProject: '',
                    otherProjectName: '',
                    releaseDate: new Date().toISOString().split('T')[0],
                    sanctionOrderNo: '',
                    remarks: ''
                });
                setDistricts([]);
                setVillages([]);

                if (onNavigate) {
                    onNavigate('released', 'village');
                }
            } else {
                throw new Error(result.error || 'Failed to release funds');
            }
        } catch (error) {
            console.error('Village fund release error:', error);
            alert(`❌ Error: ${error.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{ padding: 20 }}>
            {/* Header with Back Button */}
            <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
                <InteractiveButton
                    variant="outline"
                    size="sm"
                    onClick={onBack}
                    style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                >
                    <ArrowLeft size={16} />
                    Back
                </InteractiveButton>
                <div>
                    <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Release Funds to Village</h2>
                    <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: 14 }}>
                        Select state, district, and village to release funds
                    </p>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
                <div style={{
                    backgroundColor: 'white',
                    padding: 24,
                    borderRadius: 12,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                        {/* State Selection */}
                        <div className="form-group">
                            <label className="form-label">Select State *</label>
                            <select
                                className="form-control"
                                value={formData.state}
                                onChange={(e) => handleStateChange(e.target.value)}
                            >
                                <option value="">-- Select State --</option>
                                {states.map(state => (
                                    <option key={state.id} value={state.name}>{state.name}</option>
                                ))}
                            </select>
                            {errors.state && <div className="form-error">{errors.state}</div>}
                        </div>

                        {/* District Selection */}
                        <div className="form-group">
                            <label className="form-label">Select District *</label>
                            <select
                                className="form-control"
                                value={formData.district}
                                onChange={(e) => handleDistrictChange(e.target.value)}
                                disabled={!formData.state}
                            >
                                <option value="">-- Select District --</option>
                                {districts.map(district => (
                                    <option key={district.id} value={district.name}>{district.name}</option>
                                ))}
                            </select>
                            {errors.district && <div className="form-error">{errors.district}</div>}
                        </div>

                        {/* Village Selection */}
                        <div className="form-group">
                            <label className="form-label">Select Village *</label>
                            <select
                                className="form-control"
                                value={formData.village}
                                onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                                disabled={!formData.district}
                            >
                                <option value="">-- Select Village --</option>
                                {villages.map(village => (
                                    <option key={village.village_code} value={village.village_code}>
                                        {village.village_name}
                                    </option>
                                ))}
                            </select>
                            {errors.village && <div className="form-error">{errors.village}</div>}
                        </div>

                        {/* Amounts Row */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, gridColumn: 'span 2' }}>
                            {/* Total Allocation -- RENAMED */}
                            <div className="form-group">
                                <label className="form-label">Total Allocation Amount (₹) *</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    placeholder="e.g., 5000000"
                                    value={formData.allocationAmount}
                                    onChange={(e) => setFormData({ ...formData, allocationAmount: e.target.value })}
                                />
                                {errors.allocationAmount && <div className="form-error">{errors.allocationAmount}</div>}
                            </div>

                            {/* Amount to Release */}
                            <div className="form-group">
                                <label className="form-label">Amount to Release (₹) *</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    placeholder="e.g., 2000000"
                                    value={formData.releasedAmount}
                                    onChange={(e) => setFormData({ ...formData, releasedAmount: e.target.value })}
                                />
                                {errors.releasedAmount && <div className="form-error">{errors.releasedAmount}</div>}
                            </div>
                        </div>

                        {/* Release Date */}
                        <div className="form-group">
                            <label className="form-label">Release Date</label>
                            <input
                                type="date"
                                className="form-control"
                                value={formData.releaseDate}
                                onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                            />
                        </div>

                        {/* Sanction Order No */}
                        <div className="form-group">
                            <label className="form-label">Sanction Order Number</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="e.g., MIN/2024/001"
                                value={formData.sanctionOrderNo}
                                onChange={(e) => setFormData({ ...formData, sanctionOrderNo: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Components - RADIO BUTTONS */}
                    <div className="form-group" style={{ marginTop: 20 }}>
                        <label className="form-label">Select Component *</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                            {['Adarsh Gram', 'GIA', 'Hostel'].map(component => (
                                <label
                                    key={component}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        padding: '10px',
                                        borderRadius: '6px',
                                        border: `2px solid ${formData.selectedComponent === component ? '#3B82F6' : '#E5E7EB'}`,
                                        backgroundColor: formData.selectedComponent === component ? '#EFF6FF' : 'white',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <input
                                        type="radio"
                                        name="component"
                                        checked={formData.selectedComponent === component}
                                        onChange={() => handleRadioChange('selectedComponent', component)}
                                        style={{ accentColor: '#3B82F6' }}
                                    />
                                    <span style={{ fontSize: 14 }}>{component}</span>
                                </label>
                            ))}
                        </div>
                        {errors.selectedComponent && <div className="form-error">{errors.selectedComponent}</div>}
                    </div>

                    {/* Projects - RADIO BUTTONS + OTHER */}
                    <div className="form-group" style={{ marginTop: 20 }}>
                        <label className="form-label">Select Project *</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                            {['Infrastructure', 'Skill Development', 'Education', 'Health', 'Agriculture', 'Income Generation', 'Other'].map(projectOpt => (
                                <label
                                    key={projectOpt}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        padding: '10px',
                                        borderRadius: '6px',
                                        border: `2px solid ${formData.selectedProject === projectOpt ? '#3B82F6' : '#E5E7EB'}`,
                                        backgroundColor: formData.selectedProject === projectOpt ? '#EFF6FF' : 'white',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <input
                                        type="radio"
                                        name="project"
                                        checked={formData.selectedProject === projectOpt}
                                        onChange={() => handleRadioChange('selectedProject', projectOpt)}
                                        style={{ accentColor: '#3B82F6' }}
                                    />
                                    <span style={{ fontSize: 14 }}>{projectOpt}</span>
                                </label>
                            ))}
                        </div>

                        {/* OTHER INPUT FIELD */}
                        {formData.selectedProject === 'Other' && (
                            <div style={{ marginTop: 12 }}>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter other project name"
                                    value={formData.otherProjectName}
                                    onChange={(e) => setFormData({ ...formData, otherProjectName: e.target.value })}
                                />
                            </div>
                        )}
                        {errors.selectedProject && <div className="form-error">{errors.selectedProject}</div>}
                    </div>

                    {/* Remarks */}
                    <div className="form-group" style={{ marginTop: 20 }}>
                        <label className="form-label">Remarks</label>
                        <textarea
                            className="form-control"
                            rows={3}
                            placeholder="Enter any remarks"
                            value={formData.remarks}
                            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                        />
                    </div>

                    {/* Submit Button */}
                    <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                        <InteractiveButton
                            type="button"
                            variant="outline"
                            onClick={onBack}
                        >
                            Cancel
                        </InteractiveButton>
                        <InteractiveButton
                            type="submit"
                            variant="primary"
                            disabled={submitting}
                        >
                            {submitting ? 'Releasing Funds...' : 'Release Funds'}
                        </InteractiveButton>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default VillageFundReleaseForm;
