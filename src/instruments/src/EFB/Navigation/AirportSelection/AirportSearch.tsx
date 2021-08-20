import React, { FC, useCallback, useMemo, useState } from 'react';
import { debounce } from 'lodash';
import { IconX } from '@tabler/icons';
import { AirportInfo } from '../../api/navigation/types';
import SimpleInput from '../../Components/Form/SimpleInput/SimpleInput';
import {
    useNavigationDispatch,
    useNavigationState,
} from '../reducer';
import AirportList from './AirportList';
import { NavigationActionType } from '../types';

export type AirportSearchProps = {
    searchAsync: (value: string) => Promise<Array<AirportInfo>>;
};

const AirportSearch: FC<AirportSearchProps> = ({ searchAsync }) => {
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const { airportSearchValue } = useNavigationState();
    const navigationDispatch = useNavigationDispatch();

    const handleSearchValueOnChange = useCallback(
        async (value: string) => {
            navigationDispatch({
                type: NavigationActionType.SetAirportSearchValue,
                payload: value,
            });

            if (value.length >= 3) {
                setIsSearching(true);
                const results = await searchAsync(value);
                navigationDispatch({
                    type: NavigationActionType.SetAirportSearchResults,
                    payload: results,
                });
                setIsSearching(false);
            } else {
                navigationDispatch({
                    type: NavigationActionType.SetAirportSearchResults,
                    payload: [],
                });
            }
        },
        [navigationDispatch, setIsSearching, searchAsync],
    );

    const handleClearOnClick = useCallback(() => {
        handleSearchValueOnChange('');
    }, [handleSearchValueOnChange]);

    const debouncedSearchHandler = useMemo(
        () => debounce(handleSearchValueOnChange, 500),
        [handleSearchValueOnChange],
    );

    return (
        <div className="flex flex-col h-full w-2/5 bg-navy-lighter p-6">
            <span className="flex items-center text-2xl font-medium h-14 ml-1">Select Airport</span>
            <div className="flex items-center mt-6 mr-4 relative">
                {airportSearchValue.length > 0 && <IconX className="absolute right-4" size={24} onClick={handleClearOnClick} />}
                <SimpleInput
                    value={airportSearchValue}
                    placeholder="ICAO/IATA/Name"
                    className="w-full h-14 pr-14"
                    onChange={debouncedSearchHandler}
                    noLabel
                />
            </div>
            <AirportList isSearching={isSearching} />
        </div>
    );
};

export default AirportSearch;
