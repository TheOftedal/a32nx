import React, { FC, memo } from 'react';
import { ChartGroup } from '../../../api/navigation/types';
import { ScrollableList } from '../../components/List';
import Loader from '../../components/Loader';
import ChartBundle from './ChartBundle';

export type ChartListProps = {
    chartGroup: ChartGroup;
    isLoadingCharts: boolean;
}

const ChartList: FC<ChartListProps> = ({ chartGroup, isLoadingCharts }) => (
    <ScrollableList>
        <Loader isLoading={isLoadingCharts} />
        {!isLoadingCharts && (chartGroup.count < 1
            ? (
                <div className="flex justify-center items-center p-6 bg-navy-regular rounded-lg">
                    <span className="text-gray-400 text-center">{`No ${chartGroup.name} Charts`}</span>
                </div>
            )
            : chartGroup.bundles.map((bundle) => (
                <ChartBundle
                    bundleName={bundle.name}
                    icon={bundle.icon}
                    charts={bundle.charts}
                    key={bundle.name}
                />
            )))}
    </ScrollableList>
);

export default memo(ChartList);
