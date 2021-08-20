import React, { FC, memo } from 'react';
import { IconCurrentLocation, IconNotes, IconSearch, IconStar } from '@tabler/icons';
import { useNavigationState } from '../reducer';
import { ScrollableList } from '../components/List';
import AirportBundle from './AirportBundle';
import Loader from '../components/Loader';

type AirportListStatusProps = {
    airportSearchValueLength: number;
    airportSearchResultCount: number;
}

const AirportListStatus: FC<AirportListStatusProps> = memo(({ airportSearchValueLength, airportSearchResultCount }) => {
    let status: string | null = null;

    if (airportSearchValueLength < 1) {
        status = 'Search for airports by ICAO/IATA/Name';
    } else if (airportSearchValueLength > 0 && airportSearchValueLength < 3) {
        status = 'You must input at least 3 characters';
    } else if (airportSearchValueLength > 0 && airportSearchResultCount <= 0) {
        status = 'No airports found';
    }

    if (!status) {
        return <></>;
    }

    return (
        <div className="flex justify-center items-center p-6 bg-navy-regular rounded-lg">
            <span className="text-gray-400 text-center">{status}</span>
        </div>
    );
});

export type AirportListProps = {
    isSearching: boolean;
}

const AirportList: FC<AirportListProps> = ({ isSearching }) => {
    const { airportSearchResults, simBriefAirports, nearbyAirports, favoriteAirports, airportSearchValue } = useNavigationState();

    return (
        <ScrollableList>
            <Loader isLoading={isSearching} />
            {!isSearching && (
                <AirportListStatus
                    airportSearchValueLength={airportSearchValue.length}
                    airportSearchResultCount={airportSearchResults.length}
                />
            )}
            {!isSearching && airportSearchResults.length > 0 && (
                <AirportBundle
                    bundleName="Search Results"
                    icon={<IconSearch size={24} stroke={2} />}
                    airports={airportSearchResults}
                />
            )}
            {simBriefAirports.length > 0 && (
                <AirportBundle
                    bundleName="Flight Plan"
                    icon={<IconNotes size={24} stroke={2} />}
                    airports={simBriefAirports}
                />
            )}
            {favoriteAirports.length > 0 && (
                <AirportBundle
                    bundleName="Favorites"
                    icon={<IconStar size={24} stroke={2} />}
                    airports={favoriteAirports}
                />
            )}
            {nearbyAirports.length > 0 && (
                <AirportBundle
                    bundleName="Nearby"
                    icon={<IconCurrentLocation size={24} stroke={2} />}
                    airports={nearbyAirports}
                />
            )}
        </ScrollableList>
    );
};

export default AirportList;
