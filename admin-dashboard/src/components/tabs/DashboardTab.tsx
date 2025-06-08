'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchDashboardStats,
  fetchRevenueData,
  fetchCategoryStats,
  fetchRecentActivity,
  fetchEndingSoonAuctions
} from '@/store/slices/dashboardSlice';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export function DashboardTab() {
  const dispatch = useAppDispatch();
  const {
    stats,
    revenueData,
    categoryStats,
    recentActivity,
    endingSoonAuctions,
    isLoading
  } = useAppSelector((state) => state.dashboard);

  useEffect(() => {
    // Fetch all dashboard data
    dispatch(fetchDashboardStats());
    dispatch(fetchRevenueData('6months'));
    dispatch(fetchCategoryStats());
    dispatch(fetchRecentActivity());
    dispatch(fetchEndingSoonAuctions());
  }, [dispatch]);

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  // Default values for when data is loading or not available
  const defaultStats = {
    totalProducts: 0,
    activeAuctions: 0,
    totalRevenue: 0,
    totalBids: 0,
    newUsersThisMonth: 0,
    revenueGrowth: 0
  };

  const currentStats = stats || defaultStats;

  // Chart configurations
  const revenueChartData = {
    labels: revenueData?.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Revenue ($)',
        data: revenueData?.data || [4500, 5200, 4800, 5800, 6000, 7200],
        borderColor: 'rgb(79, 70, 229)',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const categoryChartData = {
    labels: categoryStats?.labels || ['Antiques', 'Art', 'Collectibles', 'Jewelry', 'Vintage'],
    datasets: [
      {
        data: categoryStats?.data || [30, 20, 25, 15, 10],
        backgroundColor: [
          '#4F46E5',
          '#7C3AED',
          '#EC4899',
          '#EF4444',
          '#F59E0B',
        ],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  return (
    <div className="p-6 space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Products</p>
              <p className="text-3xl font-bold">{currentStats.totalProducts.toLocaleString()}</p>
              <p className="text-blue-100 text-sm mt-1">
                <i className="fas fa-arrow-up mr-1"></i>
                12% from last month
              </p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <i className="fas fa-box text-2xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Active Auctions</p>
              <p className="text-3xl font-bold">{currentStats.activeAuctions.toLocaleString()}</p>
              <p className="text-green-100 text-sm mt-1">
                <i className="fas fa-arrow-up mr-1"></i>
                8% from last month
              </p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <i className="fas fa-gavel text-2xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Total Revenue</p>
              <p className="text-3xl font-bold">${currentStats.totalRevenue.toLocaleString()}</p>
              <p className="text-purple-100 text-sm mt-1">
                <i className="fas fa-arrow-up mr-1"></i>
                {currentStats.revenueGrowth}% from last month
              </p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <i className="fas fa-dollar-sign text-2xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Total Bids</p>
              <p className="text-3xl font-bold">{currentStats.totalBids.toLocaleString()}</p>
              <p className="text-orange-100 text-sm mt-1">
                <i className="fas fa-arrow-up mr-1"></i>
                18% from last month
              </p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <i className="fas fa-hand-paper text-2xl"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Revenue Overview</h3>
            <select className="border border-gray-300 rounded-lg px-3 py-1 text-sm">
              <option>Last 6 months</option>
              <option>Last year</option>
            </select>
          </div>
          <div className="h-80">
            <Line data={revenueChartData} options={chartOptions} />
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Category Distribution</h3>
          <div className="h-80">
            <Doughnut data={categoryChartData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Recent Activity and Ending Soon */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivity.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${activity.iconBg}`}>
                    <i className={`${activity.icon} text-white text-xs`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-500">{activity.description}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Ending Soon Auctions */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Ending Soon</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {endingSoonAuctions.slice(0, 5).map((auction) => (
                <div key={auction.id} className="flex items-center space-x-3">
                  <img
                    src={auction.image}
                    alt={auction.title}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {auction.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      Current: ${auction.currentBid.toLocaleString()}
                    </p>
                    <p className="text-xs text-red-600">{auction.timeLeft} left</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {auction.bidCount} bids
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 