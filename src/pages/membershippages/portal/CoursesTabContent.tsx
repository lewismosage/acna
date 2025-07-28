import { Clock, Users, Award, ArrowRight } from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  level: string;
  format: string;
  cmeCredits: number;
  enrolled: number;
  capacity: number;
  startDate: string;
  image: string;
  status: 'enrolled' | 'available' | 'completed';
}

const CoursesTabContent = () => {
  // Sample course data
  const courses: Course[] = [
    {
      id: "course-1",
      title: "Advanced Epilepsy Management",
      description: "Comprehensive training on advanced epilepsy diagnosis and treatment approaches for pediatric cases.",
      duration: "4 weeks",
      category: "Clinical Neurology",
      level: "Advanced",
      format: "Online + Live Sessions",
      cmeCredits: 20,
      enrolled: 45,
      capacity: 60,
      startDate: "August 15, 2025",
      image: "https://images.pexels.com/photos/3184306/pexels-photo-3184306.jpeg",
      status: "available"
    },
    {
      id: "course-2",
      title: "Pediatric Stroke Recognition",
      description: "Early recognition and emergency management of stroke in children and adolescents.",
      duration: "2 weeks",
      category: "Emergency Neurology",
      level: "Intermediate",
      format: "Online Self-paced",
      cmeCredits: 10,
      enrolled: 32,
      capacity: 50,
      startDate: "September 2, 2025",
      image: "https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg",
      status: "enrolled"
    },
    {
      id: "course-3",
      title: "Neurodevelopmental Disorders",
      description: "Diagnosis and management of common neurodevelopmental conditions in children.",
      duration: "6 weeks",
      category: "Developmental Neurology",
      level: "Beginner",
      format: "Hybrid (Online + Workshop)",
      cmeCredits: 30,
      enrolled: 28,
      capacity: 40,
      startDate: "October 10, 2025",
      image: "https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg",
      status: "available"
    },
    {
      id: "course-4",
      title: "Neuromuscular Disorders in Children",
      description: "Approach to diagnosis and management of pediatric neuromuscular diseases.",
      duration: "4 weeks",
      category: "Clinical Neurology",
      level: "Advanced",
      format: "Online + Case Discussions",
      cmeCredits: 25,
      enrolled: 18,
      capacity: 30,
      startDate: "November 5, 2025",
      image: "https://images.pexels.com/photos/5726794/pexels-photo-5726794.jpeg",
      status: "available"
    },
    {
      id: "course-5",
      title: "Cerebral Palsy Management",
      description: "Multidisciplinary approach to cerebral palsy assessment and intervention.",
      duration: "3 weeks",
      category: "Rehabilitation",
      level: "Intermediate",
      format: "Online",
      cmeCredits: 15,
      enrolled: 55,
      capacity: 60,
      startDate: "July 28, 2025",
      image: "https://images.pexels.com/photos/4173239/pexels-photo-4173239.jpeg",
      status: "completed"
    },
    {
      id: "course-6",
      title: "Genetic Basis of Neurological Disorders",
      description: "Understanding genetic testing and counseling for inherited neurological conditions.",
      duration: "2 weeks",
      category: "Genetics",
      level: "Advanced",
      format: "Online Self-paced",
      cmeCredits: 12,
      enrolled: 22,
      capacity: 40,
      startDate: "September 20, 2025",
      image: "https://images.pexels.com/photos/3985163/pexels-photo-3985163.jpeg",
      status: "available"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search courses..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <select className="px-3 py-2 border border-gray-300 rounded-md text-sm">
              <option value="">All Categories</option>
              <option value="Clinical Neurology">Clinical Neurology</option>
              <option value="Emergency Neurology">Emergency Neurology</option>
              <option value="Developmental Neurology">Developmental Neurology</option>
              <option value="Rehabilitation">Rehabilitation</option>
              <option value="Genetics">Genetics</option>
            </select>
            <select className="px-3 py-2 border border-gray-300 rounded-md text-sm">
              <option value="">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
            <select className="px-3 py-2 border border-gray-300 rounded-md text-sm">
              <option value="">All Formats</option>
              <option value="Online">Online</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Self-paced">Self-paced</option>
            </select>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div key={course.id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-200">
            <div className="relative">
              <img
                src={course.image}
                alt={course.title}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-2 right-2">
                <span className={`px-2 py-1 text-xs font-medium rounded ${
                  course.status === 'enrolled' 
                    ? 'bg-blue-100 text-blue-800' 
                    : course.status === 'completed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-orange-100 text-orange-800'
                }`}>
                  {course.status === 'enrolled' 
                    ? 'Enrolled' 
                    : course.status === 'completed' 
                      ? 'Completed' 
                      : 'Available'}
                </span>
              </div>
            </div>
            
            <div className="p-5">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  {course.category}
                </span>
                <span className="text-xs font-medium text-gray-500">
                  {course.level}
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-2">{course.title}</h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>
              
              <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                <div className="flex items-center text-gray-600">
                  <Clock className="w-4 h-4 mr-1" />
                  {course.duration}
                </div>
                <div className="flex items-center text-gray-600">
                  <Award className="w-4 h-4 mr-1" />
                  {course.cmeCredits} CME
                </div>
                <div className="flex items-center text-gray-600">
                  <Users className="w-4 h-4 mr-1" />
                  {course.enrolled}/{course.capacity}
                </div>
                <div className="flex items-center text-gray-600">
                  {course.format}
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-3 border-t">
                <span className="text-sm font-medium text-gray-700">
                  Starts: {course.startDate}
                </span>
                <button className={`flex items-center text-sm font-medium ${
                  course.status === 'enrolled' 
                    ? 'text-blue-600 hover:text-blue-800' 
                    : course.status === 'completed' 
                      ? 'text-green-600 hover:text-green-800' 
                      : 'text-orange-600 hover:text-orange-800'
                }`}>
                  {course.status === 'enrolled' 
                    ? 'Continue' 
                    : course.status === 'completed' 
                      ? 'View Certificate' 
                      : 'Enroll Now'}
                  <ArrowRight className="ml-1 w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-8">
        <nav className="inline-flex rounded-md shadow-sm">
          <button className="px-3 py-1 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
            Previous
          </button>
          <button className="px-3 py-1 border-t border-b border-gray-300 bg-white text-sm font-medium text-blue-600 hover:bg-blue-50">
            1
          </button>
          <button className="px-3 py-1 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
            2
          </button>
          <button className="px-3 py-1 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
            3
          </button>
          <button className="px-3 py-1 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
            Next
          </button>
        </nav>
      </div>
    </div>
  );
};

export default CoursesTabContent;