import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { courseService } from '../lib/courses';
import { blogService } from '../lib/blog';
import Header from '../components/Header';
import Loading from '../components/Loading';
import { resolveMediaUrl } from '../lib/media';
import '../styles/HomePage.css';

const DATA_URI_PLACEHOLDER = "/assets/courses.jpg";

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const [courses, setCourses] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const HERO_IMAGE_PATH = '/assets/devopslogocopy.png';


  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [coursesResponseRaw, articlesResponseRaw] = (await Promise.all([
          courseService.getCourses(),
          blogService.getBlogPosts()
        ])) as any[];

        const coursesArray: any[] = Array.isArray(coursesResponseRaw) ? coursesResponseRaw : (coursesResponseRaw?.data || coursesResponseRaw?.courses || coursesResponseRaw?.items || []);
        const aResp: any = articlesResponseRaw;
        const articlesArray: any[] = Array.isArray(aResp) ? aResp : (aResp && (aResp.posts || aResp.data || aResp.items || aResp.results)) || [];

        setCourses((coursesArray || []).slice(0, 3));
        setArticles((articlesArray || []).slice(0, 3));
      } catch (err) {
        console.error('Failed to fetch homepage data:', err);
        setError(t('homepage.error_loading', 'Failed to load content. Please try again later.'));
        setCourses([]);
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    setTimeout(() => setIsVisible(true), 300);

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [t]);

  if (loading) return <Loading />;

  const buildImgSrc = (rawPath: any, placeholder = '/api/placeholder/400/200') => {
    if (!rawPath) return resolveMediaUrl(undefined, placeholder);
    if (typeof rawPath !== 'string') return resolveMediaUrl(undefined, placeholder);
  
    // 👉 If it's from /assets, return as-is
    if (rawPath.startsWith('/assets/')) return rawPath;
  
    if (rawPath.startsWith('http://') || rawPath.startsWith('https://')) return rawPath;
    const normalized = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
    return resolveMediaUrl(normalized, placeholder);
  };
  

  const getCourseImageSrc = (course: any) => {
    const imageFields = [
      'thumbnail',
      'thumbnail_url',
      'cover_image',
      'cover_image_thumb',
      'image',
      'picture',
      'media_url'
    ];
    for (const field of imageFields) {
      if (course[field]) return buildImgSrc(course[field], '/api/placeholder/400/200');
    }
    return DATA_URI_PLACEHOLDER;
  };

  return (
    <div className="homepage-container">
      <Header />

      {/* Hero Section */}
      <section className="hero-section" aria-label={t('hero.section_label', 'Hero')}>
        <div className="hero-grid" />

        <div className="particles-container">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className={`particle particle-${i % 5}`}
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${4 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>

        <div className="hero-bg-shapes">
          <div
            className="bg-shape shape-1"
            style={{
              transform: `translate(${mousePosition.x * 10}px, ${mousePosition.y * 10}px) rotate(${mousePosition.x * 2}deg)`
            }}
          />
          <div
            className="bg-shape shape-2"
            style={{
              transform: `translate(${mousePosition.x * -8}px, ${mousePosition.y * -8}px) rotate(${mousePosition.y * -1.5}deg)`
            }}
          />
          <div
            className="bg-shape shape-3"
            style={{
              transform: `translate(${mousePosition.x * 5}px, ${mousePosition.y * 12}px)`
            }}
          />
        </div>

        <div className="hero-content">
          <div className="container">
            <div className="hero-layout">
              <div className={`hero-text ${isVisible ? 'animate-in' : ''}`}>
                <div className="hero-badge">
                  <span className="badge-icon">{t('hero.badge_icon', '⚖️')}</span>
                  <span className="badge-text">{t('hero.badge_text', "L'éducation Juridique Premium")}</span>
                  <div className="badge-glow" />
                </div>

                <h1 className="hero-title" aria-label={t('hero.title_aria', "L'éducation Juridique Moderne, À Portée De Main")}>
                  <span className="title-line">{t('hero.title_part1', "L'éducation")}</span>
                  <span className="title-highlight">{t('hero.title_highlight', "Juridique")}</span>
                  <span className="title-line">{t('hero.title_part3', "Moderne,")}</span>
                  <span className="title-accent">{t('hero.title_accent', "À Portée De Main")}</span>
                </h1>

                <p className="hero-description">
                  {t('hero.description', "DevOps Academy - Master CI/CD, Cloud Computing, and modern DevOps practices. Expert-led training for your success.")}
                </p>

                <div className="hero-actions">
                  <Link to="/courses" className="cta-primary">
                    <span className="btn-bg" />
                    <span className="btn-text">{t('buttons.cta_more', 'En savoir plus')}</span>
                    <div className="btn-shine" />
                  </Link>

                  <Link to="/contact" className="cta-secondary">
                    <span className="btn-text">{t('buttons.contact_us', 'Nous contacter')}</span>
                    <div className="btn-border-animation" />
                  </Link>
                </div>
              </div>

              {/* Right visual */}
              <div className={`hero-visual ${isVisible ? 'animate-in' : ''}`}>
                <div className="visual-container">
                  <div className="hero-image-wrapper">
                    <div className="hero-image-glow" />
                    <img
                      src={buildImgSrc(HERO_IMAGE_PATH, '/api/placeholder/600/400')}
                      alt={t('hero.image_alt', 'DevOps Academy')}
                      className="hero-main-image"
                      onError={(e: any) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = DATA_URI_PLACEHOLDER;
                      }}
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="why-choose-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">{t('why.title', 'Why Choose DevOps Academy')}</h2>
          </div>

          <div className="features-grid">
            <div className={`feature-card ${isVisible ? 'animate-in' : ''}`} style={{ animationDelay: '0.1s' }}>
              <div className="feature-icon">
                <div className="icon-bg blue">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14,2 14,8 20,8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                </div>
              </div>
              <h3 className="feature-title">{t('features.title1', 'Contenu structuré et clair')}</h3>
              <p className="feature-description">{t('features.desc1', 'Des modules pédagogiques organisés par des experts du droit')}</p>
              <div className="feature-glow" />
            </div>

            <div className={`feature-card ${isVisible ? 'animate-in' : ''}`} style={{ animationDelay: '0.2s' }}>
              <div className="feature-icon">
                <div className="icon-bg green">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 11H5a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2h-4" />
                    <polyline points="9,11 12,14 15,11" />
                    <line x1="12" y1="2" x2="12" y2="14" />
                  </svg>
                </div>
              </div>
              <h3 className="feature-title">{t('features.title2', 'Apprenez à votre rythme')}</h3>
              <p className="feature-description">{t('features.desc2', 'Accès illimité, cours disponibles 24h/24, 7j/7 on the App')}</p>
              <div className="feature-glow" />
            </div>

            <div className={`feature-card ${isVisible ? 'animate-in' : ''}`} style={{ animationDelay: '0.3s' }}>
              <div className="feature-icon">
                <div className="icon-bg purple">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </div>
              </div>
              <h3 className="feature-title">{t('features.title3', 'Objectif concours & réussite')}</h3>
              <p className="feature-description">{t('features.desc3', 'Préparation intensive pour les épreuves écrites CRFPA et orales')}</p>
              <div className="feature-glow" />
            </div>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="courses-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">{t('courses.title', 'Nos cours')}</h2>
            <p className="section-subtitle">
              {t('courses.subtitle', "Améliorer significativement vos formations les plus efficaces, mises à jour par nos enseignants.")}
            </p>
          </div>

          {courses.length === 0 ? (
            <div className="empty-state">
              <div className="empty-animation">📚</div>
              <p>{t('courses.empty_title', 'Nos cours arrivent bientôt!')}</p>
            </div>
          ) : (
            <>
              <div className="courses-grid">
                {courses.map((course, index) => {
                  const imgSrc = getCourseImageSrc(course);

                  return (
                    <div
                      key={course.id ?? index}
                      className={`course-card ${isVisible ? 'animate-in' : ''}`}
                      style={{ animationDelay: `${index * 0.15}s` }}
                    >
                      <div className="course-image-container">
                        <img
                          src={imgSrc}
                          alt={course.title || t('courses.untitled', 'Course')}
                          className="course-image"
                          onError={(e: any) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = DATA_URI_PLACEHOLDER;
                          }}
                          loading="lazy"
                        />

                        <div className="course-overlay">
                          <Link to={`/courses/${course.id}`} className="course-link">
                            <span>{t('courses.view_course', 'Voir le cours')}</span>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M7 17L17 7M17 7H7M17 7V17" />
                            </svg>
                          </Link>
                        </div>
                        <div className="course-badge">{t('courses.badge_new', 'Nouveau')}</div>
                      </div>

                      <div className="course-content">
                        <h3 className="course-title">{course.title || t('courses.untitled', 'Untitled Course')}</h3>
                        <p className="course-description">
                          {course.description || t('courses.description_placeholder', 'Description will be available soon.')}
                        </p>
                      </div>

                      <div className="card-glow" />
                    </div>
                  );
                })}
              </div>

              <div className="section-footer">
                <Link to="/courses" className="view-all-btn">
                  <span>{t('courses.view_all', 'Voir Tous')}</span>
                  <div className="btn-arrow">→</div>
                  <div className="btn-ripple" />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Articles Section */}
      <section className="articles-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">{t('articles.title', 'Derniers articles')}</h2>
            <p className="section-subtitle">{t('articles.subtitle', 'Découvrez nos conseils, actualités juridiques et ressources pédagogiques.')}</p>
          </div>

          {articles.length === 0 ? (
            <div className="empty-state">
              <div className="empty-animation">✍️</div>
              <p>{t('articles.empty_title', 'Nos articles arrivent bientôt!')}</p>
            </div>
          ) : (
            <>
              <div className="articles-grid">
                {articles.map((article, index) => {
                  const imgSrc = buildImgSrc(article.cover_image_thumb || article.cover_image || undefined, '/api/placeholder/480/240');
                  return (
                    <div
                      key={article.id ?? index}
                      className={`article-card ${isVisible ? 'animate-in' : ''}`}
                      style={{ animationDelay: `${index * 0.2}s` }}
                    >
                      <div className="article-image-container">
                        <img
                          src={imgSrc}
                          alt={article.title}
                          className="article-image"
                          onError={(e: any) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = DATA_URI_PLACEHOLDER;
                          }}
                          loading="lazy"
                        />
                        <div className="article-overlay" />
                      </div>

                      <div className="article-content">
                        <div className="article-meta">
                          <span className="article-date">{article.created_at ? new Date(article.created_at).toLocaleDateString() : '—'}</span>
                        </div>
                        <h3 className="article-title">{article.title || t('articles.untitled', 'Untitled Article')}</h3>
                        <p className="article-excerpt">{article.excerpt || t('articles.excerpt_placeholder', 'Article excerpt will appear here.')}</p>
                      </div>

                      <div className="card-hover-effect" />
                    </div>
                  );
                })}
              </div>

              <div className="section-footer">
                <Link to="/blog" className="view-all-btn">
                  <span>{t('articles.view_all', 'Voir Tous')}</span>
                  <div className="btn-arrow">→</div>
                  <div className="btn-ripple" />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

    </div>
  );
};

export default HomePage;