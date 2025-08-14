import { Heart, Edit, Eye, Trash2, Plus } from 'lucide-react';

const mockStories = [
  { id: 1, title: 'Journey to Recovery', author: 'Dr. Sarah Johnson', date: '2025-09-01' },
  { id: 2, title: 'Community Impact Story', author: 'Dr. Michael Brown', date: '2025-08-15' },
  { id: 3, title: 'From Patient to Doctor', author: 'Dr. Lisa Chen', date: '2025-07-22' },
];

export default function StoriesTab() {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Stories of Changed Lives</h2>
        <button className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 flex items-center">
          <Plus className="w-4 h-4 mr-2" /> Add Story
        </button>
      </div>
      
      <div className="divide-y divide-gray-200">
        {mockStories.map((item) => (
          <div key={item.id} className="px-6 py-4 hover:bg-gray-50 flex justify-between">
            <div>
              <h3 className="font-medium">{item.title}</h3>
              <p className="text-sm text-gray-600">By {item.author} • {item.date}</p>
            </div>
            <div className="flex space-x-2">
              <button className="text-gray-500 hover:text-blue-600">
                <Eye className="w-5 h-5" />
              </button>
              <button className="text-gray-500 hover:text-green-600">
                <Edit className="w-5 h-5" />
              </button>
              <button className="text-gray-500 hover:text-red-600">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}