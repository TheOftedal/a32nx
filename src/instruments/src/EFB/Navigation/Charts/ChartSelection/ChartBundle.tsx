import React, { FC, memo, useCallback } from 'react';
import { Chart } from '../../../api/navigation/types';
import { BundleList, ListItem } from '../../components/List';

import { useNavigationDispatch, useNavigationState } from '../../reducer';
import { NavigationActionType } from '../../types';

export type ChartBundleProps = {
    bundleName: string;
    icon?: JSX.Element;
    charts: Array<Chart>,
}

const ChartBundle: FC<ChartBundleProps> = memo(({ bundleName, icon, charts }) => {
    const { selectedChart, favChartIds } = useNavigationState();
    const navigationDispatch = useNavigationDispatch();

    const handleChartOnClick = useCallback((chart: Chart) => {
        navigationDispatch({ type: NavigationActionType.SetSelectedChart, payload: chart });
    }, [navigationDispatch]);

    const handleChartFavOnClick = useCallback((chart: Chart) => {
        if (favChartIds.includes(chart.id)) {
            navigationDispatch({ type: NavigationActionType.RemoveFavChartId, payload: chart.id });
        } else {
            navigationDispatch({ type: NavigationActionType.AddFavChartId, payload: chart.id });
        }
    }, [navigationDispatch, favChartIds]);

    if (charts.length < 1) {
        return <></>;
    }

    return (
        <BundleList bundleName={bundleName} icon={icon}>
            {charts.map((chart) => (
                <ListItem
                    title={chart.name}
                    description={chart.description}
                    meta={chart.meta}
                    onClick={() => handleChartOnClick(chart)}
                    favOnClick={() => handleChartFavOnClick(chart)}
                    isActive={chart.id === selectedChart?.id}
                    isFav={favChartIds.includes(chart.id)}
                    key={chart.id}
                    isSelectable
                    showFav
                />
            ))}
        </BundleList>
    );
});

export default memo(ChartBundle);
