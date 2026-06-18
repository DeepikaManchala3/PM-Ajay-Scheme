import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import InteractiveButton from '../../../components/InteractiveButton';
import { IndianRupee, MapPin, CheckCircle, Calendar, Building2 } from 'lucide-react';

const ReleaseVillageFundsMinistry = () => {
    const [states, setStates] = useState([]);
    const [selectedState, setSelectedState] = useState('');
    const [districts, setDistricts] = useState([]);
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [villages, setVillages] = useState([]);
    const [selectedVillages, setSelectedVillages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form data
    const [formData, setFormData] = useState({
        amountPerVillage: '',
        components: [],
        releaseDate: new Date().toISOString().split('T')[0],
        sanctionOrderNo: '',
        remarks: ''
    });

    const componentOptions = [
        'Infrastructure',
        'Education',
        'Healthcare',
        'Water Supply',
        'Sanitation',
        'Road Construction',
        'Agriculture',
        'Skill Development',
        'Tribal Welfare',
        'Tourism',
        'Environment'
    ];

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

    // Fetch districts when state is selected
    const handleStateChange = async (stateName) => {
        setSelectedState(stateName);
        setSelectedDistrict('');
        setVillages([]);
        setSelectedVillages([]);

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

    // Fetch villages when district is selected
    const handleDistrictChange = async (districtName) => {
        setSelectedDistrict(districtName);
        setSelectedVillages([]);
        setLoading(true);

        try {
            const response = await fetch(`http://localhost:5001/api/villages/district/${districtName}`);
            const result = await response.json();

            if (result.success) {
                setVillages(result.data || []);
            }
        } catch (error) {
            console.error('Error fetching villages:', error);
        } finally {
            setLoading(false);
        }
    };

    // Toggle village selection
    const toggleVillageSelection = (villageCode) => {
        setSelectedVillages(prev =>
            prev.includes(villageCode)
                ? prev.filter(code => code !== villageCode)
                : [...prev, villageCode]
        );
    };

    // Select all villages
    const selectAllVillages = () => {
        if (selectedVillages.length === villages.length) {
            setSelectedVillages([]);
        } else {
            setSelectedVillages(villages.map(v => v.village_code));
        }
    };

    // Toggle component selection
    const toggleComponent = (component) => {
        setFormData(prev => ({
            ...prev,
            components: prev.components.includes(component)
                ? prev.components.filter(c => c !== component)
                : [...prev.components, component]
        }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (selectedVillages.length === 0) {
            alert('Please select at least one village');
            return;
        }

        if (formData.components.length === 0) {
            alert('Please select at least one component');
            return;
        }

        if (!formData.amountPerVillage || parseFloat(formData.amountPerVillage) <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        setSubmitting(true);

        try {
            const selectedVillageData = villages.filter(v =>
                selectedVillages.includes(v.village_code)
            );

            const promises = selectedVillageData.map(village =>
                fetch('http://localhost:5001/api/villages/release-funds', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        village_code: village.village_code,
                        village_name: village.village_name,
                        district_name: village.district_name,
                        state_name: village.state_name,
                        component: formData.components,
                        amount_allocated: parseFloat(formData.amountPerVillage),
                        amount_released: parseFloat(formData.amountPerVillage),
                        release_date: formData.releaseDate,
                        sanction_order_no: formData.sanctionOrderNo,
                        remarks: formData.remarks
                    })
                })
            );

            const results = await Promise.all(promises);
            const allSuccessful = results.every(r => r.ok);

            if (allSuccessful) {
                alert(`✅ Successfully released funds to ${selectedVillages.length} villages!`);
                // Reset form
                setSelectedVillages([]);
                setFormData({
                    amountPerVillage: '',
                    components: [],
                    releaseDate: new Date().toISOString().split('T')[0],
                    sanctionOrderNo: '',
                    remarks: ''
                });
            } else {
                alert('⚠️ Some fund releases failed. Please check and try again.');
            }
        } catch (error) {
            console.error('Error releasing funds:', error);
            alert('❌ Error releasing funds. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const totalAmount = selectedVillages.length * (parseFloat(formData.amountPerVillage) || 0);

    return (
        <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>
                    Release Funds to Villages
                </h1>
                <p style={{ color: '#6B7280', fontSize: '16px' }}>
                    Ministry releases funds directly to villages across India
                </p>
            </div>

            {/* State & District Selection */}
            <div style={{
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                marginBottom: '24px'
            }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    {/* State Selection */}
                    <div>
                        <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                            <Building2 size={18} style={{ display: 'inline', marginRight: '8px' }} />
                            Select State
                        </label>
                        <select
                            value={selectedState}
                            onChange={(e) => handleStateChange(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid #D1D5DB',
                                fontSize: '16px'
                            }}
                        >
                            <option value="">-- Select State --</option>
                            {states.map(state => (
                                <option key={state.id} value={state.name}>
                                    {state.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* District Selection */}
                    <div>
                        <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                            <MapPin size={18} style={{ display: 'inline', marginRight: '8px' }} />
                            Select District
                        </label>
                        <select
                            value={selectedDistrict}
                            onChange={(e) => handleDistrictChange(e.target.value)}
                            disabled={!selectedState}
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid #D1D5DB',
                                fontSize: '16px',
                                backgroundColor: !selectedState ? '#F3F4F6' : 'white'
                            }}
                        >
                            <option value="">-- Select District --</option>
                            {districts.map(district => (
                                <option key={district.id} value={district.name}>
                                    {district.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Villages Selection */}
            {selectedDistrict && (
                <div style={{
                    backgroundColor: 'white',
                    padding: '24px',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    marginBottom: '24px'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>
                            Villages in {selectedDistrict}, {selectedState}
                        </h3>
                        <InteractiveButton
                            variant="secondary"
                            size="sm"
                            onClick={selectAllVillages}
                        >
                            {selectedVillages.length === villages.length ? 'Deselect All' : 'Select All'}
                        </InteractiveButton>
                    </div>

                    {loading ? (
                        <p style={{ textAlign: 'center', color: '#6B7280', padding: '40px' }}>
                            Loading villages...
                        </p>
                    ) : villages.length === 0 ? (
                        <p style={{ textAlign: 'center', color: '#6B7280', padding: '40px' }}>
                            No villages found in this district
                        </p>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                            gap: '12px',
                            maxHeight: '400px',
                            overflowY: 'auto',
                            padding: '8px'
                        }}>
                            {villages.map(village => (
                                <label
                                    key={village.village_code}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: `2px solid ${selectedVillages.includes(village.village_code) ? '#3B82F6' : '#E5E7EB'}`,
                                        backgroundColor: selectedVillages.includes(village.village_code) ? '#EFF6FF' : 'white',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedVillages.includes(village.village_code)}
                                        onChange={() => toggleVillageSelection(village.village_code)}
                                        style={{ marginRight: '12px', width: '18px', height: '18px' }}
                                    />
                                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                                        {village.village_name}
                                    </span>
                                </label>
                            ))}
                        </div>
                    )}

                    {selectedVillages.length > 0 && (
                        <div style={{
                            marginTop: '16px',
                            padding: '12px',
                            backgroundColor: '#EFF6FF',
                            borderRadius: '8px',
                            border: '1px solid #BFDBFE'
                        }}>
                            <p style={{ fontSize: '14px', color: '#1E40AF', fontWeight: '600' }}>
                                <CheckCircle size={16} style={{ display: 'inline', marginRight: '8px' }} />
                                {selectedVillages.length} village(s) selected
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Fund Release Form */}
            {selectedVillages.length > 0 && (
                <form onSubmit={handleSubmit}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '24px',
                        borderRadius: '12px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        marginBottom: '24px'
                    }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '20px' }}>
                            Fund Release Details
                        </h3>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            {/* Amount per Village */}
                            <div>
                                <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                                    <IndianRupee size={16} style={{ display: 'inline', marginRight: '8px' }} />
                                    Amount per Village (₹)
                                </label>
                                <input
                                    type="number"
                                    value={formData.amountPerVillage}
                                    onChange={(e) => setFormData({ ...formData, amountPerVillage: e.target.value })}
                                    placeholder="Enter amount"
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: '1px solid #D1D5DB',
                                        fontSize: '16px'
                                    }}
                                />
                            </div>

                            {/* Release Date */}
                            <div>
                                <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                                    <Calendar size={16} style={{ display: 'inline', marginRight: '8px' }} />
                                    Release Date
                                </label>
                                <input
                                    type="date"
                                    value={formData.releaseDate}
                                    onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: '1px solid #D1D5DB',
                                        fontSize: '16px'
                                    }}
                                />
                            </div>

                            {/* Sanction Order Number */}
                            <div>
                                <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                                    Sanction Order Number
                                </label>
                                <input
                                    type="text"
                                    value={formData.sanctionOrderNo}
                                    onChange={(e) => setFormData({ ...formData, sanctionOrderNo: e.target.value })}
                                    placeholder="e.g., MIN/2024/001"
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: '1px solid #D1D5DB',
                                        fontSize: '16px'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Components Selection */}
                        <div style={{ marginTop: '20px' }}>
                            <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
                                Select Components *
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                                {componentOptions.map(component => (
                                    <label
                                        key={component}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '10px',
                                            borderRadius: '6px',
                                            border: `2px solid ${formData.components.includes(component) ? '#3B82F6' : '#E5E7EB'}`,
                                            backgroundColor: formData.components.includes(component) ? '#EFF6FF' : 'white',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={formData.components.includes(component)}
                                            onChange={() => toggleComponent(component)}
                                            style={{ marginRight: '8px' }}
                                        />
                                        <span style={{ fontSize: '14px' }}>{component}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Remarks */}
                        <div style={{ marginTop: '20px' }}>
                            <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                                Remarks
                            </label>
                            <textarea
                                value={formData.remarks}
                                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                                placeholder="Enter any remarks or notes"
                                rows={3}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid #D1D5DB',
                                    fontSize: '16px',
                                    resize: 'vertical'
                                }}
                            />
                        </div>
                    </div>

                    {/* Summary and Submit */}
                    <div style={{
                        backgroundColor: 'white',
                        padding: '24px',
                        borderRadius: '12px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
                            Release Summary
                        </h3>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                            <div style={{ padding: '16px', backgroundColor: '#F3F4F6', borderRadius: '8px' }}>
                                <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '4px' }}>Villages Selected</p>
                                <p style={{ fontSize: '24px', fontWeight: '700', color: '#111827' }}>{selectedVillages.length}</p>
                            </div>
                            <div style={{ padding: '16px', backgroundColor: '#F3F4F6', borderRadius: '8px' }}>
                                <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '4px' }}>Amount per Village</p>
                                <p style={{ fontSize: '24px', fontWeight: '700', color: '#111827' }}>
                                    ₹{parseFloat(formData.amountPerVillage || 0).toLocaleString('en-IN')}
                                </p>
                            </div>
                            <div style={{ padding: '16px', backgroundColor: '#EFF6FF', borderRadius: '8px', border: '2px solid #3B82F6' }}>
                                <p style={{ fontSize: '14px', color: '#1E40AF', marginBottom: '4px' }}>Total Amount</p>
                                <p style={{ fontSize: '24px', fontWeight: '700', color: '#1E40AF' }}>
                                    ₹{totalAmount.toLocaleString('en-IN')}
                                </p>
                            </div>
                        </div>

                        <InteractiveButton
                            type="submit"
                            variant="primary"
                            size="lg"
                            disabled={submitting}
                            style={{ width: '100%' }}
                        >
                            {submitting ? 'Releasing Funds...' : `Release ₹${totalAmount.toLocaleString('en-IN')} to ${selectedVillages.length} Villages`}
                        </InteractiveButton>
                    </div>
                </form>
            )}
        </div>
    );
};

export default ReleaseVillageFundsMinistry;
