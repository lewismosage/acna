// components/CaseStudiesVideos.tsx
import { useState } from "react";
import { Play, X, MapPin, Clock, Users } from "lucide-react";
import Section from "../../components/common/Section";
import YouTube from "react-youtube";

interface CaseStudyVideo {
  id: string;
  youtubeId: string;
  thumbnail: string;
  title: string;
  location: string;
  duration?: string;
  category?: string;
  description?: string;
  impact?: string;
  condition?: string;
}

const caseStudyVideos: CaseStudyVideo[] = [
  {
    id: "1",
    youtubeId: "HLnFeiOVCVo",
    thumbnail: "https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=600",
    title: "Transforming Epilepsy Care in Rural Kenya",
    location: "Nakuru County, Kenya",
    duration: "8:30 min",
    category: "Epilepsy Care",
    condition: "Epilepsy",
    description: "How community-based training reduced treatment gaps from 85% to 35% in rural communities",
    impact: "600+ children treated"
  },
  {
    id: "2",
    youtubeId: "DZXjJVrm1Jw",
    thumbnail: "https://images.pexels.com/photos/3952048/pexels-photo-3952048.jpeg?auto=compress&cs=tinysrgb&w=600",
    title: "Mobile Clinics Reach Remote Ghana Communities",
    location: "Northern Ghana",
    duration: "6:45 min",
    category: "Mobile Health",
    condition: "Multiple Conditions",
    description: "Innovative mobile clinic program provides specialized neurological assessments in remote areas",
    impact: "45 villages reached"
  },
  {
    id: "3",
    youtubeId: "j5z10be-ApY",
    thumbnail: "https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=600",
    title: "Telemedicine Bridges the Specialist Gap",
    location: "Gulu District, Uganda",
    duration: "7:20 min",
    category: "Telemedicine",
    condition: "Neurodevelopmental Disorders",
    description: "Real-time consultations connect rural health centers with pediatric neurologists",
    impact: "250+ consultations"
  },
  {
    id: "4",
    youtubeId: "PDeKrM4pkqM",
    thumbnail: "https://images.pexels.com/photos/4260323/pexels-photo-4260323.jpeg?auto=compress&cs=tinysrgb&w=600",
    title: "From Stigma to Support: Cerebral Palsy in Nigeria",
    location: "Lagos State, Nigeria",
    duration: "9:15 min",
    category: "Community Engagement",
    condition: "Cerebral Palsy",
    description: "Community education transforms attitudes and increases school enrollment for children with CP",
    impact: "85% attitude improvement"
  },
  {
    id: "5",
    youtubeId: "0vrdkzOnGgo",
    thumbnail: "https://images.pexels.com/photos/3184638/pexels-photo-3184638.jpeg?auto=compress&cs=tinysrgb&w=600",
    title: "Early Intervention Success in Rwanda",
    location: "Kigali Province, Rwanda",
    duration: "10:30 min",
    category: "Early Intervention",
    condition: "Developmental Delays",
    description: "National developmental screening program improves early identification and intervention",
    impact: "12,000+ children screened"
  },
  {
    id: "6",
    youtubeId: "vNihRTd20Pc",
    thumbnail: "https://images.pexels.com/photos/8199562/pexels-photo-8199562.jpeg?auto=compress&cs=tinysrgb&w=600",
    title: "Building Neurological Capacity in Ethiopia",
    location: "Addis Ababa, Ethiopia",
    duration: "8:45 min",
    category: "Capacity Building",
    condition: "Training Program",
    description: "Comprehensive training creates network of skilled pediatric neurology practitioners",
    impact: "120 professionals trained"
  }
];

const CaseStudiesVideos = () => {
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

  return (
    <Section className="py-16 bg-gray-50">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-4">
          Case Studies in Action
        </h2>
        <div className="w-20 h-1 bg-red-600 mx-auto mb-6"></div>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Watch real stories of transformation in child neurology care across Africa. 
          These documented cases showcase innovative approaches, successful interventions, 
          and the impact of collaborative healthcare initiatives.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {caseStudyVideos.map((caseStudy) => (
          <div
            key={caseStudy.id}
            className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
          >
            <div className="relative w-full h-48">
              {playingVideoId === caseStudy.youtubeId ? (
                <>
                  <YouTube
                    videoId={caseStudy.youtubeId}
                    opts={{
                      height: "100%",
                      width: "100%",
                      playerVars: { autoplay: 1 },
                    }}
                    className="w-full h-full"
                  />
                  <button
                    onClick={() => setPlayingVideoId(null)}
                    className="absolute top-2 right-2 bg-black bg-opacity-60 rounded-full p-2 text-white hover:bg-opacity-80 z-10 transition-all"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <>
                  <img
                    src={caseStudy.thumbnail}
                    alt={`${caseStudy.title} case study`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center group-hover:bg-opacity-50 transition-all">
                    <button
                      onClick={() => setPlayingVideoId(caseStudy.youtubeId)}
                      className="w-16 h-16 rounded-full bg-white bg-opacity-90 flex items-center justify-center transition-transform hover:scale-110 shadow-lg"
                    >
                      <Play className="h-6 w-6 text-red-600 ml-1" />
                    </button>
                  </div>
                  
                  {/* Overlay badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    <span className="bg-red-600 text-white px-2 py-1 text-xs font-bold uppercase tracking-wide rounded">
                      Case Study
                    </span>
                    {caseStudy.category && (
                      <span className="bg-orange-600 text-white px-2 py-1 text-xs font-medium rounded">
                        {caseStudy.category}
                      </span>
                    )}
                  </div>

                  {caseStudy.duration && (
                    <div className="absolute bottom-3 right-3">
                      <span className="bg-black bg-opacity-70 text-white px-2 py-1 text-xs rounded flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {caseStudy.duration}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
            
            <div className="p-6">
              <div className="mb-3">
                <h3 className="font-bold text-lg text-gray-900 leading-tight mb-2 hover:text-red-600 transition-colors cursor-pointer">
                  {caseStudy.title}
                </h3>
                
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <MapPin className="w-4 h-4 mr-1 text-red-600" />
                  {caseStudy.location}
                </div>
                
                {caseStudy.condition && (
                  <span className="inline-block bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium mb-3">
                    {caseStudy.condition}
                  </span>
                )}
              </div>
              
              {caseStudy.description && (
                <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-3">
                  {caseStudy.description}
                </p>
              )}
              
              {caseStudy.impact && (
                <div className="flex items-center text-sm border-t border-gray-100 pt-3">
                  <Users className="w-4 h-4 mr-2 text-red-600" />
                  <span className="text-red-600 font-medium">Impact: {caseStudy.impact}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
};

export default CaseStudiesVideos;