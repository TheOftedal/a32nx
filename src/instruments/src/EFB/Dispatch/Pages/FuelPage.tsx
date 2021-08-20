import React, { useMemo, useCallback } from 'react';
import { round } from 'lodash';
import { IconPlayerPlay, IconHandStop } from '@tabler/icons';
import { Slider } from '@flybywiresim/react-components';
import { useSimVar, useSimVarSyncedPersistentProperty } from '@instruments/common/simvars';
import { SelectGroup, SelectItem } from '../../Components/Form/Select';
import { ProgressBar } from '../../Components/Progress/Progress';
import Button, { BUTTON_TYPE } from '../../Components/Button/Button';
import SimpleInput from '../../Components/Form/SimpleInput/SimpleInput';
import fuselage from '../../Assets/320neo_outline_fuel.svg';
<<<<<<< Updated upstream
import { useSimVar } from '../../../Common/simVars';
import { useSimVarSyncedPersistentProperty } from '../../../Common/persistence';
=======
import FuelMeter from '../components/FuelMeter';
>>>>>>> Stashed changes

export const FuelPage = () => {
    const totalFuelGallons = 6267;
    const outerCellGallon = 228;
    const innerCellGallon = 1816;
    const centerTankGallon = 2179;
    const wingTotalRefuelTimeSeconds = 1020;
    const CenterTotalRefuelTimeSeconds = 180;
    const [usingMetrics, setUsingMetrics] = useSimVarSyncedPersistentProperty('L:A32NX_CONFIG_USING_METRIC_UNIT', 'Number', 'CONFIG_USING_METRIC_UNIT');
<<<<<<< Updated upstream

    const currentUnit = () => {
        if (usingMetrics === 1) {
            return 'KG';
        }
        return 'LB';
    };

    const convertUnit = () => {
        if (usingMetrics === 1) {
            return 1;
        }
        return 2.204617615;
    };

=======
>>>>>>> Stashed changes
    const [galToKg] = useSimVar('FUEL WEIGHT PER GALLON', 'kilograms', 1_000);
    const [busDC2] = useSimVar('L:A32NX_ELEC_DC_2_BUS_IS_POWERED', 'Bool', 1_000);
    const [busDCHot1] = useSimVar('L:A32NX_ELEC_DC_HOT_1_BUS_IS_POWERED', 'Bool', 1_000);
    const [simGroundSpeed] = useSimVar('GPS GROUND SPEED', 'knots', 1_000);
    const [isOnGround] = useSimVar('SIM ON GROUND', 'Bool', 1_000);
    const [eng1Running] = useSimVar('ENG COMBUSTION:1', 'Bool', 1_000);
    const [eng2Running] = useSimVar('ENG COMBUSTION:2', 'Bool', 1_000);
    const [refuelRate, setRefuelRate] = useSimVarSyncedPersistentProperty('L:A32NX_REFUEL_RATE_SETTING', 'Number', 'REFUEL_RATE_SETTING');
    const [sliderValue, setSliderValue] = useSimVar('L:A32NX_FUEL_DESIRED_PERCENT', 'Number');
    const [inputValue, setInputValue] = useSimVar('L:A32NX_FUEL_DESIRED', 'Number');
    const [totalTarget, setTotalTarget] = useSimVar('L:A32NX_FUEL_TOTAL_DESIRED', 'Number');
    const [refuelStartedByUser, setRefuelStartedByUser] = useSimVar('L:A32NX_REFUEL_STARTED_BY_USR', 'Bool');
    const [centerTarget, setCenterTarget] = useSimVar('L:A32NX_FUEL_CENTER_DESIRED', 'Number');
    const [LInnTarget, setLInnTarget] = useSimVar('L:A32NX_FUEL_LEFT_MAIN_DESIRED', 'Number');
    const [LOutTarget, setLOutTarget] = useSimVar('L:A32NX_FUEL_LEFT_AUX_DESIRED', 'Number');
    const [RInnTarget, setRInnTarget] = useSimVar('L:A32NX_FUEL_RIGHT_MAIN_DESIRED', 'Number');
    const [ROutTarget, setROutTarget] = useSimVar('L:A32NX_FUEL_RIGHT_AUX_DESIRED', 'Number');
    const [centerCurrent] = useSimVar('FUEL TANK CENTER QUANTITY', 'Gallons', 1_000);
    const [LInnCurrent] = useSimVar('FUEL TANK LEFT MAIN QUANTITY', 'Gallons', 1_000);
    const [LOutCurrent] = useSimVar('FUEL TANK LEFT AUX QUANTITY', 'Gallons', 1_000);
    const [RInnCurrent] = useSimVar('FUEL TANK RIGHT MAIN QUANTITY', 'Gallons', 1_000);
    const [ROutCurrent] = useSimVar('FUEL TANK RIGHT AUX QUANTITY', 'Gallons', 1_000);

    const currentUnit = useMemo(() => (usingMetrics === 1 ? 'KG' : 'LB'), [usingMetrics]);
    const convertUnit = useMemo(() => (usingMetrics === 1 ? 1 : 2.204617615), [usingMetrics]);

    const outerCell = useMemo<number>(() => outerCellGallon * galToKg * convertUnit, [outerCellGallon, galToKg, convertUnit]);
    const outerCells = useMemo<number>(() => outerCell * 2, [outerCell]);
    const innerCell = useMemo(() => centerTankGallon * galToKg * convertUnit, [centerTankGallon, galToKg, convertUnit]);
    const innerCells = useMemo(() => innerCell * 2, [innerCell]);
    const centerTank = useMemo(() => centerTankGallon * galToKg * convertUnit, [centerTankGallon, galToKg, convertUnit]);
    const totalFuel = useMemo(() => centerTank + innerCells + outerCells, []);

    const airplaneCanRefuel = useMemo<boolean>(() => {
        // TODO : REMOVE THIS IF WHENEVER PERSISTANCE IS IMPLEMENTED
        if (usingMetrics !== 1) {
            setUsingMetrics(1);
        }

        if (simGroundSpeed > 0.1 || eng1Running || eng2Running || !isOnGround || (!busDC2 && !busDCHot1)) {
            return false;
        }
        return true;
    }, [simGroundSpeed, eng1Running, eng2Running, isOnGround, busDC2, busDCHot1, usingMetrics]);

    const fuelMultiplier = useMemo(() => galToKg * convertUnit, [galToKg, convertUnit]);

    const currentWingFuel = useMemo(() => round(Math.max((LInnCurrent + (LOutCurrent) + (RInnCurrent) + (ROutCurrent)), 0)),
        [LInnCurrent, LOutCurrent, RInnCurrent, ROutCurrent]);

    const targetWingFuel = useMemo(() => round(Math.max((LInnTarget + (LOutTarget) + (RInnTarget) + (ROutTarget)), 0)),
        [LInnTarget, LOutTarget, RInnTarget, ROutTarget]);

    const convertToGallon = useCallback((curr : number) => curr * (1 / convertUnit) * (1 / galToKg),
        [convertUnit, galToKg]);

    const totalCurrentGallon = useMemo(() => round(Math.max((LInnCurrent + (LOutCurrent) + (RInnCurrent) + (ROutCurrent) + (centerCurrent)), 0)),
        [LInnCurrent, LOutCurrent, RInnCurrent, ROutCurrent, centerCurrent]);

    const totalCurrent = useMemo(() => {
        if (round(totalTarget) === totalCurrentGallon) {
            return inputValue;
        }
        const val = round(totalCurrentGallon * fuelMultiplier);
        if (centerCurrent > 0 && centerCurrent < centerTankGallon) {
            return round(val + convertUnit);
        }
        return val;
    }, [totalTarget, inputValue, totalCurrentGallon, fuelMultiplier, centerCurrent, centerTankGallon, convertUnit]);

    const refuelStatusLabel = useMemo(() => {
        if (airplaneCanRefuel) {
            if (round(totalTarget) === totalCurrentGallon) {
                return '(Completed)';
            }
            if (refuelStartedByUser) {
                return ((totalTarget) > (totalCurrentGallon)) ? '(Refueling...)' : '(Defueling...)';
            }
            return '(Ready to start)';
        }
        if (refuelStartedByUser) {
            setRefuelStartedByUser(false);
        }
        return '(Unavailable)';
    }, [airplaneCanRefuel, totalTarget, totalCurrentGallon, refuelStartedByUser, setRefuelStartedByUser]);

    const refuelStatusClass = useMemo(() => {
        if (airplaneCanRefuel) {
            if (round(totalTarget) === totalCurrentGallon || !refuelStartedByUser) {
                if (refuelStartedByUser) {
                    setRefuelStartedByUser(false);
                }
                return 'text-base text-blue-500';
            }
            return ((totalTarget) > (totalCurrentGallon)) ? 'text-base text-green-500' : 'text-base text-yellow-500';
        }
        return 'text-base text-gray-400';
    }, [airplaneCanRefuel, totalTarget, totalCurrentGallon, refuelStartedByUser, setRefuelStartedByUser]);

    const formatFuelFilling = (curr: number, max: number) => {
        const percent = (Math.max(curr, 0) / max) * 100;
        return `linear-gradient(to top, #3b82f6 ${percent}%,#ffffff00 0%)`;
    };

    const convertFuelValue = useCallback((curr: number) => round(round(Math.max(curr, 0)) * fuelMultiplier), [fuelMultiplier]);

    const convertFuelValueCenter = useCallback((curr: number) => {
        if (curr < 1) {
            return 0;
        }
        if (curr === centerTankGallon) {
            return convertFuelValue(curr);
        }
        return round(convertFuelValue(curr) + convertUnit);
    }, [centerTankGallon, convertUnit, convertFuelValue]);

    const setDesiredFuel = useCallback((fuel: number) => {
        fuel -= (outerCellGallon) * 2;
        const outerTank = (((outerCellGallon) * 2) + Math.min(fuel, 0)) / 2;
        setLOutTarget(outerTank);
        setROutTarget(outerTank);
        if (fuel <= 0) {
            setLInnTarget(0);
            setRInnTarget(0);
            setCenterTarget(0);
            return;
        }
        fuel -= (innerCellGallon) * 2;
        const innerTank = (((innerCellGallon) * 2) + Math.min(fuel, 0)) / 2;
        setLInnTarget(innerTank);
        setRInnTarget(innerTank);
        if (fuel <= 0) {
            setCenterTarget(0);
            return;
        }
        setCenterTarget(fuel);
    }, [outerCellGallon, innerCellGallon, setLOutTarget, setROutTarget, setLInnTarget, setRInnTarget, setCenterTarget]);

    const updateDesiredFuel = useCallback((value:string) => {
        let fuel = 0;
        let originalFuel = 0;
        if (value.length > 0) {
            originalFuel = parseInt(value);
            fuel = convertToGallon(originalFuel);
            if (originalFuel > totalFuel) {
                originalFuel = round(totalFuel);
            }
            setInputValue(originalFuel);
        }
        if (fuel > totalFuelGallons) {
            fuel = totalFuelGallons + 2;
        }
        setTotalTarget(fuel);
        setSliderValue((fuel / totalFuelGallons) * 100);
        setDesiredFuel(fuel);
    }, []);

    const updateSlider = useCallback((value: number) => {
        if (value < 2) {
            value = 0;
        }
        setSliderValue(value);
        const fuel = Math.round(totalFuel * (value / 100));
        updateDesiredFuel(fuel.toString());
    }, [setSliderValue, updateDesiredFuel]);

    const calculateEta = useCallback(() => {
        if (round(totalTarget) === totalCurrentGallon || refuelRate === 2) {
            return ' 0';
        }
        let estimatedTimeSeconds = 0;
        const totalWingFuel = totalFuelGallons - centerTankGallon;
        const differentialFuelWings = Math.abs(currentWingFuel - targetWingFuel);
        const differentialFuelCenter = Math.abs(centerTarget - centerCurrent);
        estimatedTimeSeconds += (differentialFuelWings / totalWingFuel) * wingTotalRefuelTimeSeconds;
        estimatedTimeSeconds += (differentialFuelCenter / centerTankGallon) * CenterTotalRefuelTimeSeconds;
        if (refuelRate === 1) {
            estimatedTimeSeconds /= 5;
        }
        if (estimatedTimeSeconds < 35) {
            return ' 0.5';
        }
        return ` ${Math.round(estimatedTimeSeconds / 60)}`;
    }, [totalTarget, totalCurrentGallon, refuelRate, totalFuelGallons, centerTankGallon, currentWingFuel,
        targetWingFuel, centerTarget, centerCurrent, wingTotalRefuelTimeSeconds, CenterTotalRefuelTimeSeconds]);

    const switchRefuelState = useCallback(() => {
        if (airplaneCanRefuel) {
            setRefuelStartedByUser(!refuelStartedByUser);
        }
    }, [airplaneCanRefuel, refuelStartedByUser, setRefuelStartedByUser]);

    return (
        <div className="text-white mt-6 h-efb-nav flex flex-col justify-between">
            <div className="z-40">
                <div className="flex flex-row w-full">
                    <div className="w-1/3 mr-3">
                        <FuelMeter
                            header="Left Inner Tank"
                            target={LInnTarget}
                            current={LInnCurrent}
                            total={innerCellGallon}
                            convertFuelValue={convertFuelValue}
                            unit={currentUnit}
                        />
                    </div>
                    <div className="w-1/3 mx-3">
                        <FuelMeter
                            header="Center Tank"
                            target={centerTarget}
                            current={centerCurrent}
                            total={centerTankGallon}
                            convertFuelValue={convertFuelValueCenter}
                            unit={currentUnit}
                        />
                    </div>
                    <div className="w-1/3 ml-3">
                        <FuelMeter
                            header="Right Inner Tank"
                            target={RInnTarget}
                            current={RInnCurrent}
                            total={innerCellGallon}
                            convertFuelValue={convertFuelValue}
                            unit={currentUnit}
                        />
                    </div>
                </div>
                <div className="flex flex-row w-full mt-6">
                    <div className="w-4/12 mr-3">
                        <FuelMeter
                            header="Left Outer Tank"
                            target={LOutTarget}
                            current={LOutCurrent}
                            total={outerCellGallon}
                            convertFuelValue={convertFuelValue}
                            unit={currentUnit}
                        />
                    </div>
                    <div className="w-2/4 mx-3">
                        <div className="bg-navy-lighter rounded-2xl p-6 text-white shadow-lg overflow-x-hidden">
                            <div className="flex w-full items-center">
                                <h2 className="text-2xl font-medium mr-2">Refuel</h2>
                                <label htmlFor="fuel-label" className={refuelStatusClass}>{refuelStatusLabel}</label>
                            </div>
                            <div className="flex flex-row mt-4 mb-2 items-center relative">
                                <div className="fuel-progress">
                                    <Slider className="w-48" value={sliderValue} onInput={(value) => updateSlider(value)} />
                                </div>
                                <div className="fuel-label ml-4 relative">
                                    <SimpleInput
                                        className="w-32"
                                        noLeftMargin
                                        noLabel
                                        placeholder={round(totalFuel).toString()}
                                        number
                                        min={0}
                                        max={round(totalFuel)}
                                        value={inputValue}
                                        onChange={(x) => updateDesiredFuel(x)}
                                    />
                                    <div className="absolute top-2 right-4 text-gray-400 text-lg">{currentUnit}</div>
                                </div>
                                <div className="absolute border-l-0 border-t-0 border-b-0 border-white border-r h-28 right-28" />
                                <div className="absolute flex flex-col justify-center items-center right-3 mt-3">
                                    <div className={refuelStatusClass}>
                                        <Button onClick={() => switchRefuelState()} type={BUTTON_TYPE.NONE}>
                                            <IconPlayerPlay className={refuelStartedByUser ? 'hidden' : ''} />
                                            <IconHandStop className={refuelStartedByUser ? '' : 'hidden'} />
                                        </Button>
                                    </div>
                                    <div className="mt-4 text-base">
                                        {`EST: ${calculateEta()} min`}
                                    </div>
                                </div>
                            </div>
                            <span className="fuel-content-label text-base">Current Fuel:</span>
                            <div className="flex current-fuel-line">
                                <ProgressBar height="10px" width="200px" displayBar={false} isLabelVisible={false} bgcolor="#3b82f6" completed={(totalCurrent / round(totalFuel)) * 100} />
                                <div className="fuel-label">
                                    <label className="fuel-content-label text-base" htmlFor="fuel-label">
                                        {totalCurrent}
                                        /
                                        {round(totalFuel)}
                                        {' '}
                                        {currentUnit}
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="w-4/12 ml-3">
                        <FuelMeter
                            header="Right Outer Tank"
                            target={ROutTarget}
                            current={ROutCurrent}
                            total={outerCellGallon}
                            convertFuelValue={convertFuelValue}
                            unit={currentUnit}
                        />
                    </div>
                </div>
            </div>
            <div className="flex flex-col items-center justify-end">
                <img className="z-20 h-96 mb-3" src={fuselage} />
                <div className="z-0 w-24 h-20 absolute bottom-ctr-tk-y" style={{ background: formatFuelFilling(centerCurrent, centerTankGallon) }} />
                <div className="z-0 w-inr-tk h-36 absolute bottom-inn-tk-y left-inn-tk-l" style={{ background: formatFuelFilling(LInnCurrent, innerCellGallon) }} />
                <div className="z-0 w-inr-tk h-36 absolute bottom-inn-tk-y right-inn-tk-r" style={{ background: formatFuelFilling(RInnCurrent, innerCellGallon) }} />
                <div className="z-0 w-out-tk h-16 absolute bottom-out-tk-y left-out-tk-l" style={{ background: formatFuelFilling(LOutCurrent, outerCellGallon) }} />
                <div className="z-0 w-out-tk h-16 absolute bottom-out-tk-y right-out-tk-r" style={{ background: formatFuelFilling(ROutCurrent, outerCellGallon) }} />
                <div className="z-10 w-96 h-20 absolute bg-navy-regular bottom-overlay-b-y left-overlay-bl transform -rotate-18.5" />
                <div className="z-10 w-96 h-20 absolute bg-navy-regular bottom-overlay-b-y right-overlay-br transform rotate-18.5" />
                <div className="z-10 w-96 h-24 absolute bg-navy-regular bottom-overlay-t-y left-overlay-tl transform -rotate-26.5" />
                <div className="z-10 w-96 h-24 absolute bg-navy-regular bottom-overlay-t-y right-overlay-tr transform rotate-26.5" />
                <div className="absolute bg-navy-lighter rounded-2xl text-white shadow-lg overflow-x-hidden p-6 z-30">
                    <div className="w-96 flex flex-row justify-between items-center">
                        <span className="text-lg text-gray-300">Refuel Time</span>
                        <SelectGroup>
                            <SelectItem selected={refuelRate === 2} onSelect={() => setRefuelRate(2)}>Instant</SelectItem>
                            <SelectItem selected={refuelRate === 1} onSelect={() => setRefuelRate(1)}>Fast</SelectItem>
                            <SelectItem selected={refuelRate === 0} onSelect={() => setRefuelRate(0)}>Real</SelectItem>
                        </SelectGroup>
                    </div>
                </div>
            </div>
        </div>
    );
};
