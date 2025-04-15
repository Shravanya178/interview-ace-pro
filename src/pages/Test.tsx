import React from 'react';

const Test = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: '#f9fafb',
      color: '#1f2937',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Basic Test Page</h1>
      <p style={{ marginBottom: '2rem' }}>This page doesn't use any hooks or context</p>
      
      <div style={{
        padding: '2rem',
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        maxWidth: '500px',
        width: '100%'
      }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Environment Information</h2>
        <pre style={{
          backgroundColor: '#f3f4f6',
          padding: '1rem',
          borderRadius: '0.25rem',
          overflowX: 'auto',
          fontSize: '0.875rem'
        }}>
          {JSON.stringify({
            userAgent: navigator.userAgent,
            windowDimensions: {
              width: window.innerWidth,
              height: window.innerHeight
            },
            timestamp: new Date().toISOString(),
            reactAvailable: typeof React !== 'undefined'
          }, null, 2)}
        </pre>
        
        <button 
          onClick={() => alert('Button click works!')}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '0.25rem',
            cursor: 'pointer'
          }}
        >
          Test Button
        </button>
      </div>
    </div>
  );
};

export default Test; 