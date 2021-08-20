import React, { FC, useCallback } from 'react';
import { useGlobalContext } from '../../Store/global-context';
import { ChartSource, NavigationActionType } from '../types';

const ChartSourceSelection: FC = () => {
    const { navigationDispatch } = useGlobalContext();

    const handleChartSourceOnClick = useCallback((source: ChartSource) => {
        navigationDispatch({ type: NavigationActionType.SetSelectedChartSource, payload: source });
    }, [navigationDispatch]);

    return <button type="button" onClick={() => handleChartSourceOnClick(ChartSource.Navigraph)}>Navigraph</button>;
};

export default ChartSourceSelection;
