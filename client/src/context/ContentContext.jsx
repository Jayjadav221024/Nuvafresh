import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axiosInstance';

const ContentContext = createContext();

export const ContentProvider = ({ children }) => {
  const [sections, setSections] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchPublicContent = async () => {
    try {
      const { data } = await API.get('/admin/content/sections');
      if (data.success && data.sections) {
        const mapped = {};
        data.sections.forEach((sec) => {
          mapped[sec.sectionKey] = sec.fields || sec.defaultFields || {};
        });
        setSections(mapped);
      }
    } catch (e) {
      console.log('Using default fallback content context');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicContent();

    // Listen for live CMS updates from Admin WebsiteEditor iframe or same-window changes
    const handleMessage = (e) => {
      if (e.data && (e.data.type === 'NUVA_CMS_UPDATED' || e.data.type === 'NUVA_SECTION_SAVED')) {
        fetchPublicContent();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Helper function to get a field with fallback default
  const getContent = (sectionKey, fieldName, fallbackValue) => {
    if (sections[sectionKey] && sections[sectionKey][fieldName] !== undefined && sections[sectionKey][fieldName] !== '') {
      return sections[sectionKey][fieldName];
    }
    return fallbackValue;
  };

  // Helper to get an entire section object
  const getSection = (sectionKey, fallbackObj = {}) => {
    return sections[sectionKey] || fallbackObj;
  };

  return (
    <ContentContext.Provider value={{ sections, getContent, getSection, refreshContent: fetchPublicContent, loading }}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => useContext(ContentContext);
