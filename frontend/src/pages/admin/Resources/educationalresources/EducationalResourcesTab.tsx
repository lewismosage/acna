import { Globe, Plus, Search, Video, Book, FileText, Download, Edit3, Eye, Trash2 } from 'lucide-react';

const EducationalResourcesTab = () => {
  const mockResources = [
    { id: 1, title: 'Neuroanatomy Video Series', type: 'Video', category: 'Medical Students', format: 'MP4' },
    { id: 2, title: 'Pediatric EEG Interpretation', type: 'Slide Deck', category: 'Residents', format: 'PDF' },
    { id: 3, title: 'Case Studies Collection', type: 'Document', category: 'Fellows', format: 'DOCX' },
  ];

  return (
    <div className="bg-white border border-gray-300 rounded-lg">
      <div className="bg-gray-100 px-4 py-3 border-b border-gray-300 flex items-center justify-between">
        <h2 className="font-semibold text-gray-800">Educational Resources</h2>
        <div className="flex space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search educational resources..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <button className="flex items-center px-3 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Resource
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mockResources.map((resource) => (
            <div key={resource.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-3">
                <div className={`p-2 rounded-lg mr-3 ${
                  resource.type === 'Video' ? 'bg-red-100 text-red-600' :
                  resource.type === 'Slide Deck' ? 'bg-blue-100 text-blue-600' :
                  'bg-green-100 text-green-600'
                }`}>
                  {resource.type === 'Video' ? <Video className="w-5 h-5" /> :
                   resource.type === 'Slide Deck' ? <FileText className="w-5 h-5" /> :
                   <Book className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{resource.title}</h3>
                  <p className="text-xs text-gray-500">{resource.category}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{resource.format}</span>
                <div className="flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-800">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="text-green-600 hover:text-green-800">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button className="text-red-600 hover:text-red-800">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button className="text-purple-600 hover:text-purple-800">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EducationalResourcesTab;