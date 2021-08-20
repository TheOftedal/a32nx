export type DispatchWeights = {
    cargo: number;
    estLandingWeight: number;
    estTakeOffWeight: number;
    estZeroFuelWeight: number;
    maxLandingWeight: number;
    maxTakeOffWeight: number;
    maxZeroFuelWeight: number;
    passengerCount: number;
    passengerWeight: number;
    payload: number;
}

export type DispatchFuels = {
    avgFuelFlow: number;
    contingency: number;
    enrouteBurn: number;
    etops: number;
    extra: number;
    maxTanks: number;
    minTakeOff: number;
    planLanding: number;
    planRamp: number;
    planTakeOff: number;
    reserve: number;
    taxi: number;
}

export type AircraftInfo = {
    model: string;
    range: number;
    mrw: number;
    mzfw: number;
    maxPax: number;
    engines: string;
    mmo: number;
    mtow: number;
    maxFuelCapacity: number;
    maxCargo: number;
}
