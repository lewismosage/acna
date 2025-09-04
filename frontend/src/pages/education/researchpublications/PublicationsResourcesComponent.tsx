import React, { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import {
  publicationsApi,
  Publication,
} from "../../../services/publicationsAPI";
import LoadingSpinner from "../../../components/common/LoadingSpinner";

const PublicationsResources = () => {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [isLoadingPublications, setIsLoadingPublications] = useState(true);
  const [publicationsError, setPublicationsError] = useState<string | null>(
    null
  );

  useEffect(() => {
    const fetchPublications = async () => {
      try {
        setIsLoadingPublications(true);
        setPublicationsError(null);
        const data = await publicationsApi.getAll({ status: "Published" });
        setPublications(data.slice(0, 4)); // Show only first 4 publications
      } catch (err) {
        setPublicationsError("Failed to load publications");
        console.error("Error fetching publications:", err);
      } finally {
        setIsLoadingPublications(false);
      }
    };

    fetchPublications();
  }, []);

  const handlePublicationClick = (publicationId: number) => {
    window.location.href = `/publications/${publicationId}`;
  };

  return (
    <section id="publications-resources">
      <div>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-4">
            Publications & Resources
          </h2>
          <div className="w-20 h-1 bg-red-600 mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Clinical guidelines, educational materials, policy briefs, and
            other resources for healthcare professionals.
          </p>
        </div>

        {isLoadingPublications ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : publicationsError ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-red-600 mb-4">{publicationsError}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md font-medium transition-colors duration-300"
            >
              Try Again
            </button>
          </div>
        ) : publications.length > 0 ? (
          <>
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {publications.map((publication) => (
                <div
                  key={publication.id}
                  className="group cursor-pointer flex gap-4 hover:bg-gray-50 transition-colors duration-200 p-4 rounded-lg"
                  onClick={() => handlePublicationClick(publication.id)}
                >
                  <div className="relative flex-shrink-0 w-24 h-24 overflow-hidden rounded">
                    <img
                      src={publication.imageUrl}
                      alt={publication.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-1 left-1">
                      <span className="bg-red-600 text-white px-2 py-0.5 text-xs font-bold uppercase tracking-wide">
                        {publication.type}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start">
                      <p className="text-red-600 font-medium text-xs uppercase">
                        {publication.category}
                      </p>
                      <span className="bg-green-100 text-green-800 px-2 py-0.5 text-xs font-medium rounded">
                        {publication.accessType}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-gray-900 leading-tight group-hover:text-red-600 transition-colors">
                      {publication.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {publication.date}
                    </p>
                    <p className="text-gray-700 text-sm line-clamp-2">
                      {publication.excerpt}
                    </p>
                    <div className="flex gap-3 pt-1">
                      <span className="text-red-600 text-sm font-medium inline-flex items-center hover:text-red-700">
                        READ MORE <ArrowRight className="ml-1 w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <button
                onClick={() => (window.location.href = "/publications")}
                className="border-2 border-orange-600 text-orange-600 px-6 py-2 sm:px-8 sm:py-3 font-medium hover:bg-orange-600 hover:text-white transition-all duration-300 uppercase tracking-wide rounded text-sm sm:text-base"
              >
                View All Publications
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Publications Available
            </h3>
            <p className="text-gray-600">
              No publications are available at this time. Please check
              back later.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default PublicationsResources;