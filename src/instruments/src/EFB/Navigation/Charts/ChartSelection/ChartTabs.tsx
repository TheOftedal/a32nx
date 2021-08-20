import React, { FC, memo, useCallback, useMemo } from 'react';
import { startCase } from 'lodash';
import clsx from 'clsx';
import { IconArrowLeft, IconChartRadar, IconMap, IconPlane, IconPlaneArrival, IconPlaneDeparture, IconStar } from '@tabler/icons';
import { Chart, ChartBundleType, ChartCategory, ChartGroup } from '../../../api/navigation/types';
import { useNavigationDispatch, useNavigationState } from '../../reducer';
import ChartList from './ChartList';
import { NavigationActionType } from '../../types';

const favTabId = 'FAV';

const resolveRunwayBundles = (charts: Array<Chart>): Array<ChartBundleType> => {
    let runways = charts.reduce((result: Array<string>, chart) => {
        chart.runways?.forEach((runway) => {
            if (!result.includes(runway)) {
                result.push(runway);
            }
        });
        return result;
    }, []);

    runways = runways.sort();

    return runways.map((runway) => ({ name: `Approach RWAY ${runway}`, icon: <IconPlaneArrival size={24} stroke={2} />, charts: charts.filter((chart) => chart.runways?.includes(runway)) }));
};

type ChartTabProps = {
    tabId: string;
    isFirst?: boolean;
    isLast?: boolean;
    isActive?: boolean;
    hasItems?: boolean;
    tabOnClick: (tabId: string) => void;
}

const ChartTab: FC<ChartTabProps> = memo(({ tabId, isFirst, isLast, isActive, hasItems, tabOnClick, children }) => (
    <div className=" h-14 w-full text-lg">
        <div
            className={clsx(
                'flex h-12 items-center justify-center text-xl',
                hasItems ? 'text-white' : 'text-gray-400',
                isFirst && 'rounded-l-lg',
                isLast && 'rounded-r-lg',
            )}
            onClick={() => tabOnClick(tabId)}
            key={tabId}
        >
            {children}
        </div>
        <div className={clsx('h-1', isActive ? 'bg-teal-light' : 'bg-navy-medium')} />
    </div>
));

const resolveChartCategoryBundles = (chartCategory: ChartCategory, charts: Array<Chart>, bundleRunways: boolean): Array<ChartBundleType> => {
    switch (chartCategory) {
    case 'SID': return [{ name: 'Standard Instrument Departure', icon: <IconPlaneDeparture size={24} stroke={2} />, charts }];
    case 'STAR': return [{ name: 'Standard Terminal Arrival', icon: <IconPlane size={24} stroke={2} />, charts }];
    case 'APP': return (bundleRunways ? resolveRunwayBundles(charts) : [{ name: 'Approach', icon: <IconPlaneArrival size={24} stroke={2} />, charts }]);
    case 'TAXI': return [{ name: 'Airport Diagrams', icon: <IconMap size={24} stroke={2} />, charts }];
    case 'REF': return [{ name: 'Reference Charts', icon: <IconChartRadar size={24} stroke={2} />, charts }];
    default: return [];
    }
};

export type ChartTabsProps = {
    charts: Array<Chart>;
    isLoadingCharts: boolean;
}

const ChartTabs: FC<ChartTabsProps> = ({ charts, isLoadingCharts }) => {
    const { selectedAirport, selectedChartTab, bundleRunways, favChartIds } = useNavigationState();
    const navigationDispatch = useNavigationDispatch();

    const handleClearSelectedAirportOnClick = useCallback(() => {
        if (selectedAirport) {
            navigationDispatch({ type: NavigationActionType.SetSelectedAirport, payload: undefined });
        }
    }, [selectedAirport, navigationDispatch]);

    const handleTabOnClick = useCallback((tabId: string) => {
        navigationDispatch({ type: NavigationActionType.SetSelectedChartTab, payload: tabId });
    }, [navigationDispatch]);

    const chartGroups = useMemo<Array<ChartGroup>>(() => {
        const groupedCharts = charts.reduce((result: Record<ChartCategory, Array<Chart>>, chart) => {
            (result[chart.category] = result[chart.category] || []).push(chart);
            return result;
        }, {
            SID: [],
            STAR: [],
            APP: [],
            TAXI: [],
            REF: [],
        });

        const groups: Array<ChartGroup> = [];

        const favCharts = favChartIds.reduce((result: Array<Chart>, chartId) => {
            const favChart = charts.find((c) => c.id === chartId);
            if (favChart) {
                result.push(favChart);
            }
            return result;
        }, []);

        groups.push({
            name: 'Favorite',
            bundles: [{ name: 'Favorite Charts', charts: favCharts }],
            tabId: favTabId,
            count: favCharts.length,
            header: <IconStar className={clsx(favCharts.length > 0 ? 'text-teal-light' : 'text-gray-400')} size={22} stroke={2.5} />,
        });

        Object.entries(groupedCharts).forEach(([key, charts]) => {
            const chartCategory = key as ChartCategory;
            const chartBundles = resolveChartCategoryBundles(chartCategory, charts, bundleRunways);

            groups.push({
                name: chartCategory,
                bundles: chartBundles,
                count: chartBundles.reduce((count, bundle) => count + bundle.charts.length, 0),
                tabId: chartCategory,
                header: <span>{chartCategory}</span>,
            });
        });

        return groups;
    }, [charts, bundleRunways, favChartIds, selectedChartTab]);

    const selectedChartGroup = useMemo<ChartGroup | undefined>(() => chartGroups.find((group) => group.tabId === selectedChartTab), [chartGroups, selectedChartTab]);

    return (
        <div className="flex flex-col h-full w-2/5 bg-navy-lighter p-6">
            <div className="flex items-center h-14 ml-1">
                <span className="flex-grow text-2xl font-medium truncate">{`${startCase(selectedAirport?.name?.toLowerCase())} (${selectedAirport?.icaoCode})`}</span>
                <button
                    type="button"
                    className="bg-teal-light font-medium text-lg py-2 px-4 mr-4 text-navy-dark flex items-center justify-center rounded-lg focus:outline-none"
                    onClick={handleClearSelectedAirportOnClick}
                >
                    <IconArrowLeft size={24} stroke={2} strokeLinejoin="miter" />
                </button>
            </div>
            <div className="flex flex-row mt-6 mr-4 justify-between bg-navy-regular rounded-lg">
                {chartGroups.map((group, index) => (
                    <ChartTab
                        tabId={group.tabId}
                        isLast={index >= chartGroups.length - 1}
                        isActive={group.tabId === selectedChartTab}
                        hasItems={group.count > 0}
                        tabOnClick={() => handleTabOnClick(group.tabId)}
                        key={group.tabId}
                    >
                        {group.header}
                    </ChartTab>
                ))}
            </div>
            {selectedChartGroup && (<ChartList chartGroup={selectedChartGroup} isLoadingCharts={isLoadingCharts} />)}
        </div>
    );
};

export default memo(ChartTabs);
