import React, { FC } from 'react';
import { useNavigraphApi } from '../../../api/navigation/navigraph';
import { SimbriefData } from '../../../Efb';
import NavigraphAuth from './NavigraphAuth';
import NavigraphCharts from './NavigraphCharts';

export type NavigraphProps = {
    simBriefData: SimbriefData;
}

export const Navigraph: FC<NavigraphProps> = ({ simBriefData }) => {
    const { isAuthenticated } = useNavigraphApi();

    if (!isAuthenticated) {
        return <NavigraphAuth />;
    }

    return <NavigraphCharts simBriefData={simBriefData} />;
};

export default Navigraph;
