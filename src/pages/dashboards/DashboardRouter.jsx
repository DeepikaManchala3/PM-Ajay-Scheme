import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, ROLES } from '../../contexts/AuthContext';
import MinistryDashboard from './MinistryDashboard';
import StateDashboard from './StateDashboard';
import DistrictDashboard from './DistrictDashboard';
import GPDashboard from './GPDashboard';
import DepartmentDashboard from './DepartmentDashboard';
import ContractorDashboard from './ContractorDashboard';

const DashboardRouter = () => {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    switch (user.role) {
        case ROLES.MINISTRY:
            return <MinistryDashboard />;

        case ROLES.STATE:
            return <StateDashboard />;

        case ROLES.DISTRICT:
            return <DistrictDashboard />;

        case ROLES.GP:
            return <GPDashboard />;

        case ROLES.DEPARTMENT:
            return <DepartmentDashboard />;

        case ROLES.CONTRACTOR:
            return <ContractorDashboard />;

        case ROLES.IMPLEMENTING_AGENCY:
            return <DepartmentDashboard />;

        case ROLES.EXECUTING_AGENCY:
            return <ContractorDashboard />;

        default:
            return <Navigate to="/login" replace />;
    }
};

export default DashboardRouter;
