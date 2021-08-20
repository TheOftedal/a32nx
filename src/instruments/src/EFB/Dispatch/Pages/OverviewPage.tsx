import React, { FC, memo } from 'react';
import { IconAlignRight, IconBox, IconPlane, IconSwitchHorizontal, IconUsers, IconBolt } from '@tabler/icons';
import { useSimVar } from '@instruments/common/simvars';
import fuselage from '../../Assets/320neo-outline-nose.svg';
import { InfoItem } from '../components/InfoItem';
import { AircraftInfo } from '../types';
import { formatNumber } from '../utils';

export type OverviewPageProps = {
    aircraftInfo: AircraftInfo
}

const OverviewPage:FC<OverviewPageProps> = ({ aircraftInfo }) => {
    const [airline] = useSimVar('ATC AIRLINE', 'string', 1_000);

    return (
        <div className="flex mt-6">
            <div className="w-1/2 mr-3">
                <div className="text-white overflow-hidden bg-navy-lighter rounded-2xl shadow-lg p-6 h-efb-nav">
                    <h2 className="text-2xl font-medium">Airbus A320neo</h2>
                    <span className="text-lg text-gray-500">{airline && airline !== '' ? airline : 'FlyByWire Simulations'}</span>
                    <div className="flex items-center justify-center mt-6">
                        <img className="flip-horizontal h-48 -ml-96 mr-32" src={fuselage} />
                    </div>
                    <div className="mt-8 flex">
                        <div className="w-1/2 space-y-6">
                            <InfoItem header="Model" value={aircraftInfo.model} icon={<IconPlane size={23} stroke={1.5} strokeLinejoin="miter" />} />
                            <InfoItem header="Range" value={`${formatNumber(aircraftInfo.range)} [nm]`} icon={<IconSwitchHorizontal size={23} stroke={1.5} strokeLinejoin="miter" />} />
                            <InfoItem header="MRW" value={`${formatNumber(aircraftInfo.mrw)} [kg]`} icon={<IconBox size={23} stroke={1.5} strokeLinejoin="miter" />} />
                            <InfoItem header="MZFW" value={`${formatNumber(aircraftInfo.mzfw)} [kg]`} icon={<IconBox size={23} stroke={1.5} strokeLinejoin="miter" />} />
                            <InfoItem header="Max PAX" value={formatNumber(aircraftInfo.maxPax)} icon={<IconUsers size={23} stroke={1.5} strokeLinejoin="miter" />} />
                        </div>
                        <div className="w-1/2 space-y-6">
                            <InfoItem header="Engines" value={aircraftInfo.engines} icon={<IconBolt size={23} stroke={1.5} strokeLinejoin="miter" />} />
                            <InfoItem header="Mmo" value={aircraftInfo.mmo} icon={<IconAlignRight size={23} stroke={1.5} strokeLinejoin="miter" />} />
                            <InfoItem header="MTOW" value={`${formatNumber(aircraftInfo.mtow)} [kg]`} icon={<IconBox size={23} stroke={1.5} strokeLinejoin="miter" />} />
                            <InfoItem header="Max Fuel Capacity" value={`${formatNumber(aircraftInfo.maxFuelCapacity)} [l]`} icon={<IconBox size={23} stroke={1.5} strokeLinejoin="miter" />} />
                            <InfoItem header="Max Cargo" value={`${formatNumber(aircraftInfo.maxCargo)} [kg]`} icon={<IconBox size={23} stroke={1.5} strokeLinejoin="miter" />} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default memo(OverviewPage);
