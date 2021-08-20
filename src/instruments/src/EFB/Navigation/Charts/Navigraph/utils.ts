import { NavigraphAirportInfoDetailed, NavigraphAirportInfoFMS, NavigraphChart, NavigraphChartCategory, NavigraphChartPlanview } from '../../../api/navigation/navigraph/types';
import { AirportInfo, Chart, ChartCategory, ChartPlanView } from '../../../api/navigation/types';

export const resolveChartCategory = (category: NavigraphChartCategory): ChartCategory => {
    switch (category) {
    case 'ARRIVAL': return 'STAR';
    case 'APPROACH': return 'APP';
    case 'AIRPORT': return 'TAXI';
    case 'DEPARTURE': return 'SID';
    default: return 'REF';
    }
};

export const parseChart = (chart: NavigraphChart): Chart => (
    {
        id: chart.id,
        name: chart.procedureIdentifier,
        description: chart.type?.details,
        icaoCode: chart.icaoAirportIdentifier,
        category: resolveChartCategory(chart.type.category),
        links: {
            light: chart.fileDay,
            dark: chart.fileNight,
        },
        planView: parsePlanView(chart.planview),
        meta: [{ key: 'INDEX', value: chart.indexNumber }],
        runways: chart.runway,
        source: chart,
    }
);

export const parseAirportInfoDetailed = (airport: NavigraphAirportInfoDetailed): AirportInfo => ({
    name: airport.name,
    iataCode: airport.iataAirportDesignator,
    icaoCode: airport.icaoAirportIdentifier,
    latitude: airport.latitude,
    longitude: airport.longitude,
    country: airport.countryCode,
    city: airport.city,
    meta: [{ key: 'ICAO', value: airport.icaoAirportIdentifier }, { key: 'IATA', value: airport.iataAirportDesignator }],
    source: airport,
});

export const parseAirportInfoFMS = (airport: NavigraphAirportInfoFMS): AirportInfo => ({
    name: airport.name,
    iataCode: airport.iataCode,
    icaoCode: airport.icaoCode,
    latitude: airport.latitude,
    longitude: airport.longitude,
    country: airport.countryCode,
    city: airport.servingCity,
    meta: [{ key: 'ICAO', value: airport.icaoCode }, { key: 'IATA', value: airport.iataCode }],
    source: airport,
});

export const parsePlanView = (planView: NavigraphChartPlanview | undefined): ChartPlanView | undefined => (planView ? {
    bboxLocal: planView.bboxLocal,
    bboxGeo: planView.bboxGeo,
} : undefined);
