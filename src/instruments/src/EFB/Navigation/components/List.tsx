import React, { FC, useCallback, useState } from 'react';
import { IconChevronDown, IconChevronUp, IconStar } from '@tabler/icons';
import clsx from 'clsx';
import { Meta } from '../../api/navigation/types';
import MetaLabel from './MetaLabel';

type BundleListItemProps = {
    title: string;
    description?: string;
    meta: Array<Meta>;
    onClick:() => void;
    isActive?: boolean;
    showFav?: boolean;
    isFav?: boolean;
    isSelectable?: boolean;
    favOnClick?:() => void;
}

export const ListItem: FC<BundleListItemProps> = ({ title, description, meta, onClick, isActive, showFav, isFav, isSelectable, favOnClick }) => {
    const handleFavOnClick = useCallback((e: React.MouseEvent<SVGElement, MouseEvent>) => {
        if (e && e.stopPropagation) {
            e.stopPropagation();
        }

        if (favOnClick) {
            favOnClick();
        }
    }, [favOnClick]);

    return (
        <div
            className="flex bg-gray-700 rounded-lg min-w-0"
            onClick={onClick}
        >
            {isSelectable && <span className={clsx('w-4 rounded-l-lg transition-colors duration-200', isActive ? 'bg-teal-light' : 'bg-navy-lighter')} />}
            <div className="w-full flex flex-col pl-4 pr-2 py-2 min-w-0">
                <div className="flex items-center">
                    <span className="flex-grow text-lg truncate">{title}</span>
                    {showFav && (
                        <IconStar
                            className={clsx('w-10 transition-colors duration-200',
                                isFav ? 'text-teal-light' : 'text-gray-400')}
                            size={24}
                            stroke={2}
                            onClick={handleFavOnClick}
                        />
                    )}
                </div>
                {description && <span className="mt-2 text-sm truncate">{description}</span>}
                <div className="flex flex-row space-x-4 mt-2">
                    {meta.map((m, index) => {
                        const key = `${m.key}-${index}`;
                        return <MetaLabel key={key} meta={m} />;
                    })}
                </div>
            </div>
        </div>
    );
};

type BundleListProps = {
    bundleName: string;
    icon?: JSX.Element;
}

export const BundleList: FC<BundleListProps> = ({ bundleName, icon, children }) => {
    const [isOpen, setIsOpen] = useState<boolean>(true);

    const handleOnClick = useCallback(() => {
        setIsOpen(!isOpen);
    }, [isOpen, setIsOpen]);

    return (
        <div className="flex flex-col rounded-lg bg-navy-regular">
            <span className="flex py-2 px-4 bg-gray-700 text-center text-xl rounded-t-lg" onClick={handleOnClick}>
                {icon && icon}
                <span className="flex-grow">{bundleName}</span>
                {isOpen ? <IconChevronUp size={24} stroke={2} /> : <IconChevronDown size={24} stroke={2} />}
            </span>
            <div className={clsx(isOpen ? 'block' : 'hidden')}>
                <List>
                    {children}
                </List>
            </div>
        </div>
    );
};

export const List: FC = ({ children }) => <div className="flex flex-col px-6 py-8 space-y-8 text-lg rounded-lg">{children}</div>;

export const ScrollableList: FC = ({ children }) => <div className="h-full space-y-8 mt-6 -mr-4 pr-4 rounded-lg overflow-x-hidden overflow-y-scroll grabbable scrollbar">{children}</div>;
