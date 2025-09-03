import { useState } from 'react';
import { Newspaper, Heart } from 'lucide-react';
import NewsUpdatesTab from '../news/NewsUpdatesTab';
import GalleryTab from '../gallery/GalleryTab';

const NewsManagement = () => {
  const [activeTab, setActiveTab] = useState('news');

  const tabs = [
    { id: 'news', label: 'NEWS & UPDATES', icon: Newspaper },
    { id: 'gallery', label: 'GALLERY', icon: Heart }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'news':
        return <NewsUpdatesTab />;  
      case 'gallery':  
        return <GalleryTab />;      
      default:
        return <NewsUpdatesTab />;  
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b-2 border-gray-200">
        <div className="bg-blue-700 overflow-x-auto">
          <nav className="px-4 md:px-6">
            <div className="flex space-x-0 min-w-max">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`px-3 py-3 md:px-4 md:py-4 text-xs md:text-sm font-medium border-r border-blue-600 last:border-r-0 hover:bg-blue-600 transition-colors whitespace-nowrap flex items-center ${
                    activeTab === id ? 'bg-blue-600 text-white' : 'text-blue-100'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2 md:mr-2" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 md:px-6 md:py-8">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default NewsManagement;