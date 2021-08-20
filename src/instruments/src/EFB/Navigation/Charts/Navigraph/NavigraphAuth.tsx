import React, { FC } from 'react';
import QRCode from 'qrcode.react';
import Loader from '../../components/Loader';
import navigraphLogo from '../../../Assets/navigraph-logo.svg';
import { NavigraphDeviceAuth, useNavigraphApi } from '../../../api/navigation/navigraph';

export const NavigraphAuth: FC = () => {
    // const { deviceAuth } = useNavigraphApi();

    const deviceAuth: NavigraphDeviceAuth = null;

    console.log(NavigraphAuth);

    return (
        <div className="flex-grow flex flex-col text-white items-center justify-center">
            <Loader isLoading={!deviceAuth} />
            {deviceAuth?.verificationUriComplete && (
                <div className="rounded-2xl">
                    <div className="flex items-center justify-center bg-navy-regular py-4 px-6 rounded-t-2xl">
                        <img width={350} alt="Navigraph Logo" src={navigraphLogo} />
                    </div>
                    <div className="bg-white flex flex-grow items-center justify-center p-6">
                        <QRCode
                            value={deviceAuth.verificationUriComplete}
                            size={450}
                            fgColor="#10161F"
                        />
                    </div>
                    <div className="flex items-center justify-center bg-navy-regular py-4 px-6 rounded-b-2xl">
                        <span className="text-2xl">Scan code to authenticate with Navigraph</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NavigraphAuth;
