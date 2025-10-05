import React from 'react';
import ArticleManager from '../components/ArticleManager';

const ArticleManagerPage = ({ articles, loading, onProcessArticles }) => {
  return (
    <div className="page-container">
      <ArticleManager articles={articles} loading={loading} onProcessArticles={onProcessArticles} />
    </div>
  );
};

export default ArticleManagerPage;
