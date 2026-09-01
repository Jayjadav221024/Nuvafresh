import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axiosInstance';
import { STORE_TOPICS, subscribeToStoreChanges } from '../lib/storeSync';

// Exported so the Admin Website Editor can wrap its live canvas with an
// unsaved-draft override provider (instant WYSIWYG preview while typing).
export const ContentContext = createContext();

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

    // Refetch when the Website Editor saves — in this window, in the editor's
    // preview iframe, or from the admin open in a completely separate tab.
    return subscribeToStoreChanges(STORE_TOPICS.CONTENT, fetchPublicContent);
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
