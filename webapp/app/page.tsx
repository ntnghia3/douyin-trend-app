"use client";
import { supabase } from '../src/utils/supabaseClient';
import { useEffect, useState } from 'react';

type DouyinVideo = {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
};

export default function Home() {
  const [videos, setVideos] = useState<DouyinVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      const { data, error } = await supabase.from('douyin_videos').select('*');
      if (!error && data) {
        setVideos(data);
      }
      setLoading(false);
    };
    fetchVideos();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-6">Douyin Viral Videos</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
          {videos.map((video) => (
            <div key={video.id} className="border rounded-lg p-4 flex flex-col items-center">
              <img src={video.thumbnail} alt={video.title} className="w-full h-48 object-cover mb-2 rounded" />
              <h2 className="text-lg font-semibold mb-2 text-center">{video.title}</h2>
              <a href={video.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline mb-2">Watch</a>
              <a href={video.url} download className="bg-green-500 text-white px-4 py-2 rounded">Download</a>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
