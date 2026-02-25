import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSites } from '../context/SitesContext';
import { templates } from '../data/templates';
import { ArrowLeft, CheckCircle2, Sparkles } from 'lucide-react';

export default function TemplatePicker() {
  const { user } = useAuth();
  const { createSite } = useSites();
  const navigate = useNavigate();

  if (!user) {
    navigate('/auth');
    return null;
  }

  const handleSelect = (templateId: string) => {
    const site = createSite(templateId, user.id);
    navigate(`/editor/${site.id}`);
  };

  const categories = [...new Set(templates.map(t => t.category))];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад к моим сайтам
        </button>

        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span className="text-sm text-indigo-600 font-medium">Шаг 1 из 2</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Выберите шаблон</h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Выберите дизайн, который лучше всего подходит для вашего мероприятия.
            Вы сможете полностью настроить его под себя.
          </p>
        </div>

        {categories.map(category => (
          <div key={category} className="mb-12">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              {category}
              <span className="text-sm font-normal text-gray-400">
                ({templates.filter(t => t.category === category).length} шаблонов)
              </span>
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.filter(t => t.category === category).map(tpl => (
                <button
                  key={tpl.id}
                  onClick={() => handleSelect(tpl.id)}
                  className="group bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500 hover:-translate-y-2 text-left"
                >
                  <div className={`h-48 bg-gradient-to-br ${tpl.previewGradient} flex items-center justify-center relative overflow-hidden`}>
                    <span className="text-7xl group-hover:scale-110 transition-transform duration-500">{tpl.previewEmoji}</span>
                    <div className="absolute inset-0 bg-indigo-500/0 group-hover:bg-indigo-500/10 transition-colors flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full p-3 shadow-lg">
                        <CheckCircle2 className="w-8 h-8 text-indigo-500" />
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                      {tpl.name}
                    </h3>
                    <p className="text-sm text-gray-500">{tpl.description}</p>
                    <div className="mt-4 flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full border-2 border-white shadow" style={{ backgroundColor: tpl.defaultConfig.colorPrimary }} />
                      <div className="w-5 h-5 rounded-full border-2 border-white shadow" style={{ backgroundColor: tpl.defaultConfig.colorAccent }} />
                      <div className="w-5 h-5 rounded-full border-2 border-white shadow" style={{ backgroundColor: tpl.defaultConfig.colorSecondary }} />
                      <span className="text-xs text-gray-400 ml-1">Цветовая палитра</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
