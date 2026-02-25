import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSites } from "../context/SitesContext";
import {
  Plus,
  Edit3,
  Trash2,
  Globe,
  GlobeLock,
  ExternalLink,
  Users,
  Calendar,
  Copy,
  CheckCircle2,
  BarChart3,
} from "lucide-react";
import { useState } from "react";
import { templates } from "../data/templates";

export default function Dashboard() {
  const { user } = useAuth();
  const {
    getUserSites,
    deleteSite,
    publishSite,
    unpublishSite,
    getRSVPResponses,
  } = useSites();
  const navigate = useNavigate();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showResponses, setShowResponses] = useState<string | null>(null);

  if (!user) {
    navigate("/auth");
    return null;
  }

  const userSites = getUserSites(user.id);

  const getTemplateInfo = (templateId: string) => {
    return templates.find((t) => t.id === templateId);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const months = [
      "янв",
      "фев",
      "мар",
      "апр",
      "мая",
      "июн",
      "июл",
      "авг",
      "сен",
      "окт",
      "ноя",
      "дек",
    ];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const copyLink = (siteId: string) => {
    // Construct the URL based on HashRouter pattern
    const baseUrl = window.location.href.split("#")[0];
    const url = `${baseUrl}#/p/${siteId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(siteId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleDelete = (siteId: string) => {
    if (confirm("Вы уверены, что хотите удалить этот сайт?")) {
      deleteSite(siteId);
    }
  };

  const responses = showResponses ? getRSVPResponses(showResponses) : [];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Мои сайты</h1>
            <p className="text-gray-500 mt-1">
              Управляйте вашими приглашениями
            </p>
          </div>
          <Link
            to="/new"
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-indigo-200 transition-all hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            Создать новый
          </Link>
        </div>

        {/* Sites list */}
        {userSites.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center">
            <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-10 h-10 text-indigo-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              У вас пока нет сайтов
            </h3>
            <p className="text-gray-500 mb-6">
              Создайте своё первое приглашение прямо сейчас!
            </p>
            <Link
              to="/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              Создать приглашение
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {userSites.map((site) => {
              const tpl = getTemplateInfo(site.templateId);
              const rsvpCount = getRSVPResponses(site.id).length;
              return (
                <div
                  key={site.id}
                  className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:shadow-indigo-50 transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Preview */}
                    <div
                      className={`w-full lg:w-24 h-20 lg:h-16 rounded-xl bg-gradient-to-br ${tpl?.previewGradient || "from-gray-100 to-gray-200"} flex items-center justify-center flex-shrink-0`}
                    >
                      <span className="text-3xl">
                        {tpl?.previewEmoji || "📄"}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-gray-900 text-lg truncate">
                          {site.config.names || site.config.title}
                        </h3>
                        {site.published ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-green-50 text-green-600 text-xs font-semibold rounded-full">
                            <Globe className="w-3 h-3" />
                            Опубликован
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-gray-100 text-gray-500 text-xs font-semibold rounded-full">
                            <GlobeLock className="w-3 h-3" />
                            Черновик
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                        <span>{tpl?.name}</span>
                        <span>·</span>
                        <span>Создан {formatDate(site.createdAt)}</span>
                        {site.config.date && (
                          <>
                            <span>·</span>
                            <span>Событие: {formatDate(site.config.date)}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    {rsvpCount > 0 && (
                      <button
                        onClick={() =>
                          setShowResponses(
                            showResponses === site.id ? null : site.id,
                          )
                        }
                        className="flex items-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors"
                      >
                        <Users className="w-4 h-4" />
                        {rsvpCount} ответ(ов)
                        <BarChart3 className="w-4 h-4" />
                      </button>
                    )}

                    {/* Actions - исправлено для мобильных */}
                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap sm:flex-shrink-0 justify-end">
                      <Link
                        to={`/editor/${site.id}`}
                        className="flex items-center gap-1.5 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span className="hidden xs:inline">Редактировать</span>
                      </Link>

                      {site.published ? (
                        <>
                          <button
                            onClick={() => copyLink(site.id)}
                            className="flex items-center gap-1.5 px-3 py-2 bg-green-50 text-green-600 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors"
                            title="Скопировать ссылку"
                          >
                            {copiedId === site.id ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                          <Link
                            to={`/p/${site.id}`}
                            target="_blank"
                            className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                            title="Открыть сайт"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => unpublishSite(site.id)}
                            className="flex items-center gap-1.5 px-3 py-2 bg-yellow-50 text-yellow-600 rounded-lg text-sm font-medium hover:bg-yellow-100 transition-colors"
                            title="Снять с публикации"
                          >
                            <GlobeLock className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => publishSite(site.id)}
                          className="flex items-center gap-1.5 px-3 py-2 bg-green-50 text-green-600 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors"
                          title="Опубликовать"
                        >
                          <Globe className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(site.id)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-500 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                        title="Удалить"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* RSVP Responses */}
                  {showResponses === site.id && responses.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100 animate-slide-down">
                      <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Ответы гостей ({responses.length})
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-left text-gray-400 border-b border-gray-100">
                              <th className="pb-2 pr-4 font-medium">Имя</th>
                              <th className="pb-2 pr-4 font-medium">Телефон</th>
                              <th className="pb-2 pr-4 font-medium">Статус</th>
                              <th className="pb-2 pr-4 font-medium">Гостей</th>
                              <th className="pb-2 font-medium">Сообщение</th>
                            </tr>
                          </thead>
                          <tbody>
                            {responses.map((r) => (
                              <tr
                                key={r.id}
                                className="border-b border-gray-50"
                              >
                                <td className="py-2 pr-4 font-medium text-gray-700">
                                  {r.name}
                                </td>
                                <td className="py-2 pr-4 text-gray-500">
                                  {r.phone || "—"}
                                </td>
                                <td className="py-2 pr-4">
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                      r.attendance === "yes"
                                        ? "bg-green-50 text-green-600"
                                        : r.attendance === "no"
                                          ? "bg-red-50 text-red-500"
                                          : "bg-yellow-50 text-yellow-600"
                                    }`}
                                  >
                                    {r.attendance === "yes"
                                      ? "Придёт"
                                      : r.attendance === "no"
                                        ? "Не придёт"
                                        : "Может быть"}
                                  </span>
                                </td>
                                <td className="py-2 pr-4 text-gray-500">
                                  {r.guestsCount}
                                </td>
                                <td className="py-2 text-gray-500 truncate max-w-xs">
                                  {r.message || "—"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="mt-3 flex gap-4 text-sm">
                        <span className="text-green-600">
                          ✓ Придут:{" "}
                          {
                            responses.filter((r) => r.attendance === "yes")
                              .length
                          }
                        </span>
                        <span className="text-red-500">
                          ✗ Не придут:{" "}
                          {
                            responses.filter((r) => r.attendance === "no")
                              .length
                          }
                        </span>
                        <span className="text-yellow-600">
                          ? Может быть:{" "}
                          {
                            responses.filter((r) => r.attendance === "maybe")
                              .length
                          }
                        </span>
                        <span className="text-gray-500">
                          Всего гостей:{" "}
                          {responses
                            .filter((r) => r.attendance !== "no")
                            .reduce((sum, r) => sum + r.guestsCount, 0)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
