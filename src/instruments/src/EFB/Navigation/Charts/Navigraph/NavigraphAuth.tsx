import React, { FC } from 'react';
import QRCode from 'qrcode.react';
import { IconRefresh } from '@tabler/icons';
import Loader from '../../components/Loader';
import navigraphLogo from '../../../Assets/navigraph-logo.svg';
import { useNavigraphApi } from '../../../api/navigation/navigraph';

export const NavigraphAuth: FC = () => {
    const { deviceAuth, authenticateDevice } = useNavigraphApi();

    const handleAuthRefreshOnClick = () => {
        authenticateDevice();
    };

    return (
        <div className="flex-grow flex flex-col text-white items-center justify-center">
            <Loader isLoading={!deviceAuth} />
            {deviceAuth && (
                <div className="bg-navy-regular rounded-2xl">
                    <div className="flex p-6">
                        <div className="flex-grow flex items-center justify-center">
                            <img width={350} alt="Navigraph Logo" src={navigraphLogo} />
                        </div>
                        <IconRefresh size={24} stroke={2} onClick={handleAuthRefreshOnClick} />
                    </div>
                    <div className="flex-grow flex">
                        <div className="flex-grow">
                            <div className="bg-white flex flex-grow items-center justify-center p-6">
                                <QRCode
                                    value={deviceAuth.verificationUriComplete}
                                    size={350}
                                    fgColor="#10161F"
                                />
                            </div>
                            <div className="flex items-center justify-center py-4 px-6">
                                <span className="text-2xl">Scan QR code</span>
                            </div>
                        </div>
                        <div className="flex-grow flex flex-col">
                            <div className="bg-navy-lighter flex-grow flex flex-col items-center justify-center">
                                <div className="flex flex-col items-center justify-center p-6 m-6">
                                    <div className="text-6xl">
                                        {deviceAuth.userCode}
                                    </div>
                                    <div className="text-xl text-gray-400 mt-2">
                                        {deviceAuth.verificationUri}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-center py-4 px-6">
                                <span className="text-2xl">Type in user code</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NavigraphAuth;
