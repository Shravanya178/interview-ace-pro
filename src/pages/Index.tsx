// Update this page (the content is just a fallback if you fail to update the page)

import React from 'react';
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: '#2563eb', fontSize: '2.5rem', marginBottom: '1rem' }}>
        PrepMate
      </h1>
      <h2 style={{ marginBottom: '2rem', fontWeight: 'normal' }}>
        Debug Mode - Testing Page
      </h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px' }}>
        <Link to="/" style={{
          padding: '10px 15px',
          backgroundColor: '#2563eb',
          color: 'white',
          borderRadius: '5px',
          textDecoration: 'none',
          textAlign: 'center'
        }}>
          Go to Landing Page
        </Link>
        
        <Link to="/dashboard" style={{
          padding: '10px 15px',
          backgroundColor: '#4b5563',
          color: 'white',
          borderRadius: '5px',
          textDecoration: 'none',
          textAlign: 'center'
        }}>
          Go to Dashboard
        </Link>
      </div>
      
      <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '5px' }}>
        <h3 style={{ marginBottom: '0.5rem' }}>Troubleshooting Info:</h3>
        <p>Browser: {navigator.userAgent}</p>
        <p>Window Size: {window.innerWidth}x{window.innerHeight}</p>
        <p>React Router working: {typeof Link !== 'undefined' ? '✅' : '❌'}</p>
      </div>
    </div>
  );
};

export default Index;
