export type NavigraphPKCE = {
    'code_challenge': string;
    'code_verifier': string;
}

export type NavigraphFMSResult = {
    airports?: Array<NavigraphAirportInfoFMS>;
    // airways: Array<>
}

export type NavigraphGeoResult = {
    airports?: Array<NavigraphAirportInfoFMS>;
    airwaySegments?: Array<NavigraphAirwaySegment>;
}

export interface NavigraphAirportInfo {
    longestRunway: number;
    latitude: number;
    longitude: number;
    magneticVariation: number;
    elevation: number;
    name: string;
    countryCode: string;
    countryName: string;
    charts: number;
    dayLightIndicator: boolean;
    imeZone: string;
}

export interface NavigraphAirportInfoFMS extends NavigraphAirportInfo {
    icaoCode: string;
    iataCode: string;
    ifrCapability: boolean;
    longestRunway: number;
    presentationText: string;
    publicMilitaryIndicator: string;
    servingCity?: string;
}

export interface NavigraphAirportInfoDetailed extends NavigraphAirportInfo {
    icaoAirportIdentifier: string;
    iataAirportDesignator: string;
    city: string;
    stateProvinceCode: string;
    stateProvinceName: string;
    fuelTypes: Array<string>;
    oxygen: Array<string>;
    repairs: Array<string>;
    landingFee: boolean;
    jetStartingUnit: boolean;
    precisionAirport: boolean;
    beacon: boolean;
    customs: boolean;
    airportType: string;
    daylightSavings: boolean;
    datumCode: string;
    revisionDate: string;
    parsedCycle: string;
    visibility: number;
    stdVisibility: boolean;
    caoVisibility: boolean;
    vrfVisibility: boolean;
    chartModes: number;
    packageFileHash: string;
}

export type NavigraphAirwaySegment = {
    id: string;
    routeIdentifier: string;
    routeType: string;
    level: string;
    cruiseTableIndicator: string;
    directionRestriction: string;
    distance: number;
    magneticCourseStart: number;
    magneticVariationStart: number;
    magneticCourseEnd: number;
    magneticVariationEnd: number;
    minimumAltitude: string;
    maximumAltitude: string;
    fixIdentifierStart: string;
    fixIdentifierEnd: string;
    latitudeStart: number;
    longitudeStart: number;
    latitudeEnd: number;
    longitudeEnd: number;
    sequenceNumber: number;
}

export type NavigraphChartCategory = 'ARRIVAL' | 'APPROACH' | 'AIRPORT' | 'DEPARTURE';

export type NavigraphChartList = {
    charts: Array<NavigraphChart>;
}

export type NavigraphChart = {
    fileDay: string;
    fileNight: string;
    thumbDay: string;
    thumbNight: string;
    icaoAirportIdentifier: string;
    id: string;
    fileName: string;
    type: NavigraphChartType;
    indexNumber: string;
    procedureIdentifier: string;
    action: string;
    revisionDate: string;
    effectiveDate: string;
    trimSize: string;
    georef: boolean;
    bboxLocal: Array<number>;
    planview?: NavigraphChartPlanview;
    insets?: Array<NavigraphChartInset>;
    procedureCode: Array<string>;
    runway: Array<string>;
    routeId: Array<string>;
    stdVisibility: boolean;
    caoVisibility: boolean;
    vfrVisibility: boolean;
    visibility: number;
}

export type NavigraphChartType = {
    code: string,
    category: NavigraphChartCategory,
    details: string,
    precision: string,
    section: string,
}

export type NavigraphChartPlanview = {
    bboxLocal: Array<number>;
    bboxGeo: Array<number>;
}

export type NavigraphChartInset = {
    bboxLocal: Array<number>;
}

export type NavigraphDeviceAuth = {
    deviceCode: string;
    expiresIn: number;
    interval: number;
    userCode: string;
    verificationUri: string;
    verificationUriComplete: string;
}

export type NavigraphDeviceAuthRequest = {
    clientId?: string;
    clientSecret?: string;
    codeChallenge: string;
    codeChallengeMethod: string;
}

export type NavigraphTokenRequest = {
    grantType: string;
    deviceCode?: string;
    clientId?: string;
    clientSecret?: string;
    scope?: string;
    codeVerifier?: string;
    refreshToken?: string;
}

export type NavigraphToken = {
    refreshToken: string | null;
    accessToken: string | null;
}

export type NavigraphUserInfo = {
    sub: string;
    updatedAt: number;
    tenant: string;
    preferredUsername: string;
    email: string;
    emailVerified: boolean;
    givenName: string;
    familyName: string;
    address: {
        country: string;
    }
    tos: string;
    emailSetting: string;
    emailMessageKey: string;
    originating: string;
}

export type NavigraphSubscription = {
    dateActive: string;
    dateExpiry: string;
    subscriptionName: string;
    type: string;
}

export type NavigraphError = {
    error: string;
}

export type NavigraphTokenResult = {
    token?: NavigraphToken | null;
    status: NavigraphTokenStatus;
}

export enum NavigraphTokenStatus {
    Success,
    SlowDown,
    IsPending,
    IsExpired,
    InvalidClient,
    InvalidRequest,
    Error,
    InvalidEnv
}
