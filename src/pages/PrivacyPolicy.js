import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const PrivacyPolicy = () => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const response = await api.get('/static/privacy-policy');
      setContent(response.data.content);
    } catch (error) {
      console.error('Error fetching privacy policy:', error);
      setContent(`
        <h1>Privacy Policy</h1>
        <p>Last updated: ${new Date().toLocaleDateString()}</p>
        
        <h2>Information We Collect</h2>
        <p>We collect information you provide directly to us, such as when you create an account, make a reservation, or contact us.</p>
        
        <h2>How We Use Your Information</h2>
        <p>We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.</p>
        
        <h2>Information Sharing</h2>
        <p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent.</p>
        
        <h2>Data Security</h2>
        <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
        
        <h2>Contact Us</h2>
        <p>If you have any questions about this Privacy Policy, please contact us through our contact form.</p>
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

export default PrivacyPolicy;