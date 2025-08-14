import React, { useState } from 'react';
import { X, Newspaper, Image, Tag, Plus, Minus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

// Define types
type NewsStatus = 'Published' | 'Draft' | 'Archived';
type NewsType = 'News Article' | 'Press Release' | 'Announcement' | 'Research Update';

export interface NewsItem {
  id: number;
  title: string;
  subtitle?: string;
  type: NewsType;
  status: NewsStatus;
  category: string;
  date: string;
  readTime: string;
  views: number;
  imageUrl: string;
  content: {
    introduction: string;
    sections: {
      heading: string;
      content: string;
    }[];
    conclusion?: string;
  };
  author?: {
    name: string;
    title: string;
    organization: string;
    bio: string;
    imageUrl: string;
  };
  tags: string[];
  source?: {
    name: string;
    url: string;
  };
  contact?: {
    name: string;
    email: string;
    phone: string;
  };
  createdAt: string;
  updatedAt: string;
  isFeatured?: boolean;
}

interface CreateNewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newsItem: NewsItem) => void;
}

const CreateNewsModal: React.FC<CreateNewsModalProps> = ({ isOpen, onClose, onSave }) => {
  // Basic fields
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [type, setType] = useState<NewsType>('News Article');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);

  // Content fields
  const [introduction, setIntroduction] = useState('');
  const [sections, setSections] = useState<{heading: string, content: string}[]>([
    { heading: '', content: '' }
  ]);
  const [conclusion, setConclusion] = useState('');

  // Metadata
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  // Author information
  const [authorName, setAuthorName] = useState('');
  const [authorTitle, setAuthorTitle] = useState('');
  const [authorOrg, setAuthorOrg] = useState('');
  const [authorBio, setAuthorBio] = useState('');
  const [authorImage, setAuthorImage] = useState('');

  // Source information
  const [sourceName, setSourceName] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');

  // Contact information
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  // Section management
  const [expandedSections, setExpandedSections] = useState<number[]>([]);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const addSection = () => {
    setSections([...sections, { heading: '', content: '' }]);
    setExpandedSections([...expandedSections, sections.length]);
  };

  const removeSection = (index: number) => {
    const newSections = [...sections];
    newSections.splice(index, 1);
    setSections(newSections);
    setExpandedSections(expandedSections.filter(i => i !== index).map(i => i > index ? i - 1 : i));
  };

  const updateSection = (index: number, field: 'heading' | 'content', value: string) => {
    const newSections = [...sections];
    newSections[index][field] = value;
    setSections(newSections);
  };

  const toggleExpandSection = (index: number) => {
    if (expandedSections.includes(index)) {
      setExpandedSections(expandedSections.filter(i => i !== index));
    } else {
      setExpandedSections([...expandedSections, index]);
    }
  };

  const handleSubmit = () => {
    const newNewsItem: NewsItem = {
      id: Date.now(),
      title,
      subtitle,
      type,
      status: 'Draft',
      category,
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      readTime: `${Math.max(3, Math.ceil((introduction.length + sections.reduce((acc, sec) => acc + sec.content.length, 0)) / 1000))} min read`,
      views: 0,
      imageUrl,
      content: {
        introduction,
        sections: sections.filter(s => s.heading || s.content),
        conclusion: conclusion.trim() || undefined
      },
      tags,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      isFeatured
    };

    // Add author if provided
    if (authorName.trim()) {
      newNewsItem.author = {
        name: authorName,
        title: authorTitle,
        organization: authorOrg,
        bio: authorBio,
        imageUrl: authorImage
      };
    }

    // Add source if provided
    if (sourceName.trim()) {
      newNewsItem.source = {
        name: sourceName,
        url: sourceUrl
      };
    }

    // Add contact if provided (for press releases)
    if (contactName.trim() && type === 'Press Release') {
      newNewsItem.contact = {
        name: contactName,
        email: contactEmail,
        phone: contactPhone
      };
    }

    onSave(newNewsItem);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center">
              <Newspaper className="w-6 h-6 mr-2 text-blue-600" />
              Create New News Item
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type*</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={type}
                  onChange={(e) => setType(e.target.value as NewsType)}
                  required
                >
                  <option value="News Article">News Article</option>
                  <option value="Press Release">Press Release</option>
                  <option value="Announcement">Announcement</option>
                  <option value="Research Update">Research Update</option>
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
            </div>

            {/* Featured Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Featured Image URL*</label>
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

            {/* Featured toggle */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="featured"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="featured" className="ml-2 text-sm font-medium text-gray-700">
                Feature this news item
              </label>
            </div>

            {/* Introduction */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Introduction*</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={4}
                value={introduction}
                onChange={(e) => setIntroduction(e.target.value)}
                required
              />
            </div>

            {/* Sections */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">Content Sections</label>
                <button
                  onClick={addSection}
                  className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Section
                </button>
              </div>

              <div className="space-y-4">
                {sections.map((section, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div 
                      className="flex justify-between items-center bg-gray-50 px-4 py-3 cursor-pointer"
                      onClick={() => toggleExpandSection(index)}
                    >
                      <div className="flex items-center">
                        <span className="text-sm font-medium">
                          {section.heading || `Section ${index + 1}`}
                        </span>
                        {!section.heading && !section.content && (
                          <span className="ml-2 text-xs text-red-500">(empty)</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeSection(index);
                          }}
                          className="text-gray-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        {expandedSections.includes(index) ? (
                          <ChevronUp className="w-4 h-4 text-gray-500" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        )}
                      </div>
                    </div>

                    {expandedSections.includes(index) && (
                      <div className="p-4 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Heading</label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            value={section.heading}
                            onChange={(e) => updateSection(index, 'heading', e.target.value)}
                            placeholder="Section heading"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                          <textarea
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            rows={4}
                            value={section.content}
                            onChange={(e) => updateSection(index, 'content', e.target.value)}
                            placeholder="Section content"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Conclusion */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Conclusion</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={4}
                value={conclusion}
                onChange={(e) => setConclusion(e.target.value)}
                placeholder="Optional conclusion paragraph"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs flex items-center"
                  >
                    {tag}
                    <button 
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex">
                <input
                  type="text"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add tag"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                />
                <button 
                  onClick={handleAddTag}
                  className="px-3 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
                >
                  <Tag className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Author Information */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Author Information (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Author Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={authorTitle}
                    onChange={(e) => setAuthorTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={authorOrg}
                    onChange={(e) => setAuthorOrg(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={authorImage}
                    onChange={(e) => setAuthorImage(e.target.value)}
                    placeholder="https://example.com/author.jpg"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={3}
                    value={authorBio}
                    onChange={(e) => setAuthorBio(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Source Information */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Source Information (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Source Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={sourceName}
                    onChange={(e) => setSourceName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Source URL</label>
                  <input
                    type="url"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information (for press releases) */}
            {type === 'Press Release' && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                    />
                  </div>
                </div>
              </div>
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
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                disabled={!title || !type || !category || !introduction || !imageUrl}
              >
                Create News Item
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateNewsModal;