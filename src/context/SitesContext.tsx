import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { SiteData, RSVPResponse, SiteConfig } from '../types';
import { templates } from '../data/templates';

interface SitesContextType {
  sites: SiteData[];
  createSite: (templateId: string, userId: string) => SiteData;
  updateSite: (id: string, config: Partial<SiteConfig>) => void;
  updateSiteMeta: (id: string, updates: Partial<SiteData>) => void;
  deleteSite: (id: string) => void;
  getSite: (id: string) => SiteData | undefined;
  getUserSites: (userId: string) => SiteData[];
  publishSite: (id: string) => void;
  unpublishSite: (id: string) => void;
  rsvpResponses: RSVPResponse[];
  addRSVPResponse: (response: Omit<RSVPResponse, 'id' | 'createdAt'>) => void;
  getRSVPResponses: (siteId: string) => RSVPResponse[];
}

const SitesContext = createContext<SitesContextType | null>(null);

export function SitesProvider({ children }: { children: ReactNode }) {
  const [sites, setSites] = useState<SiteData[]>([]);
  const [rsvpResponses, setRsvpResponses] = useState<RSVPResponse[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('invitecraft_sites');
      if (stored) setSites(JSON.parse(stored));
    } catch { /* empty */ }
    try {
      const stored = localStorage.getItem('invitecraft_rsvp');
      if (stored) setRsvpResponses(JSON.parse(stored));
    } catch { /* empty */ }
  }, []);

  useEffect(() => {
    localStorage.setItem('invitecraft_sites', JSON.stringify(sites));
  }, [sites]);

  useEffect(() => {
    localStorage.setItem('invitecraft_rsvp', JSON.stringify(rsvpResponses));
  }, [rsvpResponses]);

  const createSite = (templateId: string, userId: string): SiteData => {
    const template = templates.find(t => t.id === templateId);
    if (!template) throw new Error('Template not found');
    const id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    const newSite: SiteData = {
      id,
      userId,
      templateId,
      published: false,
      slug: id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      config: { ...template.defaultConfig, sections: template.defaultConfig.sections.map(s => ({ ...s })) },
    };
    setSites(prev => [...prev, newSite]);
    return newSite;
  };

  const updateSite = useCallback((id: string, config: Partial<SiteConfig>) => {
    setSites(prev => prev.map(s =>
      s.id === id
        ? { ...s, config: { ...s.config, ...config }, updatedAt: new Date().toISOString() }
        : s
    ));
  }, []);

  const updateSiteMeta = useCallback((id: string, updates: Partial<SiteData>) => {
    setSites(prev => prev.map(s =>
      s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
    ));
  }, []);

  const deleteSite = (id: string) => {
    setSites(prev => prev.filter(s => s.id !== id));
    setRsvpResponses(prev => prev.filter(r => r.siteId !== id));
  };

  const getSite = useCallback((id: string) => {
    return sites.find(s => s.id === id);
  }, [sites]);

  const getUserSites = useCallback((userId: string) => {
    return sites.filter(s => s.userId === userId);
  }, [sites]);

  const publishSite = (id: string) => {
    setSites(prev => prev.map(s =>
      s.id === id ? { ...s, published: true, updatedAt: new Date().toISOString() } : s
    ));
  };

  const unpublishSite = (id: string) => {
    setSites(prev => prev.map(s =>
      s.id === id ? { ...s, published: false, updatedAt: new Date().toISOString() } : s
    ));
  };

  const addRSVPResponse = (response: Omit<RSVPResponse, 'id' | 'createdAt'>) => {
    const newResponse: RSVPResponse = {
      ...response,
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      createdAt: new Date().toISOString(),
    };
    setRsvpResponses(prev => [...prev, newResponse]);
  };

  const getRSVPResponses = useCallback((siteId: string) => {
    return rsvpResponses.filter(r => r.siteId === siteId);
  }, [rsvpResponses]);

  return (
    <SitesContext.Provider value={{
      sites, createSite, updateSite, updateSiteMeta, deleteSite, getSite, getUserSites,
      publishSite, unpublishSite, rsvpResponses, addRSVPResponse, getRSVPResponses,
    }}>
      {children}
    </SitesContext.Provider>
  );
}

export function useSites() {
  const ctx = useContext(SitesContext);
  if (!ctx) throw new Error('useSites must be used within SitesProvider');
  return ctx;
}
