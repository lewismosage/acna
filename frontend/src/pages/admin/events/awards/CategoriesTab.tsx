import React, { useState } from 'react';
import { Award, Plus, Edit, Trash, UserPlus, Users, Eye, Upload, User, X } from 'lucide-react';
import { AwardCategory, Nominee, awardsApi } from '../../../../services/awardsApi';

interface CategoriesTabProps {
  categories: AwardCategory[];
  searchTerm: string;
  loading: boolean;
  onRefresh: () => void;
}

const CategoriesTab: React.FC<CategoriesTabProps> = ({
  categories,
  searchTerm,
  loading,
  onRefresh
}) => {
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [showAddNomineeModal, setShowAddNomineeModal] = useState(false);
  const [showViewNomineesModal, setShowViewNomineesModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<AwardCategory | null>(null);
  const [categoryNominees, setCategoryNominees] = useState<Nominee[]>([]);
  const [newCategory, setNewCategory] = useState({
    title: '',
    description: '',
    criteria: '',
    active: true,
    order: 0
  });
  const [newNominee, setNewNominee] = useState({
    name: '',
    institution: '',
    specialty: '',
    email: '',
    location: '',
    achievement: '',
    suggestedBy: 'Admin',
    imageUrl: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const filteredCategories = categories.filter(category => 
    category.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.');
      return;
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError('File size too large. Please upload an image smaller than 10MB.');
      return;
    }

    try {
      setUploadingImage(true);
      setError(null);
      
      const uploadResult = await awardsApi.uploadNomineeImage(file);
      
      // Update the nominee form with the uploaded image URL
      setNewNominee(prev => ({ ...prev, imageUrl: uploadResult.url }));
      
      // Create preview URL for display
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = () => {
    setNewNominee(prev => ({ ...prev, imageUrl: '' }));
    setImagePreview(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
  };

  const handleSubmitCategory = async () => {
    try {
      await awardsApi.createCategory({
        ...newCategory,
        order: categories.length + 1
      });
      
      // Reset form and close modal
      setNewCategory({
        title: '',
        description: '',
        criteria: '',
        active: true,
        order: 0
      });
      setShowAddCategoryModal(false);
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create category');
    }
  };

  const handleUpdateCategory = async () => {
    if (!selectedCategory) return;

    try {
      await awardsApi.updateCategory(selectedCategory.id, {
        ...newCategory
      });
      
      // Reset form and close modal
      setNewCategory({
        title: '',
        description: '',
        criteria: '',
        active: true,
        order: 0
      });
      setShowEditCategoryModal(false);
      setSelectedCategory(null);
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update category');
    }
  };

  const handleSubmitNominee = async () => {
    if (!selectedCategory) return;

    try {
      await awardsApi.createNominee({
        name: newNominee.name,
        institution: newNominee.institution,
        specialty: newNominee.specialty,
        category: selectedCategory.id,
        achievement: newNominee.achievement,
        email: newNominee.email,
        phone: '',
        location: newNominee.location,
        imageUrl: newNominee.imageUrl,
        status: 'Approved',
        suggestedBy: newNominee.suggestedBy,
        source: 'admin'
      });
      
      // Reset form and close modal
      setNewNominee({
        name: '',
        institution: '',
        specialty: '',
        email: '',
        location: '',
        achievement: '',
        suggestedBy: 'Admin',
        imageUrl: ''
      });
      setImagePreview(null);
      setShowAddNomineeModal(false);
      setSelectedCategory(null);
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create nominee');
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await awardsApi.deleteCategory(categoryId);
        onRefresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete category');
      }
    }
  };

  const handleViewNominees = async (category: AwardCategory) => {
    try {
      setSelectedCategory(category);
      // Only fetch pre-approved nominees for this category
      const nominees = await awardsApi.getNominees({
        category: category.id,
        status: 'Approved',
        source: 'admin,suggested'
      });
      setCategoryNominees(nominees);
      setShowViewNomineesModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load nominees');
    }
  };

  const handleEditCategory = (category: AwardCategory) => {
    setSelectedCategory(category);
    setNewCategory({
      title: category.title,
      description: category.description,
      criteria: category.criteria || '',
      active: category.active,
      order: category.order
    });
    setShowEditCategoryModal(true);
  };

  const handleCloseAddNomineeModal = () => {
    setShowAddNomineeModal(false);
    setSelectedCategory(null);
    setNewNominee({
      name: '',
      institution: '',
      specialty: '',
      email: '',
      location: '',
      achievement: '',
      suggestedBy: 'Admin',
      imageUrl: ''
    });
    setImagePreview(null);
    setError(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-bold">Award Categories</h3>
          <p className="text-gray-600 text-sm">
            Manage award categories and add suggested nominees
          </p>
        </div>
        <button 
          onClick={() => setShowAddCategoryModal(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <div className="text-red-600 font-medium">{error}</div>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {filteredCategories.length > 0 ? (
        <div className="space-y-4">
          {filteredCategories.map((category) => (
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

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => {
                    setSelectedCategory(category);
                    setShowAddNomineeModal(true);
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center text-sm font-medium transition-colors"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Suggested Nominee
                </button>

                <button
                  onClick={() => handleViewNominees(category)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center text-sm font-medium transition-colors"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Nominees
                </button>

                <button
                  onClick={() => handleEditCategory(category)}
                  className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center text-sm font-medium transition-colors"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Category
                </button>

                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  className="border border-red-600 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 flex items-center text-sm font-medium transition-colors"
                >
                  <Trash className="w-4 h-4 mr-2" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
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

      {/* Edit Category Modal */}
      {showEditCategoryModal && selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Edit Award Category</h3>
                <button 
                  onClick={() => {
                    setShowEditCategoryModal(false);
                    setSelectedCategory(null);
                  }}
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
                    id="editCategoryActive"
                    checked={newCategory.active}
                    onChange={(e) => setNewCategory({...newCategory, active: e.target.checked})}
                    className="mr-2"
                  />
                  <label htmlFor="editCategoryActive" className="text-sm font-medium text-gray-700">
                    Active Category
                  </label>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowEditCategoryModal(false);
                    setSelectedCategory(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateCategory}
                  className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
                  disabled={!newCategory.title || !newCategory.description}
                >
                  Update Category
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Suggested Nominee Modal */}
      {showAddNomineeModal && selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Add Suggested Nominee to {selectedCategory.title}</h3>
                <button 
                  onClick={handleCloseAddNomineeModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  &times;
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Image Upload Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nominee Photo</label>
                  <div className="flex items-center space-x-4">
                    {/* Image Preview */}
                    <div className="flex-shrink-0">
                      {imagePreview || newNominee.imageUrl ? (
                        <div className="relative">
                          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 bg-gray-50">
                            <img 
                              src={imagePreview || newNominee.imageUrl} 
                              alt="Nominee preview" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={removeImage}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                          <User className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Upload Button */}
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleImageUpload(file);
                          }
                        }}
                        className="hidden"
                        id="nominee-image-upload"
                        disabled={uploadingImage}
                      />
                      <label
                        htmlFor="nominee-image-upload"
                        className={`cursor-pointer inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 ${
                          uploadingImage ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {uploadingImage ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                        ) : (
                          <Upload className="w-4 h-4 mr-2" />
                        )}
                        {uploadingImage ? 'Uploading...' : 'Upload Photo'}
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        JPEG, PNG, GIF, or WebP. Max 10MB.
                      </p>
                    </div>
                  </div>
                </div>

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
                
                <div className="grid grid-cols-2 gap-4">
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
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Achievement Summary *</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={4}
                    value={newNominee.achievement}
                    onChange={(e) => setNewNominee({...newNominee, achievement: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={handleCloseAddNomineeModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitNominee}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                  disabled={!newNominee.name || !newNominee.institution || !newNominee.specialty || !newNominee.achievement || uploadingImage}
                >
                  Add Nominee
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Nominees Modal */}
      {showViewNomineesModal && selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Nominees in {selectedCategory.title}</h3>
                <button 
                  onClick={() => {
                    setShowViewNomineesModal(false);
                    setSelectedCategory(null);
                    setCategoryNominees([]);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  &times;
                </button>
              </div>
              
              {categoryNominees.length > 0 ? (
                <div className="space-y-4">
                  {categoryNominees.map((nominee) => (
                    <div key={nominee.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start space-x-4">
                        {/* Nominee Image */}
                        <div className="flex-shrink-0">
                          {nominee.imageUrl ? (
                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200 bg-gray-50">
                              <img 
                                src={nominee.imageUrl} 
                                alt={nominee.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const img = e.currentTarget;
                                  const fallback = img.nextElementSibling as HTMLElement;
                                  img.style.display = 'none';
                                  if (fallback) {
                                    fallback.style.display = 'flex';
                                  }
                                }}
                              />
                              <div className="w-full h-full bg-gray-100 flex items-center justify-center hidden">
                                <User className="w-6 h-6 text-gray-400" />
                              </div>
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center">
                              <User className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Nominee Details */}
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-bold text-lg text-gray-900">{nominee.name}</h4>
                              <p className="text-gray-600">{nominee.institution}</p>
                              <p className="text-gray-500 text-sm">{nominee.specialty}</p>
                              {nominee.location && (
                                <p className="text-gray-500 text-sm">{nominee.location}</p>
                              )}
                              {nominee.email && (
                                <p className="text-gray-500 text-sm">{nominee.email}</p>
                              )}
                              {nominee.achievement && (
                                <div className="mt-2">
                                  <p className="text-gray-700 text-sm">{nominee.achievement}</p>
                                </div>
                              )}
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              nominee.status === 'Approved' 
                                ? 'bg-green-100 text-green-800' 
                                : nominee.status === 'Winner'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-red-100 text-red-800' 
                            }`}>
                              {nominee.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No nominees found in this category.</p>
                </div>
              )}
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => {
                    setShowViewNomineesModal(false);
                    setSelectedCategory(null);
                    setCategoryNominees([]);
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

export default CategoriesTab;