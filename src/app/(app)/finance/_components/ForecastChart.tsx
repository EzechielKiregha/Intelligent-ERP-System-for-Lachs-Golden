import { useFinanceForecast } from '@/lib/hooks/finance';
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ForecastChart() {
  const [range, setRange] = useState('6m'); // Default range: 6 months
  const { data, isLoading, isError } = useFinanceForecast(range);

  if (isLoading) {
    return <p>Loading forecast data...</p>;
  }

  if (isError) {
    return <p>Error loading forecast data.</p>;
  }

  const handleRangeChange = (newRange: string) => {
    setRange(newRange);
  };

  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Forecast Chart</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => handleRangeChange('6m')}
            className={`px-4 py-2 rounded-lg ${range === '6m' ? 'bg-[#A17E25] text-white' : 'bg-gray-100 dark:bg-[#374151] text-gray-800 dark:text-gray-200'
              }`}
          >
            6 Months
          </button>
          <button
            onClick={() => handleRangeChange('12m')}
            className={`px-4 py-2 rounded-lg ${range === '12m' ? 'bg-[#A17E25] text-white' : 'bg-gray-100 dark:bg-[#374151] text-gray-800 dark:text-gray-200'
              }`}
          >
            12 Months
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="totalAmount" stroke="#A17E25" activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}