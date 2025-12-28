import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api, getErrorMessage } from '../lib/api';
import { videoService, Video } from '../lib/videoService';
import VideoPreview from '../components/VideoPreview';
import ProfessionalVideoPlayer from '../components/ProfessionalVideoPlayer';
import { useAuth } from '../lib/AuthContext';
import '../styles/CoursesPage.css';
import Header from '../components/Header';

interface Course {
  id: number;
  title: string;
  description: string;
  category: string;
  cover_image: string;
  is_active: boolean;
}

interface Subject {
  id: number;
  title: string;
  description: string;
  professor_name: string;
  hours: number;
  course_id: number;
  is_active: boolean;
}

interface CourseWithData extends Course {
  subjects: (Subject & { videos: Video[] })[];
  totalVideos: number;
  totalHours: number;
  professors: string[];
  firstVideo?: Video;
}

const CoursesPage: React.FC = () => {
  const { t } = useTranslation();
  const [courses, setCourses] = useState<CourseWithData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<number>>(new Set());
  const [expandedCourse, setExpandedCourse] = useState<number | null>(null);
  const [hoveredVideo, setHoveredVideo] = useState<Video | null>(null);
  const [previewTimeouts, setPreviewTimeouts] = useState<Map<number, NodeJS.Timeout>>(new Map());
  const [isVisible, setIsVisible] = useState(false);

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadCoursesData();
    // Trigger animations
    setTimeout(() => setIsVisible(true), 300);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMyEnrollments();
    } else {
      setEnrolledCourseIds(new Set());
    }
  }, [isAuthenticated]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      previewTimeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [previewTimeouts]);

  const fetchMyEnrollments = async () => {
    try {
      const res: any = await api.get('/user-courses/me');
      if (res && res.success) {
        const ids: number[] = res.courseIds || (res.courses || []).map((c: any) => c.id) || [];
        setEnrolledCourseIds(new Set(ids));
      } else if (Array.isArray(res)) {
        const ids = res.map((c: any) => c.id);
        setEnrolledCourseIds(new Set(ids));
      }
    } catch (err) {
      console.warn('Could not fetch enrollments:', err);
    }
  };

  const loadCoursesData = async () => {
    try {
      setLoading(true);
      setError('');

      const [coursesRes, subjectsRes, videosRes] = await Promise.all([
        api.get<Course[]>('/courses'),
        api.get<Subject[]>('/subjects'),
        videoService.getAllVideosWithSubjects()
      ]);

      const coursesWithData: CourseWithData[] = coursesRes
        .filter(course => course.is_active)
        .map(course => {
          const courseSubjects = subjectsRes.filter(s => s.course_id === course.id && s.is_active);
          const subjectsWithVideos = courseSubjects.map(subject => ({
            ...subject,
            videos: videosRes.filter(v => v.subject_id === subject.id)
          }));

          const totalVideos = subjectsWithVideos.reduce((sum, s) => sum + s.videos.length, 0);
          const totalHours = subjectsWithVideos.reduce((sum, s) => sum + s.hours, 0);
          const professorsSet: { [key: string]: boolean } = {};
          subjectsWithVideos.forEach(s => { professorsSet[s.professor_name] = true; });
          const professors = Object.keys(professorsSet);

          const firstVideo = subjectsWithVideos.find(s => s.videos.length > 0)?.videos[0];

          return {
            ...course,
            subjects: subjectsWithVideos,
            totalVideos,
            totalHours,
            professors,
            firstVideo
          };
        })
        .filter(course => course.totalVideos > 0);

      setCourses(coursesWithData);
    } catch (err) {
      console.error('❌ Error loading courses:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleVideoClick = (video: Video) => {
    const courseId = typeof video.course_id === 'number' ? video.course_id : undefined;
    const isEnrolled = typeof courseId === 'number' ? enrolledCourseIds.has(courseId) : false;

    if (!isAuthenticated) {
      navigate('/login', {
        state: {
          returnTo: `/courses?video=${video.id}`,
          message: t('courses.login_required_message', 'Please log in to watch the full video')
        }
      });
      return;
    }

    if (!isEnrolled) {
      alert(t('courses.alert_not_enrolled', "You are not enrolled in this course. Contact admin to request access."));
      return;
    }

    setSelectedVideo(video);
    setShowVideoPlayer(true);
  };

  const handleVideoHover = (video: Video, isHovering: boolean) => {
    const courseId = typeof video.course_id === 'number' ? video.course_id : undefined;
    const isEnrolled = typeof courseId === 'number' ? enrolledCourseIds.has(courseId) : false;

    if (!isAuthenticated || !isEnrolled) {
      return;
    }

    if (isHovering) {
      const existingTimeout = previewTimeouts.get(video.id);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      const timeout = setTimeout(() => {
        setHoveredVideo(video);
      }, 500);

      setPreviewTimeouts(new Map(previewTimeouts.set(video.id, timeout)));
    } else {
      const existingTimeout = previewTimeouts.get(video.id);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
        previewTimeouts.delete(video.id);
        setPreviewTimeouts(new Map(previewTimeouts));
      }
      setHoveredVideo(null);
    }
  };

  const closeVideoPlayer = () => {
    setShowVideoPlayer(false);
    setSelectedVideo(null);
  };

  const getCategoriesArray = (): string[] => {
    const categoriesSet: { [key: string]: boolean } = { all: true };
    courses.forEach(c => {
      if (c.category) categoriesSet[c.category] = true;
    });
    return Object.keys(categoriesSet);
  };

  const categories = getCategoriesArray();
  const filteredCourses = selectedCategory === 'all' ? courses : courses.filter(c => c.category === selectedCategory);

  if (loading) {
    return (
      <div className="courses-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">{t('courses.loading', 'Loading courses...')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="courses-page">
        <div className="courses-container">
          <div className="empty-state">
            <div className="empty-icon">⚠️</div>
            <h2 className="empty-title">{t('courses.error_title', 'Loading error')}</h2>
            <p className="empty-message">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="courses-page">
      <Header />

      <div className="courses-container">
        {/* Page Header */}
        <div className="courses-header">
          <h1 className="courses-title">{t('courses.page_title', 'Our Courses')}</h1>
          <p className="courses-subtitle">
            {t('courses.choose_count', 'Choose from {{count}} courses to boost your career', { count: courses.length })}
          </p>

          {/* Category Filter */}
          {categories.length > 1 && (
            <div className="category-filter">
              {categories.map(category => (
                <button
                  key={category}
                  className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category === 'all' ? t('courses.category_all', 'All courses') : category}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <h2 className="empty-title">{t('courses.no_courses_title', 'No courses available')}</h2>
            <p className="empty-message">
              {selectedCategory === 'all'
                ? t('courses.no_courses_message_all', 'Our courses are coming soon. Please check back later.')
                : t('courses.no_courses_message_category', 'No courses available in the "{{category}}" category.', { category: selectedCategory })
              }
            </p>
          </div>
        ) : (
          <div className="courses-grid">
            {filteredCourses.map((course, index) => {
              const isCourseEnrolled = enrolledCourseIds.has(course.id);
              const isExpanded = expandedCourse === course.id;
              const isHoveringThisVideo = hoveredVideo?.id === course.firstVideo?.id;

              return (
                <div
                  key={course.id}
                  className={`udemy-course-card ${isVisible ? 'animate-in' : ''}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Course Image with Enhanced Preview */}
                  <div
                    className="course-image-container"
                    onMouseEnter={() => course.firstVideo && handleVideoHover(course.firstVideo, true)}
                    onMouseLeave={() => course.firstVideo && handleVideoHover(course.firstVideo, false)}
                  >
                    {course.firstVideo && isHoveringThisVideo && isCourseEnrolled && isAuthenticated ? (
                      <VideoPreview
                        video={course.firstVideo}
                        maxDuration={15}
                        showPlayButton={false}
                        className="course-image"
                        onPreviewClick={() => handleVideoClick(course.firstVideo!)}
                      />
                    ) : course.firstVideo ? (
                      <VideoPreview
                        video={course.firstVideo}
                        maxDuration={0}
                        showPlayButton={false}
                        className="course-image"
                        onPreviewClick={() => {
                          if (!isAuthenticated) {
                            navigate('/login', {
                              state: {
                                returnTo: `/courses?video=${course.firstVideo?.id}`
                              }
                            });
                            return;
                          }
                          if (!isCourseEnrolled) {
                            alert(t('courses.alert_not_enrolled', "You are not enrolled in this course. Contact admin to request access."));
                            return;
                          }
                          if (course.firstVideo) {
                            handleVideoClick(course.firstVideo);
                          }
                        }}
                      />
                    ) : (
                      <div className="course-image" style={{
                        background: 'linear-gradient(135deg, #0066CC, #00D9A3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '28px'
                      }}>
                        📚
                      </div>
                    )}

                    <div className="course-preview-overlay">
                      <button
                        className="preview-play-btn"
                        onClick={() => {
                          if (!course.firstVideo) return;

                          if (!isAuthenticated) {
                            navigate('/login', {
                              state: {
                                returnTo: `/courses?video=${course.firstVideo.id}`
                              }
                            });
                            return;
                          }
                          if (!isCourseEnrolled) {
                            alert(t('courses.alert_not_enrolled', "You are not enrolled in this course. Contact admin to request access."));
                            return;
                          }
                          handleVideoClick(course.firstVideo);
                        }}
                      >
                        {isCourseEnrolled && isAuthenticated ? '▶' : '🔒'}
                      </button>
                    </div>

                  </div>

                  {/* Course Content */}
                  <div className="udemy-course-content">
                    <h3 className="udemy-course-title">{course.title}</h3>

                    <div className="udemy-course-instructor">
                      {course.professors.length > 0 ? course.professors.join(', ') : t('courses.instructor_placeholder', 'Instructor')}
                    </div>

                    <div className="udemy-course-meta">
                      <span>{t('courses.total_hours', '{{count}} hours total', { count: course.totalHours })}</span>
                      <span>•</span>
                      <span>{course.totalVideos} {t('courses.word_videos', 'courses')}</span>
                      <span>•</span>
                      <span>{t('courses.all_levels', 'All levels')}</span>
                    </div>

                    <div className="udemy-course-meta">
                      <span className={`enrollment-badge ${isCourseEnrolled ? 'enrolled' : 'locked'}`}>
                        {isCourseEnrolled ? t('courses.enrolled', 'Enrolled ✓') : t('courses.login_required', 'Login required 🔒')}
                      </span>
                    </div>

                    <div className="video-stats">
                      <span className="video-count">{course.totalVideos} {t('courses.word_videos', 'videos')}</span>
                      <button
                        className="watch-button"
                        disabled={!isCourseEnrolled}
                        onClick={() => setExpandedCourse(isExpanded ? null : course.id)}
                      >
                        {isExpanded ? t('courses.hide', 'Hide') : t('courses.view_content', 'View content')}
                      </button>
                    </div>

                    {/* Expandable Subject/Video List */}
                    {isExpanded && (
                      <div className="subject-dropdown">
                        {course.subjects.map((subject) => (
                          <div key={subject.id}>
                            <div className="subject-header-btn">
                              <span>{subject.title} ({subject.videos.length} {t('courses.word_videos_short', 'videos')})</span>
                              <span>{subject.hours}h</span>
                            </div>
                            <div className="subject-content">
                              {subject.videos.map((video) => (
                                <div
                                  key={video.id}
                                  className={`video-item ${!isCourseEnrolled ? 'locked' : ''}`}
                                  onClick={() => {
                                    if (!isAuthenticated) {
                                      navigate('/login', {
                                        state: {
                                          returnTo: `/courses?video=${video.id}`
                                        }
                                      });
                                      return;
                                    }
                                    if (!isCourseEnrolled) {
                                      alert(t('courses.alert_not_enrolled', "You are not enrolled in this course. Contact admin to request access."));
                                      return;
                                    }
                                    handleVideoClick(video);
                                  }}
                                  onMouseEnter={() => handleVideoHover(video, true)}
                                  onMouseLeave={() => handleVideoHover(video, false)}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                                    <span className="play-icon-small">
                                      {isCourseEnrolled ? '▶' : '🔒'}
                                    </span>
                                    <span className="video-title-small">{video.title}</span>
                                  </div>

                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Video Player Modal */}
      {showVideoPlayer && selectedVideo && (
        <div className="video-player-modal">
          <button className="close-video-btn" onClick={closeVideoPlayer}>
            ×
          </button>
          <div className="video-player-container">
            <ProfessionalVideoPlayer
              video={selectedVideo}
              isAuthenticated={isAuthenticated}
              onClose={closeVideoPlayer}
              className="w-full h-full"
              autoPlay={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursesPage;