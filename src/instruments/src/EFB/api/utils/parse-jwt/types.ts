export type Jwt = {
    header: JwtHeader;
    payload: JwtPayload;
    signature: string;
}

export type JwtHeader = {
    alg: string | Algorithm;
    typ?: string;
    cty?: string;
    crit?: Array<string | Exclude<keyof JwtHeader, 'crit'>>;
    kid?: string;
    jku?: string;
    x5u?: string | Array<string>;
    'x5t#S256'?: string;
    x5t?: string;
    x5c?: string | Array<string>;
}

export interface JwtPayload {
    iss?: string;
    aud?: string | Array<string>;
    exp?: number;
    nbf?: number;
    'client_id'?: string;
    scope?: Array<string>;
    sub?: string;
    'auth_time'?: number;
    idp?: string;
    'preferred_username'?: string;
    amr?: Array<string>;
    subscriptions?: Array<string>;
    iat?: number;
    jti?: string;
}

export type Algorithm =
'HS256' | 'HS384' | 'HS512' |
'RS256' | 'RS384' | 'RS512' |
'ES256' | 'ES384' | 'ES512' |
'PS256' | 'PS384' | 'PS512' |
'none';
