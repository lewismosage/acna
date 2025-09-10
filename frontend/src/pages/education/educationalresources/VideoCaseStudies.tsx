// components/CaseStudiesVideos.tsx
import { useState, useEffect } from "react";
import { Play, X, MapPin, Clock, Users, Video } from "lucide-react";
import Section from "../../../components/common/Section";
import { educationalResourcesApi, EducationalResource } from "../../../services/educationalResourcesApi";

interface CaseStudyVideo extends EducationalResource {
  youtubeId?: string;
  videoUrl?: string;
}

const CaseStudiesVideos = () => {
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [caseStudyVideos, setCaseStudyVideos] = useState<CaseStudyVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCaseStudyVideos = async () => {
      try {
        setLoading(true);
        // Fetch all published resources first
        const allResources = await educationalResourcesApi.getAll({
          status: "Published"
        });
        
        // Filter for videos - look for resources with videoUrl or type containing "video"
        const videoResources = allResources.filter(resource => 
          resource.videoUrl || 
          resource.type?.toLowerCase().includes('video') ||
          resource.tags?.some(tag => tag.toLowerCase().includes('video')) ||
          resource.category?.toLowerCase().includes('video')
        );
        
        setCaseStudyVideos(videoResources);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load case studies");
        console.error("Error fetching case study videos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCaseStudyVideos();
  }, []);

  const extractYoutubeId = (url: string): string | null => {
    if (!url) return null;
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const getVideoThumbnail = (video: CaseStudyVideo): string => {
    // If there's a custom image, use it (ensure proper URL format)
    if (video.imageUrl) {
      // Check if the URL is already absolute
      if (video.imageUrl.startsWith('http')) {
        return video.imageUrl;
      }
      // If it's a relative path, construct the full URL
      return educationalResourcesApi.getBaseUrl() + video.imageUrl;
    }
    
    // If it's a YouTube video, use YouTube thumbnail
    if (video.videoUrl) {
      const youtubeId = extractYoutubeId(video.videoUrl);
      if (youtubeId) {
        return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
      }
    }
    
    // Fallback to a default thumbnail
    return "https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=600";
  };

  const getVideoSource = (video: CaseStudyVideo): string | null => {
    if (video.videoUrl) {
      // If it's a YouTube URL, return the ID for embedding
      const youtubeId = extractYoutubeId(video.videoUrl);
      if (youtubeId) {
        return youtubeId;
      }
      
      // If it's a direct video URL, return the full URL
      if (video.videoUrl.startsWith('http')) {
        return video.videoUrl;
      }
      
      // If it's a relative path, construct the full URL
      return educationalResourcesApi.getBaseUrl() + video.videoUrl;
    }
    return null;
  };

  const isYouTubeVideo = (video: CaseStudyVideo): boolean => {
    return video.videoUrl ? video.videoUrl.includes('youtube') || video.videoUrl.includes('youtu.be') : false;
  };

  if (loading) {
    return (
      <Section className="py-16 bg-gray-50">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto mb-12"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-white rounded-lg overflow-hidden shadow-md">
                <div className="w-full h-48 bg-gray-300 animate-pulse"></div>
                <div className="p-6">
                  <div className="h-6 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>
    );
  }

  if (error) {
    return (
      <Section className="py-16 bg-gray-50">
        <div className="text-center text-red-600">
          <p>Error loading case studies: {error}</p>
        </div>
      </Section>
    );
  }

  return (
    <Section className="py-16 bg-gray-50">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-4">
          Case Studies in Action
        </h2>
        <div className="w-20 h-1 bg-red-600 mx-auto mb-6"></div>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Watch real stories of transformation in child neurology care across
          Africa. These documented cases showcase innovative approaches,
          successful interventions, and the impact of collaborative healthcare
          initiatives.
        </p>
      </div>

      {caseStudyVideos.length === 0 ? (
        <div className="text-center py-12">
          <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            No Case Study Videos Available
          </h3>
          <p className="text-gray-500">
            Check back later for new case study videos and resources.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {caseStudyVideos.map((caseStudy) => {
            const videoSource = getVideoSource(caseStudy);
            const youtubeVideo = isYouTubeVideo(caseStudy);
            
            return (
              <div
                key={caseStudy.id}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
              >
                <div className="relative w-full h-48">
                  {playingVideoId === caseStudy.id.toString() && videoSource ? (
                    <>
                      {youtubeVideo ? (
                        <iframe
                          src={`https://www.youtube.com/embed/${videoSource}?autoplay=1`}
                          className="w-full h-full"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <video
                          controls
                          autoPlay
                          className="w-full h-full"
                          src={videoSource}
                        />
                      )}
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
                        src={getVideoThumbnail(caseStudy)}
                        alt={caseStudy.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback if image fails to load
                          e.currentTarget.src = "https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=600";
                        }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center group-hover:bg-opacity-50 transition-all">
                        {videoSource && (
                          <button
                            onClick={() => setPlayingVideoId(caseStudy.id.toString())}
                            className="w-16 h-16 rounded-full bg-white bg-opacity-90 flex items-center justify-center transition-transform hover:scale-110 shadow-lg"
                          >
                            <Play className="h-6 w-6 text-red-600 ml-1" />
                          </button>
                        )}
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

                    {caseStudy.location && (
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <MapPin className="w-4 h-4 mr-1 text-red-600" />
                        {caseStudy.location}
                      </div>
                    )}

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

                  {caseStudy.impactStatement && (
                    <div className="flex items-center text-sm border-t border-gray-100 pt-3">
                      <Users className="w-4 h-4 mr-2 text-red-600" />
                      <span className="text-red-600 font-medium">
                        Impact: {caseStudy.impactStatement}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Section>
  );
};

export default CaseStudiesVideos;