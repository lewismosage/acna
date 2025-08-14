import { Users, Plus, Search, Calendar, Clock, Edit3, Eye, Trash2 } from 'lucide-react';

const TrainingProgramsTab = () => {
  const mockPrograms = [
    { id: 1, title: 'EEG Certification Course', duration: '6 weeks', participants: 45, status: 'Active' },
    { id: 2, title: 'Pediatric Neurology Fellowship', duration: '12 months', participants: 12, status: 'Ongoing' },
    { id: 3, title: 'Neurodevelopmental Workshop', duration: '2 days', participants: 28, status: 'Upcoming' },
  ];

  return (
    <div className="bg-white border border-gray-300 rounded-lg">
      <div className="bg-gray-100 px-4 py-3 border-b border-gray-300 flex items-center justify-between">
        <h2 className="font-semibold text-gray-800">Training Programs</h2>
        <div className="flex space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search programs..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <button className="flex items-center px-3 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Program
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="space-y-4">
          {mockPrograms.map((program) => (
            <div key={program.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{program.title}</h3>
                  <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {program.duration}
                    </span>
                    <span className="flex items-center">
                      <Users className="w-3 h-3 mr-1" />
                      {program.participants} participants
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    program.status === 'Active' ? 'bg-green-100 text-green-800' :
                    program.status === 'Ongoing' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {program.status}
                  </span>
                  <div className="flex space-x-1">
                    <button className="p-1 text-blue-600 hover:text-blue-800">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-green-600 hover:text-green-800">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-red-600 hover:text-red-800">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrainingProgramsTab;