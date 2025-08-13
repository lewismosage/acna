import { TrendingUp } from 'lucide-react';

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

export default StatsCard;