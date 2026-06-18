import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Globe } from 'lucide-react';

const LanguageSwitcher = () => {
    const { language, toggleLanguage } = useLanguage();

    return (
        <button
            onClick={toggleLanguage}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                backgroundColor: 'white',
                border: '2px solid #FF9933',
                borderRadius: '8px',
                color: '#FF9933',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 4px rgba(255, 153, 51, 0.1)'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#FF9933';
                e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.color = '#FF9933';
            }}
            title={language === 'en' ? 'Switch to Hindi' : 'अंग्रेज़ी में बदलें'}
        >
            <Globe size={18} />
            <span>{language === 'en' ? 'हिंदी' : 'English'}</span>
        </button>
    );
};

export default LanguageSwitcher;
