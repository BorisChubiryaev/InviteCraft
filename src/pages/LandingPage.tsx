import { Link } from "react-router-dom";
import { templates } from "../data/templates";
import { useAuth } from "../context/AuthContext";
import {
  Sparkles,
  Clock,
  MapPin,
  Image,
  Heart,
  Send,
  Palette,
  ArrowRight,
  Star,
  Zap,
  Shield,
  Globe,
} from "lucide-react";

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: Palette,
      title: "Красивые шаблоны",
      desc: "Выберите из коллекции профессионально разработанных шаблонов",
    },
    {
      icon: Clock,
      title: "Обратный отсчёт",
      desc: "Автоматический таймер до вашего мероприятия",
    },
    {
      icon: MapPin,
      title: "Яндекс Карта",
      desc: "Интерактивная карта с местом проведения",
    },
    {
      icon: Image,
      title: "Фотогалерея",
      desc: "Покажите ваши лучшие фотографии",
    },
    {
      icon: Send,
      title: "RSVP онлайн",
      desc: "Гости подтвердят участие прямо на сайте",
    },
    {
      icon: Heart,
      title: "Полная кастомизация",
      desc: "Настройте цвета, шрифты и содержание",
    },
  ];

  const steps = [
    {
      num: "01",
      title: "Выберите шаблон",
      desc: "Подберите дизайн, подходящий под стиль вашего мероприятия",
    },
    {
      num: "02",
      title: "Настройте под себя",
      desc: "Добавьте фото, текст, детали и настройте цвета",
    },
    {
      num: "03",
      title: "Опубликуйте",
      desc: "Поделитесь ссылкой с гостями одним кликом",
    },
  ];

  const stats = [
    { icon: Star, value: "6+", label: "Шаблонов" },
    { icon: Zap, value: "5 мин", label: "На создание" },
    { icon: Shield, value: "100%", label: "Бесплатно" },
    { icon: Globe, value: "∞", label: "Приглашений" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float delay-200" />
        <div className="absolute top-40 right-40 w-48 h-48 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float delay-400" />

        <div className="relative max-w-5xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-full mb-8 animate-fade-in-up">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span className="text-sm text-indigo-600 font-medium">
              Создайте идеальное приглашение за 5 минут
            </span>
          </div>

          <h1
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight animate-fade-in-up delay-100"
            style={{ animationFillMode: "both" }}
          >
            Ваше мероприятие —{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
              ваш стиль
            </span>
          </h1>

          <p
            className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto animate-fade-in-up delay-200"
            style={{ animationFillMode: "both" }}
          >
            Конструктор красивых сайтов-приглашений для свадеб, дней рождения и
            любых особенных событий
          </p>

          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-300"
            style={{ animationFillMode: "both" }}
          >
            <Link
              to={isAuthenticated ? "/new" : "/auth?mode=register"}
              className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl font-semibold text-lg shadow-xl shadow-indigo-200 hover:shadow-2xl hover:shadow-indigo-300 transition-all hover:-translate-y-1 flex items-center gap-2"
            >
              Создать приглашение
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#templates"
              className="px-8 py-4 bg-white border border-gray-200 text-gray-700 rounded-2xl font-semibold text-lg hover:border-indigo-200 hover:text-indigo-600 transition-all"
            >
              Посмотреть шаблоны
            </a>
          </div>

          {/* Stats */}
          <div
            className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 animate-fade-in-up delay-400"
            style={{ animationFillMode: "both" }}
          >
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center gap-2"
              >
                <stat.icon className="w-5 h-5 text-indigo-400" />
                <div className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-indigo-500 uppercase tracking-wider">
              Просто и быстро
            </span>
            <h2 className="text-4xl font-bold text-gray-900 mt-3 mb-4">
              Как это работает
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Три простых шага — и ваше приглашение готово
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.num} className="relative group">
                <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-3xl p-8 hover:shadow-xl hover:shadow-indigo-50 transition-all duration-300 hover:-translate-y-1">
                  <div className="text-6xl font-bold bg-gradient-to-br from-indigo-100 to-purple-100 bg-clip-text text-transparent mb-4">
                    {step.num}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-500">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Templates */}
      <section
        id="templates"
        className="py-24 bg-gradient-to-b from-gray-50 to-white"
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-indigo-500 uppercase tracking-wider">
              Коллекция
            </span>
            <h2 className="text-4xl font-bold text-gray-900 mt-3 mb-4">
              Шаблоны для любого события
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Профессиональные дизайны, которые можно настроить под свой вкус
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                className="group bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-2xl hover:shadow-indigo-50 transition-all duration-500 hover:-translate-y-2"
              >
                <div
                  className={`h-48 bg-gradient-to-br ${tpl.previewGradient} flex items-center justify-center relative overflow-hidden`}
                >
                  <span className="text-6xl group-hover:scale-110 transition-transform duration-500">
                    {tpl.previewEmoji}
                  </span>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-600 text-xs font-semibold rounded-full">
                      {tpl.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {tpl.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {tpl.description}
                  </p>
                  <Link
                    to={isAuthenticated ? "/new" : "/auth?mode=register"}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                  >
                    Использовать
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-indigo-500 uppercase tracking-wider">
              Возможности
            </span>
            <h2 className="text-4xl font-bold text-gray-900 mt-3 mb-4">
              Всё, что нужно для идеального приглашения
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat) => (
              <div
                key={feat.title}
                className="p-6 rounded-2xl border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feat.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {feat.title}
                </h3>
                <p className="text-gray-500 text-sm">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white/5 rounded-full" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white/5 rounded-full" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Создайте своё идеальное приглашение прямо сейчас
          </h2>
          <p className="text-xl text-indigo-100 mb-10">
            Бесплатно. Без ограничений. За 5 минут.
          </p>
          <Link
            to={isAuthenticated ? "/new" : "/auth?mode=register"}
            className="inline-flex items-center gap-2 px-10 py-4 bg-white text-indigo-600 rounded-2xl font-bold text-lg hover:shadow-2xl transition-all hover:-translate-y-1"
          >
            Начать бесплатно
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">InviteCraft</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <span>Конструктор сайтов-приглашений</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <span>Сделано с</span>
              <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400" />
              <span>в 2026</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
