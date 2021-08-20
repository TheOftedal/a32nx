import { Jwt } from './types';

const b64DecodeUnicode = (str: string) => decodeURIComponent(
    Array.prototype.map.call(Buffer.from(str, 'base64'), (c: string) => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`).join(''),
);

export const parseJwt = (token: string): Jwt => JSON.parse(
    b64DecodeUnicode(
        token.split('.')[1].replace('-', '+').replace('_', '/'),
    ),
);
