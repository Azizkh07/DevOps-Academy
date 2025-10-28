import React, { useState, useEffect } from 'react';
import { api, getErrorMessage } from '../../lib/api';

interface Course {
  id: number;
  title: string;
  category: string;
  subject_count: number;
}

interface Subject {
  id: number;
  title: string;
  course_id: number;
  professor_name: string;
  hours: number;
  is_active: boolean;
}

interface VideoUploadFormProps {
  onSuccess?: (video: any) => void;
  onCancel?: () => void;
  isOpen: boolean;
}

const VideoUploadForm: React.FC<VideoUploadFormProps> = ({ onSuccess, onCancel, isOpen }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject_id: '',
    is_active: true
  });

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string>('');

  console.log(`🎬 VideoUploadForm loaded for Medsaidabidi02 at 2025-09-09 17:00:14`);

  // Load courses and subjects when form opens
  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  // Filter subjects when course changes
  useEffect(() => {
    if (selectedCourse && selectedCourse !== '') {
      const courseId = parseInt(selectedCourse);
      const filtered = subjects.filter(s => s.course_id === courseId && s.is_active);
      setFilteredSubjects(filtered);
      console.log(`🔍 Filtered subjects for course ${courseId}:`, filtered.length);
    } else {
      setFilteredSubjects(subjects.filter(s => s.is_active));
    }
    // Reset subject selection when course changes
    setFormData(prev => ({ ...prev, subject_id: '' }));
  }, [selectedCourse, subjects]);

  const loadData = async () => {
    try {
      setLoadingData(true);
      setError('');
      console.log('📊 Loading courses and subjects for Medsaidabidi02...');
      
      // ✅ FIXED: Use your existing API endpoints
      const [coursesRes, subjectsRes] = await Promise.all([
        api.get<Course[]>('/api/courses'),
        api.get<Subject[]>('/api/subjects')
      ]);
      
      console.log('✅ Data loaded:', {
        courses: coursesRes.length,
        subjects: subjectsRes.length
      });
      
      setCourses(coursesRes);
      setSubjects(subjectsRes);
      setFilteredSubjects(subjectsRes.filter(s => s.is_active));
      
    } catch (error) {
      console.error('❌ Error loading data for Medsaidabidi02:', error);
      setError(`Erreur lors du chargement: ${getErrorMessage(error)}`);
    } finally {
      setLoadingData(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const courseId = e.target.value;
    setSelectedCourse(courseId);
    console.log(`📚 Course selected: ${courseId}`);
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('video/')) {
        setError('Veuillez sélectionner un fichier vidéo valide');
        return;
      }

    
      const maxSize = 5 * 1024 * 1024 * 1024; 
      if (file.size > maxSize) {
        setError('Le fichier vidéo doit faire moins de 5GB');
        return;
      }

      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setError('');
      
      console.log('🎬 Video file selected for Medsaidabidi02:', {
        name: file.name,
        size: (file.size / (1024 * 1024 * 1024)).toFixed(2) + ' GB',
        type: file.type
      });
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Veuillez sélectionner une image valide pour la miniature');
        return;
      }

      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        setError('La miniature doit faire moins de 10MB');
        return;
      }

      setThumbnailFile(file);
      const url = URL.createObjectURL(file);
      setThumbnailPreview(url);
      setError('');
      
      console.log('🖼️ Thumbnail file selected for Medsaidabidi02:', {
        name: file.name,
        size: (file.size / 1024).toFixed(2) + ' KB'
      });
    }
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    const videoFile = files.find(file => file.type.startsWith('video/'));
    const imageFile = files.find(file => file.type.startsWith('image/'));

    if (videoFile) {
      const maxSize = 5 * 1024 * 1024 * 1024; // 5GB
      if (videoFile.size > maxSize) {
        setError('Le fichier vidéo doit faire moins de 5GB');
        return;
      }

      setVideoFile(videoFile);
      const url = URL.createObjectURL(videoFile);
      setPreviewUrl(url);
      console.log('🎬 Video dropped for Medsaidabidi02:', videoFile.name);
    }

    if (imageFile) {
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (imageFile.size > maxSize) {
        setError('La miniature doit faire moins de 10MB');
        return;
      }

      setThumbnailFile(imageFile);
      const url = URL.createObjectURL(imageFile);
      setThumbnailPreview(url);
      console.log('🖼️ Thumbnail dropped for Medsaidabidi02:', imageFile.name);
    }
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setError('Le titre de la vidéo est requis');
      return false;
    }

    if (!videoFile) {
      setError('Le fichier vidéo est requis');
      return false;
    }

    if (!formData.subject_id) {
      setError('Veuillez sélectionner une matière pour cette vidéo');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setUploadProgress(0);
    setError('');
    
    const selectedSubject = subjects.find(s => s.id.toString() === formData.subject_id);
    const selectedCourseData = courses.find(c => c.id === selectedSubject?.course_id);
    
    console.log('📤 Starting video upload ', {
      title: formData.title,
      subject: selectedSubject?.title,
      course: selectedCourseData?.title,
      video_size: (videoFile!.size / (1024 * 1024 * 1024)).toFixed(2) + ' GB',
      has_thumbnail: !!thumbnailFile,
      timestamp: '2025-09-09 17:00:14'
    });

    try {
      // ✅ FIXED: Create FormData for multipart upload
      const uploadFormData = new FormData();
      uploadFormData.append('title', formData.title);
      uploadFormData.append('description', formData.description);
      uploadFormData.append('subject_id', formData.subject_id);
      uploadFormData.append('is_active', formData.is_active.toString());
      uploadFormData.append('video', videoFile!);
      
      if (thumbnailFile) {
        uploadFormData.append('thumbnail', thumbnailFile);
      }

      console.log('📤 Uploading to /api/videos with XMLHttpRequest for progress tracking...');

      // ✅ Use XMLHttpRequest to track upload progress
      const result = await new Promise<any>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        // Track upload progress
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = Math.round((e.loaded / e.total) * 100);
            setUploadProgress(percentComplete);
            console.log(`📊 Upload progress: ${percentComplete}% (${(e.loaded / (1024 * 1024)).toFixed(2)}MB / ${(e.total / (1024 * 1024)).toFixed(2)}MB)`);
          }
        });
        
        // Handle completion
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              console.log('✅ Raw upload response:', response);
              resolve(response);
            } catch (e) {
              reject(new Error('Invalid response format'));
            }
          } else {
            console.error('❌ Upload response error:', xhr.responseText);
            reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
          }
        });
        
        // Handle errors
        xhr.addEventListener('error', () => {
          reject(new Error('Network error during upload'));
        });
        
        xhr.addEventListener('abort', () => {
          reject(new Error('Upload cancelled'));
        });
        
        // Send request
        xhr.open('POST', '/api/videos');
        xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('authToken') || ''}`);
        xhr.send(uploadFormData);
      });

      // ✅ FIXED: Handle different response structures from MySQL5
      let actualVideo;
      if (result.success && result.data) {
        // New response format with success flag and data wrapper
        actualVideo = result.data;
        console.log('✅ Extracted video from data wrapper:', actualVideo);
      } else if (result.id) {
        // Direct video object
        actualVideo = result;
        console.log('✅ Using direct video object:', actualVideo);
      } else {
        console.error('❌ Unexpected response structure:', result);
        throw new Error('Unexpected response structure from server');
      }

      console.log('✅ Video uploaded successfully for Medsaidabidi02:', {
        id: actualVideo.id,
        title: actualVideo.title,
        subject_id: actualVideo.subject_id
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        subject_id: '',
        is_active: true
      });
      setVideoFile(null);
      setThumbnailFile(null);
      setPreviewUrl('');
      setThumbnailPreview('');
      setSelectedCourse('');
      setUploadProgress(0);

      // ✅ FIXED: Pass the actual video object to parent
      onSuccess?.(actualVideo);
      
    } catch (error) {
      console.error('❌ Upload error for Medsaidabidi02:', error);
      setError(error instanceof Error ? error.message : 'Échec du téléchargement. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const getSelectedSubject = () => {
    if (!formData.subject_id) return null;
    return subjects.find(s => s.id.toString() === formData.subject_id);
  };

  const getSelectedCourse = () => {
    const subject = getSelectedSubject();
    if (!subject) return null;
    return courses.find(c => c.id === subject.course_id);
  };

  const selectedSubject = getSelectedSubject();
  const selectedCourseData = getSelectedCourse();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-screen overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">🎬 Ajouter une Vidéo</h2>
            </div>
            <button
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700 text-2xl transition-colors"
              disabled={loading}
              type="button"
            >
              ✕
            </button>
          </div>

          {/* Loading Data */}
          {loadingData && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Chargement des cours et matières...</p>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
              <div className="flex items-center">
                <span className="mr-2 text-lg">⚠️</span>
                <div>
                  <strong className="font-medium">Erreur:</strong> {error}
                </div>
              </div>
            </div>
          )}

          {!loadingData && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Course and Subject Selection */}
              <div className="bg-purple-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-purple-900 mb-4">📚 Sélection du Cours et de la Matière</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Course Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cours
                    </label>
                    <select
                      value={selectedCourse}
                      onChange={handleCourseChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      disabled={loading}
                    >
                      <option value="">-- Sélectionner un cours --</option>
                      {courses.map(course => (
                        <option key={course.id} value={course.id.toString()}>
                          {course.title} ({course.subject_count} matières)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Subject Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Matière *
                    </label>
                    <select
                      name="subject_id"
                      value={formData.subject_id}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      required
                      disabled={loading || filteredSubjects.length === 0}
                    >
                      <option value="">-- Sélectionner une matière --</option>
                      {filteredSubjects.map(subject => (
                        <option key={subject.id} value={subject.id.toString()}>
                          {subject.title} - {subject.professor_name}
                        </option>
                      ))}
                    </select>
                    {filteredSubjects.length === 0 && selectedCourse && (
                      <p className="text-sm text-gray-500 mt-1">
                        Aucune matière active trouvée pour ce cours
                      </p>
                    )}
                  </div>
                </div>

                {/* Selected Subject Info */}
                {selectedSubject && selectedCourseData && (
                  <div className="mt-4 bg-white p-4 rounded-lg border border-purple-200">
                    <h4 className="font-medium text-gray-900 mb-2">📖 Détails de la sélection</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><span className="font-medium">Cours:</span> {selectedCourseData.title}</div>
                      <div><span className="font-medium">Matière:</span> {selectedSubject.title}</div>
                      <div><span className="font-medium">Professeur:</span> {selectedSubject.professor_name}</div>
                      <div><span className="font-medium">Heures:</span> {selectedSubject.hours}h</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Video Information */}
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">📝 Informations de la Vidéo</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Titre de la vidéo *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Introduction au Droit Civil - Chapitre 1"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Description de ce que couvre cette vidéo..."
                      disabled={loading}
                    />
                  </div>

            
                </div>
              </div>

              {/* Video File Upload */}
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-green-900 mb-4">🎬 Fichier Vidéo</h3>
                
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive 
                      ? 'border-green-500 bg-green-50' 
                      : loading 
                      ? 'border-gray-200 bg-gray-50' 
                      : 'border-gray-300 hover:border-green-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {videoFile ? (
                    <div className="space-y-4">
                      <div className="text-green-600">
                        ✅ Vidéo sélectionnée: {videoFile.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        Taille: {(videoFile.size / (1024 * 1024 * 1024)).toFixed(2)} GB
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setVideoFile(null);
                          setPreviewUrl('');
                        }}
                        className="text-red-600 hover:text-red-800 text-sm transition-colors"
                        disabled={loading}
                      >
                        🗑️ Supprimer la vidéo
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-4xl">🎬</div>
                      <div>
                        <p className="text-lg font-medium">Glissez le fichier vidéo ici ou cliquez pour parcourir</p>
                        <p className="text-sm text-gray-500">Formats supportés: MP4, MOV, AVI, WebM (Max: 20GB)</p>
                      </div>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleVideoChange}
                        className="hidden"
                        id="video-upload"
                        disabled={loading}
                      />
                      <label
                        htmlFor="video-upload"
                        className={`inline-block px-6 py-2 rounded-lg cursor-pointer transition-colors ${
                          loading 
                            ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                      >
                        📁 Sélectionner une vidéo
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Thumbnail Upload */}
              <div className="bg-orange-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-orange-900 mb-4">🖼️ Miniature (Optionnel)</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      disabled={loading}
                    />
                    {thumbnailFile && (
                      <div className="mt-2 text-sm text-gray-600">
                        Sélectionné: {thumbnailFile.name} ({(thumbnailFile.size / 1024).toFixed(2)} KB)
                      </div>
                    )}
                  </div>
                  
                  {thumbnailPreview && (
                    <div>
                      <img
                        src={thumbnailPreview}
                        alt="Aperçu miniature"
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setThumbnailFile(null);
                          setThumbnailPreview('');
                        }}
                        className="mt-2 text-red-600 hover:text-red-800 text-sm"
                        disabled={loading}
                      >
                        🗑️ Supprimer la miniature
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Upload Progress */}
              {loading && (
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Progression du téléchargement</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Téléchargement en cours</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-600 text-center">
                      Veuillez patienter... Les gros fichiers peuvent prendre plusieurs minutes.
                    </div>
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  disabled={loading}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading || !videoFile || !formData.subject_id || !formData.title.trim()}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium disabled:opacity-50 transition-colors"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Téléchargement...
                    </div>
                  ) : (
                    '🎬 Ajouter la Vidéo'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoUploadForm;