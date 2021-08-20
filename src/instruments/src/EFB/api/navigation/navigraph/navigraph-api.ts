import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { camelizeKeys, decamelize } from 'humps';
import {
    NavigraphDeviceAuth, NavigraphDeviceAuthRequest, NavigraphFMSResult, NavigraphChart, NavigraphChartList,
    NavigraphPKCE, NavigraphTokenRequest, NavigraphUserInfo, NavigraphSubscription, NavigraphGeoResult,
    NavigraphAirportInfoDetailed, NavigraphError, NavigraphTokenResult, NavigraphTokenStatus,
} from './types';
import { icaoFormat } from '../utils';

// TODO: Fix typing
function formatFormBody<T>(body: T): string {
    return Object.keys(body).map((key) => ''.concat(encodeURIComponent(decamelize(key)), '=').concat(encodeURIComponent(body[key]))).join('&');
}

export default class NavigraphApi {
    private client: AxiosInstance;

    private clientId: string | undefined;

    private clientSecret: string | undefined;

    constructor() {
        this.client = axios.create({ transformRequest: (data) => camelizeKeys(data) });
        this.clientId = process?.env?.CLIENT_ID;
        this.clientSecret = process?.env?.CLIENT_SECRET;
    }

    private setRequestInterceptor(accessToken: string | null) {
        this.client.interceptors.request.use((config: AxiosRequestConfig): AxiosRequestConfig => {
            if (accessToken) {
                config.headers.Authorization = accessToken ? `Bearer ${accessToken}` : undefined;
            }
            return config;
        });
    }

    public isValidEnv() {
        return !(this.clientSecret === undefined || this.clientId === undefined);
    }

    public setAccessToken(accessToken: string | null) {
        this.setRequestInterceptor(accessToken);
    }

    public async authenticateDeviceAsync(pkce: NavigraphPKCE): Promise<NavigraphDeviceAuth | null> {
        if (!this.isValidEnv()) {
            return null;
        }

        const request: NavigraphDeviceAuthRequest = {
            clientId: this.clientId,
            clientSecret: this.clientSecret,
            codeChallenge: pkce.code_challenge,
            codeChallengeMethod: 'S256',
        };

        return this.client.post<NavigraphDeviceAuth>(
            'https://identity.api.navigraph.com/connect/deviceauthorization', formatFormBody(request),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' } },
        ).then((value) => value.data)
            .catch((error: AxiosError) => {
                console.error('Exception while trying to authenticate device', error);
                return null;
            });
    }

    public async refreshTokenAsync(refreshToken: string): Promise<NavigraphTokenResult> {
        if (!this.isValidEnv()) {
            return null;
        }

        const request: NavigraphTokenRequest = {
            grantType: 'refresh_token',
            clientId: this.clientId,
            clientSecret: this.clientSecret,
            refreshToken,
        };

        return this.fetchTokenAsync(request);
    }

    public async getTokenAsync(deviceCode: string, pkce: NavigraphPKCE): Promise<NavigraphTokenResult> {
        if (!this.isValidEnv()) {
            return { status: NavigraphTokenStatus.InvalidEnv };
        }

        const request: NavigraphTokenRequest = {
            grantType: 'urn:ietf:params:oauth:grant-type:device_code',
            clientId: this.clientId,
            clientSecret: this.clientSecret,
            scope: 'openid charts offline_access',
            codeVerifier: pkce.code_verifier,
            deviceCode,
        };

        return this.fetchTokenAsync(request);
    }

    private async fetchTokenAsync(request: NavigraphTokenRequest): Promise<NavigraphTokenResult> {
        return this.client.post<NavigraphTokenRequest, NavigraphTokenResult>(
            'https://identity.api.navigraph.com/connect/token', formatFormBody(request),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' } },
        ).then((value) => value)
            .catch((error: AxiosError<NavigraphError>) => {
                if (error.response?.data) {
                    switch (error.response?.data.error) {
                    case 'invalid_client': return { status: NavigraphTokenStatus.InvalidClient };
                    case 'invalid_request': return { status: NavigraphTokenStatus.InvalidRequest };
                    case 'slow_down': return { status: NavigraphTokenStatus.SlowDown };
                    case 'authorization_pending': {
                        return { status: NavigraphTokenStatus.IsPending };
                    }
                    case 'expired_token': {
                        return { status: NavigraphTokenStatus.IsExpired };
                    }
                    default: break;
                    }
                }
                console.error('Error while fetching Navigraph token', error.response?.data);
                return { status: NavigraphTokenStatus.Error };
            });
    }

    public async getSignedUrlAsync(icao: string, item: string): Promise<string | null> {
        if (!icaoFormat.test(icao)) {
            throw new Error(`ICAO code ${icao} is not in the correct format`);
        }

        return this.client.get<string>(`https://charts.api.navigraph.com/2/airports/${icao}/signedurls/${item}`, { responseType: 'text' })
            .then((response) => response.data)
            .catch((error: AxiosError) => {
                console.error(`Error while fetching signed URL for ICAO '${icao}' with item '${item}'`, error);
                return null;
            });
    }

    public async getAirportInfoAsync(icao: string): Promise<NavigraphAirportInfoDetailed | null> {
        const airportUrl = await this.getSignedUrlAsync(icao.toUpperCase(), 'airport.json');

        if (airportUrl) {
            return this.client.get<NavigraphAirportInfoDetailed>(airportUrl).then((response) => response.data)
                .catch((error: AxiosError) => {
                    console.error(`Exception while fetching airport information for ICAO '${icao}'`, error);
                    return null;
                });
        }

        console.error(`Unable to fetch airport info for ICAO '${icao}'; unable to fetch signed url`);
        return null;
    }

    public async getChartsListAsync(icao: string): Promise<Array<NavigraphChart>> {
        const chartsUrl = await this.getSignedUrlAsync(icao.toUpperCase(), 'charts.json');

        if (chartsUrl) {
            const result = await this.client.get<NavigraphChartList>(chartsUrl)
                .then((response) => response.data?.charts,
                    (reason) => {
                        console.error(`Unable to fetch charts for ICAO '${icao}'`, reason);
                        return [];
                    })
                .catch((error: AxiosError) => {
                    console.error(`Exception while fetching charts for ICAO '${icao}'`, error);
                    return [];
                });

            return result;
        }

        return [];
    }

    public async searchFMSDataAsync(searchTerm: string, size: number = 10): Promise<NavigraphFMSResult | null> {
        return this.client.get<NavigraphFMSResult>(`https://fmsdata.api.navigraph.com/1/search?search=${encodeURI(searchTerm)}&size=${size}`, { responseType: 'json' })
            .then((response) => response.data,
                ((reason) => {
                    console.error(`Unable to search FMS with searchTerm '${searchTerm}'`, reason);
                    return null;
                }))
            .catch((error: AxiosError) => {
                console.error(`Exception while searching FMS with searchTerm '${searchTerm}'`, error);
                return null;
            });
    }

    public async searchGeoDataAsync(lat: number, lng: number, range: number): Promise<NavigraphGeoResult | null> {
        return this.client.get<NavigraphGeoResult>(`https://fmsdata.api.navigraph.com/1/quickgeosearch/?latitude=${lat}&longitude=${lng}&range=${range}`, { responseType: 'json' })
            .then((response) => response.data,
                ((reason) => {
                    console.error(`Unable to perform geosearch for coordinates (lat: ${lat}, lng: ${lng})`, reason);
                    return null;
                }))
            .catch((error: AxiosError) => {
                console.error(`Error while doing geosearch for coordinates (lat: ${lat}, lng: ${lng})`, error);
                return null;
            });
    }

    public async getUserInfoAsync(): Promise<NavigraphUserInfo | null> {
        return this.client.get<NavigraphUserInfo>('https://identity.api.navigraph.com/connect/userinfo')
            .then((response) => response.data,
                ((reason) => {
                    console.error('Unable to fetch user info for the authenticated user', reason);
                    return null;
                }))
            .catch((error: AxiosError) => {
                console.error('Exception while fetching user info for the authenticated user', error);
                return null;
            });
    }

    public async getSubscriptionsAsync(): Promise<Array<NavigraphSubscription>> {
        return this.client.get<Array<NavigraphSubscription>>('https://subscriptions.api.navigraph.com/2/subscriptions/valid')
            .then((response) => response.data,
                ((reason) => {
                    console.error('Unable to fetch valid subscriptions for the authenticated user', reason);
                    return [];
                }))
            .catch((error: AxiosError) => {
                console.error('Exception while fetching valid subscriptions for the authenticated user', error);
                return [];
            });
    }
}
