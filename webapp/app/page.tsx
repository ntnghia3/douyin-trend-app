"use client";
import { supabase } from '../src/utils/supabaseClient';
import { useEffect, useState } from 'react';

type DouyinVideo = {
  id: string;
  douyin_id: string;
  title: string;
  video_url: string;
  thumbnail_url: string;
  stats?: any;
  public_url?: string;
  storage_path?: string;
  processed?: boolean;
  created_at?: string;
};

export default function Home() {
  const [videos, setVideos] = useState<DouyinVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      const { data, error } = await supabase.from('videos').select('*');
      console.log('Supabase response:', { data, error });
      if (!error && data) {
        setVideos(data);
      } else if (error) {
        console.error('Supabase error:', error);
      }
      setLoading(false);
    };
    fetchVideos();
  }, []);

  // Test function to add sample data
  const addTestVideo = async () => {
    const testVideo = {
      douyin_id: 'test_' + Date.now(),
      title: 'Test Video - ' + new Date().toLocaleString(),
      video_url: 'https://example.com/video.mp4',
      thumbnail_url: 'https://example.com/thumb.jpg',
      public_url: 'https://example.com/public.mp4',
      storage_path: '/test/video.mp4',
      processed: true,
      stats: { views: 1000, likes: 100, shares: 50 }
    };

    console.log('Adding test video:', testVideo);
    const { data, error } = await supabase.from('videos').insert(testVideo).select();
    console.log('Insert response:', { data, error });
    
    if (error) {
      alert('Lỗi RLS: ' + error.message + '\n\nVào Supabase Dashboard → Table Editor → videos → Settings → tắt "Enable Row Level Security"');
    } else if (data) {
      alert('Thêm thành công! Đang refresh...');
      // Refresh the videos list
      const { data: allVideos } = await supabase.from('videos').select('*');
      if (allVideos) setVideos(allVideos);
    }
  };

  // Download video function
  const downloadVideo = async (video: DouyinVideo) => {
    try {
      const videoUrl = video.public_url || video.video_url;
      if (!videoUrl) {
        alert('Không có URL video để download');
        return;
      }

      // Create a filename
      const filename = `${video.title?.replace(/[^a-zA-Z0-9]/g, '_') || 'douyin_video'}_${video.douyin_id || Date.now()}.mp4`;
      
      console.log('Downloading video:', { videoUrl, filename });

      // Method 1: Direct download link (works for same-origin or CORS-enabled URLs)
      const link = document.createElement('a');
      link.href = videoUrl;
      link.download = filename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Method 2: If direct download doesn't work, try fetch and blob (for CORS issues)
      // Uncomment below if needed:
      /*
      try {
        const response = await fetch(videoUrl);
        if (!response.ok) throw new Error('Network response was not ok');
        
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up
        window.URL.revokeObjectURL(blobUrl);
      } catch (fetchError) {
        console.error('Fetch download failed:', fetchError);
        // Fallback: open in new tab
        window.open(videoUrl, '_blank');
      }
      */

    } catch (error) {
      console.error('Download error:', error);
      alert('Lỗi khi download video: ' + error);
    }
  };

  // Test database connection
  const testConnection = async () => {
    try {
      // Test basic connection
      const { data, error } = await supabase.from('videos').select('count', { count: 'exact' });
      console.log('Connection test:', { data, error });
      
      if (error) {
        alert('Lỗi kết nối: ' + error.message);
      } else {
        alert('Kết nối thành công! Database có ' + (data?.length || 0) + ' records');
      }
    } catch (err) {
      console.error('Connection error:', err);
      alert('Lỗi: ' + err);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-6">Douyin Viral Videos</h1>
      
      {/* Test buttons */}
      <div className="mb-4 space-x-2">
        <button 
          onClick={testConnection}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Test Connection
        </button>
        <button 
          onClick={addTestVideo}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Add Test Video
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
          {videos.map((video) => (
            <div key={video.id} className="border rounded-lg p-4 flex flex-col items-center bg-white shadow-lg">
              <img 
                src={video.thumbnail_url} 
                alt={video.title} 
                className="w-full h-48 object-cover mb-2 rounded" 
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
                }}
              />
              <h2 className="text-lg font-semibold mb-2 text-center line-clamp-2">{video.title}</h2>
              
              {/* Video stats */}
              {video.stats && (
                <div className="text-sm text-gray-600 mb-2 text-center">
                  {typeof video.stats === 'object' && (
                    <>
                      {video.stats.views && <span>👁️ {video.stats.views.toLocaleString()} </span>}
                      {video.stats.likes && <span>❤️ {video.stats.likes.toLocaleString()} </span>}
                      {video.stats.shares && <span>🔄 {video.stats.shares.toLocaleString()}</span>}
                    </>
                  )}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex space-x-2 mt-auto">
                <a 
                  href={video.video_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
                >
                  🎬 Watch
                </a>
                <button
                  onClick={() => downloadVideo(video)}
                  className="bg-green-500 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
                >
                  ⬇️ Download
                </button>
              </div>

              {/* Additional info */}
              <div className="text-xs text-gray-500 mt-2 text-center">
                {video.created_at && (
                  <div>Added: {new Date(video.created_at).toLocaleDateString()}</div>
                )}
                {video.douyin_id && (
                  <div>ID: {video.douyin_id}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

/* Supabase Row Level Security Policies */

/* -- Policy cho phép đọc dữ liệu
CREATE POLICY "Enable read access for all users" ON "public"."videos"
AS PERMISSIVE FOR SELECT
TO public
USING (true);

-- Policy cho phép insert dữ liệu (nếu cần)
CREATE POLICY "Enable insert access for all users" ON "public"."videos"
AS PERMISSIVE FOR INSERT
TO public
WITH CHECK (true); */
