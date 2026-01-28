'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PlayCircle, Search, Filter, Video, X } from 'lucide-react';

interface Exercise {
  id: string;
  name: string;
  description: string | null;
  muscle_group: string;
  youtube_url: string | null;
  instructions: string | null;
}

const muscleGroups = [
  'All',
  'Chest',
  'Back',
  'Shoulders',
  'Biceps',
  'Triceps',
  'Legs',
  'Core',
  'Full Body',
  'Glutes',
  'Cardio',
];

// Convert YouTube watch URL to embed URL
function getEmbedUrl(url: string | null): string | null {
  if (!url) return null;

  // Already an embed URL
  if (url.includes('/embed/')) {
    return url;
  }

  // Regular YouTube URL
  const watchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  if (watchMatch) {
    return `https://www.youtube.com/embed/${watchMatch[1]}`;
  }

  return url;
}

export default function VideosPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('All');
  const [selectedVideo, setSelectedVideo] = useState<Exercise | null>(null);
  const [availableGroups, setAvailableGroups] = useState<string[]>(['All']);

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    try {
      const supabase = createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        setError('Please log in to view the exercise library');
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('exercises')
        .select('*')
        .order('muscle_group')
        .order('name');

      if (fetchError) {
        console.error('Error fetching exercises:', fetchError);
        setError('Failed to load exercises');
      } else if (data) {
        setExercises(data);

        // Extract unique muscle groups from data
        const groups = ['All', ...new Set(data.map(e => e.muscle_group).filter(Boolean))];
        setAvailableGroups(groups);
      }
    } catch (err) {
      console.error('Error in fetchExercises:', err);
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const filteredExercises = exercises.filter((exercise) => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (exercise.description?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    const matchesGroup = selectedGroup === 'All' || exercise.muscle_group === selectedGroup;
    return matchesSearch && matchesGroup;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-grey-500">Loading exercises...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-grey-500">
        <Video className="h-12 w-12 mb-4 text-grey-300" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-black">Exercise Library</h1>
        <p className="text-grey-600 mt-1">Watch demonstrations and learn proper form</p>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-grey-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search exercises..."
            className="w-full border border-grey-300 pl-10 pr-4 py-3 text-black focus:outline-none focus:border-blue-600"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-grey-400" />
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="w-full sm:w-48 border border-grey-300 pl-10 pr-4 py-3 text-black focus:outline-none focus:border-blue-600 bg-white appearance-none"
          >
            {availableGroups.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Exercise Grid */}
      {exercises.length === 0 ? (
        <div className="bg-white p-12 text-center">
          <Video className="h-12 w-12 mx-auto text-grey-300 mb-4" />
          <h3 className="text-lg font-semibold text-black mb-2">No exercises yet</h3>
          <p className="text-grey-500">Your coach will add exercises to the library soon.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredExercises.map((exercise) => (
              <button
                key={exercise.id}
                onClick={() => setSelectedVideo(exercise)}
                className="bg-white p-4 text-left hover:shadow-lg transition-shadow group"
                disabled={!exercise.youtube_url}
              >
                <div className="aspect-video bg-grey-200 flex items-center justify-center mb-4 relative overflow-hidden">
                  {exercise.youtube_url ? (
                    <PlayCircle className="h-12 w-12 text-grey-400 group-hover:text-blue-600 transition-colors" />
                  ) : (
                    <Video className="h-12 w-12 text-grey-300" />
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </div>
                <span className="text-xs text-blue-600 font-medium uppercase">{exercise.muscle_group}</span>
                <h3 className="font-bold text-black mt-1 group-hover:text-blue-600 transition-colors">
                  {exercise.name}
                </h3>
                {exercise.description && (
                  <p className="text-sm text-grey-500 mt-1 line-clamp-2">{exercise.description}</p>
                )}
                {!exercise.youtube_url && (
                  <p className="text-xs text-grey-400 mt-2">Video coming soon</p>
                )}
              </button>
            ))}
          </div>

          {filteredExercises.length === 0 && (
            <div className="bg-white p-12 text-center">
              <p className="text-grey-500">No exercises found matching your criteria</p>
            </div>
          )}
        </>
      )}

      {/* Video Modal */}
      {selectedVideo && selectedVideo.youtube_url && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <div
            className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="aspect-video bg-black">
              <iframe
                src={getEmbedUrl(selectedVideo.youtube_url) || ''}
                title={selectedVideo.name}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="p-6">
              <span className="text-xs text-blue-600 font-medium uppercase">
                {selectedVideo.muscle_group}
              </span>
              <h2 className="text-xl font-bold text-black mt-1">{selectedVideo.name}</h2>
              {selectedVideo.description && (
                <p className="text-grey-600 mt-2">{selectedVideo.description}</p>
              )}
              {selectedVideo.instructions && (
                <div className="mt-4">
                  <h3 className="font-semibold text-black mb-2">Instructions</h3>
                  <p className="text-grey-600 whitespace-pre-line">{selectedVideo.instructions}</p>
                </div>
              )}
              <button
                onClick={() => setSelectedVideo(null)}
                className="mt-6 w-full py-3 bg-grey-100 text-black font-medium hover:bg-grey-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
