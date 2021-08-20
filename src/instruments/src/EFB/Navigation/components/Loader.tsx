import clsx from 'clsx';
import React, { FC } from 'react';
import logo from '../../Assets/fbw-logo.svg';

export type LoaderProps = {
    isLoading?: boolean;
    fullWidth?: boolean;
    fullHeight?: boolean;
    absolute?: boolean;
}

export const Loader: FC<LoaderProps> = ({ isLoading, fullWidth, fullHeight, absolute }) => {
    if (isLoading) {
        return (
            <div className={clsx('flex justify-center items-center', fullWidth && 'w-full', fullHeight && 'h-full', absolute && 'absolute')}>
                <img className="animate-ping" alt="loader icon" src={logo} width={24} />
            </div>
        );
    }
    return <></>;
};

export default Loader;
