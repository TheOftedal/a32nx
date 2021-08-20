import React, { FC, useCallback, useMemo, useEffect, useState } from 'react';
import { useNavigraphApi } from '../../../api/navigation/navigraph/context';
import { useSimVar } from '../../../../Common/simVars';
import { useNavigationDispatch, useNavigationState } from '../../reducer';
import { AirportInfo, Chart, ChartLinks } from '../../../api/navigation/types';
import { parseChart, parseAirportInfoDetailed, parseAirportInfoFMS } from './utils';
import { SimbriefData } from '../../../Efb';
import { icaoFormat } from '../../../api/navigation/utils';
import { NavigraphAirportInfoDetailed, NavigraphChart } from '../../../api/navigation/navigraph';
import AirportSearch from '../../AirportSelection/AirportSearch';
import ChartTabs from '../ChartSelection/ChartTabs';
import ChartRender from '../ChartView/ChartRender';
import { NavigationActionType, NavSimVar } from '../../types';

export type NavigraphChartsProps = {
    simBriefData: SimbriefData;
}

const NavigraphCharts: FC<NavigraphChartsProps> = ({ simBriefData }) => {
    const { api } = useNavigraphApi();
    const navigationDispatch = useNavigationDispatch();
    const { selectedAirport, selectedChart, navigraphCharts, favICAOs, favoriteAirports } = useNavigationState();
    const [isLoadingCharts, setIsLoadingCharts] = useState<boolean>(false);
    const [chartLinks, setChartLinks] = useState<ChartLinks | null>(null);

    // TODO: Add support for typing in sim vars
    const [simLat] = useSimVar(NavSimVar.PlaneLatitude, 'degrees', 500);
    const [simLng] = useSimVar(NavSimVar.PlaneLongitude, 'degrees', 500);

    const charts = useMemo<Array<Chart>>(() => navigraphCharts.map(parseChart), [navigraphCharts]);
    const chartSource = useMemo<NavigraphChart | undefined>(() => selectedChart?.source as NavigraphChart | undefined, [selectedChart]);

    const getChartLinksAsync = useCallback(async () => {
        if (chartSource) {
            const lightChartUrlPromise = api.getSignedUrlAsync(chartSource.icaoAirportIdentifier, chartSource.fileDay);
            const darkChartUrlPromise = api.getSignedUrlAsync(chartSource.icaoAirportIdentifier, chartSource.fileNight);
            await Promise.all([lightChartUrlPromise, darkChartUrlPromise]);
            setChartLinks({ light: await lightChartUrlPromise, dark: await darkChartUrlPromise });
        } else {
            setChartLinks(null);
        }
    }, [api, chartSource]);

    useEffect(() => {
        getChartLinksAsync();
    }, [getChartLinksAsync]);

    const getSimbriefAirportInfoAsync = useCallback(async () => {
        const simbriefAirportPromises: Array<Promise<NavigraphAirportInfoDetailed | null>> = [];
        if (icaoFormat.test(simBriefData.departingAirport)) {
            simbriefAirportPromises.push(api.getAirportInfoAsync(simBriefData.departingAirport));
        }
        if (icaoFormat.test(simBriefData.arrivingAirport)) {
            simbriefAirportPromises.push(api.getAirportInfoAsync(simBriefData.arrivingAirport));
        }
        if (icaoFormat.test(simBriefData.altIcao) && simBriefData.altIcao !== simBriefData.departingAirport && simBriefData.altIcao !== simBriefData.arrivingAirport) {
            simbriefAirportPromises.push(api.getAirportInfoAsync(simBriefData.altIcao));
        }

        const simbriefAirportResults = await Promise.all(simbriefAirportPromises);

        const airportInfos: Array<NavigraphAirportInfoDetailed> = [];

        simbriefAirportResults.forEach((result) => {
            if (result !== null) {
                airportInfos.push(result);
            }
        });

        navigationDispatch({ type: NavigationActionType.SetSimBriefAirports, payload: airportInfos.map((airport) => parseAirportInfoDetailed(airport)) });
    }, [simBriefData]);

    useEffect(() => {
        getSimbriefAirportInfoAsync();
    }, [getSimbriefAirportInfoAsync]);

    const getFavoriteAirportInfoAsync = useCallback(async () => {
        const existingFavAirports: Array<AirportInfo> = [];
        const newFavAirportPromises: Array<Promise<NavigraphAirportInfoDetailed | null>> = [];

        favICAOs.forEach((icao) => {
            const existingAirport = favoriteAirports.find((airport) => airport.icaoCode === icao);
            if (existingAirport) {
                existingFavAirports.push(existingAirport);
            } else {
                newFavAirportPromises.push(api.getAirportInfoAsync(icao));
            }
        });

        const newFavAirportResults = await Promise.all(newFavAirportPromises);

        const favAirportInfos: Array<NavigraphAirportInfoDetailed> = [];

        newFavAirportResults.forEach((result) => {
            if (result !== null) {
                favAirportInfos.push(result);
            }
        });

        const newFavAirportInfos = [...existingFavAirports, ...favAirportInfos.map((airport) => parseAirportInfoDetailed(airport))];

        const existingICAOs = favoriteAirports.map((a) => a.icaoCode);
        const newICAOs = newFavAirportInfos.map((a) => a.icaoCode);

        if (existingICAOs.every((item) => newICAOs.includes(item)) && newICAOs.every((item) => existingICAOs.includes(item))) {
            return;
        }

        navigationDispatch({ type: NavigationActionType.SetFavoriteAirports, payload: [...existingFavAirports, ...newFavAirportInfos] });
    }, [favICAOs, favoriteAirports]);

    useEffect(() => {
        getFavoriteAirportInfoAsync();
    }, [getFavoriteAirportInfoAsync]);

    const getNearbyAirportInfoAsync = useCallback(async () => {
        const geoData = await api.searchGeoDataAsync(simLat, simLng, 50);
        if (geoData?.airports) {
            const airportInfo = geoData.airports.map((airport) => parseAirportInfoFMS(airport));
            navigationDispatch({ type: NavigationActionType.SetNearbyAirports, payload: airportInfo });
        }
    }, [simLat, simLng, api, navigationDispatch]);

    useEffect(() => {
        getNearbyAirportInfoAsync();
    }, [getNearbyAirportInfoAsync]);

    const searchAirportsAsync = useCallback(async (value: string): Promise<Array<AirportInfo>> => {
        const result = await api.searchFMSDataAsync(value);

        if (result?.airports) {
            return result?.airports.map(parseAirportInfoFMS);
        }

        return [];
    }, [api]);

    const getChartsAsync = useCallback(async () => {
        if (selectedAirport) {
            setIsLoadingCharts(true);
            const chartResults = await api.getChartsListAsync(selectedAirport.icaoCode);
            navigationDispatch({ type: NavigationActionType.SetNavigraphCharts, payload: chartResults });
            setIsLoadingCharts(false);
        } else {
            navigationDispatch({ type: NavigationActionType.SetNavigraphCharts, payload: [] });
        }
    }, [selectedAirport, setIsLoadingCharts]);

    useEffect(() => {
        getChartsAsync();
    }, [getChartsAsync]);

    return (
        <>
            {!selectedAirport ? <AirportSearch searchAsync={searchAirportsAsync} /> : <ChartTabs charts={charts} isLoadingCharts={isLoadingCharts} />}
            {selectedChart && <ChartRender chartLinks={chartLinks} posLat={simLat} posLng={simLng} planView={selectedChart?.planView} />}
        </>
    );
};

export default NavigraphCharts;
