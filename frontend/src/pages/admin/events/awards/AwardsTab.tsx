// AdminAwardsManagement.tsx (updated)
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
  
      await awardsApi.updateNominee(nominee.id, { 
        status: 'Winner' as const 
      });
      
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
  const unverifiedNomineesCount = nominees.filter(n => n.source === 'new' || n.source === 'nomination').length;
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
            <div className="flex gap-3">
              <button className="border border-red-600 text-red-600 px-6 py-2 rounded-lg hover:bg-red-50 flex items-center font-medium transition-colors">
                <BarChart className="w-5 h-5 mr-2" />
                Analytics
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col md:flexRow md:items-center justify-between gap-4">
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
                  <div key={winner.id} className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
                    {/* Winner content remains the same */}
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