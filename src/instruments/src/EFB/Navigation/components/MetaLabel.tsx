import React, { FC } from 'react';
import { Meta } from '../../api/navigation/types';

export type MetaLabelProps = {
    meta: Meta;
}

export const MetaLabel: FC<MetaLabelProps> = ({ meta }) => {
    if (!meta.value || meta.value.length <= 0) {
        return <></>;
    }
    return (
        <span className="text-sm bg-navy-lighter text-gray-300 rounded-md px-2 py-1">
            {`${meta.key}: ${meta.value}`}
        </span>
    );
};

export default MetaLabel;
