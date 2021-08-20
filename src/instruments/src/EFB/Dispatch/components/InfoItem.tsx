import React, { FC } from 'react';

export type InfoItemProps = {
    header: string;
    value: string | number;
    icon: JSX.Element;
}

export const InfoItem:FC<InfoItemProps> = ({ header, value, icon }) => (
    <div>
        <span className="text-xl font-medium flex items-center">
            {icon}
            <div className="ml-2">{header}</div>
        </span>
        <span className="mt-2 text-lg">{value}</span>
    </div>
);
