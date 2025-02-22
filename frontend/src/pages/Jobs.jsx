import React, { useEffect, useState } from "react";
import axios from "axios";

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get(import.meta.env.VITE_ADZUNA_API_URL, {
          params: {
            app_id: import.meta.env.VITE_ADZUNA_APP_ID,
            app_key: import.meta.env.VITE_ADZUNA_APP_KEY,
            what: "developer",
            where: "Remote",
          },
        });
    
        if (response.data.results) {
          setJobs(response.data.results);
        } else {
          setError("No jobs found.");
        }
      } catch {
        setError("Failed to fetch jobs.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchJobs();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Remote Job Listings
        </h2>

        {loading && (
          <div className="grid gap-4">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="animate-pulse bg-white p-4 rounded-lg shadow-md"
              >
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <p className="text-red-600 text-center font-semibold bg-red-100 p-3 rounded-md">
            {error}
          </p>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white p-5 rounded-lg shadow-lg transition transform hover:scale-105 hover:shadow-xl"
            >
              <h3 className="text-xl font-semibold text-gray-900">
                {job.title}
              </h3>
              <p className="text-gray-600">
                {job.company?.display_name || "Unknown Company"}
              </p>
              <p className="text-gray-500 text-sm">{job.location.display_name}</p>
              <a
                href={job.redirect_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                View Job
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Jobs;

