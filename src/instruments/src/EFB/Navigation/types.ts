export enum NavigationActionType {
    SetSelectedChartSource,
    SetSelectedAirport,
    SetAirportSearchResults,
    SetSimBriefAirports,
    SetFavoriteAirports,
    SetNearbyAirports,
    SetNavigraphCharts,
    SetChartFoxCharts,
    SetSelectedChart,
    SetSelectedChartTab,
    SetAirportSearchValue,
    AddFavACIO,
    RemoveFavACIO,
    AddFavChartId,
    RemoveFavChartId,
    SetShowPosOnChart,
}

export type NavigationAction = {
    type: NavigationActionType,
    payload: any
}

export type ChartDisplay = {
    light: string;
    dark: string;
}

export enum ChartSource {
    Navigraph = 'Navigraph',
    ChartFox = 'ChartFox'
}

export enum NavPersistentProp {
    SelectedChartSource = 'SEL_CHART_SOURCE',
    FavICAOs = 'FAV_ACIOS',
    FavChartIds = 'FAV_CHART_IDS',
    ShowPosOnChart = 'SHOW_POS_ON_CHART',
}

export enum NavSimVar {
    PlaneLatitude = 'PLANE LATITUDE',
    PlaneLongitude = 'PLANE LONGITUDE',
    PlaneHeadingTrue = 'PLANE HEADING DEGREES TRUE'
}
