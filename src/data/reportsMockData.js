export const reportsMockData = {
  kpis: [
    {
      label: 'Total Projects',
      primaryValue: '9',
      secondaryValue: '4 active',
      color: '#EEF2FF',
      accent: '#4F46E5',
      trend: [4, 5, 6, 5, 6, 7, 6],
    },
    {
      label: 'Total Budget',
      primaryValue: '₹17.0 Cr',
      secondaryValue: 'across components',
      color: '#ECFEFF',
      accent: '#0EA5E9',
      trend: [7, 8, 9, 9, 10, 10, 10],
    },
    {
      label: 'Funds Released',
      primaryValue: '₹2 Cr',
      secondaryValue: 'this quarter',
      color: '#ECFDF3',
      accent: '#16A34A',
      trend: [1, 1, 1, 2, 3, 3, 3],
    },
    {
      label: 'Average Progress',
      primaryValue: '55%',
      secondaryValue: 'overall',
      color: '#FEF3C7',
      accent: '#D97706',
      trend: [35, 42, 48, 50, 52, 55, 52],
    },
  ],
  overview: {
    projectsByStatus: [
      { label: 'Completed', value: 2, color: '#10B981' },
      { label: 'In Progress', value: 5, color: '#3B82F6' },
      { label: 'Delayed', value: 2, color: '#F97316' },
      { label: 'Not Started', value: 0, color: '#94A3B8' },
    ],
    budgetByComponent: [
      { label: 'component_adarsh_gram', value: 58, color: '#10B981' },
      { label: 'component_hostel', value: 42, color: '#2563EB' },
    ],
    stateWiseProjectDistribution: [
      { label: 'Maharashtra', value: 3, color: '#F97316' },
      { label: 'Uttar Pradesh', value: 2, color: '#F59E0B' },
      { label: 'Gujarat', value: 2, color: '#FB923C' },
      { label: 'West Bengal', value: 1, color: '#FDBA74' },
      { label: 'Tamil Nadu', value: 1, color: '#FBBF24' },
    ],
    componentPerformance: [
      { label: 'component_adarsh_gram', value: 6.0 },
      { label: 'component_hostel', value: 4.2 },
    ],
  },
  financial: {
    utilizationByState: [
      { label: 'Maharashtra', allocatedCr: 3.6, releasedCr: 1.8, utilizedCr: 1.4 },
      { label: 'Uttar Pradesh', allocatedCr: 3.6, releasedCr: 0.0, utilizedCr: 0.0 },
      { label: 'Gujarat', allocatedCr: 3.6, releasedCr: 0.9, utilizedCr: 0.4 },
      { label: 'West Bengal', allocatedCr: 3.6, releasedCr: 0.9, utilizedCr: 0.5 },
      { label: 'Tamil Nadu', allocatedCr: 3.6, releasedCr: 1.8, utilizedCr: 0.6 },
    ],
    allocationVsUtilization: [
      { label: 'Allocated Budget', value: 17, color: '#4F46E5' },
      { label: 'Utilized Budget', value: 3, color: '#22C55E' },
    ],
    fundReleaseTimeline: {
      months: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'],
      currencyCr: [45, 70, 100, 120, 110, 140, 170]
    }
  },
  performance: {
    progressDistribution: [
      { label: '0-25%', value: 1, color: '#EF4444' },
      { label: '25-50%', value: 2, color: '#F97316' },
      { label: '50-75%', value: 2, color: '#3B82F6' },
      { label: '75-100%', value: 1, color: '#22C55E' },
    ],
    radarMetrics: [
      { label: 'Quality', value: 78 },
      { label: 'Timeliness', value: 65 },
      { label: 'Compliance', value: 72 },
      { label: 'Impact', value: 80 },
      { label: 'Efficiency', value: 70 },
    ],
  },
  trends: {
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    projectsStarted: [2, 3, 1, 4, 5, 3, 2, 4, 3, 5, 4, 3],
    monthlyBudgetCr: [0.4, 0.6, 0.3, 0.8, 1.2, 0.9, 0.7, 1.0, 0.9, 1.4, 1.6, 1.1],
  },
};

