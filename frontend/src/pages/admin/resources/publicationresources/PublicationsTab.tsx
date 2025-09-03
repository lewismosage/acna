import React, { useState, useEffect } from 'react';
import { Search, Edit3, Trash2, Download, FileText, Clock, User, Award, ChevronDown, ChevronUp } from 'lucide-react';
import CreatePublicationModal from './CreatePublicationModal';
import { Publication, CreatePublicationInput, PublicationStatus, Author } from './types';
import { publicationsApi } from '../../../../services/publicationsAPI';

interface PublicationsTabProps {
  showCreateModal?: boolean;
  onShowCreateModalChange?: (show: boolean) => void;
}

const PublicationsTab: React.FC<PublicationsTabProps> = ({ 
  showCreateModal: externalShowCreateModal, 
  onShowCreateModalChange 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [internalShowCreateModal, setInternalShowCreateModal] = useState(false);
  const [expandedPublication, setExpandedPublication] = useState<number | null>(null);
  const [allPublications, setAllPublications] = useState<Publication[]>([]);
  const [editingPublication, setEditingPublication] = useState<Publication | null>(null);
  const [loading, setLoading] = useState(true);

  // Determine which modal state to use
  const showCreateModal = externalShowCreateModal !== undefined 
    ? externalShowCreateModal 
    : internalShowCreateModal;

  const setShowCreateModal = (show: boolean) => {
    if (onShowCreateModalChange) {
      onShowCreateModalChange(show);
    } else {
      setInternalShowCreateModal(show);
    }
  };

  // Fetch publications from backend
  useEffect(() => {
    const fetchPublications = async () => {
      try {
        setLoading(true);
        const publications = await publicationsApi.getAll();
        setAllPublications(publications);
      } catch (error) {
        console.error('Error fetching publications:', error);
        // Handle error (show notification, etc.)
      } finally {
        setLoading(false);
      }
    };

    fetchPublications();
  }, []);

  // Sync modal state when external prop changes
  useEffect(() => {
    if (externalShowCreateModal !== undefined) {
      setInternalShowCreateModal(externalShowCreateModal);
    }
  }, [externalShowCreateModal]);

  const getStatusColor = (status: PublicationStatus) => {
    switch (status) {
      case 'Published':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Archived':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAccessTypeColor = (accessType: string) => {
    switch (accessType) {
      case 'Open Access':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Free Access':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Member Access':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleStatusChange = async (publicationId: number, newStatus: PublicationStatus) => {
    try {
      const updatedPublication = await publicationsApi.updateStatus(publicationId, newStatus);
      setAllPublications(prev => 
        prev.map(pub => 
          pub.id === publicationId 
            ? updatedPublication
            : pub
        )
      );
    } catch (error) {
      console.error('Error updating publication status:', error);
      // Handle error (show notification, etc.)
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedPublication(expandedPublication === id ? null : id);
  };

  const handleSavePublication = async (publicationData: CreatePublicationInput) => {
    try {
      let savedPublication: Publication;
      
      if (editingPublication) {
        // Update existing publication
        savedPublication = await publicationsApi.update(editingPublication.id, publicationData);
        setAllPublications(prev => 
          prev.map(p => p.id === savedPublication.id ? savedPublication : p)
        );
        setEditingPublication(null);
      } else {
        // Add new publication
        savedPublication = await publicationsApi.create(publicationData);
        setAllPublications(prev => [savedPublication, ...prev]);
      }
      
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error saving publication:', error);
      // Handle error (show notification, etc.)
    }
  };

  const handleEditPublication = (publication: Publication) => {
    setEditingPublication(publication);
    setShowCreateModal(true);
  };

  const handleDeletePublication = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this publication?')) {
      try {
        await publicationsApi.delete(id);
        setAllPublications(prev => prev.filter(p => p.id !== id));
      } catch (error) {
        console.error('Error deleting publication:', error);
        // Handle error (show notification, etc.)
      }
    }
  };

  const filteredPublications = allPublications.filter(pub => {
    const matchesSearch =
      pub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pub.authors.some(author => author.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      pub.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const formatDownloadCount = (count: number): string => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const formatAuthors = (authors: Author[]): string => {
    return authors.map(author => author.name).join(', ');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search publications..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Publications List */}
      <div className="space-y-6">
        {filteredPublications.length > 0 ? (
          filteredPublications.map((pub) => {
            const isExpanded = expandedPublication === pub.id;
            
            return (
              <div key={pub.id} className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
                <div className="flex flex-col lg:flex-row">
                  {/* Publication Image */}
                  <div className="lg:w-1/4">
                    <div className="relative">
                      <img
                        src={pub.imageUrl}
                        alt={pub.title}
                        className="w-full h-48 lg:h-full object-cover rounded-t-lg lg:rounded-l-lg lg:rounded-t-none"
                      />
                      <div className="absolute top-3 left-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(pub.status)}`}>
                          {pub.status}
                        </span>
                      </div>
                      {pub.isFeatured && (
                        <div className="absolute top-3 right-3">
                          <Award className="w-5 h-5 text-yellow-500 fill-current" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Publication Details */}
                  <div className="lg:w-3/4 p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                          {pub.title}
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                          <div className="space-y-2">
                            <div className="flex items-center text-gray-600 text-sm">
                              <User className="w-4 h-4 mr-2 text-blue-600" />
                              <span>{formatAuthors(pub.authors)}</span>
                            </div>
                            {pub.journal && (
                              <div className="flex items-center text-gray-600 text-sm">
                                <FileText className="w-4 h-4 mr-2 text-blue-600" />
                                <span>{pub.journal}</span>
                              </div>
                            )}
                            <div className="flex items-center text-gray-600 text-sm">
                              <Clock className="w-4 h-4 mr-2 text-blue-600" />
                              <span>{pub.date}</span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center text-gray-600 text-sm">
                              <span className="font-medium">{pub.type}</span>
                            </div>
                            <div className="flex items-center text-gray-600 text-sm">
                              <span className={`px-2 py-1 rounded-full text-xs ${getAccessTypeColor(pub.accessType)}`}>
                                {pub.accessType}
                              </span>
                            </div>
                            <div className="flex items-center text-gray-600 text-sm">
                              <Download className="w-4 h-4 mr-2 text-blue-600" />
                              <span>{formatDownloadCount(pub.downloads)} downloads</span>
                            </div>
                          </div>
                        </div>

                        <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                          {pub.excerpt}
                        </p>

                        {/* Expandable Content */}
                        {isExpanded && (
                          <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <h4 className="font-medium text-gray-900 mb-2">
                                Abstract
                              </h4>
                              <p className="text-gray-600 text-sm whitespace-pre-line">
                                {pub.abstract}
                              </p>
                            </div>
                            
                            {pub.fullContent && (
                              <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <h4 className="font-medium text-gray-900 mb-2">
                                  Full Content
                                </h4>
                                <p className="text-gray-600 text-sm whitespace-pre-line">
                                  {pub.fullContent}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Admin Actions */}
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => toggleExpand(pub.id)}
                        className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center text-sm font-medium transition-colors"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-4 h-4 mr-2" />
                            Collapse
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4 mr-2" />
                            Expand
                          </>
                        )}
                      </button>

                      <button 
                        onClick={() => handleEditPublication(pub)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center text-sm font-medium transition-colors"
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit Details
                      </button>

                      <div className="relative">
                        <select
                          value={pub.status}
                          onChange={(e) => handleStatusChange(pub.id, e.target.value as PublicationStatus)}
                          className="border border-gray-300 px-3 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="Published">Published</option>
                          <option value="Draft">Draft</option>
                          <option value="Archived">Archive</option>
                        </select>
                      </div>

                      <button 
                        onClick={() => handleDeletePublication(pub.id)}
                        className="border border-red-300 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 flex items-center text-sm font-medium transition-colors"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </button>
                    </div>

                    {/* Metadata */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                        <span>Created: {pub.createdAt}</span>
                        <span>Last Updated: {pub.updatedAt}</span>
                        <span>ID: #{pub.id}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No publications found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm 
                ? "No publications match your search criteria." 
                : "No publications available yet."}
            </p>
            <button 
              onClick={() => {
                setEditingPublication(null);
                setShowCreateModal(true);
              }}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
            >
              Add Your First Publication
            </button>
          </div>
        )}
      </div>

      {/* Create/Edit Publication Modal */}
      {showCreateModal && (
        <CreatePublicationModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setEditingPublication(null);
          }}
          onSave={handleSavePublication}
          initialData={editingPublication || undefined}
        />
      )}
    </div>
  );
};

export default PublicationsTab;