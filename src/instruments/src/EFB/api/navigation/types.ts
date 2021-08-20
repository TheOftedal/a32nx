import { ChartFoxChart } from './chart-fox/chart-fox';
import { NavigraphAirportInfo, NavigraphChart } from './navigraph';

export type AirportInfo = {
    name?: string,
    iataCode?: string;
    icaoCode: string;
    latitude?: number;
    longitude?: number;
    city?: string;
    country?: string;
    meta: Array<Meta>;
    source?: NavigraphAirportInfo;
}

export type Chart = {
    id: string;
    name: string;
    description: string | undefined;
    icaoCode: string;
    category: ChartCategory;
    links: ChartLinks;
    meta: Array<Meta>;
    runways?: Array<string>;
    source: NavigraphChart | ChartFoxChart;
    planView?: ChartPlanView;
}

export type ChartLinks = {
    light: string | null;
    dark: string | null;
}

export type Charts = {
    star: Array<Chart>;
    app: Array<Chart>;
    taxi: Array<Chart>;
    sid: Array<Chart>;
    ref: Array<Chart>;
}

export type ChartBundleType = {
    name: string;
    icon?: JSX.Element;
    charts: Array<Chart>;
}

export type ChartGroup = {
    name: string;
    bundles: Array<ChartBundleType>;
    tabId: string;
    header: JSX.Element;
    count: number;
}

export type ChartCategory = 'STAR' | 'APP' | 'TAXI' | 'SID' | 'REF';

export type ChartPlanView = {
    bboxLocal: Array<number>;
    bboxGeo: Array<number>;
}

export type Meta = {
    key: string;
    value: string;
}
