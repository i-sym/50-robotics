import { useEffect, useMemo, useState } from 'react';
import { WidgetConfig, DashboardConfig } from '@/types/dashboard';
import { WidgetRenderer } from './widget-renderer';

type DashboardGridProps = {
    dashboard: DashboardConfig;
    className?: string;
};

export function DashboardGrid({ dashboard, className = '' }: DashboardGridProps) {
    const [mounted, setMounted] = useState(false);

    // Set mounted state after initial render to handle SSR
    useEffect(() => {
        setMounted(true);
    }, []);

    const gridStyle = useMemo(() => {
        return {
            display: 'grid',
            gridTemplateColumns: `repeat(${dashboard.layout.columns}, minmax(0, 1fr))`,
            gridAutoRows: `${dashboard.layout.rowHeight}px`,
            gap: '1rem',
        };
    }, [dashboard.layout.columns, dashboard.layout.rowHeight]);

    // Only render widgets once mounted (client-side) to avoid hydration issues
    if (!mounted) {
        return (
            <div className={`w-full p-4 ${className}`}>
                <div className="animate-pulse flex flex-col space-y-4">
                    <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`w-full p-4 ${className}`}>
            <h1 className="text-2xl font-bold mb-6">{dashboard.name}</h1>
            <div style={gridStyle}>
                {dashboard.widgets.map((widget) => (
                    <WidgetContainer
                        key={widget.id}
                        widget={widget}
                        dashboardId={dashboard.id}
                    />
                ))}
            </div>
        </div>
    );
}

function WidgetContainer({ widget, dashboardId }: { widget: WidgetConfig, dashboardId: string }) {
    const { position } = widget;

    // Calculate grid position
    const style = {
        gridColumn: `span ${position.width} / span ${position.width}`,
        gridRow: `span ${position.height} / span ${position.height}`,
        gridColumnStart: position.x + 1, // +1 because CSS grid is 1-indexed
        gridRowStart: position.y + 1, // +1 because CSS grid is 1-indexed
    };

    return (
        <div
            className=""
            style={style}
        >
            <WidgetRenderer
                widget={widget}
                dashboardId={dashboardId}
            />
        </div>
    );
}