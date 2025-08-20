import React, { useState, useEffect } from 'react';
import { Trophy, ChevronDown, ChevronUp, Award, Users, BarChart3, Crown, Medal, X, FileText, Mail, User, Building, MapPin, Award as AwardIcon, Link as LinkIcon } from 'lucide-react';
import { AwardCategory, Nominee, AwardNomination, awardsApi } from '../../../../services/awardsApi';

interface PollData {
  nominee: Nominee;
  voteCount: number;
  nominations: AwardNomination[];
  percentage: number;
}

interface CategoryPollData {
  category: AwardCategory;
  polls: PollData[];
  totalVotes: number;
}

interface PollTabProps {
  categories: AwardCategory[];
  nominees: Nominee[];
  nominations: AwardNomination[];
  searchTerm: string;
  loading: boolean;
  onDeclareWinner: (nominee: Nominee, category: AwardCategory) => void;
}

const PollTab: React.FC<PollTabProps> = ({
  categories,
  nominees,
  nominations,
  searchTerm,
  loading,
  onDeclareWinner
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [categoryPollData, setCategoryPollData] = useState<CategoryPollData[]>([]);
  const [selectedNominations, setSelectedNominations] = useState<AwardNomination[]>([]);
  const [showNominationsModal, setShowNominationsModal] = useState(false);
  const [selectedNominee, setSelectedNominee] = useState<Nominee | null>(null);

  useEffect(() => {
  const processedData: CategoryPollData[] = categories.map(category => {
    console.log(`\nProcessing category: ${category.title} (ID: ${category.id})`);
    
    // Only get approved nominees for this category from 'admin' or 'suggested' sources
    const categoryNominees = nominees.filter(nominee => {
      const isMatch = nominee.category === category.id &&
        nominee.status === 'Approved' &&
        (nominee.source === 'admin' || nominee.source === 'suggested');
      
      if (isMatch) {
        console.log(`✅ Approved nominee: ${nominee.name} (Source: ${nominee.source})`);
      }
      
      return isMatch;
    });

    // Get APPROVED nominations for this category from ALL sources
    const categoryNominations = nominations.filter(nomination => {
      const isMatch = nomination.awardCategory === category.id &&
        nomination.status === 'Approved';
      
      if (isMatch) {
        console.log(`✅ Approved nomination: ${nomination.nomineeName} (Source: ${nomination.source})`);
      }
      
      return isMatch;
    });

    console.log(`Category ${category.title}: ${categoryNominations.length} approved nominations`);

    // Process polls data
    const polls: PollData[] = categoryNominees.map(nominee => {
      const nomineeNominations = categoryNominations.filter(nomination => {
        // Trim and case-insensitive comparison
        const nomName = nomination.nomineeName.trim().toLowerCase();
        const nomineeName = nominee.name.trim().toLowerCase();
        const isMatch = nomName === nomineeName;
        
        if (isMatch) {
          console.log(`🎯 MATCH: Nomination "${nomination.nomineeName}" -> Nominee "${nominee.name}"`);
        }
        
        return isMatch;
      });
      
      const voteCount = nomineeNominations.length;
      console.log(`📊 ${nominee.name}: ${voteCount} votes`);
      
      return {
        nominee,
        voteCount,
        nominations: nomineeNominations,
        percentage: categoryNominations.length > 0 ? (voteCount / categoryNominations.length) * 100 : 0
      };
    }).sort((a, b) => b.voteCount - a.voteCount);

    return {
      category,
      polls,
      totalVotes: categoryNominations.length
    };
  }).filter(categoryData => categoryData.polls.length > 0 || searchTerm);

  console.log('Final processed data:', processedData);
  setCategoryPollData(processedData);
}, [categories, nominees, nominations, searchTerm]);


  function toggleCategory(categoryId: number) {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  }

  const handleDeclareWinner = async (poll: PollData, category: AwardCategory) => {
    if (window.confirm(`Declare ${poll.nominee.name} as the winner of ${category.title}?`)) {
      await onDeclareWinner(poll.nominee, category);
    }
  };

  const handleViewNominations = (poll: PollData) => {
    setSelectedNominations(poll.nominations);
    setSelectedNominee(poll.nominee);
    setShowNominationsModal(true);
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Crown className="w-5 h-5 text-yellow-500" />;
      case 1: return <Medal className="w-5 h-5 text-gray-400" />;
      case 2: return <Medal className="w-5 h-5 text-yellow-600" />;
      default: return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-500">#{index + 1}</span>;
    }
  };

  const filteredCategoryData = categoryPollData.filter(categoryData =>
    categoryData.category.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    categoryData.polls.some(poll => 
      poll.nominee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      poll.nominee.institution.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold">Award Category Polls</h3>
          <p className="text-gray-600 text-sm">
            View nomination votes by category and declare winners
          </p>
        </div>
        <div className="text-sm text-gray-500">
          {filteredCategoryData.length} categories with active polls
        </div>
      </div>

      {filteredCategoryData.length > 0 ? (
        <div className="space-y-4">
          {filteredCategoryData.map((categoryData) => {
            const isExpanded = expandedCategories.has(categoryData.category.id);
            const topCandidate = categoryData.polls[0];

            return (
              <div key={categoryData.category.id} className="bg-white border border-gray-200 rounded-lg shadow-sm">
                {/* Category Header */}
                <div 
                  className="p-6 cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleCategory(categoryData.category.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <Award className="w-6 h-6 text-red-600 mr-3" />
                        <h4 className="text-xl font-bold text-gray-900">
                          {categoryData.category.title}
                        </h4>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">
                        {categoryData.category.description}
                      </p>
                      
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {categoryData.polls.length} nominees
                        </div>
                        <div className="flex items-center">
                          <BarChart3 className="w-4 h-4 mr-1" />
                          {categoryData.totalVotes} total votes
                        </div>
                        {topCandidate && (
                          <div className="flex items-center">
                            <Trophy className="w-4 h-4 mr-1 text-yellow-500" />
                            Leading: {topCandidate.nominee.name} ({topCandidate.voteCount} votes)
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="ml-4">
                      {isExpanded ? (
                        <ChevronUp className="w-6 h-6 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-gray-200 p-6 bg-gray-50">
                    <div className="space-y-4">
                      {categoryData.polls.map((poll, index) => (
                        <div 
                          key={poll.nominee.id} 
                          className={`bg-white rounded-lg p-4 border ${
                            index === 0 ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0">
                                {getRankIcon(index)}
                              </div>
                              <div className="flex-1">
                                <h5 className={`font-bold text-gray-900 ${index === 0 ? 'text-lg' : ''}`}>
                                  {poll.nominee.name}
                                </h5>
                                <p className="text-sm text-gray-600">
                                  {poll.nominee.institution} • {poll.nominee.specialty}
                                </p>
                                {poll.nominee.location && (
                                  <p className="text-xs text-gray-500">{poll.nominee.location}</p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`text-2xl font-bold ${
                                index === 0 ? 'text-yellow-600' : 'text-gray-600'
                              }`}>
                                {poll.voteCount}
                              </div>
                              <div className="text-xs text-gray-500">
                                {poll.percentage.toFixed(1)}%
                              </div>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="mb-3">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  index === 0 ? 'bg-yellow-500' : 'bg-gray-400'
                                }`}
                                style={{ width: `${Math.max(poll.percentage, 2)}%` }}
                              ></div>
                            </div>
                          </div>

                          {/* Achievement Summary */}
                          {poll.nominee.achievement && (
                            <div className="mb-3">
                              <p className="text-sm text-gray-700 leading-relaxed">
                                {poll.nominee.achievement.length > 150 
                                  ? `${poll.nominee.achievement.substring(0, 150)}...` 
                                  : poll.nominee.achievement}
                              </p>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                            <div className="text-xs text-gray-500">
                              {poll.nominations.length} nomination{poll.nominations.length !== 1 ? 's' : ''}
                            </div>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleViewNominations(poll)}
                                className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200"
                              >
                                View Nominations
                              </button>
                              {index === 0 && poll.voteCount > 0 && (
                                <button
                                  onClick={() => handleDeclareWinner(poll, categoryData.category)}
                                  className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                                >
                                  Declare Winner
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {categoryData.polls.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p>No nominees in this category yet</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No active polls</h3>
          <p className="text-gray-500">
            {searchTerm 
              ? "No polls match your search criteria." 
              : "No nominees have been added to polls yet."}
          </p>
        </div>
      )}

      {/* Nominations Modal */}
      {showNominationsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">
                  Nominations for {selectedNominee?.name}
                </h3>
                <button 
                  onClick={() => {
                    setShowNominationsModal(false);
                    setSelectedNominations([]);
                    setSelectedNominee(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              {selectedNominations.length > 0 ? (
                <div className="space-y-6">
                  {selectedNominations.map((nomination, index) => (
                    <div key={nomination.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-bold text-lg text-gray-900">
                          Nomination #{index + 1}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          nomination.status === 'Approved' 
                            ? 'bg-green-100 text-green-800' 
                            : nomination.status === 'Pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                        }`}>
                          {nomination.status}
                        </span>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Nominator Information */}
                        <div>
                          <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                            <User className="w-4 h-4 mr-2" />
                            Nominator Information
                          </h5>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="font-medium">Name:</span>
                              <p className="text-gray-700">{nomination.nominatorName}</p>
                            </div>
                            <div>
                              <span className="font-medium">Email:</span>
                              <p className="text-gray-700">{nomination.nominatorEmail}</p>
                            </div>
                            <div>
                              <span className="font-medium">Relationship to Nominee:</span>
                              <p className="text-gray-700">{nomination.nominatorRelationship || 'Not specified'}</p>
                            </div>
                            <div>
                              <span className="font-medium">Submitted:</span>
                              <p className="text-gray-700">
                                {new Date(nomination.submissionDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Nominee Information */}
                        <div>
                          <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                            <AwardIcon className="w-4 h-4 mr-2" />
                            Nominee Information
                          </h5>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="font-medium">Name:</span>
                              <p className="text-gray-700">{nomination.nomineeName}</p>
                            </div>
                            <div>
                              <span className="font-medium">Email:</span>
                              <p className="text-gray-700">{nomination.nomineeEmail || 'Not provided'}</p>
                            </div>
                            <div>
                              <span className="font-medium">Institution:</span>
                              <p className="text-gray-700">{nomination.nomineeInstitution}</p>
                            </div>
                            <div>
                              <span className="font-medium">Specialty:</span>
                              <p className="text-gray-700">{nomination.nomineeSpecialty}</p>
                            </div>
                            {nomination.nomineeLocation && (
                              <div>
                                <span className="font-medium">Location:</span>
                                <p className="text-gray-700">{nomination.nomineeLocation}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Achievement Summary */}
                      <div className="mt-6">
                        <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                          <FileText className="w-4 h-4 mr-2" />
                          Achievement Summary
                        </h5>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {nomination.achievementSummary}
                          </p>
                        </div>
                      </div>

                      {/* Additional Information */}
                      {nomination.additionalInfo && (
                        <div className="mt-4">
                          <h5 className="font-medium text-gray-900 mb-3">Additional Information</h5>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {nomination.additionalInfo}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Supporting Documents */}
                      {nomination.supportingDocuments && (
                        <div className="mt-4">
                          <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                            <LinkIcon className="w-4 h-4 mr-2" />
                            Supporting Documents
                          </h5>
                          <div className="flex items-center">
                            <span className="text-sm text-blue-600 hover:text-blue-800">
                              <a 
                                href={nomination.supportingDocuments} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center"
                              >
                                <FileText className="w-4 h-4 mr-1" />
                                View supporting document
                              </a>
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p>No nomination details available</p>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => {
                    setShowNominationsModal(false);
                    setSelectedNominations([]);
                    setSelectedNominee(null);
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md text-sm font-medium hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PollTab;