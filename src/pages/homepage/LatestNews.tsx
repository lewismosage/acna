// components/LatestNews.tsx
import React from "react";
import { ArrowRight } from "lucide-react";

const news = [
  {
    type: "NEWS",
    date: "JUL 11, 2025",
    title: "Spike in pediatric epilepsy cases in post-conflict South Sudan",
    image:
      "https://images.pexels.com/photos/4021775/pexels-photo-4021775.jpeg?auto=compress&cs=tinysrgb&w=600",
    description: "",
  },
  {
    type: "STORY",
    date: "JUL 17, 2025",
    title: "Bringing neurological care to remote clinics in rural Uganda",
    image:
      "https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=600",
    description: "",
  },
  {
    type: "NEWS",
    date: "JUL 17, 2025",
    title: "ACNA launches child brain health initiative across West Africa",
    image:
      "https://images.pexels.com/photos/3825583/pexels-photo-3825583.jpeg?auto=compress&cs=tinysrgb&w=600",
    description: "",
  },
  {
    type: "STORY",
    date: "JUL 10, 2025",
    title: "A mother’s fight for neurological treatment in northern Kenya",
    image:
      "https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=600",
    description: "",
  },
  {
    type: "NEWS",
    date: "JUL 16, 2025",
    title:
      "New ACNA research highlights gaps in epilepsy treatment access in Nigeria",
    image:
      "https://images.pexels.com/photos/4173239/pexels-photo-4173239.jpeg?auto=compress&cs=tinysrgb&w=600",
    description: "",
  },
];

const redIcon = (
  <svg
    width="28"
    height="28"
    viewBox="0 0 28 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="28" height="28" rx="4" fill="#E10600" />
    <path
      d="M8 9.5C8 8.67157 8.67157 8 9.5 8H18.5C19.3284 8 20 8.67157 20 9.5V18.5C20 19.3284 19.3284 20 18.5 20H9.5C8.67157 20 8 19.3284 8 18.5V9.5Z"
      fill="white"
    />
    <rect x="11" y="12" width="6" height="2" rx="1" fill="#E10600" />
  </svg>
);

const LatestNews = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="mb-10">
        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-2 text-left">
            Latest News & Updates
          </h2>
          <div className="h-2 w-16 bg-red-600 mb-6" />
          <p className="text-xl text-gray-600">
            Stay informed about the latest developments in child neurology
          </p>
        </div>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Featured News */}
          <div className="flex-1 relative min-w-[340px] max-w-2xl">
            <div className="relative h-[420px] rounded overflow-hidden">
              <img
                src={news[0].image}
                alt={news[0].title}
                className="w-full h-full object-cover"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              {/* Vertical Red Bar */}
              <div className="absolute left-0 top-0 h-full w-2 bg-red-600" />
              {/* Text */}
              <div className="absolute bottom-0 left-0 p-8">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 max-w-lg">
                  {news[0].title}
                </h2>
                <div className="flex items-center gap-4 text-white text-base font-medium">
                  <span className="uppercase tracking-wide text-white/80">
                    {news[0].type}
                  </span>
                  <span className="text-white/80">|</span>
                  <span>{news[0].date}</span>
                </div>
              </div>
            </div>
          </div>
          {/* Right: News List */}
          <div className="w-full lg:w-[420px] flex flex-col gap-6">
            {news.slice(1, 5).map((item, idx) => (
              <div
                key={item.title}
                className="flex items-center gap-4 bg-transparent"
              >
                <div className="relative min-w-[100px] w-[100px] h-[100px] rounded overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  {/* Red Icon Overlay */}
                  <div className="absolute top-0 left-0">{redIcon}</div>
                </div>
                <div className="flex-1">
                  <div className="text-xs text-gray-500 font-medium mb-1 uppercase">
                    {item.type} | {item.date}
                  </div>
                  <div className="text-base text-gray-900 font-semibold leading-snug">
                    {item.title}
                  </div>
                </div>
              </div>
            ))}
            {/* View All News link at the bottom right */}
            <div className="flex justify-end mt-4">
              <a
                href="#"
                className="text-orange-600 font-medium hover:text-black-700 inline-flex items-center"
              >
                View All News <ArrowRight className="ml-2 w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LatestNews;
