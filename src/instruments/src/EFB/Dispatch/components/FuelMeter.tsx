import React, { FC, memo, useMemo } from 'react';

import { ProgressBar } from '../../Components/Progress/Progress';

export type FuelMeterProps = {
    header: string;
    target: number;
    current: number;
    total: number;
    convertFuelValue: (curr: number) => number;
    unit: string;
}

const FuelMeter: FC<FuelMeterProps> = ({ header, target, current, total, unit, convertFuelValue }) => {
    const completed = useMemo(() => (Math.max(current, 0) / total) * 100, [current, total]);
    const completedBarBegin = useMemo(() => (Math.max(target, 0) / total) * 100, [target, total]);

    return (
        <div className="bg-navy-lighter rounded-2xl p-6 text-white shadow-lg overflow-x-hidden">
            <h2 className="text-2xl font-medium">{header}</h2>
            <div className="flex mt-4">
                <ProgressBar
                    height="10px"
                    width="200px"
                    isLabelVisible={false}
                    displayBar={false}
                    completedBarBegin={completedBarBegin}
                    bgcolor="#3b82f6"
                    completed={completed}
                />
                <div className="fuel-label">
                    <label className="fuel-content-label text-base" htmlFor="fuel-label">
                        <span>{`${convertFuelValue(current)}/${Math.round(total)} ${unit}`}</span>
                    </label>
                </div>
            </div>
        </div>
    );
};

export default memo(FuelMeter);
