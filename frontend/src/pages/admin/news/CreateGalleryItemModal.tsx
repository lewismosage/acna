import React, { useState } from 'react';
import { X, Camera, Video, Image, BookOpen, Heart, Plus, Minus, Trash2 } from 'lucide-react';

interface CreateGalleryItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: any) => void;
  type: 'gallery' | 'stories';
}

const CreateGalleryItemModal: React.FC<CreateGalleryItemModalProps> = ({ isOpen, onClose, onSave, type }) => {
  // Common fields
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);

  // Gallery item fields
  const [itemType, setItemType] = useState<'photo' | 'video'>('photo');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');

  // Story fields
  const [patientName, setPatientName] = useState('');
  const [age, setAge] = useState('');
  const [condition, setCondition] = useState('');
  const [story, setStory] = useState('');

  const handleSubmit = () => {
    if (type === 'gallery') {
      const newItem = {
        id: Date.now(),
        type: itemType,
        title,
        category,
        date: date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        location,
        description,
        imageUrl,
        thumbnailUrl: thumbnailUrl || imageUrl,
        duration: itemType === 'video' ? duration : undefined,
        status: 'Draft',
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        isFeatured
      };
      onSave(newItem);
    } else {
      const newItem = {
        id: Date.now(),
        title,
        patientName,
        age: parseInt(age) || 0,
        condition,
        location,
        date: date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        story,
        imageUrl,
        status: 'Draft',
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        isFeatured
      };
      onSave(newItem);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center">
              {type === 'gallery' ? (
                <Camera className="w-6 h-6 mr-2 text-purple-600" />
              ) : (
                <Heart className="w-6 h-6 mr-2 text-purple-600" />
              )}
              Create New {type === 'gallery' ? 'Gallery Item' : 'Story'}
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title*</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Featured toggle */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="featured"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="h-4 w-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
              />
              <label htmlFor="featured" className="ml-2 text-sm font-medium text-gray-700">
                Feature this {type === 'gallery' ? 'item' : 'story'}
              </label>
            </div>

            {/* Image URLs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL*</label>
                <div className="flex items-center">
                  <input
                    type="text"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    required
                  />
                  <button className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-200">
                    <Image className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
                {imageUrl && (
                  <div className="mt-2">
                    <img 
                      src={imageUrl} 
                      alt="Preview" 
                      className="h-32 object-cover rounded-md border border-gray-200"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail URL</label>
                <div className="flex items-center">
                  <input
                    type="text"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md"
                    value={thumbnailUrl}
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                    placeholder="https://example.com/thumbnail.jpg"
                  />
                  <button className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-200">
                    <Image className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
                {thumbnailUrl && (
                  <div className="mt-2">
                    <img 
                      src={thumbnailUrl} 
                      alt="Thumbnail Preview" 
                      className="h-32 object-cover rounded-md border border-gray-200"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {type === 'gallery' ? (
              <>
                {/* Gallery Item Specific Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type*</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={itemType}
                      onChange={(e) => setItemType(e.target.value as 'photo' | 'video')}
                      required
                    >
                      <option value="photo">Photo</option>
                      <option value="video">Video</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category*</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      placeholder="e.g. July 10, 2025"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Kampala, Uganda"
                    />
                  </div>
                  {itemType === 'video' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        placeholder="e.g. 4:32"
                      />
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description*</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>
              </>
            ) : (
              <>
                {/* Story Specific Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name*</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Age*</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Medical Condition*</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={condition}
                      onChange={(e) => setCondition(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Nairobi, Kenya"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      placeholder="e.g. June 15, 2025"
                    />
                  </div>
                </div>

                {/* Story Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Story*</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={6}
                    value={story}
                    onChange={(e) => setStory(e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700"
                disabled={
                  !title || !imageUrl || 
                  (type === 'gallery' && (!category || !description)) ||
                  (type === 'stories' && (!patientName || !age || !condition || !story))
                }
              >
                Create {type === 'gallery' ? 'Gallery Item' : 'Story'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateGalleryItemModal;