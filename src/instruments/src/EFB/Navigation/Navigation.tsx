import React, { FC } from 'react';
import { SimbriefData } from '../Efb';
import { useGlobalContext } from '../Store/global-context';
import Charts from './Charts';
import { NavigationProvider } from './reducer';

export type NavigationProps = {
    simBriefData: SimbriefData;
}

// TODO: Fetch simBriefData from global state?
export const Navigation: FC<NavigationProps> = ({ simBriefData }) => {
    const { navigationState, navigationDispatch } = useGlobalContext();

    return (
        <NavigationProvider navigationState={navigationState} navigationDispatch={navigationDispatch}>
            <div className="flex flex-col w-full h-full">
                <div>
                    <h1 className="text-3xl mt-6 text-white mb-6">Charts &amp; Navigation</h1>
                </div>
                <div className="flex flex-grow bg-navy-medium rounded-2xl text-white shadow-lg overflow-hidden">
                    <Charts simBriefData={simBriefData} />
                </div>
            </div>
        </NavigationProvider>
    );
};

export default Navigation;
