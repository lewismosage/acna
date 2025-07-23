// components/CoreValues.tsx
import React from "react";
import pediatricCheckup from "../../assets/pediatric-checkup.jpg";
import howWeWork from "../../assets/how-we-work.jpg";
import ourStory from "../../assets/our-story.webp";

const coreValues = [
  {
    image: pediatricCheckup,
    title: "What we do",
    description:
      "For over 15 years, ACNA has been dedicated to advancing child neurological care and equity across Africa.",
    link: "about/what-we-do",
  },
  {
    image: howWeWork,
    title: "How we work",
    description:
      "We are focused on results. Those that can be measured. And those measured in ways beyond numbers.",
    link: "about/how-we-work",
  },
  {
    image: ourStory,
    title: "Our story",
    description:
      "Learn about the origins of the foundation and the values that drive our work.",
    link: "/about/our-story",
  },
];

const CoreValues = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title and Subtitle */}
        <div className="mb-12 max-w-4xl">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-2 text-left">
            Core Values Guiding Our Work
          </h2>
          <div className="h-2 w-16 bg-red-600 mb-6" />
          <p className="text-xl text-gray-700 text-left">
            The principles that shape our approach to advancing child neurology
            in Africa
          </p>
        </div>
        {/* Core Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {coreValues.map((value) => (
            <div key={value.title} className="flex flex-col h-full">
              <div className="w-full h-72 bg-gray-200 rounded overflow-hidden mb-6">
                <img
                  src={value.image}
                  alt={value.title}
                  className="w-full h-full object-cover rounded"
                />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 text-left">
                {value.title}
              </h3>
              <p className="text-gray-700 mb-4 text-left flex-1">
                {value.description}
              </p>
              <a
                href={value.link}
                className="text-orange-600 font-semibold underline underline-offset-4 hover:text-orange-700 text-left mt-auto inline-block"
              >
                Learn more
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CoreValues;
