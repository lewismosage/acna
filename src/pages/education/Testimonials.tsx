// components/Testimonials.tsx
import { useState } from "react";
import { Play, X } from "lucide-react";
import Section from "../../components/common/Section";
import YouTube from "react-youtube";

interface TestimonialVideo {
  id: string;
  youtubeId: string;
  thumbnail: string;
  title: string;
  role: string;
  location: string;
  duration?: string;
  category?: string;
  description?: string;
}

const testimonials: TestimonialVideo[] = [
  {
    id: "1",
    youtubeId: "HLnFeiOVCVo",
    thumbnail: "https://images.pexels.com/photos/8942991/pexels-photo-8942991.jpeg?auto=compress&cs=tinysrgb&w=600",
    title: "Amy Carter",
    role: "Director of Community Development",
    location: "South Africa",
    duration: "3:45 min",
    category: "Leadership",
    description: "Sharing insights on community development strategies"
  },
  {
    id: "2",
    youtubeId: "DZXjJVrm1Jw",
    thumbnail: "https://images.pexels.com/photos/7578808/pexels-photo-7578808.jpeg?auto=compress&cs=tinysrgb&w=600",
    title: "Eric Momanyi",
    role: "Senior Program Manager",
    location: "Ethiopia",
    duration: "4:20 min",
    category: "Management",
    description: "Discussing program implementation challenges"
  }
];

const Testimonials = () => {
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

  return (
    <Section className="py-16 bg-white">
      <div className="text-center mb-12">
        <h2 className="text-2xl md:text-3xl font-bold mb-4 text-primary-800">
          What our employees are saying
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Hear directly from our team members about their experiences working with ACNA.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((testimonial) => (
          <div
            key={testimonial.id}
            className="bg-white rounded overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300"
          >
            <div className="relative w-full h-40">
              {playingVideoId === testimonial.youtubeId ? (
                <>
                  <YouTube
                    videoId={testimonial.youtubeId}
                    opts={{
                      height: "100%",
                      width: "100%",
                      playerVars: { autoplay: 1 },
                    }}
                    className="w-full h-full"
                  />
                  <button
                    onClick={() => setPlayingVideoId(null)}
                    className="absolute top-2 right-2 bg-black bg-opacity-60 rounded p-1 text-white hover:bg-opacity-80 z-10"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </>
              ) : (
                <>
                  <img
                    src={testimonial.thumbnail}
                    alt={`${testimonial.title} testimonial`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                    <button
                      onClick={() => setPlayingVideoId(testimonial.youtubeId)}
                      className="w-12 h-12 rounded-full bg-white bg-opacity-80 flex items-center justify-center transition-transform hover:scale-110"
                    >
                      <Play className="h-5 w-5 text-primary-700 ml-1" />
                    </button>
                  </div>
                </>
              )}
            </div>
            <div className="p-4 bg-blue-50">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-primary-800">
                  {testimonial.title}
                </h3>
                {testimonial.duration && (
                  <span className="text-gray-500 text-sm">
                    {testimonial.duration}
                  </span>
                )}
              </div>
              <div className="text-gray-600 text-sm mb-2">
                {testimonial.role} ({testimonial.location})
              </div>
              {testimonial.category && (
                <span className="inline-block bg-primary-50 text-primary-700 px-2 py-1 rounded-full text-xs font-medium mb-2">
                  {testimonial.category}
                </span>
              )}
              {testimonial.description && (
                <p className="text-gray-600 text-sm mt-2">
                  {testimonial.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
};

export default Testimonials;