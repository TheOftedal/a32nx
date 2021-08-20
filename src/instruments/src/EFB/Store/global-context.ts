import { Context, createContext, Dispatch, useContext } from 'react';
import { performanceInitialState, PerformanceStateType } from './performance-reducer';
import { dispatchInitialState, DispatchStateType } from './dispatch-reducer';
import { getNavigationInitialState, NavigationState } from '../Navigation/reducer';
import { NavigationAction } from '../Navigation';

export type GlobalContextType = {
    performanceState: PerformanceStateType;
    performanceDispatch: Dispatch<any>;
    dispatchState: DispatchStateType;
    dispatchDispatch: Dispatch<any>;
    navigationState: NavigationState,
    navigationDispatch: Dispatch<NavigationAction>
}

const defaultValue = {
    performanceState: performanceInitialState,
    performanceDispatch: () => {},
    dispatchState: dispatchInitialState,
    dispatchDispatch: () => {},
    navigationState: getNavigationInitialState(),
    navigationDispatch: () => {},
};

export const GlobalContext:Context<GlobalContextType> = createContext<GlobalContextType>(defaultValue);

export const useGlobalContext = (): GlobalContextType => {
    const context = useContext(GlobalContext);
    if (context === undefined) {
        throw new Error('useGlobalContext must be used within GlobalContext.Provider');
    }
    return context;
};
