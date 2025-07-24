// components/KeyFeatures.tsx
import React from "react";
import { Link } from "react-router-dom";
import { Users, BookOpen, Calendar, Award, ChevronRight } from "lucide-react";

const featureImages = [
  // Placeholder images
  "https://images.stockcake.com/public/c/6/2/c624f1e3-3794-467c-b5aa-c73e2e3101ab_large/global-health-collaboration-stockcake.jpg",
  "https://images.pexels.com/photos/7723396/pexels-photo-7723396.jpeg?auto=compress&w=600",
  "https://images.pexels.com/photos/7648221/pexels-photo-7648221.jpeg?auto=compress&w=600",
  "https://images.stockcake.com/public/0/4/4/044c2114-d49c-4356-be9f-d8d47d23f9ab_large/excellence-in-medicine-stockcake.jpg",
];

const KeyFeatures = () => {
  const features = [
    {
      title: "Professional Network",
      description:
        "Connect with leading child neurologists and researchers across the African continent.",
      link: "#",
      linkText: "Join Network",
      image: featureImages[0],
    },
    {
      title: "Research & Publications",
      description:
        "Access cutting-edge research, clinical guidelines, and educational resources.",
      link: "#",
      linkText: "Explore Research",
      image: featureImages[1],
    },
    {
      title: "Events & Training",
      description:
        "Participate in conferences, workshops, and professional development programs.",
      link: "#",
      linkText: "View Events",
      image: featureImages[2],
    },
    {
      title: "Recognition & Awards",
      description:
        "Celebrate excellence in child neurology research, clinical care, and advocacy.",
      link: "#",
      linkText: "Learn More",
      image: featureImages[3],
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title and Subtitle */}
        <div className="mb-12 max-w-4xl">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-2 text-left">
            Empowering Child Neurology Excellence
          </h2>
          <div className="h-2 w-16 bg-red-600 mb-6" />
          <p className="text-xl text-gray-700 text-left">
            ACNA provides comprehensive resources, networking opportunities, and
            professional development for neurologists, researchers, and
            healthcare advocates across Africa.
          </p>
        </div>
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {features.slice(0, 3).map((feature, idx) => (
            <div key={feature.title} className="flex flex-col h-full">
              <div className="w-full h-56 bg-gray-200 rounded overflow-hidden mb-6">
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 text-left">
                {feature.title}
              </h3>
              <p className="text-gray-700 mb-4 text-left flex-1">
                {feature.description}
              </p>
              <a
                href={feature.link}
                className="text-orange-600 font-semibold hover:underline text-left mt-auto inline-block"
              >
                Read more<span className="ml-1">&rsaquo;</span>
              </a>
            </div>
          ))}
        </div>
        {/* If there are more than 3 features, show the rest in a new row */}
        {features.length > 3 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mt-10">
            {features.slice(3).map((feature, idx) => (
              <div key={feature.title} className="flex flex-col h-full">
                <div className="w-full h-56 bg-gray-200 rounded overflow-hidden mb-6">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 text-left">
                  {feature.title}
                </h3>
                <p className="text-gray-700 mb-4 text-left flex-1">
                  {feature.description}
                </p>
                <a
                  href={feature.link}
                  className="text-orange-600 font-semibold hover:underline text-left mt-auto inline-block"
                >
                  Read more<span className="ml-1">&rsaquo;</span>
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default KeyFeatures;
