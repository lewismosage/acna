import React, { useState, useEffect } from 'react';
import { 
  Book, 
  Download, 
  Eye, 
  Clock,
  TrendingUp,
  Loader
} from 'lucide-react';
import { educationalResourcesApi, ResourceAnalytics } from '../../../../services/educationalResourcesApi';
import LoadingSpinner from '../../../../components/common/LoadingSpinner';

interface AnalyticsTabProps {
  resources: any[];
}

const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ resources }) => {
  const [analyticsData, setAnalyticsData] = useState<ResourceAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await educationalResourcesApi.getAnalytics();
      setAnalyticsData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
          <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Analytics</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Total Resources</p>
              <p className="text-3xl font-bold text-blue-900">{analyticsData.total}</p>
            </div>
            <Book className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Total Downloads</p>
              <p className="text-3xl font-bold text-green-900">{analyticsData.totalDownloads.toLocaleString()}</p>
            </div>
            <Download className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-green-600 text-sm mt-2">+{analyticsData.monthlyDownloads} this month</p>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Total Views</p>
              <p className="text-3xl font-bold text-purple-900">{analyticsData.totalViews.toLocaleString()}</p>
            </div>
            <Eye className="w-8 h-8 text-purple-600" />
          </div>
          <p className="text-purple-600 text-sm mt-2">+{analyticsData.monthlyViews} this month</p>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">Pending Submissions</p>
              <p className="text-3xl font-bold text-orange-900">{analyticsData.pendingSubmissions}</p>
            </div>
            <Clock className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resource Status Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 rounded-lg bg-green-50">
            <div className="text-2xl font-bold text-green-800">{analyticsData.published}</div>
            <div className="text-sm text-green-600">Published</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-yellow-50">
            <div className="text-2xl font-bold text-yellow-800">{analyticsData.draft}</div>
            <div className="text-sm text-yellow-600">Draft</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-blue-50">
            <div className="text-2xl font-bold text-blue-800">{analyticsData.underReview}</div>
            <div className="text-sm text-blue-600">Under Review</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-gray-50">
            <div className="text-2xl font-bold text-gray-800">{analyticsData.archived}</div>
            <div className="text-sm text-gray-600">Archived</div>
          </div>
        </div>
      </div>

      {/* Top Categories and Resources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Categories</h3>
          <div className="space-y-3">
            {Object.entries(analyticsData.resourcesByCategory).slice(0, 5).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between">
                <span className="text-gray-600">{category}</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(count / Math.max(...Object.values(analyticsData.resourcesByCategory))) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {analyticsData.recentActivity.slice(0, 5).map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg mr-3 ${
                    activity.type === 'download' ? 'bg-green-100' :
                    activity.type === 'submission' ? 'bg-blue-100' :
                    'bg-orange-100'
                  }`}>
                    {activity.type === 'download' ? <Download className="w-4 h-4 text-green-600" /> :
                     activity.type === 'submission' ? <TrendingUp className="w-4 h-4 text-blue-600" /> :
                     <Eye className="w-4 h-4 text-orange-600" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{activity.resource}</p>
                    <p className="text-xs text-gray-500">{activity.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">
                    {activity.count ? `${activity.count} ${activity.type}` : activity.type}
                  </p>
                  {activity.user && <p className="text-xs text-gray-500">{activity.user}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsTab;