import React, { useState } from 'react';
import { Calendar, MapPin, Users, Play, Download, Filter } from 'lucide-react';

// 1. Define a type for gallery items
type GalleryItem = {
  id: number;
  title: string;
  category: string;
  type: string;
  location: string;
  date: string;
  attendees: number;
  image: string;
  description: string;
};

const Gallery = () => {
  // 2. Use the type for galleryItems and selectedImage
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  const galleryItems: GalleryItem[] = [
    {
      id: 1,
      title: "ACNA 2024 Annual Conference Opening Ceremony",
      category: "conferences",
      type: "image",
      location: "Cape Town, South Africa",
      date: "March 2024",
      attendees: 500,
      image: "https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=800",
      description: "Opening ceremony of the ACNA 2024 Annual Conference with keynote speakers and delegates from across Africa."
    },
    {
      id: 2,
      title: "Pediatric Neurology Workshop - Lagos",
      category: "workshops",
      type: "image",
      location: "Lagos, Nigeria",
      date: "February 2024",
      attendees: 120,
      image: "https://images.pexels.com/photos/4021775/pexels-photo-4021775.jpeg?auto=compress&cs=tinysrgb&w=800",
      description: "Hands-on training session on pediatric epilepsy management techniques."
    },
    {
      id: 3,
      title: "Research Collaboration Meeting",
      category: "meetings",
      type: "image",
      location: "Nairobi, Kenya",
      date: "January 2024",
      attendees: 45,
      image: "https://images.pexels.com/photos/3825583/pexels-photo-3825583.jpeg?auto=compress&cs=tinysrgb&w=800",
      description: "Multi-institutional research planning meeting for pediatric stroke studies."
    },
    {
      id: 4,
      title: "Community Outreach Program",
      category: "outreach",
      type: "image",
      location: "Accra, Ghana",
      date: "December 2023",
      attendees: 200,
      image: "https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=800",
      description: "Community education program on epilepsy awareness and seizure first aid."
    },
    {
      id: 5,
      title: "Fellowship Training Session",
      category: "training",
      type: "image",
      location: "Cairo, Egypt",
      date: "November 2023",
      attendees: 30,
      image: "https://images.pexels.com/photos/4173239/pexels-photo-4173239.jpeg?auto=compress&cs=tinysrgb&w=800",
      description: "Advanced training session for pediatric neurology fellows on neuroimaging interpretation."
    },
    {
      id: 6,
      title: "ILAE African Epilepsy Congress Highlights",
      category: "conferences",
      type: "video",
      location: "Marrakech, Morocco",
      date: "October 2023",
      attendees: 800,
      image: "https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=800",
      description: "Key moments from the 5th African Epilepsy Congress featuring international speakers."
    },
    {
      id: 7,
      title: "Telemedicine Initiative Launch",
      category: "innovation",
      type: "image",
      location: "Johannesburg, South Africa",
      date: "September 2023",
      attendees: 75,
      image: "https://images.pexels.com/photos/4226219/pexels-photo-4226219.jpeg?auto=compress&cs=tinysrgb&w=800",
      description: "Launch of the STONE-HMIS® digital health platform for remote neurological consultations."
    },
    {
      id: 8,
      title: "Young Investigators Symposium",
      category: "symposiums",
      type: "image",
      location: "Tunis, Tunisia",
      date: "August 2023",
      attendees: 60,
      image: "https://images.pexels.com/photos/3786126/pexels-photo-3786126.jpeg?auto=compress&cs=tinysrgb&w=800",
      description: "Symposium showcasing research presentations by young investigators in pediatric neurology."
    }
  ];

  const categories = [
    { value: 'all', label: 'All Events' },
    { value: 'conferences', label: 'Conferences' },
    { value: 'workshops', label: 'Workshops' },
    { value: 'meetings', label: 'Meetings' },
    { value: 'outreach', label: 'Outreach' },
    { value: 'training', label: 'Training' },
    { value: 'innovation', label: 'Innovation' },
    { value: 'symposiums', label: 'Symposiums' }
  ];

  const filteredItems = galleryItems.filter(item => 
    selectedCategory === 'all' || item.category === selectedCategory
  );

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-indigo-900 to-indigo-700 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Gallery
            </h1>
            <p className="text-xl text-indigo-100 max-w-3xl mx-auto">
              Explore moments from our conferences, workshops, training sessions, and community 
              outreach programs across Africa.
            </p>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Event Gallery</h2>
              <p className="text-gray-600">Browse through our collection of memorable moments</p>
            </div>
            
            <div className="flex items-center space-x-2 mt-4 md:mt-0">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item) => (
              <div 
                key={item.id} 
                className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                onClick={() => setSelectedImage(item)}
              >
                <div className="relative">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-64 object-cover"
                  />
                  {item.type === 'video' && (
                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                      <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                        <Play className="w-8 h-8 text-gray-800 ml-1" />
                      </div>
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${
                      item.category === 'conferences' ? 'bg-blue-600' :
                      item.category === 'workshops' ? 'bg-green-600' :
                      item.category === 'meetings' ? 'bg-purple-600' :
                      item.category === 'outreach' ? 'bg-red-600' :
                      item.category === 'training' ? 'bg-yellow-600' :
                      item.category === 'innovation' ? 'bg-indigo-600' :
                      'bg-gray-600'
                    }`}>
                      {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{item.location}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{item.date}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="w-4 h-4 mr-2" />
                      <span>{item.attendees} attendees</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Our Impact in Numbers
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Measuring our reach and engagement across Africa
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-600 mb-2">50+</div>
              <div className="text-gray-600">Events Organized</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-600 mb-2">15,000+</div>
              <div className="text-gray-600">Total Attendees</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-600 mb-2">25</div>
              <div className="text-gray-600">Countries Reached</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-600 mb-2">200+</div>
              <div className="text-gray-600">Expert Speakers</div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal for Image/Video Preview */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <img
                src={selectedImage.image}
                alt={selectedImage.title}
                className="w-full h-96 object-cover rounded-t-xl"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 bg-white bg-opacity-90 rounded-full p-2 hover:bg-opacity-100 transition-colors"
              >
                <span className="sr-only">Close</span>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-8">
              <div className="flex items-center justify-between mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  selectedImage.category === 'conferences' ? 'bg-blue-100 text-blue-800' :
                  selectedImage.category === 'workshops' ? 'bg-green-100 text-green-800' :
                  selectedImage.category === 'meetings' ? 'bg-purple-100 text-purple-800' :
                  selectedImage.category === 'outreach' ? 'bg-red-100 text-red-800' :
                  selectedImage.category === 'training' ? 'bg-yellow-100 text-yellow-800' :
                  selectedImage.category === 'innovation' ? 'bg-indigo-100 text-indigo-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {selectedImage.category.charAt(0).toUpperCase() + selectedImage.category.slice(1)}
                </span>
                <button className="flex items-center text-indigo-600 hover:text-indigo-700">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </button>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{selectedImage.title}</h3>
              <p className="text-gray-600 mb-6">{selectedImage.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center text-gray-500">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{selectedImage.location}</span>
                </div>
                <div className="flex items-center text-gray-500">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{selectedImage.date}</span>
                </div>
                <div className="flex items-center text-gray-500">
                  <Users className="w-4 h-4 mr-2" />
                  <span>{selectedImage.attendees} attendees</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Be Part of Our Next Event
          </h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-3xl mx-auto">
            Join us at upcoming conferences, workshops, and training sessions. 
            Connect with fellow professionals and advance pediatric neurology in Africa.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-indigo-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors">
              View Upcoming Events
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-indigo-600 transition-colors">
              Submit Photos
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Gallery;