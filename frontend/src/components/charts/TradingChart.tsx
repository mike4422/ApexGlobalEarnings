'use client';

import { useEffect, useRef } from 'react';
import { createChart, ISeriesApi, LineData } from 'lightweight-charts';

interface TradingChartProps {
  pair: string;
  data: LineData[];
}

export default function TradingChart({ pair, data }: TradingChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: 320,
      layout: {
        background: { color: '#050816' },
        textColor: '#e5e7eb',
      },
      grid: {
        vertLines: { color: '#111827' },
        horzLines: { color: '#111827' },
      },
      crosshair: { mode: 0 },
      timeScale: { borderColor: '#374151' },
      rightPriceScale: { borderColor: '#374151' },
    });

    const series: ISeriesApi<'Line'> = chart.addLineSeries({
      lineWidth: 2,
    });

    series.setData(data);

    const handleResize = () => {
      chart.applyOptions({ width: containerRef.current!.clientWidth });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [pair, data]);

  return (
    <div className="rounded-xl border border-gray-800 bg-bgAlt p-3">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-semibold">{pair} Chart</h3>
        <p className="text-[11px] text-gray-500">TradingView Lightweight Charts</p>
      </div>
      <div ref={containerRef} />
    </div>
  );
}
