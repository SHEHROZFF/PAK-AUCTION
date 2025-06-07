'use client';

import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export function CategoriesChart() {
  const data = {
    labels: ['Antiques', 'Art', 'Collectibles', 'Jewelry', 'Vintage'],
    datasets: [
      {
        data: [30, 20, 25, 15, 10],
        backgroundColor: [
          'rgba(79, 70, 229, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(59, 130, 246, 0.8)',
        ],
        borderWidth: 0,
      },
    ],
  };

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
    },
    cutout: '70%',
  };

  return <Doughnut data={data} options={options} />;
} 