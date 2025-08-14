import React, { useState } from 'react';
import { 
  Award, Trophy, Users, Calendar, FileText, CheckCircle, Star, Medal,
  Plus, Edit, Eye, Trash, Download, BarChart, Settings, Mail, 
  UserPlus, UserCheck, UserX, Search, ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';

type AwardStatus = 'Active' | 'Draft' | 'Archived';
type AwardWinner = {
  id: number;
  name: string;
  title: string;
  location: string;
  achievement: string;
  image: string;
  category: string;
  year: number;
  status: AwardStatus;
  createdAt: string;
  updatedAt: string;
};

type SuggestedNominee = {
  id: number;
  name: string;
  institution: string;
  specialty: string;
  category: string;
  suggestedBy: string;
  suggestedDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
};

type AwardCategory = {
  id: string;
  title: string;
  description: string;
  nominees: Nominee[];
  active: boolean;
};

type Nominee = {
  id: number;
  name: string;
  institution: string;
  specialty: string;
  image?: string;
  achievement: string;
  addedBy: string;
  addedDate: string;
};

const AdminAwardsManagement = () => {
  const [selectedTab, setSelectedTab] = useState<'winners' | 'nominees' | 'categories' | 'nominations'>('winners');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddNomineeModal, setShowAddNomineeModal] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  const [newNominee, setNewNominee] = useState<Omit<Nominee, 'id' | 'addedDate'>>({ 
    name: '',
    institution: '',
    specialty: '',
    achievement: '',
    addedBy: 'Admin'
  });

  // Sample data for admin view
  const [awardWinners, setAwardWinners] = useState<AwardWinner[]>([
    {
      id: 1,
      name: "Dr. Amina Hassan",
      title: "Excellence in Child Neurology - 2024",
      location: "Lagos, Nigeria",
      achievement: "Pioneered community-based epilepsy care programs reaching over 5,000 children across West Africa",
      image: "https://images.pexels.com/photos/5214907/pexels-photo-5214907.jpeg?auto=compress&cs=tinysrgb&w=400",
      category: "excellence",
      year: 2024,
      status: "Active",
      createdAt: "2024-03-15",
      updatedAt: "2024-03-15"
    },
    {
      id: 2,
      name: "Dr. Joseph Mutamba",
      title: "Healthcare Innovation Award - 2024",
      location: "Kampala, Uganda",
      achievement: "Developed mobile diagnostic units that increased early detection rates by 70% in rural communities",
      image: "https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=400",
      category: "innovation",
      year: 2024,
      status: "Active",
      createdAt: "2024-03-15",
      updatedAt: "2024-03-15"
    },
    {
      id: 3,
      name: "Dr. Fatima El-Rashid",
      title: "Child Neurology Advocacy Award - 2024",
      location: "Cairo, Egypt",
      achievement: "Led policy reforms that mandated neurological screening in all primary schools across North Africa",
      image: "https://images.pexels.com/photos/3952048/pexels-photo-3952048.jpeg?auto=compress&cs=tinysrgb&w=400",
      category: "advocacy",
      year: 2024,
      status: "Active",
      createdAt: "2024-03-15",
      updatedAt: "2024-03-15"
    }
  ]);

  const [suggestedNominees, setSuggestedNominees] = useState<SuggestedNominee[]>([
    {
      id: 1,
      name: "Dr. Fatima Bello",
      institution: "University Teaching Hospital, Lagos",
      specialty: "Pediatric Epilepsy Specialist",
      category: "excellence",
      suggestedBy: "Dr. John Smith",
      suggestedDate: "2024-10-15",
      status: "Approved"
    },
    {
      id: 2,
      name: "Dr. Kwame Mensah",
      institution: "Accra Children's Hospital",
      specialty: "Neurodevelopmental Disorders",
      category: "education",
      suggestedBy: "Dr. Sarah Johnson",
      suggestedDate: "2024-10-12",
      status: "Pending"
    },
    {
      id: 3,
      name: "Dr. Amina Diop",
      institution: "Dakar Neurological Institute",
      specialty: "Community Neurology Programs",
      category: "advocacy",
      suggestedBy: "Dr. Michael Chen",
      suggestedDate: "2024-10-10",
      status: "Approved"
    }
  ]);

  const [awardCategories, setAwardCategories] = useState<AwardCategory[]>([
    {
      id: 'excellence',
      title: "Excellence in Child Neurology",
      description: "Recognizing outstanding contributions to pediatric neurological care and research across Africa",
      nominees: [
        {
          id: 1,
          name: "Dr. Fatima Bello",
          institution: "University Teaching Hospital, Lagos",
          specialty: "Pediatric Epilepsy Specialist",
          achievement: "Developed new treatment protocols for childhood epilepsy",
          addedBy: "Admin",
          addedDate: "2024-03-10"
        },
        {
          id: 2,
          name: "Dr. Samuel Okafor",
          institution: "Nairobi Children's Hospital",
          specialty: "Pediatric Neurosurgery",
          achievement: "Pioneered minimally invasive techniques for pediatric brain tumors",
          addedBy: "Admin",
          addedDate: "2024-03-15"
        }
      ],
      active: true
    },
    {
      id: 'innovation',
      title: "Healthcare Innovation Award",
      description: "Honoring innovative approaches to addressing neurological care challenges in African communities",
      nominees: [
        {
          id: 1,
          name: "Dr. Joseph Mutamba",
          institution: "Kampala Medical Center",
          specialty: "Telemedicine",
          achievement: "Developed mobile diagnostic units for rural areas",
          addedBy: "Admin",
          addedDate: "2024-02-20"
        }
      ],
      active: true
    },
    {
      id: 'advocacy',
      title: "Child Neurology Advocacy Award",
      description: "Celebrating individuals who champion neurological health awareness and policy changes",
      nominees: [
        {
          id: 1,
          name: "Dr. Amina Diop",
          institution: "Dakar Neurological Institute",
          specialty: "Community Health",
          achievement: "Led policy reforms for school neurological screenings",
          addedBy: "Admin",
          addedDate: "2024-01-15"
        }
      ],
      active: true
    },
    {
      id: 'education',
      title: "Medical Education Excellence",
      description: "Recognizing exceptional contributions to training and educating healthcare professionals",
      nominees: [],
      active: true
    },
    {
      id: 'service',
      title: "Lifetime Service Award",
      description: "Honoring sustained dedication to improving child neurological health across Africa",
      nominees: [],
      active: true
    }
  ]);

  const [nominations, setNominations] = useState<any[]>([]); // Would be populated with actual nomination data

  const handleStatusChange = (id: number, newStatus: AwardStatus) => {
    setAwardWinners(prev => 
      prev.map(winner => 
        winner.id === id 
          ? { ...winner, status: newStatus, updatedAt: new Date().toISOString().split('T')[0] }
          : winner
      )
    );
  };

  const handleNomineeStatusChange = (id: number, newStatus: 'Pending' | 'Approved' | 'Rejected') => {
    setSuggestedNominees(prev => 
      prev.map(nominee => 
        nominee.id === id 
          ? { ...nominee, status: newStatus }
          : nominee
      )
    );
  };

  const handleAddNominee = (categoryId: string) => {
    setCurrentCategory(categoryId);
    setShowAddNomineeModal(true);
  };

  const handleSubmitNominee = () => {
    if (!currentCategory) return;

    const newNomineeWithId: Nominee = {
      ...newNominee,
      id: Date.now(),
      addedDate: new Date().toISOString().split('T')[0]
    };

    setAwardCategories(prev =>
      prev.map(category =>
        category.id === currentCategory
          ? {
              ...category,
              nominees: [...category.nominees, newNomineeWithId]
            }
          : category
      )
    );

    // Reset form
    setNewNominee({
      name: '',
      institution: '',
      specialty: '',
      achievement: '',
      addedBy: 'Admin'
    });
    setShowAddNomineeModal(false);
  };

  const filteredWinners = awardWinners.filter(winner => 
    winner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    winner.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredNominees = suggestedNominees.filter(nominee => 
    nominee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    nominee.institution.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCategories = awardCategories.filter(category => 
    category.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredNominations = nominations.filter(nomination => 
    nomination.nomineeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    nomination.awardCategory.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <button 
                onClick={() => setShowCreateModal(true)}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 flex items-center font-medium transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Winner
              </button>
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
                { id: 'nominees', label: 'Suggested Nominees', count: suggestedNominees.length, icon: UserPlus },
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
                            src={winner.image}
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
                              {winner.location}
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
                            <span>Created: {winner.createdAt}</span>
                            <span>Last Updated: {winner.updatedAt}</span>
                            <span>ID: #{winner.id}</span>
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
                  <button 
                    onClick={() => setShowCreateModal(true)}
                    className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 font-medium"
                  >
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
                          {awardCategories.find(c => c.id === nominee.category)?.title || nominee.category}
                        </div>
                          <div className="flex items-center">
                            <UserCheck className="w-4 h-4 mr-1" />
                            Suggested by: {nominee.suggestedBy}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {nominee.suggestedDate}
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
                      <button 
                        onClick={() => handleNomineeStatusChange(nominee.id, 'Approved')}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center text-sm font-medium transition-colors"
                      >
                        <UserCheck className="w-4 h-4 mr-2" />
                        Approve
                      </button>
                      
                      <button 
                        onClick={() => handleNomineeStatusChange(nominee.id, 'Rejected')}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center text-sm font-medium transition-colors"
                      >
                        <UserX className="w-4 h-4 mr-2" />
                        Reject
                      </button>
                      <button className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center text-sm font-medium transition-colors">
                        <Mail className="w-4 h-4 mr-2" />
                        Contact Nominator
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <UserPlus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No suggested nominees found</h3>
                  <p className="text-gray-500">
                    {searchTerm 
                      ? "No nominees match your search criteria." 
                      : "No nominees have been suggested yet."}
                  </p>
                </div>
              )}
            </div>
          ) : selectedTab === 'categories' ? (
            <div className="space-y-6">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category) => (
                  <div key={category.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <Award className={`w-5 h-5 mr-3 ${category.active ? 'text-red-600' : 'text-gray-400'}`} />
                          <h3 className="text-xl font-bold text-gray-900 leading-tight">
                            {category.title}
                          </h3>
                        </div>
                        <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                          {category.description}
                        </p>
                        
                        {/* Nominees List */}
                        {category.nominees.length > 0 ? (
                          <div className="mt-4">
                            <h4 className="font-medium text-gray-900 text-sm mb-2">Nominees ({category.nominees.length}):</h4>
                            <div className="space-y-3">
                              {category.nominees.map((nominee) => (
                                <div key={nominee.id} className="bg-gray-50 p-3 rounded-lg">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <p className="font-medium text-gray-900">{nominee.name}</p>
                                      <p className="text-sm text-gray-600">{nominee.institution} • {nominee.specialty}</p>
                                      <p className="text-xs text-gray-500 mt-1">{nominee.achievement}</p>
                                    </div>
                                    <div className="flex gap-2">
                                      <button className="text-gray-500 hover:text-red-600">
                                        <Edit className="w-4 h-4" />
                                      </button>
                                      <button className="text-gray-500 hover:text-red-600">
                                        <Trash className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="mt-4 bg-gray-50 p-4 rounded-lg text-center">
                            <p className="text-gray-500 text-sm">No nominees added yet for this category</p>
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
                          Nominated for: {nomination.awardCategory}
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
                      <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center text-sm font-medium transition-colors">
                        <Edit className="w-4 h-4 mr-2" />
                        Review Nomination
                      </button>
                      
                      <button className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center text-sm font-medium transition-colors">
                        <Eye className="w-4 h-4 mr-2" />
                        View Full Submission
                      </button>

                      <button className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center text-sm font-medium transition-colors">
                        <Mail className="w-4 h-4 mr-2" />
                        Contact Nominator
                      </button>

                      <button className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center text-sm font-medium transition-colors">
                        <Download className="w-4 h-4 mr-2" />
                        Download Documents
                      </button>
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
                <h3 className="text-lg font-bold">Add Nominee to {awardCategories.find(c => c.id === currentCategory)?.title}</h3>
                <button 
                  onClick={() => setShowAddNomineeModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  &times;
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nominee Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={newNominee.name}
                    onChange={(e) => setNewNominee({...newNominee, name: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={newNominee.institution}
                    onChange={(e) => setNewNominee({...newNominee, institution: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={newNominee.specialty}
                    onChange={(e) => setNewNominee({...newNominee, specialty: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Achievement</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={3}
                    value={newNominee.achievement}
                    onChange={(e) => setNewNominee({...newNominee, achievement: e.target.value})}
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
                >
                  Add Nominee
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