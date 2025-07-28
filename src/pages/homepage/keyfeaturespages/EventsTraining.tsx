import { useState } from 'react';
import { Link } from "react-router-dom";
import ScrollToTop from '../../../components/common/ScrollToTop';
import { ArrowRight } from 'lucide-react';

interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  type: 'upcoming' | 'past';
  category: string;
  description: string;
  imageUrl: string;
  isOnline?: boolean;
}

const EventsTraining = () => {
  // Using events data from your main EventsPage
  const upcomingEvents: Event[] = [
    {
      id: 1,
      title: "ACNA Live from Nairobi: Advancing Pediatric Neurology Care Across East Africa",
      date: "August 15, 2025",
      time: "2:00PM-4:00PM EAT",
      location: "Live online",
      type: "upcoming",
      category: "CONFERENCE",
      description: "Join us for an interactive session discussing the latest advances in pediatric neurology care and treatment protocols across East African healthcare systems.",
      imageUrl: "https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=600",
      isOnline: true
    },
    {
      id: 2,
      title: "Epilepsy Awareness Workshop in Community Settings",
      date: "August 22, 2025",
      time: "9:00AM-5:00PM CAT",
      location: "In-person in Cape Town, SA",
      type: "upcoming",
      category: "WORKSHOP",
      description: "A comprehensive workshop focused on epilepsy awareness, community education, and reducing stigma around neurological conditions in African communities.",
      imageUrl: "https://images.pexels.com/photos/3184638/pexels-photo-3184638.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
      id: 3,
      title: "Child Neurology Training Program for Healthcare Workers",
      date: "September 5, 2025",
      time: "10:00AM-3:00PM WAT",
      location: "In-person in Lagos, Nigeria",
      type: "upcoming",
      category: "TRAINING",
      description: "Intensive training program designed to equip primary healthcare workers with essential skills in identifying and managing pediatric neurological conditions.",
      imageUrl: "https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=600"
    }
  ];

  const trainingPrograms = [
    {
      title: "Annual Continental Conference",
      description: "Our flagship event bringing together professionals from across Africa",
      imageUrl: "https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=600",
      details: "Three days of cutting-edge presentations, hands-on workshops, and networking opportunities focusing on advances in pediatric neurology."
    },
    {
      title: "Specialized Workshops & Masterclasses",
      description: "Intensive hands-on training sessions",
      imageUrl: "https://images.pexels.com/photos/3184306/pexels-photo-3184306.jpeg?auto=compress&cs=tinysrgb&w=600",
      details: "Practical training covering specific neurological conditions, diagnostic techniques, and treatment protocols tailored for African healthcare settings."
    },
    {
      title: "Fellowship & Certification Programs",
      description: "Comprehensive training with certification",
      imageUrl: "https://images.pexels.com/photos/5726794/pexels-photo-5726794.jpeg?auto=compress&cs=tinysrgb&w=600",
      details: "Specialized certification in pediatric neurology, including mentorship opportunities and clinical rotations at leading institutions."
    },
    {
      title: "Virtual Learning Platform",
      description: "Online courses and webinars",
      imageUrl: "https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=600",
      details: "Flexible professional development through online courses, webinars, and interactive modules accessible across the continent."
    }
  ];

  return (
    <div className="bg-white">
      <ScrollToTop />
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-light text-gray-900 mb-6">Events & Training</h1>
          <p className="text-xl md:text-2xl text-gray-700 font-light max-w-3xl mx-auto">
            Participate in conferences, workshops, and professional development programs.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="space-y-6 text-gray-700 leading-relaxed text-lg">
            <p>
              ACNA is committed to advancing pediatric neurology practice across Africa through comprehensive education and training programs. Our events bring together healthcare professionals, researchers, and advocates to share knowledge, build skills, and foster collaboration across the continent.
            </p>

            <p>
              From our annual continental conference to specialized workshops and online learning modules, we provide diverse opportunities for professional development that meet the needs of healthcare providers at every stage of their careers. Our programs are designed to be practical, relevant, and immediately applicable in clinical practice.
            </p>

            <p>
              We recognize the unique challenges facing healthcare professionals in different African contexts, which is why our training programs combine international best practices with locally relevant approaches. Whether you're a medical student, general practitioner, or specialist, we have programs tailored to your learning needs.
            </p>

            <p>
              Through partnerships with leading academic institutions and healthcare organizations across Africa and globally, we ensure that our participants receive world-class training while building networks that support career-long learning and collaboration.
            </p>
          </div>
        </div>
      </section>

      {/* Training Programs Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-4">Training Programs</h2>
            <div className="w-20 h-1 bg-red-600 mx-auto mb-6"></div>
            <p className="text-gray-600 max-w-3xl mx-auto text-lg">
              Discover our comprehensive range of educational opportunities designed to enhance{' '}
              <span className="text-orange-600 font-medium">clinical skills and knowledge</span> in pediatric neurology across Africa.
            </p>
          </div>

          {/* Programs Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {trainingPrograms.map((program, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <img
                  src={program.imageUrl}
                  alt={program.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{program.title}</h3>
                  <p className="text-orange-600 text-sm font-medium mb-3">{program.description}</p>
                  <p className="text-gray-700 text-sm mb-4">{program.details}</p>
                  <button className="text-orange-600 text-sm font-semibold hover:underline">
                    Learn more →
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
             to="/training-programs"
              className="border-2 border-orange-600 text-gray-800 px-6 py-3 text-sm font-bold tracking-wider hover:bg-orange-600 hover:text-white transition-all duration-300 rounded-lg">
             BROWSE PROGRAMS
            </Link>
          </div>
        </div>
      </section>

      {/* Upcoming Events Section - Updated to match News About ACNA layout */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-4">Upcoming Events</h2>
            <div className="w-20 h-1 bg-red-600 mx-auto mb-6"></div>
            <p className="text-gray-600 max-w-3xl mx-auto text-lg">
              Join us at our upcoming events and take advantage of{' '}
              <span className="text-orange-600 font-medium">world-class learning opportunities</span> in pediatric neurology across the continent.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {upcomingEvents.map((event, index) => (
              <div key={event.id} className="group cursor-pointer flex gap-4 hover:bg-gray-50 transition-colors duration-200 p-4 rounded-lg">
                <div className="relative flex-shrink-0 w-24 h-24 overflow-hidden rounded">
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-1 left-1">
                    <span className="bg-red-600 text-white px-2 py-0.5 text-xs font-bold uppercase tracking-wide">
                      {event.category}
                    </span>
                  </div>
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-orange-600 font-medium text-xs uppercase">
                    {event.date}, {event.time}
                  </p>
                  <h3 className="text-base font-bold text-gray-900 leading-tight group-hover:text-red-600 transition-colors">
                    {event.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {event.isOnline ? 'Online Event' : event.location}
                  </p>
                  <a href="#" className="text-red-600 text-sm font-medium inline-flex items-center hover:text-red-700">
                    READ MORE <ArrowRight className="ml-1 w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
            to="/events"
            className="border-2 border-orange-600 text-gray-800 px-6 py-3 text-sm font-bold tracking-wider hover:bg-orange-600 hover:text-white transition-all duration-300 rounded-lg">
              VIEW ALL EVENTS
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EventsTraining;