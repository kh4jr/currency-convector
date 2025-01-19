// src/CurrencyChart.js

import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto'; // Ensures Chart.js works with React

const CurrencyChart = ({ baseCurrency, targetCurrency, apiKey }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistoricalData = async () => {
      setLoading(true);
      setError(null);

      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 30); // Last 30 days

      const formattedToday = today.toISOString().split('T')[0];
      const formattedStartDate = startDate.toISOString().split('T')[0];

      const url = `https://api.apilayer.com/currency_data/timeframe?start_date=${formattedStartDate}&end_date=${formattedToday}&source=${baseCurrency}&currencies=${targetCurrency}`;

      try {
        const response = await fetch(url, {
          headers: {
            apikey: apiKey,
          },
        });

        const data = await response.json();

        if (response.ok) {
          const dates = Object.keys(data.quotes);
          const rates = dates.map(date => data.quotes[date][`${baseCurrency}${targetCurrency}`]);

          setChartData({
            labels: dates,
            datasets: [
              {
                label: `Exchange Rate: ${baseCurrency} to ${targetCurrency}`,
                data: rates,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.4,
              },
            ],
          });
        } else {
          throw new Error(data.message || 'Failed to fetch historical data');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHistoricalData();
  }, [baseCurrency, targetCurrency, apiKey]);

  if (loading) return <p>Loading chart...</p>;
  if (error) return <p>Error loading chart: {error}</p>;

  return (
    <div style={{ marginTop: '20px' }}>
      <h3>Exchange Rate Trends</h3>
      <Line data={chartData} />
    </div>
  );
};

export default CurrencyChart;
