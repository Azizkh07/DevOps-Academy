import React, { useState, useRef } from 'react';
import { videoService, VideoUploadData } from '../../lib/videoService';

interface VideoUploadProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const VideoUpload: React.FC<VideoUploadProps> = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<VideoUploadData>({
    title: '',
    description: '',
    is_active: true
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string>('');
  
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  console.log(`📤 VideoUpload component initialized for Azizkh07 at 2025-08-19 23:11:34`);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type (your backend accepts video/*)
      if (!file.type.startsWith('video/')) {
        setError('Please select a valid video file');
        return;
      }
      
      // Check file size (20GB limit - updated from 500MB)
      const maxSize = 5 * 1024 * 1024 * 1024; // 5GB
      if (file.size > maxSize) {
        setError('Video file size must be less than 5GB');
        return;
      }
      
      setVideoFile(file);
      setError('');
      console.log('🎬 Video file selected for Azizkh07:', {
        name: file.name,
        size: videoService.formatFileSize(file.size),
        type: file.type
      });
    }
  };

  const handleThumbnailFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file for thumbnail');
        return;
      }
      
      // Check file size (10MB limit for images)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        setError('Thumbnail file size must be less than 10MB');
        return;
      }
      
      setThumbnailFile(file);
      setError('');
      console.log('🖼️ Thumbnail file selected for Azizkh07:', {
        name: file.name,
        size: videoService.formatFileSize(file.size)
      });
    }
  };

  const formatFileSize = (bytes: number): string => {
    return videoService.formatFileSize(bytes);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    
    if (!videoFile) {
      setError('Please select a video file');
      return;
    }
    
    setUploading(true);
    setUploadProgress(0);
    setError('');
    
    try {
      console.log('📤 Starting upload for Azizkh07 at 2025-08-19 23:11:34...', {
        title: formData.title,
        videoFile: videoFile.name,
        videoSize: formatFileSize(videoFile.size),
        thumbnail: thumbnailFile?.name || 'No thumbnail'
      });
      
      // FIXED: Create FormData properly
      const uploadFormData = new FormData();
      uploadFormData.append('title', formData.title);
      uploadFormData.append('description', formData.description);
      uploadFormData.append('is_active', formData.is_active.toString());
      uploadFormData.append('video', videoFile);
      
      if (thumbnailFile) {
        uploadFormData.append('thumbnail', thumbnailFile);
      }
      
      // FIXED: Use correct method signature - just FormData and progress callback
      const result = await videoService.uploadVideo(
        uploadFormData,
        (progress) => {
          setUploadProgress(progress);
          console.log(`📊 Upload progress : ${progress}%`);
        }
      );
      
      if (result) {
        console.log('✅ Video uploaded successfully', {
          id: result.id,
          title: result.title
        });
        
        // Reset form
        setFormData({ title: '', description: '', is_active: true });
        setVideoFile(null);
        setThumbnailFile(null);
        if (videoInputRef.current) videoInputRef.current.value = '';
        if (thumbnailInputRef.current) thumbnailInputRef.current.value = '';
        
        onSuccess?.();
      } else {
        setError('Failed to upload video. Please try again.');
      }
    } catch (error) {
      console.error('❌ Upload error for Azizkh07:', error);
      setError('An error occurred during upload. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">📤 Upload Video</h2>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 text-2xl"
            type="button"
          >
            ✕
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Video Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Enter video title..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
            disabled={uploading}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description (Optional)
          </label>
          <textarea
            name="description"
            value={formData.description || ''}
            onChange={handleInputChange}
            placeholder="Enter video description..."
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            disabled={uploading}
          />
        </div>

        {/* Active Status */}
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              disabled={uploading}
            />
            <span className="ml-2 text-sm text-gray-700">Video is active (visible to users)</span>
          </label>
        </div>

        {/* Video File */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Video File *
          </label>
          <div className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
            uploading ? 'border-gray-200 bg-gray-50' : 'border-gray-300 hover:border-gray-400'
          }`}>
            <input
              type="file"
              ref={videoInputRef}
              accept="video/*"
              onChange={handleVideoFileChange}
              className="hidden"
              disabled={uploading}
            />
            
            {!videoFile ? (
              <div className="text-center">
                <div className="text-4xl mb-4">🎬</div>
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                  disabled={uploading}
                >
                  Select Video File
                </button>
                <p className="text-sm text-gray-500 mt-2">
                  Any video format (up to 5GB)
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">📹</span>
                  <div>
                    <p className="font-medium text-gray-900">{videoFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(videoFile.size)} • {videoFile.type}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setVideoFile(null);
                    if (videoInputRef.current) videoInputRef.current.value = '';
                  }}
                  className="text-red-600 hover:text-red-800 transition-colors disabled:opacity-50"
                  disabled={uploading}
                  title="Remove video file"
                >
                  🗑️ Remove
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Thumbnail */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Thumbnail (Optional)
          </label>
          <div className={`border-2 border-dashed rounded-lg p-4 transition-colors ${
            uploading ? 'border-gray-200 bg-gray-50' : 'border-gray-300 hover:border-gray-400'
          }`}>
            <input
              type="file"
              ref={thumbnailInputRef}
              accept="image/*"
              onChange={handleThumbnailFileChange}
              className="hidden"
              disabled={uploading}
            />
            
            {!thumbnailFile ? (
              <div className="text-center">
                <div className="text-2xl mb-2">🖼️</div>
                <button
                  type="button"
                  onClick={() => thumbnailInputRef.current?.click()}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                  disabled={uploading}
                >
                  Add Thumbnail
                </button>
                <p className="text-xs text-gray-500 mt-1">
                  JPEG, PNG, GIF, WebP (up to 10MB)
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <img
                    src={URL.createObjectURL(thumbnailFile)}
                    alt="Thumbnail preview"
                    className="w-16 h-16 object-cover rounded mr-3"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{thumbnailFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(thumbnailFile.size)} • {thumbnailFile.type}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setThumbnailFile(null);
                    if (thumbnailInputRef.current) thumbnailInputRef.current.value = '';
                  }}
                  className="text-red-600 hover:text-red-800 transition-colors disabled:opacity-50"
                  disabled={uploading}
                  title="Remove thumbnail"
                >
                  🗑️
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            <div className="flex items-center">
              <span className="mr-2 text-lg">⚠️</span>
              <div>
                <strong className="font-medium">Error:</strong> {error}
              </div>
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {uploading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
             
              <span className="text-sm text-blue-600">
                {videoFile && `${formatFileSize(videoFile.size * uploadProgress / 100)} / ${formatFileSize(videoFile.size)}`}
              </span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between text-xs text-blue-600 mt-2">
              <span>Please don't close this window during upload.</span>
              <span>{thumbnailFile ? 'Uploading video + thumbnail' : 'Uploading video'}</span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              disabled={uploading}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={uploading || !videoFile || !formData.title.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {uploading ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Uploading... {Math.round(uploadProgress)}%
              </>
            ) : (
              <>
                <span className="mr-2">📤</span>
                Upload Video
              </>
            )}
          </button>
        </div>
      </form>
      
     
    </div>
  );
};

export default VideoUpload;