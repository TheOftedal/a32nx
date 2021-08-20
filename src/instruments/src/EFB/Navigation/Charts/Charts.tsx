import React, { FC } from 'react';
import { NavigraphApiProvider } from '../../api/navigation/navigraph';
import { SimbriefData } from '../../Efb';
import { useNavigationState } from '../reducer';
import { ChartSource } from '../types';
import ChartFoxCharts from './ChartFox/ChartFoxCharts';
import ChartSourceSelection from './ChartSourceSelection';
import Navigraph from './Navigraph';

export type ChartsProps = {
    simBriefData: SimbriefData;
}

const Charts: FC<ChartsProps> = ({ simBriefData }) => {
    const { selectedChartSource } = useNavigationState();

    switch (selectedChartSource) {
    case ChartSource.Navigraph: return (
        <NavigraphApiProvider>
            <Navigraph simBriefData={simBriefData} />
        </NavigraphApiProvider>
    );
    case ChartSource.ChartFox: return <ChartFoxCharts />;
    default: return <ChartSourceSelection />;
    }
};

export default Charts;
