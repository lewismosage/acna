import { 
  Eye, TrendingUp, Users, DollarSign, Calendar, 
  FileText, BarChart3, Settings, Download 
} from 'lucide-react';

// Stats Card Component
const StatsCard = ({ title, value, icon: Icon, color = 'blue', trend }: any) => (
  <div className="bg-white border border-gray-300 rounded-lg p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
      </div>
      <div className={`p-3 bg-${color}-100 rounded-full`}>
        <Icon className={`w-6 h-6 text-${color}-600`} />
      </div>
    </div>
    {trend && (
      <div className="mt-2 flex items-center">
        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
        <span className="text-xs text-green-600">{trend}</span>
      </div>
    )}
  </div>
);

const ReportsAnalytics = () => (
  <div className="space-y-6">
    {/* Analytics Overview */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatsCard title="Page Views" value="12,450" icon={Eye} color="blue" trend="+5% vs last month" />
      <StatsCard title="Member Engagement" value="78%" icon={TrendingUp} color="green" />
      <StatsCard title="Event Attendance" value="89%" icon={Users} color="purple" />
      <StatsCard title="Revenue Growth" value="+12%" icon={DollarSign} color="orange" />
    </div>

    {/* Reports Section */}
    <div className="bg-white border border-gray-300 rounded-lg">
      <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
        <h2 className="font-semibold text-gray-800">Generate Reports</h2>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: 'Member Report', description: 'Detailed member statistics and demographics', icon: Users },
            { title: 'Financial Report', description: 'Revenue, payments, and financial overview', icon: DollarSign },
            { title: 'Event Report', description: 'Event attendance and engagement metrics', icon: Calendar },
            { title: 'Content Report', description: 'Content performance and engagement', icon: FileText },
            { title: 'Activity Report', description: 'User activity and platform usage', icon: BarChart3 },
            { title: 'Custom Report', description: 'Create custom reports with specific metrics', icon: Settings },
          ].map(({ title, description, icon: Icon }, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-start mb-2">
                <Icon className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                <h3 className="font-medium">{title}</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">{description}</p>
              <div className="flex space-x-2">
                <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                  Generate
                </button>
                <button className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700">
                  <Download className="w-3 h-3 inline mr-1" />
                  Export
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Recent Reports */}
    <div className="bg-white border border-gray-300 rounded-lg">
      <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
        <h2 className="font-semibold text-gray-800">Recent Reports</h2>
      </div>
      <div className="p-4">
        <div className="space-y-3">
          {[
            { name: 'Monthly Member Report - July 2025', type: 'Member Report', date: '2025-08-01', size: '2.3 MB' },
            { name: 'Q2 Financial Summary', type: 'Financial Report', date: '2025-07-31', size: '1.8 MB' },
            { name: 'Annual Conference Analytics', type: 'Event Report', date: '2025-07-25', size: '4.1 MB' },
          ].map((report, index) => (
            <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded">
              <div>
                <p className="font-medium text-sm">{report.name}</p>
                <p className="text-xs text-gray-600">{report.type} • {report.date} • {report.size}</p>
              </div>
              <div className="flex space-x-2">
                <button className="text-blue-600 hover:text-blue-900">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="text-green-600 hover:text-green-900">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default ReportsAnalytics;