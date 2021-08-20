import React, { FC, memo, useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { throttle } from 'lodash';
import { useSimVar } from '@instruments/common/simVars';
import { IconArrowsMaximize, IconArrowsMinimize, IconMinus, IconMoon, IconPlane, IconPlus, IconSun } from '@tabler/icons';
import clsx from 'clsx';
import { ChartLinks, ChartPlanView } from 'instruments/src/EFB/api/navigation/types';
import Test from '../../../Assets/plane-icon.svg';

import Loader from '../../components/Loader';

import { useNavigationDispatch, useNavigationState } from '../../reducer';
import { NavigationActionType, NavSimVar } from '../../types';

const overlayIconSize = 26;
const positionMarkerSize = 48;

type Position = {
    x: number;
    y: number;
}

const windowPosToCanvasPos = (canvas: HTMLCanvasElement, x: number, y: number): Position | null => {
    const canvasBox = canvas.getBoundingClientRect();
    if (!canvasBox) {
        return null;
    }

    return {
        x: (x - canvasBox.left) * (canvas.width / canvasBox.width), // / Zoom when the size of the canvas element is inconsistent with the size of the drawing surface
        y: (y - canvasBox.top) * (canvas.height / canvasBox.height),
    };
};

const getOffset = (offsetX: number, offsetY: number, width: number, height: number, edge: number): Position => {
    const minOffsetX = -(width - edge);
    const maxOffsetX = width - edge;
    const minOffsetY = -(height - edge);
    const maxOffsetY = height - edge;

    const offset: Position = { x: 0, y: 0 };

    if (offsetX < minOffsetX) {
        offset.x = minOffsetX;
    } else if (offsetX > maxOffsetX) {
        offset.x = maxOffsetX;
    } else {
        offset.x = offsetX;
    }

    if (offsetY < minOffsetY) {
        offset.y = minOffsetY;
    } else if (offsetY > maxOffsetY) {
        offset.y = maxOffsetY;
    } else {
        offset.y = offsetY;
    }

    return offset;
};

type ChartOverlayButtonProps = {
    onClick:() => void;
}

const ChartOverlayButton: FC<ChartOverlayButtonProps> = ({ onClick, children }) => (
    <button
        type="button"
        className="bg-gray-700 bg-opacity-90 p-2 text-white flex items-center justify-center rounded-lg focus:outline-none"
        onClick={onClick}
    >
        {children}
    </button>
);

export type ChartRenderProps = {
    chartLinks: ChartLinks | null;
    posLat: number;
    posLng: number;
    planView?: ChartPlanView;
}

export const ChartRender: FC<ChartRenderProps> = ({ chartLinks, posLat, posLng, planView }) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [chartImage, setChartImage] = useState<HTMLImageElement>();
    const [markerImage] = useState<HTMLImageElement>(new Image());
    const [fullscreen, setFullscreen] = useState<boolean>(false);
    const [darkMode, setDarkMode] = useState<boolean>(true);
    const [chartWidth, SetChartWidth] = useState<number>(0);
    const [chartHeight, SetChartHeight] = useState<number>(0);
    const chartRef = useRef<HTMLCanvasElement>(null);
    const [zoomLevel, setZoomLevel] = useState<number>(1);
    const [offset, setOffset] = useState<Position>({ x: 0, y: 0 });
    const [offsetDist, setOffsetDist] = useState<Position>({ x: 0, y: 0 });
    const [isMouseDown, setIsMouseDown] = useState<boolean>(false);
    const [mouseDownPos, setMouseDownPos] = useState<Position | null>(null);

    const [heading] = useSimVar(NavSimVar.PlaneHeadingTrue, 'Radians', 0);

    const { showPosOnChart } = useNavigationState();
    const navigationDispatch = useNavigationDispatch();

    const renderingCtx = useMemo<CanvasRenderingContext2D | undefined>(() => chartRef?.current?.getContext('2d') as CanvasRenderingContext2D, [chartRef.current]);

    const canvasAspectRatio = useMemo<number>(() => (renderingCtx?.canvas ? renderingCtx.canvas.offsetWidth / renderingCtx.canvas.offsetHeight : 0), [renderingCtx?.canvas]);

    // Reset offset variables
    const resetOffset = () => {
        setOffset({ x: 0, y: 0 });
        setOffsetDist({ x: 0, y: 0 });
        setMouseDownPos({ x: 0, y: 0 });
    };

    // Initialize rendering context for the canvas
    useEffect(() => {
        if (renderingCtx) {
            renderingCtx.imageSmoothingEnabled = false;
        }
    }, [renderingCtx]);

    // Create a new image element when the chart source links has changed
    useEffect(() => {
        if (renderingCtx && chartLinks) {
            const chartUrl = darkMode ? chartLinks.dark : chartLinks.light;

            if (chartUrl) {
                const newChartImage = new Image();
                newChartImage.src = chartUrl;
                setChartImage(newChartImage);
            }
        }
    }, [renderingCtx, chartLinks, darkMode]);

    // Initialize the chart image when a new source has been set
    useEffect(() => {
        if (canvasAspectRatio > 0 && chartImage) {
            setIsLoading(true);
            chartImage.onload = () => {
                SetChartWidth(chartImage.naturalWidth);
                SetChartHeight(chartImage.naturalWidth / canvasAspectRatio);
                resetOffset();
                setIsLoading(false);
            };
        }
    }, [canvasAspectRatio, chartImage]);

    useEffect(() => {
        markerImage.src = Test;
    }, [markerImage]);

    // Return true if aircraft position is within chart planview
    const posWithinPlanView = useMemo<boolean | undefined>(() => planView
       && posLng >= planView?.bboxGeo[0]
       && posLat >= planView?.bboxGeo[1]
       && posLng <= planView?.bboxGeo[2]
       && posLat <= planView?.bboxGeo[3],
    [posLat, posLng, planView]);

    const renderPositionMarker = useCallback((chartImage: HTMLImageElement, renderingCtx: CanvasRenderingContext2D,
        zoomLevel: number, offset: Position) => {
        if (!planView || canvasAspectRatio === 0) {
            return;
        }

        // Calculate local planview width in pixels covered
        const localWidth = Math.abs(planView.bboxLocal[0] - planView.bboxLocal[2]);
        const localHeight = Math.abs(planView.bboxLocal[1] - planView.bboxLocal[3]);

        // Calculate local planview width in geographic latitude/longitude
        const lngWidth = Math.abs(planView.bboxGeo[0] - planView.bboxGeo[2]);
        const latHeight = Math.abs(planView.bboxGeo[1] - planView.bboxGeo[3]);

        // Calculate pixel size per geographic latitude/longitude unit
        const lngPixelSize = localWidth / lngWidth;
        const latPixelSize = localHeight / latHeight;

        // Calculate local marker pixel position as per planview based on the natural width/height of the chart
        const pixelPosLngLocal = (Math.abs(posLng - planView.bboxGeo[0]) * lngPixelSize) + planView.bboxLocal[0];
        const pixelPosLatLocal = (localHeight - (Math.abs(posLat - planView.bboxGeo[1]) * latPixelSize) + planView.bboxLocal[3]);

        // Calculate the correct marker width/height depending on chart size and aspect ratio
        const positionMarkerWidth = (positionMarkerSize * (chartImage.naturalWidth / renderingCtx.canvas.offsetWidth));
        const positionMarkerHeight = (positionMarkerWidth / canvasAspectRatio);

        // Calculate the canvas pixel position for the lat/lng according to aspect ratio, zoom level and offset
        const pixelPosLng = (pixelPosLngLocal * zoomLevel) + offset.x;
        const pixelPosLat = (pixelPosLatLocal * zoomLevel) + offset.y;

        // Render the marker on the canvas
        renderingCtx.save();
        renderingCtx.translate(pixelPosLng, pixelPosLat);
        renderingCtx.rotate((heading) * Math.PI / 180);
        renderingCtx.drawImage(markerImage, -(positionMarkerWidth / 2), -(positionMarkerHeight / 2), positionMarkerWidth, positionMarkerHeight);
        renderingCtx.restore();
    }, [canvasAspectRatio, planView, posLat, posLng, heading]);

    // Clear canvas and render chart image
    const renderChart = useCallback((chartImage: HTMLImageElement, zoomLevel: number, offset: Position, chartWidth: number, chartHeight: number) => {
        if (!renderingCtx || chartWidth <= 0 || chartHeight <= 0) {
            return;
        }

        renderingCtx.clearRect(0, 0, chartWidth, chartHeight);
        const { naturalWidth, naturalHeight } = chartImage;
        renderingCtx.drawImage(chartImage, offset.x, offset.y, naturalWidth * zoomLevel, naturalHeight * zoomLevel);

        if (posWithinPlanView && showPosOnChart) {
            renderPositionMarker(chartImage, renderingCtx, zoomLevel, offset);
        }
    }, [renderingCtx, renderPositionMarker, posWithinPlanView, showPosOnChart]);

    // Throttle canvas re-renders to 60fps
    const throttledRenderChart = useMemo(
        () => throttle(renderChart, 16),
        [renderChart],
    );

    // Re-render chart image when any of the dependencies has changed
    useEffect(() => {
        if (chartImage) {
            throttledRenderChart(chartImage, zoomLevel, offset, chartWidth, chartHeight);
        }
    }, [chartImage, zoomLevel, offset, chartWidth, chartHeight, throttledRenderChart]);

    // Sync chart canvas size
    useEffect(() => {
        if (chartRef.current && chartImage) {
            SetChartWidth(chartImage.naturalWidth);
            SetChartHeight(fullscreen ? chartImage.naturalWidth / (window.innerWidth / window.innerHeight) : chartImage.naturalWidth / canvasAspectRatio);
        }
    }, [fullscreen, chartRef.current, chartImage, canvasAspectRatio]);

    // Set zoom level to full width when image or chart width has changed
    useEffect(() => {
        if (chartImage && chartImage?.naturalWidth > 0) {
            resetOffset();
            setZoomLevel(chartWidth / chartImage.naturalWidth);
        }
    }, [chartImage?.naturalWidth, chartWidth]);

    const handleToggleFullscreenOnClick = useCallback(() => {
        setFullscreen(!fullscreen);
    }, [fullscreen, setFullscreen]);

    const handleZoomInOnClick = useCallback(() => {
        setZoomLevel(zoomLevel + 0.1);
    }, [zoomLevel]);

    const handleZoomOutOnClick = useCallback(() => {
        if (chartImage) {
            const newZoomLevel = zoomLevel - 0.1;
            const ratio = Math.min(chartWidth / chartImage.naturalWidth, chartHeight / chartImage.naturalHeight);
            if (newZoomLevel > ratio) {
                setZoomLevel(zoomLevel - 0.1);
            } else {
                setZoomLevel(ratio);
            }
        }
    }, [zoomLevel, chartWidth, chartHeight, chartImage]);

    const handleToggleDarkModeOnClick = useCallback(() => {
        setDarkMode(!darkMode);
    }, [darkMode, setDarkMode]);

    const handleToggleShowPositionOnClick = useCallback(() => {
        navigationDispatch({ type: NavigationActionType.SetShowPosOnChart, payload: !showPosOnChart });
    }, [showPosOnChart, navigationDispatch]);

    const handleOnTouchDown = useCallback((event: React.TouchEvent<HTMLCanvasElement>) => {
        event.stopPropagation();

        const { clientX, clientY } = event.touches[0];

        const canvas = event.target as HTMLCanvasElement;

        const canvasPos = windowPosToCanvasPos(canvas, clientX, clientY);

        setIsMouseDown(true);
        setMouseDownPos(canvasPos);
    }, [renderingCtx]);

    const handleOnMouseMove = useCallback((event: React.TouchEvent<HTMLCanvasElement>) => {
        event.stopPropagation();

        if (!isMouseDown) {
            return;
        }

        const { clientX, clientY } = event.touches[0];

        const canvas = event.target as HTMLCanvasElement;

        const canvasPos = windowPosToCanvasPos(canvas, clientX, clientY);
        if (!canvasPos || !mouseDownPos) {
            return;
        }

        const diffX = canvasPos.x - mouseDownPos.x;
        const diffY = canvasPos.y - mouseDownPos.y;

        if (diffX === 0 && diffY === 0) {
            return;
        }

        const offset = getOffset(diffX + offsetDist.x, diffY + offsetDist.y, canvas.width, canvas.height, 100);

        setOffset(offset);
        setOffsetDist(offset);
        setMouseDownPos(canvasPos);
    }, [isMouseDown, mouseDownPos, offsetDist]);

    const handleOnMouseUp = (event: React.TouchEvent<HTMLCanvasElement>) => {
        event.stopPropagation();
        setIsMouseDown(false);
        setMouseDownPos(null);
    };

    return (
        <div className={clsx('bg-navy-medium', fullscreen ? 'w-screen h-screen absolute left-0 top-0 z-10' : 'relative w-3/5 h-full')}>
            <div className="absolute left-6 top-6 space-y-2">
                <ChartOverlayButton onClick={handleToggleFullscreenOnClick}>
                    {fullscreen ? <IconArrowsMinimize size={overlayIconSize} stroke={2} /> : <IconArrowsMaximize size={overlayIconSize} stroke={2} /> }
                </ChartOverlayButton>
            </div>
            <div className="absolute flex right-6 top-6 space-x-4">
                {planView && (
                    <ChartOverlayButton onClick={handleToggleShowPositionOnClick}>
                        <IconPlane className={clsx(showPosOnChart ? 'text-teal-light' : 'text-white')} size={overlayIconSize} stroke={2} />
                    </ChartOverlayButton>
                )}
                <ChartOverlayButton onClick={handleToggleDarkModeOnClick}>
                    {darkMode ? <IconMoon size={overlayIconSize} stroke={2} /> : <IconSun size={overlayIconSize} stroke={2} /> }
                </ChartOverlayButton>
            </div>
            <div className="absolute right-6 bottom-6 space-y-4">
                <ChartOverlayButton onClick={handleZoomInOnClick}>
                    <IconPlus size={overlayIconSize} stroke={2} />
                </ChartOverlayButton>
                <ChartOverlayButton onClick={handleZoomOutOnClick}>
                    <IconMinus size={overlayIconSize} stroke={2} />
                </ChartOverlayButton>
            </div>
            <Loader isLoading={isLoading} fullHeight />
            <canvas
                className="w-full h-full"
                ref={chartRef}
                width={chartWidth}
                height={chartHeight}
                onTouchStart={handleOnTouchDown}
                onTouchMove={handleOnMouseMove}
                onTouchEnd={handleOnMouseUp}
            />
        </div>
    );
};

export default memo(ChartRender);
