import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { SiteData, RSVPResponse } from '../types';
import SiteRenderer from '../components/SiteRenderer';
import { AlertCircle, Loader2 } from 'lucide-react';

export default function PublishedSite() {
  const { id } = useParams<{ id: string }>();
  const [site, setSite] = useState<SiteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Загружаем данные напрямую из localStorage, чтобы работало в отдельной вкладке
  useEffect(() => {
    if (!id) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    try {
      const stored = localStorage.getItem('invitecraft_sites');
      if (stored) {
        const sites: SiteData[] = JSON.parse(stored);
        const foundSite = sites.find(s => s.id === id);
        if (foundSite) {
          setSite(foundSite);
        } else {
          setNotFound(true);
        }
      } else {
        setNotFound(true);
      }
    } catch {
      setNotFound(true);
    }
    setLoading(false);
  }, [id]);

  const addRSVPResponse = (response: Omit<RSVPResponse, 'id' | 'createdAt'>) => {
    try {
      const stored = localStorage.getItem('invitecraft_rsvp');
      const responses: RSVPResponse[] = stored ? JSON.parse(stored) : [];
      const newResponse: RSVPResponse = {
        ...response,
        id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
        createdAt: new Date().toISOString(),
      };
      responses.push(newResponse);
      localStorage.setItem('invitecraft_rsvp', JSON.stringify(responses));
    } catch {
      console.error('Failed to save RSVP response');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-gray-400" />
      </div>
    );
  }

  if (notFound || !site) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Сайт не найден</h1>
          <p className="text-gray-500 mb-4">Этот сайт не существует или был удалён</p>
          <a 
            href="/"
            className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            На главную
          </a>
        </div>
      </div>
    );
  }

  if (!site.published) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Сайт не опубликован</h1>
          <p className="text-gray-500 mb-4">Автор ещё не опубликовал это приглашение</p>
          <a 
            href="/"
            className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            На главную
          </a>
        </div>
      </div>
    );
  }

  return (
    <SiteRenderer
      config={site.config}
      siteId={site.id}
      onRSVPSubmit={addRSVPResponse}
    />
  );
}
