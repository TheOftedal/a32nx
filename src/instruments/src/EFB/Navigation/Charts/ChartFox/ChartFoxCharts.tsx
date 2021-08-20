import React, { FC, useCallback } from 'react';
import { AirportInfo } from '../../../api/navigation/types';
import AirportSearch from '../../AirportSelection/AirportSearch';

export type ChartFoxChartsProps = {

}

export const ChartFoxCharts: FC<ChartFoxChartsProps> = () => {
    const searchAsync = useCallback(async (): Promise<Array<AirportInfo>> => [], []);

    return (
        <>
            <AirportSearch searchAsync={searchAsync} />
        </>
    );
};

export default ChartFoxCharts;
