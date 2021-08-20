import React, { FC, memo, useCallback } from 'react';
import { startCase } from 'lodash';
import { AirportInfo } from '../../api/navigation/types';
import { useNavigationDispatch, useNavigationState } from '../reducer';
import { BundleList, ListItem } from '../components/List';
import { NavigationActionType } from '../types';

export type AirportBundleProps = {
    bundleName: string;
    airports: Array<AirportInfo>;
    icon?: JSX.Element;
}

export const AirportBundle: FC<AirportBundleProps> = ({ bundleName, airports, icon }) => {
    const { favICAOs } = useNavigationState();
    const navigationDispatch = useNavigationDispatch();

    const handleAirportOnClick = useCallback((airport: AirportInfo) => {
        navigationDispatch({ type: NavigationActionType.SetSelectedAirport, payload: airport });
    }, [navigationDispatch]);

    const handleAirportFavOnClick = useCallback((airport: AirportInfo) => {
        if (favICAOs.includes(airport.icaoCode)) {
            navigationDispatch({ type: NavigationActionType.RemoveFavACIO, payload: airport.icaoCode });
        } else {
            navigationDispatch({ type: NavigationActionType.AddFavACIO, payload: airport.icaoCode });
        }
    }, [navigationDispatch, favICAOs]);

    return (
        <BundleList icon={icon} bundleName={bundleName}>
            {airports.map((airport) => (
                <ListItem
                    title={airport.name ?? airport.icaoCode}
                    description={`${startCase(airport.city?.toLowerCase())} (${airport.country})`}
                    meta={airport.meta}
                    onClick={() => handleAirportOnClick(airport)}
                    key={airport.icaoCode}
                    favOnClick={() => handleAirportFavOnClick(airport)}
                    isFav={favICAOs.includes(airport.icaoCode)}
                    showFav
                />
            ))}
        </BundleList>
    );
};

export default memo(AirportBundle);
