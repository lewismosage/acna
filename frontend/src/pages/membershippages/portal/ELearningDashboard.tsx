import { useState } from 'react';
import { 
  BookOpen, Users, Bell, Calendar, FileText, User, Download, 
  Play, Clock, CheckCircle, AlertCircle, Star, Upload, 
  ExternalLink, MessageSquare, Award, BarChart3,
  Video, FileDown, Link, GraduationCap, HelpCircle, Phone
} from 'lucide-react';

const ELearningDashboard = () => {
  const [activeTab, setActiveTab] = useState('elearning');

  // Mock data
  const enrolledCourses = [
    {
      id: 1,
      title: "Advanced Pediatric Neurology",
      progress: 75,
      instructor: "Dr. Jane Smith",
      totalModules: 12,
      completedModules: 9,
      nextDeadline: "Oct 15, 2025",
      status: "In Progress"
    },
    {
      id: 2,
      title: "Epilepsy Management Strategies",
      progress: 45,
      instructor: "Prof. Michael Johnson",
      totalModules: 8,
      completedModules: 4,
      nextDeadline: "Oct 20, 2025",
      status: "In Progress"
    },
    {
      id: 3,
      title: "Cerebral Palsy Rehabilitation",
      progress: 100,
      instructor: "Dr. Sarah Williams",
      totalModules: 10,
      completedModules: 10,
      nextDeadline: "Completed",
      status: "Completed"
    }
  ];

  const announcements = [
    {
      id: 1,
      title: "New Module Released: Advanced EEG Interpretation",
      date: "Oct 10, 2025",
      type: "update",
      read: false
    },
    {
      id: 2,
      title: "Assignment Due: Case Study Analysis",
      date: "Oct 12, 2025",
      type: "deadline",
      read: false
    },
    {
      id: 3,
      title: "Webinar: Latest Research in Pediatric Stroke",
      date: "Oct 8, 2025",
      type: "event",
      read: true
    }
  ];

  const instructors = [
    {
      name: "Dr. Jane Smith",
      course: "Advanced Pediatric Neurology",
      email: "j.smith@acna.org",
      officeHours: "Mon, Wed 2-4 PM",
      avatar: "https://images.pexels.com/photos/5327580/pexels-photo-5327580.jpeg?auto=compress&cs=tinysrgb&w=150"
    },
    {
      name: "Prof. Michael Johnson",
      course: "Epilepsy Management",
      email: "m.johnson@acna.org",
      officeHours: "Tue, Thu 1-3 PM",
      avatar: "https://images.pexels.com/photos/6129967/pexels-photo-6129967.jpeg?auto=compress&cs=tinysrgb&w=150"
    }
  ];

  // Tab navigation items
  const tabs = [
    { id: 'elearning', label: 'E-LEARNING', icon: BookOpen },
    { id: 'course-access', label: 'COURSE ACCESS', icon: Users },
    { id: 'learning-materials', label: 'LEARNING MATERIALS', icon: FileText },
    { id: 'timetables', label: 'TIMETABLES', icon: Calendar },
    { id: 'assignments', label: 'ASSIGNMENTS', icon: FileText },
    { id: 'student-services', label: 'STUDENT SERVICES', icon: HelpCircle }
  ];

  // Home Tab Content (E-Learning)
  const ELearningHomeContent = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Progress Tracking */}
      <div className="bg-white border border-gray-300 rounded-lg">
        <div className="bg-blue-100 px-4 py-3 border-b border-gray-300">
          <h3 className="font-semibold text-gray-800 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Progress Tracking
          </h3>
        </div>
        <div className="p-4">
          <div className="space-y-4">
            {enrolledCourses.slice(0, 2).map((course) => (
              <div key={course.id} className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-medium text-sm">{course.title}</h4>
                <div className="flex items-center mt-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600">{course.progress}%</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {course.completedModules}/{course.totalModules} modules
                </p>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 text-blue-600 hover:text-blue-800 font-medium text-sm">
            View Full Progress →
          </button>
        </div>
      </div>

      {/* Tutor Info */}
      <div className="bg-white border border-gray-300 rounded-lg">
        <div className="bg-green-100 px-4 py-3 border-b border-gray-300">
          <h3 className="font-semibold text-gray-800 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Tutor Information
          </h3>
        </div>
        <div className="p-4">
          <div className="space-y-4">
            {instructors.slice(0, 2).map((instructor, index) => (
              <div key={index} className="flex items-start space-x-3">
                <img
                  src={instructor.avatar}
                  alt={instructor.name}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{instructor.name}</h4>
                  <p className="text-xs text-gray-600">{instructor.course}</p>
                  <p className="text-xs text-blue-600">{instructor.officeHours}</p>
                </div>
                <button className="text-blue-600 hover:text-blue-800">
                  <MessageSquare className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 text-green-600 hover:text-green-800 font-medium text-sm">
            Contact All Tutors →
          </button>
        </div>
      </div>

      {/* Announcements & Notifications */}
      <div className="bg-white border border-gray-300 rounded-lg">
        <div className="bg-orange-100 px-4 py-3 border-b border-gray-300">
          <h3 className="font-semibold text-gray-800 flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            Announcements & Notifications
          </h3>
        </div>
        <div className="p-4">
          <div className="space-y-3">
            {announcements.slice(0, 3).map((announcement) => (
              <div key={announcement.id} className={`p-3 rounded-lg ${announcement.read ? 'bg-gray-50' : 'bg-blue-50'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{announcement.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">{announcement.date}</p>
                  </div>
                  {!announcement.read && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full ml-2 mt-1"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 text-orange-600 hover:text-orange-800 font-medium text-sm">
            View All Notifications →
          </button>
        </div>
      </div>
    </div>
  );

  // Course Access Tab Content
  const CourseAccessContent = () => (
    <div className="space-y-6">
      <div className="bg-white border border-gray-300 rounded-lg">
        <div className="bg-blue-100 px-6 py-4 border-b border-gray-300">
          <h2 className="text-xl font-bold text-gray-800">My Enrolled Courses</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((course) => (
              <div key={course.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-lg">{course.title}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    course.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {course.status}
                  </span>
                </div>
                <p className="text-gray-600 mb-3">Instructor: {course.instructor}</p>
                
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progress</span>
                    <span>{course.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>

                <div className="text-sm text-gray-600 mb-4">
                  <p>Modules: {course.completedModules}/{course.totalModules}</p>
                  <p>Next Deadline: {course.nextDeadline}</p>
                </div>

                <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 flex items-center justify-center">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Access Course
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Learning Materials Tab Content
  const LearningMaterialsContent = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PDFs and Documents */}
        <div className="bg-white border border-gray-300 rounded-lg">
          <div className="bg-green-100 px-4 py-3 border-b border-gray-300">
            <h3 className="font-semibold text-gray-800 flex items-center">
              <FileDown className="w-5 h-5 mr-2" />
              Documents & PDFs
            </h3>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {[
                { name: "Pediatric Neurology Handbook.pdf", size: "2.3 MB", date: "Oct 8, 2025" },
                { name: "EEG Interpretation Guide.pdf", size: "1.8 MB", date: "Oct 5, 2025" },
                { name: "Case Study Templates.docx", size: "0.5 MB", date: "Oct 3, 2025" }
              ].map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded">
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 text-red-500 mr-3" />
                    <div>
                      <p className="font-medium text-sm">{doc.name}</p>
                      <p className="text-xs text-gray-500">{doc.size} • {doc.date}</p>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-800">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Video Lectures */}
        <div className="bg-white border border-gray-300 rounded-lg">
          <div className="bg-purple-100 px-4 py-3 border-b border-gray-300">
            <h3 className="font-semibold text-gray-800 flex items-center">
              <Video className="w-5 h-5 mr-2" />
              Video Lectures
            </h3>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {[
                { title: "Introduction to Pediatric Epilepsy", duration: "45:30", views: "1.2k", date: "Oct 8, 2025" },
                { title: "Advanced EEG Reading Techniques", duration: "38:15", views: "856", date: "Oct 6, 2025" },
                { title: "Case Discussion: Complex Seizures", duration: "52:20", views: "743", date: "Oct 4, 2025" }
              ].map((video, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded">
                  <div className="flex items-center">
                    <div className="w-12 h-8 bg-gray-200 rounded flex items-center justify-center mr-3">
                      <Play className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{video.title}</p>
                      <p className="text-xs text-gray-500">{video.duration} • {video.views} views • {video.date}</p>
                    </div>
                  </div>
                  <button className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700">
                    Watch
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* External Resources */}
      <div className="bg-white border border-gray-300 rounded-lg">
        <div className="bg-yellow-100 px-4 py-3 border-b border-gray-300">
          <h3 className="font-semibold text-gray-800 flex items-center">
            <Link className="w-5 h-5 mr-2" />
            External Resources & Links
          </h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: "WHO Guidelines on Pediatric Epilepsy", url: "who.int", type: "guideline" },
              { title: "International League Against Epilepsy", url: "ilae.org", type: "organization" },
              { title: "PubMed Research Database", url: "pubmed.ncbi.nlm.nih.gov", type: "database" },
              { title: "Pediatric Neurology Journal", url: "pediatricneurologybriefs.com", type: "journal" }
            ].map((resource, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded hover:bg-gray-50">
                <div className="flex items-center">
                  <ExternalLink className="w-4 h-4 text-blue-500 mr-3" />
                  <div>
                    <p className="font-medium text-sm">{resource.title}</p>
                    <p className="text-xs text-gray-500">{resource.url}</p>
                  </div>
                </div>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">{resource.type}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Timetables Tab Content
  const TimetablesContent = () => (
    <div className="space-y-6">
      <div className="bg-white border border-gray-300 rounded-lg">
        <div className="bg-blue-100 px-6 py-4 border-b border-gray-300">
          <h2 className="text-xl font-bold text-gray-800">Class Schedule & Live Sessions</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Sessions */}
            <div>
              <h3 className="font-semibold text-lg mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                Upcoming Live Sessions
              </h3>
              <div className="space-y-4">
                {[
                  {
                    title: "Advanced EEG Interpretation",
                    instructor: "Dr. Jane Smith",
                    date: "Oct 15, 2025",
                    time: "2:00 PM - 3:30 PM",
                    type: "Webinar",
                    link: "zoom.us/j/123456789"
                  },
                  {
                    title: "Case Discussion Forum",
                    instructor: "Prof. Michael Johnson",
                    date: "Oct 18, 2025",
                    time: "10:00 AM - 11:00 AM",
                    type: "Interactive Session",
                    link: "zoom.us/j/987654321"
                  },
                  {
                    title: "Research Methodology Workshop",
                    instructor: "Dr. Sarah Williams",
                    date: "Oct 22, 2025",
                    time: "3:00 PM - 5:00 PM",
                    type: "Workshop",
                    link: "zoom.us/j/456789123"
                  }
                ].map((session, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-medium">{session.title}</h4>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        {session.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Instructor: {session.instructor}</p>
                    <div className="flex items-center text-sm text-gray-600 mb-3">
                      <Calendar className="w-4 h-4 mr-1" />
                      {session.date} • {session.time}
                    </div>
                    <div className="flex space-x-2">
                      <button className="bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 flex items-center">
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Join Session
                      </button>
                      <button className="border border-gray-300 px-3 py-2 rounded text-sm hover:bg-gray-50">
                        Add to Calendar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Schedule */}
            <div>
              <h3 className="font-semibold text-lg mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-green-600" />
                Weekly Schedule
              </h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Day</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Time</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Course</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {[
                      { day: "Monday", time: "2:00 PM", course: "Advanced Pediatric Neurology" },
                      { day: "Wednesday", time: "10:00 AM", course: "Epilepsy Management" },
                      { day: "Friday", time: "3:00 PM", course: "Case Study Review" }
                    ].map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-sm">{item.day}</td>
                        <td className="px-4 py-3 text-sm">{item.time}</td>
                        <td className="px-4 py-3 text-sm">{item.course}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Assignments Tab Content
  const AssignmentsContent = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Assignments */}
        <div className="bg-white border border-gray-300 rounded-lg">
          <div className="bg-red-100 px-4 py-3 border-b border-gray-300">
            <h3 className="font-semibold text-gray-800 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              Pending Assignments
            </h3>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              {[
                {
                  title: "Case Study Analysis: Pediatric Stroke Patient",
                  course: "Advanced Pediatric Neurology",
                  dueDate: "Oct 20, 2025",
                  type: "Essay",
                  status: "pending"
                },
                {
                  title: "EEG Interpretation Quiz",
                  course: "Epilepsy Management",
                  dueDate: "Oct 25, 2025",
                  type: "Quiz",
                  status: "pending"
                }
              ].map((assignment, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-sm">{assignment.title}</h4>
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                      {assignment.type}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{assignment.course}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-red-600 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      Due: {assignment.dueDate}
                    </span>
                    <button className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700">
                      Start Assignment
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Completed Assignments */}
        <div className="bg-white border border-gray-300 rounded-lg">
          <div className="bg-green-100 px-4 py-3 border-b border-gray-300">
            <h3 className="font-semibold text-gray-800 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              Completed Assignments
            </h3>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              {[
                {
                  title: "Cerebral Palsy Management Plan",
                  course: "Rehabilitation Strategies",
                  submittedDate: "Oct 8, 2025",
                  grade: "A-",
                  feedback: "Excellent analysis and treatment recommendations"
                },
                {
                  title: "Neurological Assessment Quiz",
                  course: "Clinical Neurology",
                  submittedDate: "Oct 5, 2025",
                  grade: "B+",
                  feedback: "Good understanding of assessment techniques"
                }
              ].map((assignment, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-sm">{assignment.title}</h4>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold">
                      {assignment.grade}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{assignment.course}</p>
                  <p className="text-xs text-gray-500 mb-2">Submitted: {assignment.submittedDate}</p>
                  <p className="text-xs text-blue-600">{assignment.feedback}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Upload Assignment */}
      <div className="bg-white border border-gray-300 rounded-lg">
        <div className="bg-blue-100 px-4 py-3 border-b border-gray-300">
          <h3 className="font-semibold text-gray-800 flex items-center">
            <Upload className="w-5 h-5 mr-2" />
            Submit Assignment
          </h3>
        </div>
        <div className="p-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h4 className="font-medium text-lg mb-2">Upload Assignment File</h4>
            <p className="text-gray-600 mb-4">Drag and drop your file here or click to browse</p>
            <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
              Choose File
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Student Services Tab Content
  const StudentServicesContent = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Library Access */}
        <div className="bg-white border border-gray-300 rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <BookOpen className="w-8 h-8 text-blue-600 mr-3" />
            <h3 className="font-semibold text-lg">Library Access</h3>
          </div>
          <p className="text-gray-600 mb-4">Access digital library resources, research databases, and medical journals.</p>
          <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 flex items-center justify-center">
            <ExternalLink className="w-4 h-4 mr-2" />
            Access Library
          </button>
        </div>

        {/* Technical Support */}
        <div className="bg-white border border-gray-300 rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <HelpCircle className="w-8 h-8 text-green-600 mr-3" />
            <h3 className="font-semibold text-lg">Technical Support</h3>
          </div>
          <p className="text-gray-600 mb-4">Get help with platform issues, login problems, or technical difficulties.</p>
          <button className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 flex items-center justify-center">
            <MessageSquare className="w-4 h-4 mr-2" />
            Contact Support
          </button>
        </div>

        {/* Academic Advising */}
        <div className="bg-white border border-gray-300 rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <GraduationCap className="w-8 h-8 text-purple-600 mr-3" />
            <h3 className="font-semibold text-lg">Academic Advising</h3>
          </div>
          <p className="text-gray-600 mb-4">Schedule appointments with academic advisors for course guidance.</p>
          <button className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 flex items-center justify-center">
            <Calendar className="w-4 h-4 mr-2" />
            Book Appointment
          </button>
        </div>

        {/* Career Services */}
        <div className="bg-white border border-gray-300 rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <Award className="w-8 h-8 text-orange-600 mr-3" />
            <h3 className="font-semibold text-lg">Career Services</h3>
          </div>
          <p className="text-gray-600 mb-4">Access career guidance, job opportunities, and professional development resources.</p>
          <button className="w-full bg-orange-600 text-white py-2 rounded hover:bg-orange-700 flex items-center justify-center">
            <Star className="w-4 h-4 mr-2" />
            Explore Careers
          </button>
        </div>

        {/* Mentorship Portal */}
        <div className="bg-white border border-gray-300 rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <Users className="w-8 h-8 text-teal-600 mr-3" />
            <h3 className="font-semibold text-lg">Mentorship Program</h3>
          </div>
          <p className="text-gray-600 mb-4">Connect with experienced professionals for guidance and networking.</p>
          <button className="w-full bg-teal-600 text-white py-2 rounded hover:bg-teal-700 flex items-center justify-center">
            <Users className="w-4 h-4 mr-2" />
            Find Mentor
          </button>
        </div>

        {/* Student Wellness */}
        <div className="bg-white border border-gray-300 rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <Phone className="w-8 h-8 text-pink-600 mr-3" />
            <h3 className="font-semibold text-lg">Student Wellness</h3>
          </div>
          <p className="text-gray-600 mb-4">Access mental health resources, counseling services, and wellness programs.</p>
          <button className="w-full bg-pink-600 text-white py-2 rounded hover:bg-pink-700 flex items-center justify-center">
            <Phone className="w-4 h-4 mr-2" />
            Get Support
          </button>
        </div>
      </div>

      {/* Quick Contact Info */}
      <div className="bg-white border border-gray-300 rounded-lg">
        <div className="bg-gray-100 px-4 py-3 border-b border-gray-300">
          <h3 className="font-semibold text-gray-800">Quick Contact Information</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Academic Support</h4>
              <div className="space-y-2 text-sm">
                <p><strong>Email:</strong> academic@acna.edu</p>
                <p><strong>Phone:</strong> +254-700-123-456</p>
                <p><strong>Hours:</strong> Mon-Fri 8:00 AM - 5:00 PM</p>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3">Technical Support</h4>
              <div className="space-y-2 text-sm">
                <p><strong>Email:</strong> support@acna.edu</p>
                <p><strong>Phone:</strong> +254-700-789-012</p>
                <p><strong>Hours:</strong> 24/7 Online Support</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render tab content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'elearning':
        return <ELearningHomeContent />;
      case 'course-access':
        return <CourseAccessContent />;
      case 'learning-materials':
        return <LearningMaterialsContent />;
      case 'timetables':
        return <TimetablesContent />;
      case 'assignments':
        return <AssignmentsContent />;
      case 'student-services':
        return <StudentServicesContent />;
      default:
        return <ELearningHomeContent />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b-2 border-gray-200">
        {/* Navigation Tabs */}
        <div className="bg-blue-700 overflow-x-auto">
          <nav className="px-4 md:px-6">
            <div className="flex space-x-0 min-w-max">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`px-3 py-3 md:px-4 md:py-4 text-xs md:text-sm font-medium border-r border-blue-600 last:border-r-0 hover:bg-blue-600 transition-colors whitespace-nowrap flex items-center ${
                    activeTab === id ? 'bg-blue-600 text-white' : 'text-blue-100'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2 md:mr-2" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 md:px-6 md:py-8">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default ELearningDashboard;