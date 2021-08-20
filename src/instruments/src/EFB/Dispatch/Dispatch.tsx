import React, { FC, useMemo, useState } from 'react';

import OverviewPage from './Pages/OverviewPage';
import LoadsheetPage from './Pages/LoadsheetPage';
import { Navbar } from '../Components/Navbar';
import { FuelPage } from './Pages/FuelPage';
import { AircraftInfo, DispatchFuels, DispatchWeights } from './types';

export type DispatchProps = {
    loadsheet: string,
    weights: DispatchWeights,
    fuels: DispatchFuels,
    units: string,
    arrivingAirport: string,
    arrivingIata: string,
    departingAirport: string,
    departingIata: string,
    altBurn: number,
    altIcao: string,
    altIata: string,
    tripTime: number,
    contFuelTime: number,
    resFuelTime: number,
    taxiOutTime: number,
}

// Replace with state
const aircraftInfo: AircraftInfo = {
    model: '320-251N [A20N]',
    range: 3400,
    mrw: 79400,
    mzfw: 64300,
    maxPax: 180,
    engines: 'CFM LEAP 1A-26',
    mmo: 0.82,
    mtow: 79000,
    maxFuelCapacity: 23721,
    maxCargo: 9435,
};

const Dispatch:FC<DispatchProps> = (props) => {
    const [activePage, setActivePage] = useState<number>(0);

    const pages = ['Overview', 'OFP', 'Fuel'];

    const currentPage = useMemo(() => {
        switch (activePage) {
        case 1:
            return (
                <LoadsheetPage loadsheet={props.loadsheet} />
            );
        case 2:
            return (
                <FuelPage />
            );
        case 3:
            return (
                <div className="w-full h-full">
                    <p className="text-white font-medium mt-6 ml-4 text-3xl">Inop.</p>
                </div>
            );
        default:
            return (
                <OverviewPage
                    aircraftInfo={aircraftInfo}
                />
            );
        }
    }, [activePage]);

    return (
        <div className="w-full">
            <h1 className="text-3xl pt-6 text-white">Dispatch</h1>
            <Navbar tabs={pages} onSelected={(page) => setActivePage(page)} />
            <div>
                {currentPage}
            </div>
        </div>
    );
};

export default Dispatch;
