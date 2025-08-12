import { 
  Calendar, Users, Clock, DollarSign, Plus, Eye, Edit3, Trash2 
} from 'lucide-react';

// Mock data for demo purposes
const mockEvents = [
  { id: 1, name: 'Annual Conference 2025', date: '2025-11-15', attendees: 156, status: 'Upcoming' },
  { id: 2, name: 'Pediatric Neurology Workshop', date: '2025-09-22', attendees: 89, status: 'Registration Open' },
  { id: 3, name: 'Research Symposium', date: '2025-07-30', attendees: 234, status: 'Completed' },
];

// Stats Card Component
const StatsCard = ({ title, value, icon: Icon, color = 'blue' }: any) => (
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
  </div>
);

const EventsManagement = () => {
  return (
    <div className="space-y-6">
      {/* Event Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard title="Upcoming Events" value="5" icon={Calendar} color="blue" />
        <StatsCard title="Total Registrations" value="456" icon={Users} color="green" />
        <StatsCard title="This Month" value="2" icon={Clock} color="orange" />
        <StatsCard title="Event Revenue" value="$12,450" icon={DollarSign} color="purple" />
      </div>

      {/* Events Management */}
      <div className="bg-white border border-gray-300 rounded-lg">
        <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">Events Management</h2>
            <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
              <Plus className="w-4 h-4 inline mr-1" />
              Create Event
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attendees</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mockEvents.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{event.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{event.date}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{event.attendees}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      event.status === 'Completed' 
                        ? 'bg-gray-100 text-gray-800'
                        : event.status === 'Upcoming'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {event.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EventsManagement;