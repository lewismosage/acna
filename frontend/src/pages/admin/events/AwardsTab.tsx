import React, { useState, useEffect } from 'react';
import { 
  Award, Trophy, Users, Calendar, FileText, CheckCircle, Star, Medal,
  Plus, Edit, Eye, Trash, Download, BarChart, Settings, Mail, 
  UserPlus, UserCheck, UserX, Search, ArrowLeft, Loader
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { awardsApi, AwardCategory, AwardWinner, Nominee, AwardNomination } from '../../../services/awardsApi';

type AwardStatus = 'Active' | 'Draft' | 'Archived';

const AdminAwardsManagement = () => {
  const [selectedTab, setSelectedTab] = useState<'winners' | 'nominees' | 'categories' | 'nominations'>('winners');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddNomineeModal, setShowAddNomineeModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for data from API
  const [awardWinners, setAwardWinners] = useState<AwardWinner[]>([]);
  const [nominees, setNominees] = useState<Nominee[]>([]);
  const [awardCategories, setAwardCategories] = useState<AwardCategory[]>([]);
  const [nominations, setNominations] = useState<AwardNomination[]>([]);

  const [newNominee, setNewNominee] = useState({
    name: '',
    institution: '',
    specialty: '',
    achievement: '',
    email: '',
    phone: '',
    location: '',
    category: 0,
    suggested_by: 'Admin'
  });

  const [newCategory, setNewCategory] = useState({
    title: '',
    description: '',
    criteria: '',
    active: true,
    order: 0
  });

  // Initialize default categories if none exist
  const initializeDefaultCategories = async () => {
    try {
      const existingCategories = await awardsApi.getCategories();
      if (existingCategories.length === 0) {
        const defaultCategories = [
          {
            title: "Excellence in Child Neurology",
            description: "Recognizing outstanding contributions to pediatric neurological care and research across Africa",
            criteria: "Minimum 10 years experience, Published research contributions, Community impact demonstration",
            active: true,
            order: 1
          },
          {
            title: "Healthcare Innovation Award",
            description: "Honoring innovative approaches to addressing neurological care challenges in African communities",
            criteria: "Novel treatment approaches, Technology implementation, Measurable patient outcomes",
            active: true,
            order: 2
          },
          {
            title: "Child Neurology Advocacy Award",
            description: "Celebrating individuals who champion neurological health awareness and policy changes",
            criteria: "Policy influence, Community engagement, Awareness campaign leadership",
            active: true,
            order: 3
          },
          {
            title: "Medical Education Excellence",
            description: "Recognizing exceptional contributions to training and educating healthcare professionals",
            criteria: "Training program development, Curriculum innovation, Mentorship excellence",
            active: true,
            order: 4
          },
          {
            title: "Lifetime Service Award",
            description: "Honoring sustained dedication to improving child neurological health across Africa",
            criteria: "25+ years of service, Cross-continental impact, Mentorship legacy",
            active: true,
            order: 5
          }
        ];

        for (const category of defaultCategories) {
          await awardsApi.createCategory(category);
        }
      }
    } catch (err) {
      console.error('Failed to initialize default categories:', err);
    }
  };

  // Fetch data based on selected tab
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        switch (selectedTab) {
          case 'winners':
            const winnersData = await awardsApi.getWinners({ search: searchTerm });
            setAwardWinners(winnersData);
            break;
          case 'nominees':
            // Only show nominees from public nominations (not admin-added)
            const nomineesData = await awardsApi.getNominees({ 
              search: searchTerm,
              source: 'nomination'
            });
            setNominees(nomineesData);
            break;
          case 'categories':
            const categoriesData = await awardsApi.getCategories({ search: searchTerm });
            setAwardCategories(categoriesData);
            break;
          case 'nominations':
            // Show ALL nominations (both suggested and new)
            const nominationsData = await awardsApi.getNominations({ search: searchTerm });
            setNominations(nominationsData);
            break;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedTab, searchTerm]);

  // Initialize categories on component mount
  useEffect(() => {
    const initializeData = async () => {
      await initializeDefaultCategories();
      const categories = await awardsApi.getCategories({ active: true });
      setAwardCategories(categories);
    };

    initializeData();
  }, []);

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

  const handleNomineeStatusChange = async (id: number, newStatus: 'Pending' | 'Approved' | 'Rejected') => {
    try {
      const updatedNominee = await awardsApi.updateNomineeStatus(id, newStatus);
      setNominees(prev => 
        prev.map(nominee => nominee.id === id ? updatedNominee : nominee)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const handleAddNominee = (categoryId: number) => {
    setCurrentCategory(categoryId);
    setNewNominee(prev => ({ ...prev, category: categoryId }));
    setShowAddNomineeModal(true);
  };

  const handleSubmitNominee = async () => {
    try {
      const createdNominee = await awardsApi.createNominee({
        name: newNominee.name,
        institution: newNominee.institution,
        specialty: newNominee.specialty,
        category: newNominee.category,
        achievement: newNominee.achievement,
        email: newNominee.email,
        phone: newNominee.phone,
        location: newNominee.location,
        suggestedBy: newNominee.suggested_by,
        status: 'Approved',
        imageUrl: ''
      });

      setNominees(prev => [...prev, createdNominee]);
      
      // Reset form
      setNewNominee({
        name: '',
        institution: '',
        specialty: '',
        achievement: '',
        email: '',
        phone: '',
        location: '',
        category: 0,
        suggested_by: 'Admin'
      });
      setShowAddNomineeModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create nominee');
    }
  };

  const handleSubmitCategory = async () => {
    try {
      const createdCategory = await awardsApi.createCategory(newCategory);
      setAwardCategories(prev => [...prev, createdCategory]);
      
      // Reset form
      setNewCategory({
        title: '',
        description: '',
        criteria: '',
        active: true,
        order: awardCategories.length + 1
      });
      setShowAddCategoryModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create category');
    }
  };

  const handleNominationStatusChange = async (id: number, newStatus: string) => {
    try {
      const updatedNomination = await awardsApi.updateNominationStatus(id, newStatus);
      setNominations(prev => 
        prev.map(nomination => nomination.id === id ? updatedNomination : nomination)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const filteredWinners = awardWinners.filter(winner => 
    winner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    winner.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredNominees = nominees.filter(nominee => 
    nominee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    nominee.institution.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCategories = awardCategories.filter(category => 
    category.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredNominations = nominations.filter(nomination => 
    nomination.nomineeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    nomination.awardCategoryTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <nav className="flex space-x-8">
              {[
                { id: 'winners', label: 'Award Winners', count: awardWinners.length, icon: Trophy },
                { id: 'nominees', label: 'Nominees', count: nominees.length, icon: UserPlus },
                { id: 'categories', label: 'Categories', count: awardCategories.length, icon: Award },
                { id: 'nominations', label: 'Nominations', count: nominations.length, icon: FileText }
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
          {selectedTab === 'winners' ? (
            <div className="space-y-6">
              {filteredWinners.length > 0 ? (
                filteredWinners.map((winner) => (
                  <div key={winner.id} className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
                    <div className="flex flex-col lg:flex-row">
                      {/* Winner Image */}
                      <div className="lg:w-1/4">
                        <div className="relative">
                          <img
                            src={winner.imageUrl || '/api/placeholder/400/250'}
                            alt={winner.name}
                            className="w-full h-48 lg:h-full object-cover rounded-t-lg lg:rounded-l-lg lg:rounded-t-none"
                          />
                          <div className="absolute top-3 left-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold border ${
                              winner.status === 'Active' 
                                ? 'bg-green-100 text-green-800 border-green-200' 
                                : winner.status === 'Draft' 
                                  ? 'bg-yellow-100 text-yellow-800 border-yellow-200' 
                                  : 'bg-gray-100 text-gray-800 border-gray-200'
                            }`}>
                              {winner.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Winner Details */}
                      <div className="lg:w-3/4 p-6">
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                              {winner.name}
                            </h3>
                            <p className="text-red-600 font-medium text-sm mb-2">
                              {winner.title}
                            </p>
                            <p className="text-gray-600 text-sm mb-3">
                              {winner.location} • {winner.year}
                            </p>
                            <p className="text-gray-700 text-sm leading-relaxed">
                              {winner.achievement}
                            </p>
                          </div>
                        </div>

                        {/* Admin Actions */}
                        <div className="flex flex-wrap gap-3">
                          <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center text-sm font-medium transition-colors">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Winner
                          </button>

                          <select
                            value={winner.status}
                            onChange={(e) => handleWinnerStatusChange(winner.id, e.target.value as AwardStatus)}
                            className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium"
                          >
                            <option value="Active">Active</option>
                            <option value="Draft">Draft</option>
                            <option value="Archived">Archived</option>
                          </select>

                          <button className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center text-sm font-medium transition-colors">
                            <Mail className="w-4 h-4 mr-2" />
                            Contact Winner
                          </button>

                          <button className="border border-red-600 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 flex items-center text-sm font-medium transition-colors">
                            <Trash className="w-4 h-4 mr-2" />
                            Remove
                          </button>
                        </div>

                        {/* Metadata */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                            <span>Created: {new Date(winner.createdAt).toLocaleDateString()}</span>
                            <span>Last Updated: {new Date(winner.updatedAt).toLocaleDateString()}</span>
                            <span>Category: {winner.categoryTitle}</span>
                          </div>
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
                  <button className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 font-medium">
                    Add First Winner
                  </button>
                </div>
              )}
            </div>
          ) : selectedTab === 'nominees' ? (
            <div className="space-y-6">
              {filteredNominees.length > 0 ? (
                filteredNominees.map((nominee) => (
                  <div key={nominee.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                          {nominee.name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3">
                          {nominee.institution} • {nominee.specialty}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center">
                            <Award className="w-4 h-4 mr-1" />
                            {nominee.categoryTitle}
                          </div>
                          <div className="flex items-center">
                            <UserCheck className="w-4 h-4 mr-1" />
                            Suggested by: {nominee.suggestedBy}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(nominee.suggestedDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        nominee.status === 'Approved' 
                          ? 'bg-green-100 text-green-800 border-green-200' 
                          : nominee.status === 'Rejected' 
                            ? 'bg-red-100 text-red-800 border-red-200' 
                            : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                      }`}>
                        {nominee.status}
                      </span>
                    </div>

                    {/* Admin Actions */}
                    <div className="flex flex-wrap gap-3">
                      <button className="border border-red-600 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 flex items-center text-sm font-medium transition-colors">
                        <Eye className="w-4 h-4 mr-2" />
                        Nominee Information
                      </button>
                      
                      <select
                        value={nominee.status}
                        onChange={(e) => handleNomineeStatusChange(nominee.id, e.target.value as any)}
                        className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approve</option>
                        <option value="Rejected">Reject</option>
                      </select>

                      <button className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center text-sm font-medium transition-colors">
                        <Mail className="w-4 h-4 mr-2" />
                        Contact
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <UserPlus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No nominees found</h3>
                  <p className="text-gray-500">
                    {searchTerm 
                      ? "No nominees match your search criteria." 
                      : "No nominees have been added yet."}
                  </p>
                </div>
              )}
            </div>
          ) : selectedTab === 'categories' ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Award Categories</h3>
                <button 
                  onClick={() => setShowAddCategoryModal(true)}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center text-sm font-medium transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Category
                </button>
              </div>

              {filteredCategories.length > 0 ? (
                filteredCategories.map((category) => (
                  <div key={category.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <Award className={`w-5 h-5 mr-3 ${category.active ? 'text-red-600' : 'text-gray-400'}`} />
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 leading-tight">
                              {category.title}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              category.active 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {category.active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                          {category.description}
                        </p>
                        
                        {/* Criteria */}
                        {category.criteria && (
                          <div className="mt-4">
                            <h4 className="font-medium text-gray-900 text-sm mb-2">Criteria:</h4>
                            <p className="text-sm text-gray-600">{category.criteria}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Admin Actions */}
                    <div className="flex flex-wrap gap-3">
                      <button 
                        onClick={() => handleAddNominee(category.id)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center text-sm font-medium transition-colors"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Nominee
                      </button>
                      <button className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center text-sm font-medium transition-colors">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Category
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No award categories found</h3>
                  <p className="text-gray-500">
                    {searchTerm 
                      ? "No categories match your search criteria." 
                      : "No award categories have been created yet."}
                  </p>
                  <button 
                    onClick={() => setShowAddCategoryModal(true)}
                    className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 font-medium mt-4"
                  >
                    Create First Category
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {filteredNominations.length > 0 ? (
                filteredNominations.map((nomination) => (
                  <div key={nomination.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                          {nomination.nomineeName}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3">
                          Nominated for: {nomination.awardCategoryTitle}
                        </p>
                        <p className="text-gray-600 text-sm mb-3">
                          Nominated by: {nomination.nominatorName} ({nomination.nominatorEmail})
                        </p>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {nomination.achievementSummary.substring(0, 200)}...
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        nomination.status === 'Approved' 
                          ? 'bg-green-100 text-green-800 border-green-200' 
                          : nomination.status === 'Rejected' 
                            ? 'bg-red-100 text-red-800 border-red-200' 
                            : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                      }`}>
                        {nomination.status || 'Pending Review'}
                      </span>
                    </div>

                    {/* Admin Actions */}
                    <div className="flex flex-wrap gap-3">
                      <select
                        value={nomination.status}
                        onChange={(e) => handleNominationStatusChange(nomination.id, e.target.value)}
                        className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Approved">Approve</option>
                        <option value="Rejected">Reject</option>
                      </select>
                      
                      <button className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center text-sm font-medium transition-colors">
                        <Eye className="w-4 h-4 mr-2" />
                        View Full Submission
                      </button>

                      <button className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center text-sm font-medium transition-colors">
                        <Mail className="w-4 h-4 mr-2" />
                        Contact Nominator
                      </button>

                      {nomination.supportingDocuments && (
                        <a 
                          href={nomination.supportingDocuments}
                          className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center text-sm font-medium transition-colors"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download Documents
                        </a>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No nominations found</h3>
                  <p className="text-gray-500">
                    {searchTerm 
                      ? "No nominations match your search criteria." 
                      : "No award nominations have been submitted yet."}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Nominee Modal */}
      {showAddNomineeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">
                  Add Nominee to {awardCategories.find(c => c.id === currentCategory)?.title}
                </h3>
                <button 
                  onClick={() => setShowAddNomineeModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  &times;
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nominee Name *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={newNominee.name}
                    onChange={(e) => setNewNominee({...newNominee, name: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Institution *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={newNominee.institution}
                    onChange={(e) => setNewNominee({...newNominee, institution: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specialty *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={newNominee.specialty}
                    onChange={(e) => setNewNominee({...newNominee, specialty: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={newNominee.email}
                    onChange={(e) => setNewNominee({...newNominee, email: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={newNominee.location}
                    onChange={(e) => setNewNominee({...newNominee, location: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Achievement *</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={3}
                    value={newNominee.achievement}
                    onChange={(e) => setNewNominee({...newNominee, achievement: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowAddNomineeModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitNominee}
                  className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
                  disabled={!newNominee.name || !newNominee.institution || !newNominee.specialty || !newNominee.achievement}
                >
                  Add Nominee
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Add Award Category</h3>
                <button 
                  onClick={() => setShowAddCategoryModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  &times;
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category Title *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={newCategory.title}
                    onChange={(e) => setNewCategory({...newCategory, title: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={3}
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Criteria</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={3}
                    value={newCategory.criteria}
                    onChange={(e) => setNewCategory({...newCategory, criteria: e.target.value})}
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="categoryActive"
                    checked={newCategory.active}
                    onChange={(e) => setNewCategory({...newCategory, active: e.target.checked})}
                    className="mr-2"
                  />
                  <label htmlFor="categoryActive" className="text-sm font-medium text-gray-700">
                    Active Category
                  </label>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowAddCategoryModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitCategory}
                  className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
                  disabled={!newCategory.title || !newCategory.description}
                >
                  Add Category
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAwardsManagement;