import { FileText, Plus, Search, Edit3, Eye, Trash2, Download } from 'lucide-react';

const PublicationResourcesTab = () => {
  const mockPublications = [
    { id: 1, title: 'Pediatric Neurology Guidelines', author: 'ACNA Committee', year: 2025, downloads: 245 },
    { id: 2, title: 'Epilepsy Treatment Protocols', author: 'Dr. Sarah Johnson', year: 2024, downloads: 187 },
    { id: 3, title: 'Neurodevelopmental Disorders Review', author: 'Prof. Michael Chen', year: 2023, downloads: 132 },
  ];

  return (
    <div className="bg-white border border-gray-300 rounded-lg">
      <div className="bg-gray-100 px-4 py-3 border-b border-gray-300 flex items-center justify-between">
        <h2 className="font-semibold text-gray-800">Publication Resources</h2>
        <div className="flex space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search publications..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <button className="flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Publication
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Downloads</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockPublications.map((pub) => (
                <tr key={pub.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{pub.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pub.author}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pub.year}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pub.downloads}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button className="text-purple-600 hover:text-purple-900">
                        <Download className="w-4 h-4" />
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

export default PublicationResourcesTab;