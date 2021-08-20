import React, { useContext, useState, useCallback, useEffect, useMemo } from 'react';
import getPkce from '@navigraph/pkce';
import { useInterval } from '@flybywiresim/react-components';
import { NXDataStore } from '@shared/persistence';
import NavigraphApi from './navigraph-api';
import { NavigraphDeviceAuth, NavigraphPKCE, NavigraphTokenStatus, NavigraphUserInfo } from './types';
import { NavigraphRefreshTokenDataProp } from './constants';
import { parseJwt } from '../../utils/parse-jwt/parse-jwt';

const defaultTokenExpiryInterval = 60;
const defaultAuthCheckInterval = 5;

export type NavigraphApiState = {
    api: NavigraphApi;
    deviceAuth?: NavigraphDeviceAuth | null;
    authenticateDevice: () => void;
    isAuthenticated: boolean;
    isAuthenticatingDevice: boolean;
    userInfo?: NavigraphUserInfo | null;
}

const NavigraphApiContext = React.createContext<NavigraphApiState>(undefined!);

export const NavigraphApiProvider: React.FC = ({ children }) => {
    const [api] = useState<NavigraphApi>(new NavigraphApi());
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [refreshToken, setRefreshToken] = useState<string | null>(null);
    const [pkce, setPkce] = useState<NavigraphPKCE | null>(null);
    const [accessTokenExpiresAt, setAccessTokenExpiresAt] = useState<number | null>(null);
    const [deviceAuth, setDeviceAuth] = useState<NavigraphDeviceAuth | null>(null);
    const [authCheckInterval, setAuthCheckInterval] = useState<number>(defaultAuthCheckInterval);
    const [isAuthenticatingDevice, setIsAuthenticatingDevice] = useState<boolean>(false);
    const [deviceAuthExpiresIn, setDeviceAuthExpiresIn] = useState<number | null>(null);
    const [userInfo, setUserInfo] = useState<NavigraphUserInfo | null>(null);

    const isAuthenticated = useMemo<boolean>(() => !!accessToken, [accessToken]);

    // Callbacks

    // Try to authenticate the device
    const authenticateDevice = useCallback(async () => {
        setIsAuthenticatingDevice(true);
        const newPkce: NavigraphPKCE = getPkce();
        setPkce(newPkce);
        setDeviceAuth(null);
        const result = await api.authenticateDeviceAsync(newPkce);
        setDeviceAuth(result);
        setDeviceAuthExpiresIn(result?.expiresIn ?? 0);
        setAuthCheckInterval(result?.interval ?? 0);
        setIsAuthenticatingDevice(false);
    }, [api, setIsAuthenticatingDevice, setDeviceAuthExpiresIn, setDeviceAuth, setAuthCheckInterval, setPkce]);

    // Try to refresh the accessToken using a refreshToken
    const tryRefreshToken = useCallback(async () => {
        if (refreshToken) {
            await api.refreshTokenAsync(refreshToken);
        }
    }, [api, refreshToken]);

    // Try to get a new token
    const tryGetToken = useCallback(async () => {
        if (deviceAuth?.deviceCode && pkce) {
            const result = await api.getTokenAsync(deviceAuth.deviceCode, pkce);
            switch (result.status) {
            case NavigraphTokenStatus.Success: {
                setAccessToken(result.token?.accessToken ?? null);
                setRefreshToken(result.token?.refreshToken ?? null);
                NXDataStore.set<string>(NavigraphRefreshTokenDataProp, result.token?.refreshToken ?? '');
                break;
            }
            case NavigraphTokenStatus.IsExpired: {
                await authenticateDevice();
                break;
            }
            case NavigraphTokenStatus.SlowDown: {
                setAuthCheckInterval(authCheckInterval + 5);
                break;
            }
            case NavigraphTokenStatus.IsPending: {
                break;
            }
            default: break;
            }
        }
    }, [api, deviceAuth?.deviceCode, pkce, authenticateDevice, setAccessToken, setRefreshToken, setAuthCheckInterval]);

    // Get info of the currently authenticated user
    const getUserInfo = useCallback(async () => {
        const result = await api.getUserInfoAsync();
        setUserInfo(result);
    }, [api]);

    // Intervals

    // Countdown for authenticated device expiry
    useInterval(() => {
        if (deviceAuthExpiresIn) {
            if (deviceAuthExpiresIn > 0) {
                setDeviceAuthExpiresIn(deviceAuthExpiresIn - 1);
            } else if (!isAuthenticatingDevice) {
                authenticateDevice();
            }
        }
    }, 1000, { additionalDeps: [deviceAuthExpiresIn, isAuthenticatingDevice, authenticateDevice, setDeviceAuthExpiresIn] });

    // Check if the user has completed authentication for a device
    useInterval(() => {
        if (!isAuthenticated && deviceAuth) {
            tryGetToken();
        }
    }, authCheckInterval * 1000, { additionalDeps: [deviceAuth, isAuthenticated, tryGetToken] });

    // Check if the accessToken is near expiry and try to refresh with a refreshToken
    useInterval(() => {
        if (accessTokenExpiresAt && (Date.now() / 1000) - 60 >= accessTokenExpiresAt) {
            tryRefreshToken();
        }
    }, defaultTokenExpiryInterval * 1000, { additionalDeps: [accessTokenExpiresAt, tryRefreshToken] });

    // Effects

    // Get refresh token from persistent store on mount
    useEffect(() => {
        const persistentRefreshToken = NXDataStore.get<string>(NavigraphRefreshTokenDataProp);
        if (persistentRefreshToken && persistentRefreshToken !== '') {
            setRefreshToken(persistentRefreshToken);
        } else {
            authenticateDevice();
        }
    }, [setRefreshToken]);

    // Set the access token in the API and update expiry
    useEffect(() => {
        api.setAccessToken(accessToken);
        if (accessToken) {
            const jwt = parseJwt(accessToken);
            if (jwt.payload.exp) {
                setAccessTokenExpiresAt(jwt.payload.exp);
            } else {
                setAccessTokenExpiresAt(null);
            }
        }
    }, [api, accessToken, setAccessTokenExpiresAt]);

    // Get user info for the currently authenticated user
    useEffect(() => {
        if (isAuthenticated) {
            getUserInfo();
        } else {
            setUserInfo(null);
        }
    }, [isAuthenticated, getUserInfo, setUserInfo]);

    return (
        <NavigraphApiContext.Provider value={{
            api,
            deviceAuth,
            authenticateDevice,
            isAuthenticated,
            isAuthenticatingDevice,
            userInfo,
        }}
        >
            {children}
        </NavigraphApiContext.Provider>
    );
};

export const useNavigraphApi = (): NavigraphApiState => {
    const context = useContext(NavigraphApiContext);
    if (context === undefined) {
        throw new Error('useNavigraphApi must be used within a NavigraphApiProvider');
    }
    return context;
};
