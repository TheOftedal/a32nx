import React, { createContext, Dispatch, FC, memo, useContext, useReducer } from 'react';
import { NXDataStore } from '@shared/persistence';
import { NavigraphChart } from '../api/navigation/navigraph';
// import { ChartFoxChart } from '../api/navigation/chart-fox';
import { AirportInfo, Chart } from '../api/navigation/types';
import { ChartSource, NavigationAction, NavigationActionType, NavPersistentProp } from './types';

export type NavigationState = {
    selectedChartSource?: ChartSource;
    selectedAirport?: AirportInfo;
    airportSearchResults: Array<AirportInfo>;
    simBriefAirports: Array<AirportInfo>;
    favoriteAirports: Array<AirportInfo>;
    nearbyAirports: Array<AirportInfo>;
    airportSearchValue: string;
    selectedChartTab: string;
    navigraphCharts: Array<NavigraphChart>;
    // chartFoxCharts: Array<ChartFoxChart>;
    selectedChart?: Chart;
    favICAOs: Array<string>;
    favChartIds: Array<string>;
    bundleRunways: boolean;
    showPosOnChart?: boolean;
}

export const getNavigationInitialState = (): NavigationState => {
    const selectedChartSource = NXDataStore.get<ChartSource>(NavPersistentProp.SelectedChartSource) ?? ChartSource.Navigraph;
    const favICAOs = JSON.parse(NXDataStore.get<string>(NavPersistentProp.FavICAOs) ?? '[]');
    const favChartIds = JSON.parse(NXDataStore.get<string>(NavPersistentProp.FavChartIds) ?? '[]');
    const showPosOnChart = NXDataStore.get<number>(NavPersistentProp.ShowPosOnChart) === 1;

    return {
        selectedChartTab: favChartIds.length > 0 ? 'FAV' : 'SID',
        navigraphCharts: [],
        // chartFoxCharts: [],
        airportSearchResults: [],
        simBriefAirports: [],
        favoriteAirports: [],
        nearbyAirports: [],
        airportSearchValue: '',
        bundleRunways: true,
        selectedChartSource,
        favICAOs,
        favChartIds,
        showPosOnChart,
    };
};

const NavigationContext = createContext<[NavigationState, Dispatch<NavigationAction>]>([getNavigationInitialState(), () => {}]);

const NavigationReducer = (state: NavigationState, action: NavigationAction): NavigationState => {
    switch (action.type) {
    case NavigationActionType.SetSelectedChartSource: {
        NXDataStore.set(NavPersistentProp.SelectedChartSource, action.payload);
        return {
            ...state,
            selectedChartSource: action.payload,
        };
    }
    case NavigationActionType.SetSelectedAirport: {
        return {
            ...state,
            selectedAirport: action.payload,
        };
    }
    case NavigationActionType.SetAirportSearchResults: {
        return {
            ...state,
            airportSearchResults: action.payload,
        };
    }
    case NavigationActionType.SetSimBriefAirports: {
        return {
            ...state,
            simBriefAirports: action.payload,
        };
    }
    case NavigationActionType.SetFavoriteAirports: {
        return {
            ...state,
            favoriteAirports: action.payload,
        };
    }
    case NavigationActionType.SetNearbyAirports: {
        return {
            ...state,
            nearbyAirports: action.payload,
        };
    }
    case NavigationActionType.SetNavigraphCharts: {
        return {
            ...state,
            navigraphCharts: action.payload,
        };
    }
    // case NavigationActionType.SetChartFoxCharts: {
    //     return {
    //         ...state,
    //         chartFoxCharts: action.payload,
    //     };
    // }
    case NavigationActionType.SetSelectedChart: {
        return {
            ...state,
            selectedChart: action.payload,
        };
    }
    case NavigationActionType.SetSelectedChartTab: {
        return {
            ...state,
            selectedChartTab: action.payload,
        };
    }
    case NavigationActionType.SetAirportSearchValue: {
        return {
            ...state,
            airportSearchValue: action.payload,
        };
    }
    case NavigationActionType.AddFavACIO: {
        if (state.favICAOs.includes(action.payload)) {
            return state;
        }

        const acios = [...state.favICAOs, action.payload];
        NXDataStore.set(NavPersistentProp.FavICAOs, JSON.stringify(acios));
        return {
            ...state,
            favICAOs: acios,
        };
    }
    case NavigationActionType.RemoveFavACIO: {
        const acios = state.favICAOs.filter((acio) => acio !== action.payload);
        NXDataStore.set(NavPersistentProp.FavICAOs, JSON.stringify(acios));
        return {
            ...state,
            favICAOs: acios,
        };
    }
    case NavigationActionType.AddFavChartId: {
        if (state.favChartIds.includes(action.payload)) {
            return state;
        }

        const chartIds = [...state.favChartIds, action.payload];
        NXDataStore.set(NavPersistentProp.FavChartIds, JSON.stringify(chartIds));
        return {
            ...state,
            favChartIds: chartIds,
        };
    }
    case NavigationActionType.RemoveFavChartId: {
        const chartIds = state.favChartIds.filter((id) => id !== action.payload);
        NXDataStore.set(NavPersistentProp.FavChartIds, JSON.stringify(chartIds));
        return {
            ...state,
            favChartIds: chartIds,
        };
    }
    case NavigationActionType.SetShowPosOnChart: {
        NXDataStore.set<number>(NavPersistentProp.ShowPosOnChart, action.payload ? 1 : 0);
        return {
            ...state,
            showPosOnChart: action.payload,
        };
    }
    default:
        throw new Error(`Unhandled action type: ${action.type}`);
    }
};

export type NavigationProviderProps = {
    navigationState: NavigationState;
    navigationDispatch: Dispatch<NavigationAction>;
}

export const NavigationProvider: FC<NavigationProviderProps> = memo(({ navigationState, navigationDispatch, children }) => (
    <NavigationContext.Provider value={[navigationState, navigationDispatch]}>
        {children}
    </NavigationContext.Provider>
));

export const useNavigationState = (): NavigationState => {
    const [state] = useContext(NavigationContext);
    if (state === undefined) {
        throw new Error('useNavigationState must be used within NavigationProvider');
    }
    return state;
};

export const useNavigationDispatch = (): Dispatch<NavigationAction> => {
    const [, dispatch] = useContext(NavigationContext);
    if (dispatch === undefined) {
        throw new Error('useNavigationDispatch must be used within NavigationProvider');
    }
    return dispatch;
};

export const useNavigationReducer = (): [NavigationState, Dispatch<NavigationAction>] => useReducer(NavigationReducer, getNavigationInitialState());
