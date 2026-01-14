import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const TermsConditions = () => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const response = await api.get('/static/terms-conditions');
      setContent(response.data.content);
    } catch (error) {
      console.error('Error fetching terms and conditions:', error);
      setContent(`
        <h1>Terms & Conditions</h1>
        <p>Last updated: ${new Date().toLocaleDateString()}</p>
        
        <h2>Acceptance of Terms</h2>
        <p>By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.</p>
        
        <h2>Use License</h2>
        <p>Permission is granted to temporarily download one copy of the materials on our website for personal, non-commercial transitory viewing only.</p>
        
        <h2>Disclaimer</h2>
        <p>The materials on our website are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties.</p>
        
        <h2>Limitations</h2>
        <p>In no event shall our company or its suppliers be liable for any damages arising out of the use or inability to use the materials on our website.</p>
        
        <h2>Accuracy of Materials</h2>
        <p>The materials appearing on our website could include technical, typographical, or photographic errors. We do not warrant that any of the materials on its website are accurate, complete, or current.</p>
        
        <h2>Modifications</h2>
        <p>We may revise these terms of service for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.</p>
      `);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-8">
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsConditions;