import React from 'react';
import { 
  Book, 
  Download, 
  Eye, 
  Clock,
  TrendingUp
} from 'lucide-react';

interface FactSheet {
  id: number;
  title: string;
  type: string;
  category: string;
  description: string;
  status: string;
  author: string;
  dateCreated: string;
  downloads: number;
  views: number;
  fileSize: string;
  fileFormat: string;
  tags: string[];
  targetAudience: string[];
  isFeatured: boolean;
}

interface CaseStudySubmission {
  id: number;
  title: string;
  status: string;
  submissionDate: string;
}

interface AnalyticsTabProps {
  factSheets: FactSheet[];
  submissions: CaseStudySubmission[];
}

const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ factSheets, submissions }) => {
  const analyticsData = {
    totalResources: factSheets.length,
    publishedResources: factSheets.filter(r => r.status === 'Published').length,
    draftResources: factSheets.filter(r => r.status === 'Draft').length,
    underReviewResources: factSheets.filter(r => r.status === 'Under Review').length,
    archivedResources: factSheets.filter(r => r.status === 'Archived').length,
    totalDownloads: factSheets.reduce((sum, r) => sum + r.downloads, 0),
    totalViews: factSheets.reduce((sum, r) => sum + r.views, 0),
    monthlyDownloads: 1250,
    monthlyViews: 2890,
    pendingSubmissions: submissions.filter(s => s.status === 'Pending Review').length,
    featuredResources: factSheets.filter(r => r.isFeatured).length,
    topCategories: [
      { category: 'Epilepsy', count: 12, downloads: 5200 },
      { category: 'Cerebral Palsy', count: 8, downloads: 3800 },
      { category: 'Neurodevelopment', count: 6, downloads: 2100 }
    ],
    topResources: [
      { id: 1, title: 'Epilepsy in African Children', category: 'Epilepsy', downloads: 2400, views: 5600 },
      { id: 2, title: 'Cerebral Palsy Early Detection', category: 'Cerebral Palsy', downloads: 1800, views: 3200 }
    ],
    recentActivity: [
      { type: 'download', resource: 'Epilepsy Fact Sheet', count: 45, date: '2024-08-25' },
      { type: 'submission', resource: 'Ghana Epilepsy Program', date: '2024-08-20', user: 'Dr. Kwame Asante' }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Total Resources</p>
              <p className="text-3xl font-bold text-blue-900">{analyticsData.totalResources}</p>
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
            <div className="text-2xl font-bold text-green-800">{analyticsData.publishedResources}</div>
            <div className="text-sm text-green-600">Published</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-yellow-50">
            <div className="text-2xl font-bold text-yellow-800">{analyticsData.draftResources}</div>
            <div className="text-sm text-yellow-600">Draft</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-blue-50">
            <div className="text-2xl font-bold text-blue-800">{analyticsData.underReviewResources}</div>
            <div className="text-sm text-blue-600">Under Review</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-gray-50">
            <div className="text-2xl font-bold text-gray-800">{analyticsData.archivedResources}</div>
            <div className="text-sm text-gray-600">Archived</div>
          </div>
        </div>
      </div>

      {/* Top Categories and Resources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Categories</h3>
          <div className="space-y-3">
            {analyticsData.topCategories.map((category) => (
              <div key={category.category} className="flex items-center justify-between">
                <span className="text-gray-600">{category.category}</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(category.count / analyticsData.topCategories[0].count) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{category.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {analyticsData.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg mr-3 ${
                    activity.type === 'download' ? 'bg-green-100' :
                    activity.type === 'submission' ? 'bg-blue-100' :
                    activity.type === 'publish' ? 'bg-purple-100' : 'bg-orange-100'
                  }`}>
                    {activity.type === 'download' ? <Download className="w-4 h-4 text-green-600" /> :
                     activity.type === 'submission' ? <TrendingUp className="w-4 h-4 text-blue-600" /> :
                     activity.type === 'publish' ? <Book className="w-4 h-4 text-purple-600" /> :
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