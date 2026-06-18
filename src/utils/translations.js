export const translations = {
    en: {
        // Dashboard
        dashboard: 'Dashboard',
        assignedWorks: 'Assigned Works',
        worksInProgress: 'Works in Progress',
        pendingPayments: 'Pending Payments',
        completedWorks: 'Completed Works',
        recentAssignedWorks: 'Recent Assigned Works',
        viewAllWorks: 'View All Works',
        updateProgress: 'Update Progress',
        paymentStatus: 'Payment Status',
        help: 'Help',
        logout: 'Logout',
        quickActions: 'Quick Actions',

        // Work details
        projectName: 'Project Name',
        location: 'Location',
        budget: 'Budget',
        deadline: 'Deadline',
        status: 'Status',
        progress: 'Progress',
        startDate: 'Start Date',
        endDate: 'End Date',

        // Actions
        view: 'View',
        edit: 'Edit',
        submit: 'Submit',
        cancel: 'Cancel',
        save: 'Save',
        delete: 'Delete',
        uploadSitePhotos: 'Upload Site Photos',
        updatePhysicalProgress: 'Update physical progress with images',
        checkPayments: 'Check Payments',
        viewBillStatus: 'View bill status and history',
        raiseIssue: 'Raise Issue',
        contactDepartment: 'Contact department for support',

        // Status
        pending: 'Pending',
        inProgress: 'In Progress',
        completed: 'Completed',
        delayed: 'Delayed',
        notStarted: 'Not Started',

        // Common
        home: 'Home',
        search: 'Search',
        filter: 'Filter',
        export: 'Export',
        print: 'Print',
        loading: 'Loading...',
        noData: 'No data available',
        noAssignedWorks: 'No assigned works found.',
        error: 'Error occurred',
        success: 'Success',

        // Payment
        amount: 'Amount',
        paymentDate: 'Payment Date',
        paymentMethod: 'Payment Method',
        transactionId: 'Transaction ID',
        paid: 'Paid',
        unpaid: 'Unpaid',

        // User
        user: 'User',
        profile: 'Profile',
        settings: 'Settings',
        notifications: 'Notifications',
    },
    hi: {
        // Dashboard
        dashboard: 'डैशबोर्ड',
        assignedWorks: 'सौंपे गए कार्य',
        worksInProgress: 'प्रगति में कार्य',
        pendingPayments: 'लंबित भुगतान',
        completedWorks: 'पूर्ण कार्य',
        recentAssignedWorks: 'हाल के सौंपे गए कार्य',
        viewAllWorks: 'सभी कार्य देखें',
        updateProgress: 'प्रगति अपडेट करें',
        paymentStatus: 'भुगतान स्थिति',
        help: 'सहायता',
        logout: 'लॉगआउट',
        quickActions: 'त्वरित कार्य',

        // Work details
        projectName: 'परियोजना का नाम',
        location: 'स्थान',
        budget: 'बजट',
        deadline: 'समय सीमा',
        status: 'स्थिति',
        progress: 'प्रगति',
        startDate: 'आरंभ तिथि',
        endDate: 'समाप्ति तिथि',

        // Actions
        view: 'देखें',
        edit: 'संपादित करें',
        submit: 'जमा करें',
        cancel: 'रद्द करें',
        save: 'सहेजें',
        delete: 'हटाएं',
        uploadSitePhotos: 'साइट फोटो अपलोड करें',
        updatePhysicalProgress: 'छवियों के साथ भौतिक प्रगति अपडेट करें',
        checkPayments: 'भुगतान जांचें',
        viewBillStatus: 'बिल स्थिति और इतिहास देखें',
        raiseIssue: 'समस्या उठाएं',
        contactDepartment: 'सहायता के लिए विभाग से संपर्क करें',

        // Status
        pending: 'लंबित',
        inProgress: 'प्रगति में',
        completed: 'पूर्ण',
        delayed: 'विलंबित',
        notStarted: 'शुरू नहीं हुआ',

        // Common
        home: 'होम',
        search: 'खोजें',
        filter: 'फ़िल्टर',
        export: 'निर्यात',
        print: 'प्रिंट',
        loading: 'लोड हो रहा है...',
        noData: 'कोई डेटा उपलब्ध नहीं',
        noAssignedWorks: 'कोई सौंपे गए कार्य नहीं मिले।',
        error: 'त्रुटि हुई',
        success: 'सफलता',

        // Payment
        amount: 'राशि',
        paymentDate: 'भुगतान तिथि',
        paymentMethod: 'भुगतान विधि',
        transactionId: 'लेनदेन आईडी',
        paid: 'भुगतान किया गया',
        unpaid: 'अवैतनिक',

        // User
        user: 'उपयोगकर्ता',
        profile: 'प्रोफ़ाइल',
        settings: 'सेटिंग्स',
        notifications: 'सूचनाएं',
    }
};

export const t = (key, language = 'en') => {
    return translations[language][key] || key;
};
