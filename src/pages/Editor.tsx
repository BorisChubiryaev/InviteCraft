import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSites } from "../context/SitesContext";
import { SiteConfig, ScheduleItem, SectionConfig, VideoItem } from "../types";
import SiteRenderer from "../components/SiteRenderer";
import ImageUpload from "../components/ImageUpload";
import { QRCodeCanvas } from "qrcode.react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import {
  ArrowLeft,
  Save,
  Globe,
  GlobeLock,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  X,
  Monitor,
  Smartphone,
  Copy,
  ExternalLink,
  QrCode,
  GripVertical,
  Image,
  Clock,
  MapPin,
  Calendar,
  Users,
  Film,
  Heart,
  Shirt,
  Palette,
  Type,
} from "lucide-react";
import { cn } from "../lib/utils";

const FONT_OPTIONS = [
  { value: "'Playfair Display', serif", label: "Playfair Display" },
  { value: "'Montserrat', sans-serif", label: "Montserrat" },
  { value: "'Cormorant Garamond', serif", label: "Cormorant Garamond" },
  { value: "'Raleway', sans-serif", label: "Raleway" },
  { value: "'Lora', serif", label: "Lora" },
  { value: "'Roboto', sans-serif", label: "Roboto" },
  { value: "'Inter', sans-serif", label: "Inter" },
  { value: "'Merriweather', serif", label: "Merriweather" },
  { value: "'Open Sans', sans-serif", label: "Open Sans" },
  { value: "'Caveat', cursive", label: "Caveat (рукописный)" },
  { value: "'Great Vibes', cursive", label: "Great Vibes (каллиграфия)" },
  { value: "'Dancing Script', cursive", label: "Dancing Script" },
];

const COLOR_PRESETS = [
  {
    name: "Золото",
    primary: "#B8860B",
    accent: "#D4AF37",
    secondary: "#F5F0E8",
    bg: "#FFFEF7",
    text: "#2C2C2C",
  },
  {
    name: "Розовый",
    primary: "#D4798A",
    accent: "#E8A0B0",
    secondary: "#FDF2F4",
    bg: "#FFF5F7",
    text: "#4A2C3D",
  },
  {
    name: "Синий",
    primary: "#2563EB",
    accent: "#3B82F6",
    secondary: "#EFF6FF",
    bg: "#FFFFFF",
    text: "#1E293B",
  },
  {
    name: "Зелёный",
    primary: "#059669",
    accent: "#10B981",
    secondary: "#ECFDF5",
    bg: "#FFFFFF",
    text: "#064E3B",
  },
  {
    name: "Фиолетовый",
    primary: "#7C3AED",
    accent: "#A78BFA",
    secondary: "#F5F3FF",
    bg: "#FEFCFF",
    text: "#1E1B4B",
  },
  {
    name: "Минимализм",
    primary: "#1A1A1A",
    accent: "#C9A96E",
    secondary: "#F5F5F5",
    bg: "#FFFFFF",
    text: "#1A1A1A",
  },
  {
    name: "Терракота",
    primary: "#C2410C",
    accent: "#EA580C",
    secondary: "#FFF7ED",
    bg: "#FFFBF5",
    text: "#431407",
  },
  {
    name: "Лаванда",
    primary: "#7E22CE",
    accent: "#A855F7",
    secondary: "#FAF5FF",
    bg: "#FDFCFE",
    text: "#3B0764",
  },
  {
    name: "Оливковый",
    primary: "#4D7C0F",
    accent: "#84CC16",
    secondary: "#F7FEE7",
    bg: "#FEFFF5",
    text: "#1A2E05",
  },
  {
    name: "Бордовый",
    primary: "#9F1239",
    accent: "#BE123C",
    secondary: "#FFF1F2",
    bg: "#FFFBFC",
    text: "#4C0519",
  },
];

const SECTION_ICONS: Record<string, typeof Image> = {
  hero: Image,
  countdown: Clock,
  details: Calendar,
  story: Heart,
  schedule: Clock,
  gallery: Image,
  video: Film,
  map: MapPin,
  dresscode: Shirt,
  rsvp: Users,
};

function SortableSectionItem({
  section,
  isExpanded,
  onToggle,
  onToggleEnabled,
  children,
}: {
  section: SectionConfig;
  isExpanded: boolean;
  onToggle: () => void;
  onToggleEnabled: () => void;
  children?: React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
    position: "relative" as const,
  };

  const Icon = SECTION_ICONS[section.type] || Calendar;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-white rounded-xl border transition-all mb-2 overflow-hidden",
        isDragging && "shadow-xl border-indigo-300 ring-2 ring-indigo-100",
        section.enabled ? "border-gray-200" : "border-gray-100 opacity-70",
        isExpanded && "ring-2 ring-indigo-100 border-indigo-200",
      )}
    >
      <div className="flex items-center gap-2 p-3">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
        >
          <GripVertical className="w-4 h-4" />
        </div>

        <button
          onClick={onToggleEnabled}
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
            section.enabled
              ? "bg-indigo-100 text-indigo-600"
              : "bg-gray-100 text-gray-400",
          )}
        >
          <Icon className="w-4 h-4" />
        </button>

        <button
          onClick={onToggle}
          className="flex-grow flex items-center justify-between text-left"
        >
          <span
            className={cn(
              "text-sm font-medium",
              section.enabled ? "text-gray-800" : "text-gray-400",
            )}
          >
            {section.label}
          </span>
          {section.enabled &&
            (isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            ))}
        </button>

        <button
          onClick={onToggleEnabled}
          className={cn(
            "w-9 h-5 rounded-full transition-colors relative flex-shrink-0",
            section.enabled ? "bg-indigo-500" : "bg-gray-300",
          )}
        >
          <div
            className={cn(
              "w-3.5 h-3.5 bg-white rounded-full absolute top-[3px] transition-transform shadow-sm",
              section.enabled ? "translate-x-[18px]" : "translate-x-[3px]",
            )}
          />
        </button>
      </div>

      {isExpanded && section.enabled && children && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-gray-50/50">
          {children}
        </div>
      )}
    </div>
  );
}

export default function Editor() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { getSite, updateSite, publishSite, unpublishSite } = useSites();
  const navigate = useNavigate();

  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">(
    "desktop",
  );
  const [showPreview, setShowPreview] = useState(true);
  const [saved, setSaved] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [localConfig, setLocalConfig] = useState<SiteConfig | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["hero"]),
  );
  const [showGlobalSettings, setShowGlobalSettings] = useState(false);

  const site = getSite(id || "");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (!site) {
      navigate("/dashboard");
      return;
    }
    if (site.userId !== user.id) {
      navigate("/dashboard");
      return;
    }
    if (!localConfig) {
      setLocalConfig({
        ...site.config,
        sections: site.config.sections.map((s) => ({ ...s })),
        schedule: site.config.schedule.map((s) => ({ ...s })),
        galleryImages: [...site.config.galleryImages],
        videos: site.config.videos ? [...site.config.videos] : [],
      });
    }
  }, [user, site, navigate, localConfig]);

  const updateConfig = useCallback((updates: Partial<SiteConfig>) => {
    setLocalConfig((prev) => (prev ? { ...prev, ...updates } : prev));
  }, []);

  // Inline edit callback from SiteRenderer
  const handleInlineEdit = useCallback(
    (field: string, value: string) => {
      updateConfig({ [field]: value } as Partial<SiteConfig>);
    },
    [updateConfig],
  );

  if (!site || !localConfig) return null;

  const handleSave = () => {
    if (localConfig) {
      updateSite(site.id, localConfig);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handlePublish = () => {
    handleSave();
    if (site.published) {
      unpublishSite(site.id);
    } else {
      publishSite(site.id);
    }
  };

  const publishedUrl = `${window.location.origin}/#/p/${site.id}`;

  const copyLink = () => {
    navigator.clipboard.writeText(publishedUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  const toggleSectionExpanded = (sectionId: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const toggleSection = (sectionId: string) => {
    const sections = localConfig.sections.map((s) =>
      s.id === sectionId ? { ...s, enabled: !s.enabled } : s,
    );
    updateConfig({ sections });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = localConfig.sections.findIndex(
        (s) => s.id === active.id,
      );
      const newIndex = localConfig.sections.findIndex((s) => s.id === over.id);
      const newSections = arrayMove(
        localConfig.sections,
        oldIndex,
        newIndex,
      ).map((s, idx) => ({
        ...s,
        order: idx,
      }));
      updateConfig({ sections: newSections });
    }
  };

  const addScheduleItem = () => {
    const newItem: ScheduleItem = {
      id: Date.now().toString(36),
      time: "00:00",
      title: "Новый пункт",
      description: "",
    };
    updateConfig({ schedule: [...localConfig.schedule, newItem] });
  };

  const updateScheduleItem = (idx: number, updates: Partial<ScheduleItem>) => {
    const newSchedule = localConfig.schedule.map((item, i) =>
      i === idx ? { ...item, ...updates } : item,
    );
    updateConfig({ schedule: newSchedule });
  };

  const removeScheduleItem = (idx: number) => {
    updateConfig({
      schedule: localConfig.schedule.filter((_, i) => i !== idx),
    });
  };

  const addGalleryImage = () => {
    updateConfig({ galleryImages: [...localConfig.galleryImages, ""] });
  };

  const updateGalleryImage = (idx: number, val: string) => {
    const imgs = [...localConfig.galleryImages];
    imgs[idx] = val;
    updateConfig({ galleryImages: imgs });
  };

  const removeGalleryImage = (idx: number) => {
    updateConfig({
      galleryImages: localConfig.galleryImages.filter((_, i) => i !== idx),
    });
  };

  const addVideo = () => {
    const newVideo: VideoItem = {
      id: Date.now().toString(36),
      url: "",
      title: "",
    };
    updateConfig({ videos: [...(localConfig.videos || []), newVideo] });
  };

  const updateVideo = (idx: number, updates: Partial<VideoItem>) => {
    const videos = (localConfig.videos || []).map((v, i) =>
      i === idx ? { ...v, ...updates } : v,
    );
    updateConfig({ videos });
  };

  const removeVideo = (idx: number) => {
    updateConfig({
      videos: (localConfig.videos || []).filter((_, i) => i !== idx),
    });
  };

  const sortedSections = [...localConfig.sections].sort(
    (a, b) => a.order - b.order,
  );

  const renderSectionSettings = (section: SectionConfig) => {
    switch (section.type) {
      case "hero":
        return (
          <div className="space-y-4">
            <InputField
              label="Имена / Название"
              value={localConfig.names}
              onChange={(v) => updateConfig({ names: v })}
              placeholder="Александр & Екатерина"
            />
            <InputField
              label="Заголовок"
              value={localConfig.title}
              onChange={(v) => updateConfig({ title: v })}
              placeholder="Мы женимся!"
            />
            <InputField
              label="Подзаголовок"
              value={localConfig.subtitle}
              onChange={(v) => updateConfig({ subtitle: v })}
              placeholder="Приглашаем вас..."
            />
            <div className="grid grid-cols-2 gap-3">
              <InputField
                label="Дата"
                type="date"
                value={localConfig.date}
                onChange={(v) => updateConfig({ date: v })}
              />
              <InputField
                label="Время"
                type="time"
                value={localConfig.time}
                onChange={(v) => updateConfig({ time: v })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Обложка (фото/GIF)
              </label>
              <ImageUpload
                value={localConfig.heroImage}
                onChange={(v) => updateConfig({ heroImage: v })}
                placeholder="Загрузить обложку или GIF"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <SelectField
                label="Стиль"
                value={localConfig.heroStyle || "fullscreen"}
                onChange={(v) => updateConfig({ heroStyle: v as any })}
                options={[
                  { value: "fullscreen", label: "Полноэкранный" },
                  { value: "centered", label: "Центрированный" },
                  { value: "minimal", label: "Минимальный" },
                ]}
              />
              <SelectField
                label="Выравнивание"
                value={localConfig.heroTextAlign || "center"}
                onChange={(v) => updateConfig({ heroTextAlign: v as any })}
                options={[
                  { value: "left", label: "Слева" },
                  { value: "center", label: "По центру" },
                  { value: "right", label: "Справа" },
                ]}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Затемнение: {localConfig.heroOverlay || 40}%
              </label>
              <input
                type="range"
                min={0}
                max={80}
                value={localConfig.heroOverlay || 40}
                onChange={(e) =>
                  updateConfig({ heroOverlay: Number(e.target.value) })
                }
                className="w-full accent-indigo-500"
              />
            </div>
            <ToggleField
              label="Градиентный текст"
              value={localConfig.gradientText || false}
              onChange={(v) => updateConfig({ gradientText: v })}
            />
            <ToggleField
              label="Параллакс эффект"
              value={localConfig.parallaxHero || false}
              onChange={(v) => updateConfig({ parallaxHero: v })}
            />
          </div>
        );

      case "countdown":
        return (
          <div className="space-y-4">
            <ToggleField
              label="Показывать обратный отсчёт"
              value={localConfig.countdownEnabled}
              onChange={(v) => updateConfig({ countdownEnabled: v })}
            />
            <div className="grid grid-cols-2 gap-2">
              {(["classic", "minimal", "cards", "circles"] as const).map(
                (style) => (
                  <button
                    key={style}
                    onClick={() => updateConfig({ countdownStyle: style })}
                    className={cn(
                      "p-2.5 border rounded-lg text-center transition-all text-xs font-medium",
                      localConfig.countdownStyle === style
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                        : "border-gray-200 hover:border-gray-300 text-gray-600",
                    )}
                  >
                    {style === "classic" && "Классический"}
                    {style === "minimal" && "Минимал"}
                    {style === "cards" && "Карточки"}
                    {style === "circles" && "Круги"}
                  </button>
                ),
              )}
            </div>
          </div>
        );

      case "details":
        return (
          <div className="space-y-4">
            <InputField
              label="Заголовок раздела"
              value={localConfig.detailsTitle || localConfig.title}
              onChange={(v) => updateConfig({ detailsTitle: v })}
            />
            <TextAreaField
              label="Описание"
              value={localConfig.description}
              onChange={(v) => updateConfig({ description: v })}
              rows={3}
            />
            <InputField
              label="Место проведения"
              value={localConfig.venue}
              onChange={(v) => updateConfig({ venue: v })}
              placeholder="Название площадки"
            />
            <InputField
              label="Адрес"
              value={localConfig.address}
              onChange={(v) => updateConfig({ address: v })}
              placeholder="Полный адрес"
            />
          </div>
        );

      case "story":
        return (
          <div className="space-y-4">
            <TextAreaField
              label="Наша история"
              value={localConfig.loveStory || ""}
              onChange={(v) => updateConfig({ loveStory: v })}
              rows={5}
              placeholder="Расскажите вашу историю любви..."
            />
          </div>
        );

      case "schedule":
        return (
          <div className="space-y-4">
            <InputField
              label="Заголовок раздела"
              value={localConfig.scheduleTitle || "Программа"}
              onChange={(v) => updateConfig({ scheduleTitle: v })}
            />
            <div className="space-y-2">
              {localConfig.schedule.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="p-3 bg-white rounded-lg border border-gray-200 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={item.time}
                      onChange={(e) =>
                        updateScheduleItem(idx, { time: e.target.value })
                      }
                      className="px-2 py-1.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-200 w-24"
                    />
                    <input
                      value={item.title}
                      onChange={(e) =>
                        updateScheduleItem(idx, { title: e.target.value })
                      }
                      className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                      placeholder="Название"
                    />
                    <button
                      onClick={() => removeScheduleItem(idx)}
                      className="text-red-400 hover:text-red-600 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <input
                    value={item.description}
                    onChange={(e) =>
                      updateScheduleItem(idx, { description: e.target.value })
                    }
                    className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                    placeholder="Описание (необязательно)"
                  />
                </div>
              ))}
            </div>
            <button
              onClick={addScheduleItem}
              className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              <Plus className="w-4 h-4" /> Добавить пункт
            </button>
          </div>
        );

      case "gallery":
        return (
          <div className="space-y-4">
            <InputField
              label="Заголовок раздела"
              value={localConfig.galleryTitle || "Галерея"}
              onChange={(v) => updateConfig({ galleryTitle: v })}
            />
            <div className="grid grid-cols-2 gap-3">
              <SelectField
                label="Раскладка"
                value={localConfig.galleryLayout || "grid"}
                onChange={(v) => updateConfig({ galleryLayout: v as any })}
                options={[
                  { value: "grid", label: "Сетка" },
                  { value: "masonry", label: "Masonry" },
                  { value: "carousel", label: "Карусель" },
                ]}
              />
              <SelectField
                label="Колонок"
                value={String(localConfig.galleryColumns || 3)}
                onChange={(v) =>
                  updateConfig({ galleryColumns: Number(v) as any })
                }
                options={[
                  { value: "2", label: "2" },
                  { value: "3", label: "3" },
                  { value: "4", label: "4" },
                ]}
              />
            </div>
            <div className="space-y-3">
              {localConfig.galleryImages.map((img, idx) => (
                <div
                  key={idx}
                  className="bg-white p-2 rounded-lg border border-gray-200 relative"
                >
                  <button
                    onClick={() => removeGalleryImage(idx)}
                    className="absolute top-3 right-3 z-10 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <ImageUpload
                    value={img}
                    onChange={(v) => updateGalleryImage(idx, v)}
                    placeholder={`Фото ${idx + 1}`}
                  />
                </div>
              ))}
            </div>
            <button
              onClick={addGalleryImage}
              className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              <Plus className="w-4 h-4" /> Добавить фото
            </button>
          </div>
        );

      case "video":
        return (
          <div className="space-y-4">
            <InputField
              label="Заголовок раздела"
              value={localConfig.videosTitle || "Видео"}
              onChange={(v) => updateConfig({ videosTitle: v })}
            />
            <p className="text-xs text-gray-500">
              Поддерживаются ссылки: YouTube, VK Video, RuTube
            </p>
            <div className="space-y-3">
              {(localConfig.videos || []).map((video, idx) => (
                <div
                  key={video.id}
                  className="p-3 bg-white rounded-lg border border-gray-200 space-y-2"
                >
                  <div className="flex gap-2">
                    <input
                      value={video.url}
                      onChange={(e) =>
                        updateVideo(idx, { url: e.target.value })
                      }
                      className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                      placeholder="https://youtube.com/watch?v=..."
                    />
                    <button
                      onClick={() => removeVideo(idx)}
                      className="text-red-400 hover:text-red-600 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <input
                    value={video.title || ""}
                    onChange={(e) =>
                      updateVideo(idx, { title: e.target.value })
                    }
                    className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                    placeholder="Название видео (необязательно)"
                  />
                </div>
              ))}
            </div>
            <button
              onClick={addVideo}
              className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              <Plus className="w-4 h-4" /> Добавить видео
            </button>
          </div>
        );

      case "map":
        return (
          <div className="space-y-4">
            <InputField
              label="Заголовок раздела"
              value={localConfig.mapTitle || "Как добраться"}
              onChange={(v) => updateConfig({ mapTitle: v })}
            />
            <ToggleField
              label="Показывать карту"
              value={localConfig.mapEnabled}
              onChange={(v) => updateConfig({ mapEnabled: v })}
            />
            <InputField
              label="Место"
              value={localConfig.venue}
              onChange={(v) => updateConfig({ venue: v })}
              placeholder="Название"
            />
            <InputField
              label="Адрес для карты"
              value={localConfig.address}
              onChange={(v) => updateConfig({ address: v })}
              placeholder="Полный адрес"
            />
          </div>
        );

      case "dresscode":
        return (
          <div className="space-y-4">
            <TextAreaField
              label="Описание дресс-кода"
              value={localConfig.dressCode}
              onChange={(v) => updateConfig({ dressCode: v })}
              rows={3}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Цвета дресс-кода
              </label>
              <div className="flex gap-2 flex-wrap">
                {(localConfig.dressCodeColors || []).map((color, idx) => (
                  <div key={idx} className="relative group">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => {
                        const colors = [...(localConfig.dressCodeColors || [])];
                        colors[idx] = e.target.value;
                        updateConfig({ dressCodeColors: colors });
                      }}
                      className="w-10 h-10 rounded-full border-2 border-white shadow cursor-pointer"
                    />
                    <button
                      onClick={() => {
                        const colors = (
                          localConfig.dressCodeColors || []
                        ).filter((_, i) => i !== idx);
                        updateConfig({ dressCodeColors: colors });
                      }}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  onClick={() =>
                    updateConfig({
                      dressCodeColors: [
                        ...(localConfig.dressCodeColors || []),
                        "#CCCCCC",
                      ],
                    })
                  }
                  className="w-10 h-10 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-indigo-400 hover:text-indigo-500"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        );

      case "rsvp":
        return (
          <div className="space-y-4">
            <ToggleField
              label="Включить форму RSVP"
              value={localConfig.rsvpEnabled}
              onChange={(v) => updateConfig({ rsvpEnabled: v })}
            />
            <InputField
              label="Заголовок"
              value={localConfig.rsvpTitle || "Подтвердите участие"}
              onChange={(v) => updateConfig({ rsvpTitle: v })}
            />
            <TextAreaField
              label="Описание"
              value={localConfig.rsvpDescription || ""}
              onChange={(v) => updateConfig({ rsvpDescription: v })}
              rows={2}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header - исправлено для мобильных */}
      <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 flex-shrink-0 z-30">
        {/* Левая часть (без изменений) */}
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Назад</span>
          </Link>
          <div className="w-px h-6 bg-gray-200" />
          <h1 className="font-semibold text-gray-800 truncate max-w-[120px] sm:max-w-[200px]">
            {localConfig.names || localConfig.title || "Без названия"}
          </h1>
        </div>

        {/* Правая часть с кнопками - исправлено */}
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
          <div className="hidden lg:flex items-center gap-1 bg-gray-100 rounded-lg p-0.5 flex-shrink-0">
            <button
              onClick={() => setPreviewMode("desktop")}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                previewMode === "desktop"
                  ? "bg-white shadow text-indigo-600"
                  : "text-gray-400",
              )}
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPreviewMode("mobile")}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                previewMode === "mobile"
                  ? "bg-white shadow text-indigo-600"
                  : "text-gray-400",
              )}
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setShowPreview(!showPreview)}
            className="lg:hidden flex items-center gap-1.5 px-2 py-1.5 text-sm text-gray-600 hover:text-gray-800 bg-gray-100 rounded-lg flex-shrink-0"
            title={showPreview ? "Скрыть превью" : "Показать превью"}
          >
            {showPreview ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-1 px-2 sm:px-4 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex-shrink-0"
          >
            {saved ? (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">
              {saved ? "Сохранено!" : "Сохранить"}
            </span>
          </button>

          {site.published && (
            <>
              <button
                onClick={copyLink}
                className="flex items-center gap-1 px-2 sm:px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 flex-shrink-0"
                title="Скопировать ссылку"
              >
                {copiedLink ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">Копировать</span>
              </button>
              <button
                onClick={() => setShowQR(true)}
                className="flex items-center gap-1 px-2 sm:px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 flex-shrink-0"
                title="QR код"
              >
                <QrCode className="w-4 h-4" />
                <span className="hidden sm:inline">QR</span>
              </button>
              <Link
                to={`/p/${site.id}`}
                target="_blank"
                className="flex items-center gap-1 px-2 sm:px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 flex-shrink-0"
                title="Открыть сайт"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="hidden sm:inline">Открыть</span>
              </Link>
            </>
          )}

          <button
            onClick={handlePublish}
            className={cn(
              "flex items-center gap-1 px-2 sm:px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex-shrink-0",
              site.published
                ? "bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                : "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg",
            )}
          >
            {site.published ? (
              <GlobeLock className="w-4 h-4" />
            ) : (
              <Globe className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">
              {site.published ? "Снять" : "Опубликовать"}
            </span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div
          className={cn(
            "w-full lg:w-[400px] flex-shrink-0 bg-gray-50 border-r border-gray-200 flex flex-col overflow-hidden",
            showPreview ? "hidden lg:flex" : "flex",
          )}
        >
          {/* Global Settings Toggle */}
          <button
            onClick={() => setShowGlobalSettings(!showGlobalSettings)}
            className={cn(
              "flex items-center justify-between p-4 border-b transition-colors",
              showGlobalSettings
                ? "bg-indigo-50 border-indigo-100"
                : "bg-white border-gray-200 hover:bg-gray-50",
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  showGlobalSettings
                    ? "bg-indigo-500 text-white"
                    : "bg-gray-100 text-gray-500",
                )}
              >
                <Palette className="w-4 h-4" />
              </div>
              <span className="font-medium text-gray-800">Общие настройки</span>
            </div>
            {showGlobalSettings ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
          </button>

          {showGlobalSettings && (
            <div className="p-4 bg-white border-b border-gray-200 space-y-4 max-h-[50vh] overflow-y-auto">
              {/* Color Presets */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Цветовая схема
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() =>
                        updateConfig({
                          colorPrimary: preset.primary,
                          colorAccent: preset.accent,
                          colorSecondary: preset.secondary,
                          colorBackground: preset.bg,
                          colorText: preset.text,
                        })
                      }
                      className="group relative"
                      title={preset.name}
                    >
                      <div className="flex -space-x-1 justify-center p-2 border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors">
                        <div
                          className="w-4 h-4 rounded-full border border-white shadow-sm"
                          style={{ backgroundColor: preset.primary }}
                        />
                        <div
                          className="w-4 h-4 rounded-full border border-white shadow-sm"
                          style={{ backgroundColor: preset.accent }}
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Colors */}
              <div className="grid grid-cols-2 gap-3">
                <ColorField
                  label="Основной"
                  value={localConfig.colorPrimary}
                  onChange={(v) => updateConfig({ colorPrimary: v })}
                />
                <ColorField
                  label="Акцент"
                  value={localConfig.colorAccent}
                  onChange={(v) => updateConfig({ colorAccent: v })}
                />
                <ColorField
                  label="Фон"
                  value={localConfig.colorBackground}
                  onChange={(v) => updateConfig({ colorBackground: v })}
                />
                <ColorField
                  label="Текст"
                  value={localConfig.colorText}
                  onChange={(v) => updateConfig({ colorText: v })}
                />
              </div>

              {/* Fonts */}
              <div className="grid grid-cols-2 gap-3">
                <SelectField
                  label="Шрифт текста"
                  value={localConfig.fontFamily}
                  onChange={(v) => updateConfig({ fontFamily: v })}
                  options={FONT_OPTIONS.map((f) => ({
                    value: f.value,
                    label: f.label,
                  }))}
                />
                <SelectField
                  label="Шрифт заголовков"
                  value={localConfig.headingFont || localConfig.fontFamily}
                  onChange={(v) => updateConfig({ headingFont: v })}
                  options={FONT_OPTIONS.map((f) => ({
                    value: f.value,
                    label: f.label,
                  }))}
                />
              </div>

              {/* Style */}
              <div className="grid grid-cols-2 gap-3">
                <SelectField
                  label="Закругления"
                  value={localConfig.borderRadius}
                  onChange={(v) => updateConfig({ borderRadius: v as any })}
                  options={[
                    { value: "none", label: "Нет" },
                    { value: "sm", label: "Малое" },
                    { value: "md", label: "Среднее" },
                    { value: "lg", label: "Большое" },
                    { value: "full", label: "Круглое" },
                  ]}
                />
                <SelectField
                  label="Анимация"
                  value={localConfig.animation}
                  onChange={(v) => updateConfig({ animation: v as any })}
                  options={[
                    { value: "none", label: "Нет" },
                    { value: "fade", label: "Появление" },
                    { value: "slide", label: "Сдвиг" },
                  ]}
                />
              </div>

              {/* Dividers */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Разделители
                </label>
                <div className="flex gap-2">
                  {(["none", "line", "dots", "hearts", "flowers"] as const).map(
                    (style) => (
                      <button
                        key={style}
                        onClick={() => updateConfig({ dividerStyle: style })}
                        className={cn(
                          "flex-1 p-2 border rounded-lg text-center transition-all text-xs",
                          localConfig.dividerStyle === style
                            ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                            : "border-gray-200 hover:border-gray-300",
                        )}
                      >
                        {style === "none" && "—"}
                        {style === "line" && "——"}
                        {style === "dots" && "•••"}
                        {style === "hearts" && "♥♥♥"}
                        {style === "flowers" && "✿✿✿"}
                      </button>
                    ),
                  )}
                </div>
              </div>

              {/* Effects */}
              <ToggleField
                label="Плавающие элементы"
                value={localConfig.floatingElements || false}
                onChange={(v) => updateConfig({ floatingElements: v })}
              />

              {/* Social */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Социальные сети
                </label>
                <input
                  value={localConfig.socialLinks?.instagram || ""}
                  onChange={(e) =>
                    updateConfig({
                      socialLinks: {
                        ...localConfig.socialLinks,
                        instagram: e.target.value,
                      },
                    })
                  }
                  placeholder="Instagram @username"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                />
                <input
                  value={localConfig.socialLinks?.telegram || ""}
                  onChange={(e) =>
                    updateConfig({
                      socialLinks: {
                        ...localConfig.socialLinks,
                        telegram: e.target.value,
                      },
                    })
                  }
                  placeholder="Telegram @username"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                />
                <input
                  value={localConfig.socialLinks?.hashtag || ""}
                  onChange={(e) =>
                    updateConfig({
                      socialLinks: {
                        ...localConfig.socialLinks,
                        hashtag: e.target.value,
                      },
                    })
                  }
                  placeholder="Хештег #НашаСвадьба"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                />
                <ToggleField
                  label="Показать в футере"
                  value={localConfig.showSocialInFooter || false}
                  onChange={(v) => updateConfig({ showSocialInFooter: v })}
                />
              </div>

              {/* Footer */}
              <TextAreaField
                label="Текст в футере"
                value={localConfig.footerText || ""}
                onChange={(v) => updateConfig({ footerText: v })}
                rows={2}
              />
            </div>
          )}

          {/* Sections List */}
          <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
            <p className="text-xs text-gray-500 mb-3 flex items-center gap-2">
              <Type className="w-3 h-3" />
              Нажмите на секцию для настройки • Перетаскивайте для сортировки
            </p>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sortedSections.map((s) => s.id)}
                strategy={verticalListSortingStrategy}
              >
                {sortedSections.map((section) => (
                  <SortableSectionItem
                    key={section.id}
                    section={section}
                    isExpanded={expandedSections.has(section.id)}
                    onToggle={() => toggleSectionExpanded(section.id)}
                    onToggleEnabled={() => toggleSection(section.id)}
                  >
                    {renderSectionSettings(section)}
                  </SortableSectionItem>
                ))}
              </SortableContext>
            </DndContext>
          </div>
        </div>

        {/* Preview */}
        <div
          className={cn(
            "flex-1 bg-gray-100 overflow-hidden relative",
            !showPreview ? "hidden lg:block" : "",
          )}
        >
          <div className="h-full flex items-start justify-center overflow-auto p-4 lg:p-8">
            <div
              className={cn(
                "bg-white shadow-2xl shadow-gray-200 rounded-2xl overflow-hidden transition-all duration-300 relative",
                previewMode === "mobile"
                  ? "w-[375px]"
                  : "w-full max-w-[1200px]",
              )}
              style={{ minHeight: "600px" }}
            >
              {previewMode === "mobile" && (
                <div className="absolute top-0 left-0 right-0 h-6 bg-gray-800 z-20 flex justify-center items-center">
                  <div className="w-16 h-4 bg-black rounded-b-xl"></div>
                </div>
              )}

              <div
                className={cn(
                  "overflow-y-auto h-full",
                  previewMode === "mobile" ? "pt-6" : "",
                )}
                style={{ maxHeight: "calc(100vh - 120px)" }}
              >
                <SiteRenderer
                  config={localConfig}
                  siteId={site.id}
                  isPreview={true}
                  isEditing={true}
                  onInlineEdit={handleInlineEdit}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Modal */}
      {showQR && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm relative shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowQR(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-center mb-6">
              QR код приглашения
            </h3>

            <div className="flex justify-center mb-6 p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
              <QRCodeCanvas
                value={publishedUrl}
                size={200}
                level={"H"}
                includeMargin={true}
              />
            </div>

            <p className="text-center text-sm text-gray-500 mb-6 break-all">
              {publishedUrl}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowQR(false)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Закрыть
              </button>
              <button
                onClick={copyLink}
                className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
              >
                Копировать ссылку
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper components
function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all"
      />
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  rows = 3,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all resize-none"
      />
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [showPicker, setShowPicker] = useState(false);
  const [localValue, setLocalValue] = useState(value);

  // Предустановленные цвета
  const presetColors = [
    "#B8860B",
    "#D4AF37",
    "#FFD700",
    "#FFA500",
    "#FF6347",
    "#D4798A",
    "#E8A0B0",
    "#FF69B4",
    "#FF1493",
    "#DC143C",
    "#9F1239",
    "#BE123C",
    "#C2410C",
    "#EA580C",
    "#F97316",
    "#059669",
    "#10B981",
    "#22C55E",
    "#84CC16",
    "#4D7C0F",
    "#2563EB",
    "#3B82F6",
    "#0EA5E9",
    "#06B6D4",
    "#14B8A6",
    "#7C3AED",
    "#8B5CF6",
    "#A855F7",
    "#D946EF",
    "#EC4899",
    "#1A1A1A",
    "#374151",
    "#6B7280",
    "#9CA3AF",
    "#D1D5DB",
    "#FFFFFF",
    "#F5F5F5",
    "#FAFAFA",
    "#FEF3C7",
    "#FFFEF7",
  ];

  return (
    <div className="relative">
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowPicker(!showPicker)}
          className="w-8 h-8 rounded-lg border-2 border-gray-200 cursor-pointer flex-shrink-0 shadow-sm hover:border-indigo-300 transition-colors"
          style={{ backgroundColor: value }}
        />
        <input
          type="text"
          value={localValue}
          onChange={(e) => {
            setLocalValue(e.target.value);
            if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
              onChange(e.target.value);
            }
          }}
          onBlur={() => {
            if (/^#[0-9A-Fa-f]{6}$/.test(localValue)) {
              onChange(localValue);
            } else {
              setLocalValue(value);
            }
          }}
          className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-200 font-mono uppercase"
          placeholder="#000000"
        />
      </div>

      {showPicker && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowPicker(false)}
          />
          <div className="absolute left-0 top-full mt-2 z-50 bg-white rounded-xl shadow-xl border border-gray-200 p-3 w-64 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-8 gap-1.5 mb-3">
              {presetColors.map((color, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    onChange(color);
                    setLocalValue(color);
                    setShowPicker(false);
                  }}
                  className="w-6 h-6 rounded-md border border-gray-200 hover:scale-110 transition-transform shadow-sm"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={value}
                onChange={(e) => {
                  onChange(e.target.value);
                  setLocalValue(e.target.value);
                }}
                className="w-10 h-8 rounded border border-gray-200 cursor-pointer"
              />
              <span className="text-xs text-gray-500">Выбрать свой цвет</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-200 bg-white"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function ToggleField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-gray-700">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={cn(
          "w-9 h-5 rounded-full transition-colors relative flex-shrink-0",
          value ? "bg-indigo-500" : "bg-gray-300",
        )}
      >
        <div
          className={cn(
            "w-3.5 h-3.5 bg-white rounded-full absolute top-[3px] transition-transform shadow-sm",
            value ? "translate-x-[18px]" : "translate-x-[3px]",
          )}
        />
      </button>
    </div>
  );
}
