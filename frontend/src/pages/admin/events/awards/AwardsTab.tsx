// AdminAwardsManagement.tsx (fixed)
import React, { useState, useEffect } from 'react';
import { 
  Award, Trophy, UserCheck, BarChart, Search, Loader
} from 'lucide-react';
import { awardsApi, AwardCategory, AwardWinner, Nominee, AwardNomination } from '../../../../services/awardsApi';
import PollTab from './PollTab';
import CategoriesTab from './CategoriesTab';

type AwardStatus = 'Active' | 'Draft' | 'Archived';

const AdminAwardsManagement = () => {
  const [selectedTab, setSelectedTab] = useState<'winners' | 'nominees' | 'categories' | 'poll'>('winners');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for data from API
  const [awardWinners, setAwardWinners] = useState<AwardWinner[]>([]);
  const [nominees, setNominees] = useState<Nominee[]>([]);
  const [awardCategories, setAwardCategories] = useState<AwardCategory[]>([]);
  const [nominations, setNominations] = useState<AwardNomination[]>([]);
  const [approvedNominees, setApprovedNominees] = useState<Nominee[]>([]);

  // Fetch all data
  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [winnersData, nomineesData, categoriesData, nominationsData, approvedNomineesData] = await Promise.all([
        awardsApi.getWinners({ search: searchTerm }),
        awardsApi.getNominees({ status: 'Approved', source: 'admin,suggested' }),
        awardsApi.getCategories({ search: searchTerm }),
        awardsApi.getNominations({ search: searchTerm }),
        // Add this line to fetch approved nominees for the poll
        awardsApi.getNominees({ status: 'Approved', source: 'admin,suggested' })
      ]);

      setAwardWinners(winnersData);
      setNominees(nomineesData);
      setAwardCategories(categoriesData);
      setNominations(nominationsData);
      // Add this state for approved nominees
      setApprovedNominees(approvedNomineesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  // Refetch data when search term changes
  useEffect(() => {
    if (searchTerm !== undefined) {
      fetchAllData();
    }
  }, [searchTerm]);

  const handleWinnerStatusChange = async (id: number, newStatus: AwardStatus) => {
    try {
      const updatedWinner = await awardsApi.updateWinnerStatus(id, newStatus);
      setAwardWinners(prev => 
        prev.map(winner => winner.id === id ? updatedWinner : winner)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  // Handle declaring winner
  const handleDeclareWinner = async (nominee: Nominee, category: AwardCategory) => {
    try {
      // Create the winner
      await awardsApi.createWinner({
        name: nominee.name,
        title: `${category.title} Winner`,
        location: nominee.location || 'Africa',
        achievement: nominee.achievement,
        category: category.id,
        year: new Date().getFullYear(),
        status: 'Active', 
        imageUrl: nominee.imageUrl || ''
      });

      // Only update nominee status if it's a real nominee (positive ID)
      if (nominee.id > 0) {
        await awardsApi.updateNominee(nominee.id, { 
          status: 'Winner' as const 
        });
      } else {
        // For virtual nominees (negative IDs), create a real nominee record first
        const realNominee = await awardsApi.createNominee({
          name: nominee.name,
          institution: nominee.institution,
          specialty: nominee.specialty,
          category: nominee.category,
          achievement: nominee.achievement,
          email: nominee.email,
          phone: nominee.phone || '',
          location: nominee.location,
          imageUrl: nominee.imageUrl || '',
          status: 'Winner',
          suggestedBy: nominee.suggestedBy,
          source: 'suggested'
        });
        console.log('Created real nominee record:', realNominee);
      }
      
      await fetchAllData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to declare winner');
    }
  };

  const filteredWinners = awardWinners.filter(winner => 
    winner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    winner.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get counts for tab display
  const pollNomineesCount = approvedNominees.length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="text-red-600 font-medium">Error: {error}</div>
          <button 
            onClick={() => setError(null)}
            className="ml-auto text-red-600 hover:text-red-800"
          >
            Dismiss
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white border border-gray-300 rounded-lg">
        <div className="bg-red-50 px-6 py-4 border-b border-gray-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <Award className="w-7 h-7 mr-3 text-red-600" />
                Awards Management
              </h2>
              <p className="text-gray-600 mt-1">Manage awards, nominees, and recognition programs</p>
            </div>
            
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <nav className="flex space-x-8">
              {[
                { id: 'winners', label: 'Award Winners', count: awardWinners.length, icon: Trophy },
                { id: 'poll', label: 'Category Polls', count: pollNomineesCount, icon: BarChart },
                { id: 'categories', label: 'Categories', count: awardCategories.length, icon: Award }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id as any)}
                  className={`py-2 border-b-2 font-medium text-sm transition-colors ${
                    selectedTab === tab.id
                      ? 'border-red-600 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <div className="flex items-center">
                    <tab.icon className="w-4 h-4 mr-2" />
                    {tab.label} ({tab.count})
                  </div>
                </button>
              ))}
            </nav>
            <div className="mt-3 md:mt-0 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {selectedTab === 'winners' && (
            <div className="space-y-6">
              {filteredWinners.length > 0 ? (
                filteredWinners.map((winner) => (
                  <div key={winner.id} className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        {/* Winner Image */}
                        <div className="flex-shrink-0">
                          {winner.imageUrl ? (
                            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-yellow-400 bg-gray-50">
                              <img 
                                src={winner.imageUrl} 
                                alt={winner.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const img = e.currentTarget as HTMLImageElement;
                                  img.style.display = 'none';
                                  const fallback = img.nextElementSibling as HTMLElement;
                                  if (fallback) {
                                    fallback.style.display = 'flex';
                                  }
                                }}
                              />
                              <div className="w-full h-full bg-gray-100 flex items-center justify-center hidden">
                                <UserCheck className="w-8 h-8 text-gray-400" />
                              </div>
                            </div>
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-yellow-100 border-2 border-yellow-400 flex items-center justify-center">
                              <Trophy className="w-8 h-8 text-yellow-600" />
                            </div>
                          )}
                        </div>

                        {/* Winner Details */}
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <Trophy className="w-5 h-5 text-yellow-500 mr-2" />
                            <h3 className="text-xl font-bold text-gray-900">{winner.name}</h3>
                            <span className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${
                              winner.status === 'Active' ? 'bg-green-100 text-green-800' :
                              winner.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {winner.status}
                            </span>
                          </div>
                          
                          <p className="text-lg font-medium text-gray-700 mb-2">{winner.title}</p>
                          
                          <div className="flex items-center text-sm text-gray-600 mb-3 space-x-4">
                            <span>{winner.location}</span>
                            <span>•</span>
                            <span>{winner.year}</span>
                            <span>•</span>
                            <span className="text-blue-600">{winner.categoryTitle}</span>
                          </div>

                          {/* Achievement */}
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-medium text-gray-900 mb-2">Achievement</h4>
                            <p className="text-gray-700 text-sm leading-relaxed">
                              {winner.achievement}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col space-y-2">
                        <select
                          value={winner.status}
                          onChange={(e) => handleWinnerStatusChange(winner.id, e.target.value as 'Active' | 'Draft' | 'Archived')}
                          className="text-sm border border-gray-300 rounded px-3 py-1"
                        >
                          <option value="Active">Active</option>
                          <option value="Draft">Draft</option>
                          <option value="Archived">Archived</option>
                        </select>
                        
                        <div className="text-xs text-gray-500">
                          Added {new Date(winner.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No award winners found</h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm 
                      ? "No winners match your search criteria." 
                      : "You haven't added any award winners yet."}
                  </p>
                </div>
              )}
            </div>
          )}

          {selectedTab === 'poll' && (
            <PollTab
              categories={awardCategories}
              nominees={approvedNominees} 
              nominations={nominations}
              searchTerm={searchTerm}
              loading={loading}
              onDeclareWinner={handleDeclareWinner}
              awardWinners={awardWinners}
            />
          )}

          {selectedTab === 'categories' && (
            <CategoriesTab
              categories={awardCategories}
              searchTerm={searchTerm}
              loading={loading}
              onRefresh={fetchAllData}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAwardsManagement;