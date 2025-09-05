import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabase';
import './NewsDetail.css';

const NewsDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const articleId = useMemo(() => {
    if (typeof id === 'string' && id.trim().length > 0) return id.trim();
    return null;
  }, [id]);

  const [article, setArticle] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchArticle = async () => {
      if (!articleId) {
        setErrorMessage('Invalid article id.');
        return;
      }
      setIsLoading(true);
      setErrorMessage('');
      try {
        const { data, error } = await supabase
          .from('health_news')
          .select('*')
          .eq('id', articleId)
          .single();

        if (error) throw error;
        setArticle(data);
      } catch (error) {
        setErrorMessage(error?.message || 'Failed to load article.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticle();
  }, [articleId]);

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="news-detail-page">
      <div className="news-detail-container">
        <div className="news-detail-header">
          <button className="back-button" onClick={handleBack} aria-label="Go back">
            ← Back
          </button>
        </div>

        {isLoading && (
          <div className="detail-loading">Loading article...</div>
        )}

        {errorMessage && !isLoading && (
          <div className="detail-error">
            <p>{errorMessage}</p>
          </div>
        )}

        {article && !isLoading && (
          <article className="news-detail-content" aria-labelledby="news-title">
            <header className="news-detail-title-block">
              <h1 id="news-title" className="news-detail-title">{article.title || 'Untitled Article'}</h1>
              <div className="news-detail-meta">
                <span className="news-detail-date">
                  {article.created_at ? new Date(article.created_at).toLocaleString() : 'No date available'}
                </span>
                {article.author && (
                  <span className="news-detail-author">By {article.author}</span>
                )}
              </div>
              {article.summary && (
                <p className="news-detail-summary">{article.summary}</p>
              )}
            </header>

            {article.image_url && (
              <figure className="news-detail-figure">
                <img src={article.image_url} alt={article.title || 'Article image'} />
              </figure>
            )}

            {article.content && (
              <section className="news-detail-body">
                <pre className="news-detail-text">
{article.content}
                </pre>
              </section>
            )}
          </article>
        )}
      </div>
    </div>
  );
};

export default NewsDetail;


