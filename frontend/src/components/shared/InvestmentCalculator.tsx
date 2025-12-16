'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/Input';

export default function InvestmentCalculator() {
  const [amount, setAmount] = useState(1000);
  const [roi, setRoi] = useState(1.5); // % per day
  const [days, setDays] = useState(15);

  const result = useMemo(() => {
    const dailyRate = roi / 100;
    const dailyEarnings = amount * dailyRate;
    const totalProfit = dailyEarnings * days;
    const totalReturn = amount + totalProfit;

    return {
      dailyEarnings,
      totalProfit,
      totalReturn,
    };
  }, [amount, roi, days]);

  return (
    <div className="rounded-2xl border border-gray-700 bg-bg p-4 sm:p-6 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
        <div>
          <label className="block text-gray-400 mb-1">Amount (USD)</label>
          <Input
            type="number"
            min={50}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value) || 0)}
          />
        </div>
        <div>
          <label className="block text-gray-400 mb-1">Daily ROI (%)</label>
          <Input
            type="number"
            min={0.1}
            step={0.1}
            value={roi}
            onChange={(e) => setRoi(Number(e.target.value) || 0)}
          />
        </div>
        <div>
          <label className="block text-gray-400 mb-1">Duration (days)</label>
          <Input
            type="number"
            min={1}
            value={days}
            onChange={(e) => setDays(Number(e.target.value) || 0)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
        <div>
          <p className="text-gray-400 mb-1">Daily Earnings</p>
          <p className="font-semibold">${result.dailyEarnings.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-gray-400 mb-1">Total Profit</p>
          <p className="font-semibold text-accentGreen">
            ${result.totalProfit.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-gray-400 mb-1">Total Return</p>
          <p className="font-semibold">${result.totalReturn.toFixed(2)}</p>
        </div>
      </div>

      <p className="text-[11px] text-gray-500">
        Projections are indicative and do not guarantee future performance.
      </p>
    </div>
  );
}
