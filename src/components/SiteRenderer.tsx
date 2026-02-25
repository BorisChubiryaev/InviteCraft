import { useState, useEffect, FormEvent, useRef } from 'react';
import { SiteConfig, RSVPResponse } from '../types';
import {
  Calendar, MapPin, Heart, Send, ChevronDown,
  Shirt, CheckCircle2, X, Instagram, MessageCircle, Hash,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface SiteRendererProps {
  config: SiteConfig;
  siteId?: string;
  isPreview?: boolean;
  isEditing?: boolean;
  onRSVPSubmit?: (response: Omit<RSVPResponse, 'id' | 'createdAt'>) => void;
  onInlineEdit?: (field: string, value: string) => void;
}

const MONTHS_RU = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const DAYS_RU = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];

function formatDateRu(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getDate()} ${MONTHS_RU[d.getMonth()]} ${d.getFullYear()}`;
}

function formatTime24(timeStr: string) {
  if (!timeStr) return '';
  // Если уже в формате HH:MM, возвращаем как есть
  return timeStr;
}

function getDayOfWeek(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return DAYS_RU[d.getDay()];
}

const TEXTURES: Record<string, string> = {
  none: 'none',
  dots: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
  lines: 'repeating-linear-gradient(45deg, currentColor 0, currentColor 1px, transparent 0, transparent 10px)',
  paper: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")`,
  hearts: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cpath fill='%23ff000010' d='M20 35l-1.5-1.3C7.5 23.5 2 18.5 2 12.5 2 7.5 6 3.5 11 3.5c2.8 0 5.5 1.3 7 3.4 1.5-2.1 4.2-3.4 7-3.4 5 0 9 4 9 9 0 6-5.5 11-16.5 21.2L20 35z'/%3E%3C/svg%3E")`,
  confetti: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Ccircle cx='10' cy='10' r='2' fill='%23ffd70030'/%3E%3Ccircle cx='50' cy='20' r='3' fill='%23ff634730'/%3E%3Ccircle cx='30' cy='50' r='2' fill='%2390ee9030'/%3E%3Crect x='40' y='40' width='4' height='4' fill='%23add8e630' transform='rotate(45 42 42)'/%3E%3C/svg%3E")`,
};

function Divider({ style, color }: { style?: string; color: string }) {
  if (!style || style === 'none') return null;
  
  return (
    <div className="flex items-center justify-center py-4 md:py-8 opacity-50">
      {style === 'line' && <div className="w-20 h-px" style={{ backgroundColor: color }} />}
      {style === 'dots' && (
        <div className="flex gap-2">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
          ))}
        </div>
      )}
      {style === 'hearts' && (
        <div className="flex gap-2 text-base" style={{ color }}>♥ ♥ ♥</div>
      )}
      {style === 'flowers' && (
        <div className="flex gap-2 text-base" style={{ color }}>✿ ✿ ✿</div>
      )}
    </div>
  );
}

function FloatingElements({ color }: { color: string }) {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-xl md:text-2xl opacity-15"
          style={{ color, left: `${10 + i * 15}%`, top: `${20 + (i % 3) * 30}%` }}
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 10, -10, 0],
          }}
          transition={{ 
            duration: 4 + i, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: i * 0.5
          }}
        >
          {i % 3 === 0 ? '♥' : i % 3 === 1 ? '✿' : '★'}
        </motion.div>
      ))}
    </div>
  );
}

// Улучшенный компонент inline редактирования
function EditableText({ 
  value, 
  field,
  isEditing, 
  onEdit,
  className,
  style,
  as: Component = 'span',
  multiline = false
}: { 
  value: string;
  field: string;
  isEditing?: boolean;
  onEdit?: (field: string, value: string) => void;
  className?: string;
  style?: React.CSSProperties;
  as?: 'span' | 'h1' | 'h2' | 'p' | 'div';
  multiline?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  if (!isEditing || !onEdit) {
    return <Component className={className} style={style}>{value}</Component>;
  }

  if (editing) {
    const commonProps = {
      value: localValue,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setLocalValue(e.target.value),
      onBlur: () => {
        setEditing(false);
        if (localValue !== value) {
          onEdit(field, localValue);
        }
      },
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !multiline) {
          setEditing(false);
          if (localValue !== value) {
            onEdit(field, localValue);
          }
        }
        if (e.key === 'Escape') {
          setEditing(false);
          setLocalValue(value);
        }
      },
      className: cn(
        "bg-white text-gray-900 outline-none ring-2 ring-indigo-500 rounded-lg px-3 py-2",
        "w-full max-w-full text-base"
      ),
      style: { 
        fontFamily: style?.fontFamily,
        minWidth: '150px',
        maxWidth: '100%',
      }
    };

    if (multiline) {
      return (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          {...commonProps}
          rows={3}
        />
      );
    }

    return (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type="text"
        {...commonProps}
      />
    );
  }

  return (
    <Component 
      className={cn(
        className, 
        "cursor-text hover:ring-2 hover:ring-white/50 hover:bg-black/10 rounded-lg px-2 py-1 transition-all"
      )}
      style={style}
      onClick={() => setEditing(true)}
      title="Нажмите для редактирования"
    >
      {value || 'Нажмите для редактирования'}
    </Component>
  );
}

// Parse video URL to get embed URL
function getVideoEmbedUrl(url: string): string | null {
  if (!url) return null;
  
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  if (ytMatch) {
    return `https://www.youtube.com/embed/${ytMatch[1]}`;
  }
  
  // RuTube
  const rtMatch = url.match(/rutube\.ru\/video\/([a-zA-Z0-9]+)/);
  if (rtMatch) {
    return `https://rutube.ru/play/embed/${rtMatch[1]}`;
  }
  
  // VK Video
  const vkMatch = url.match(/vk\.com\/video(-?\d+)_(\d+)/);
  if (vkMatch) {
    return `https://vk.com/video_ext.php?oid=${vkMatch[1]}&id=${vkMatch[2]}`;
  }
  
  return null;
}

export default function SiteRenderer({ config, siteId, isPreview, isEditing, onRSVPSubmit, onInlineEdit }: SiteRendererProps) {
  const sortedSections = [...config.sections].sort((a, b) => a.order - b.order);
  const enabledSections = sortedSections.filter(s => s.enabled);

  const spacingClass = config.sectionSpacing === 'compact' ? 'py-8 md:py-12' : 
                       config.sectionSpacing === 'spacious' ? 'py-16 md:py-24' : 
                       'py-12 md:py-16';

  const style = {
    '--c-primary': config.colorPrimary,
    '--c-secondary': config.colorSecondary,
    '--c-accent': config.colorAccent,
    '--c-bg': config.colorBackground,
    '--c-text': config.colorText,
    '--radius': config.borderRadius === 'none' ? '0px' : 
                config.borderRadius === 'sm' ? '4px' :
                config.borderRadius === 'md' ? '8px' :
                config.borderRadius === 'lg' ? '16px' : '9999px',
    '--heading-font': config.headingFont || config.fontFamily,
    '--body-font': config.fontFamily,
  } as React.CSSProperties;

  const textureStyle = config.texture !== 'none' ? { 
    backgroundImage: TEXTURES[config.texture] || 'none', 
    backgroundSize: config.texture === 'dots' ? '20px 20px' : 
                    config.texture === 'lines' ? '14px 14px' : 
                    config.texture === 'hearts' ? '40px 40px' :
                    config.texture === 'confetti' ? '60px 60px' : 'auto',
    color: config.colorAccent + '20'
  } : {};

  return (
    <div
      className="site-renderer min-h-[100dvh] w-full relative overflow-x-hidden"
      style={{ ...style, fontFamily: config.fontFamily, backgroundColor: config.colorBackground, color: config.colorText }}
    >
      {config.texture !== 'none' && (
        <div className="fixed inset-0 pointer-events-none z-0 opacity-60" style={textureStyle} />
      )}
      
      {config.floatingElements && <FloatingElements color={config.colorAccent} />}
      
      <div className="relative z-10">
        {enabledSections.map((section, idx) => (
          <div key={section.id}>
            {idx > 0 && <Divider style={config.dividerStyle} color={config.colorAccent} />}
            {section.type === 'hero' && <HeroSection config={config} isEditing={isEditing} onEdit={onInlineEdit} />}
            {section.type === 'countdown' && config.countdownEnabled && <CountdownSection config={config} spacingClass={spacingClass} />}
            {section.type === 'details' && <DetailsSection config={config} spacingClass={spacingClass} isEditing={isEditing} onEdit={onInlineEdit} />}
            {section.type === 'story' && config.loveStory && <StorySection config={config} spacingClass={spacingClass} />}
            {section.type === 'schedule' && config.schedule.length > 0 && <ScheduleSection config={config} spacingClass={spacingClass} />}
            {section.type === 'gallery' && config.galleryImages.length > 0 && <GallerySection config={config} isPreview={isPreview} spacingClass={spacingClass} />}
            {section.type === 'video' && config.videos && config.videos.length > 0 && <VideoSection config={config} spacingClass={spacingClass} />}
            {section.type === 'map' && config.mapEnabled && (config.address || config.venue) && <MapSection config={config} spacingClass={spacingClass} />}
            {section.type === 'dresscode' && config.dressCode && <DressCodeSection config={config} spacingClass={spacingClass} />}
            {section.type === 'rsvp' && config.rsvpEnabled && <RSVPSection config={config} siteId={siteId} isPreview={isPreview} onSubmit={onRSVPSubmit} spacingClass={spacingClass} />}
          </div>
        ))}

        <FooterSection config={config} />
      </div>
    </div>
  );
}

function SectionContainer({ children, className, config, bg = 'bg', spacingClass }: { 
  children: React.ReactNode; 
  className?: string; 
  config: SiteConfig; 
  bg?: 'bg' | 'secondary';
  spacingClass?: string;
}) {
  const bgColor = bg === 'bg' ? config.colorBackground : config.colorSecondary;
  
  const variants = {
    hidden: { opacity: 0, y: config.animation === 'slide' ? 30 : 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };
  
  const shouldAnimate = config.animation !== 'none';

  return (
    <section 
      className={cn(spacingClass || "py-12 md:py-16", "px-4 w-full overflow-hidden", className)} 
      style={{ backgroundColor: bgColor }}
    >
      <motion.div
        initial={shouldAnimate ? "hidden" : "visible"}
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={variants}
        className="max-w-3xl mx-auto w-full"
      >
        {children}
      </motion.div>
    </section>
  );
}

function SectionHeader({ title, config }: { title: string; config: SiteConfig }) {
  const sizeClass = config.headingSize === 'small' ? 'text-xl md:text-2xl' :
                    config.headingSize === 'xlarge' ? 'text-3xl md:text-4xl' :
                    config.headingSize === 'medium' ? 'text-2xl md:text-3xl' :
                    'text-2xl md:text-3xl';

  return (
    <div className="text-center mb-8 md:mb-10">
      <h2 
        className={cn(sizeClass, "font-bold mb-3")}
        style={{ color: config.colorPrimary, fontFamily: config.headingFont || config.fontFamily }}
      >
        {title}
      </h2>
      <div className="w-12 h-0.5 mx-auto" style={{ backgroundColor: config.colorAccent }} />
    </div>
  );
}

function HeroSection({ config, isEditing, onEdit }: { config: SiteConfig; isEditing?: boolean; onEdit?: (field: string, value: string) => void }) {
  const overlayOpacity = (config.heroOverlay ?? 40) / 100;
  const isMinimal = config.heroStyle === 'minimal';
  
  // Адаптивные размеры для мобильных
  const namesSizeClass = config.headingSize === 'small' ? 'text-3xl sm:text-4xl md:text-5xl' :
                         config.headingSize === 'xlarge' ? 'text-4xl sm:text-5xl md:text-6xl lg:text-7xl' :
                         config.headingSize === 'medium' ? 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl' :
                         'text-3xl sm:text-4xl md:text-5xl lg:text-6xl';

  const isGif = config.heroImage?.includes('.gif') || config.heroImage?.startsWith('data:image/gif');

  return (
    <section 
      className={cn(
        "relative flex items-center justify-center overflow-hidden w-full",
        isMinimal ? "min-h-[60dvh]" : "min-h-[100dvh]"
      )}
    >
      {config.heroImage ? (
        <>
          <div 
            className={cn(
              "absolute inset-0",
              config.parallaxHero && !isGif && "bg-fixed"
            )}
            style={config.parallaxHero && !isGif ? {
              backgroundImage: `url(${config.heroImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            } : undefined}
          >
            {(!config.parallaxHero || isGif) && (
              <img
                src={config.heroImage}
                alt=""
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="absolute inset-0" style={{ backgroundColor: `rgba(0,0,0,${overlayOpacity})` }} />
        </>
      ) : (
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${config.colorPrimary}, ${config.colorAccent})` }} />
      )}

      <div className={cn(
        "relative z-10 px-4 w-full max-w-2xl mx-auto pb-8 pt-16",
        config.heroTextAlign === 'left' ? 'text-left' : 
        config.heroTextAlign === 'right' ? 'text-right' : 'text-center'
      )}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <EditableText
            value={config.subtitle}
            field="subtitle"
            isEditing={isEditing}
            onEdit={onEdit}
            as="p"
            className="text-white/90 text-sm sm:text-base md:text-lg mb-3 sm:mb-4 tracking-[0.1em] sm:tracking-[0.15em] uppercase break-words"
          />
          <EditableText
            value={config.names}
            field="names"
            isEditing={isEditing}
            onEdit={onEdit}
            as="h1"
            className={cn(namesSizeClass, "font-bold text-white mb-6 leading-tight break-words")}
            style={{ 
              fontFamily: config.headingFont || config.fontFamily,
              ...(config.gradientText ? {
                background: `linear-gradient(135deg, #fff 0%, ${config.colorAccent} 50%, #fff 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              } : {})
            }}
          />
        </motion.div>
        
        {config.date && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className={cn(
              "flex",
              config.heroTextAlign === 'left' ? 'justify-start' : 
              config.heroTextAlign === 'right' ? 'justify-end' : 'justify-center'
            )}
          >
            <div className="inline-block px-4 sm:px-6 py-3 sm:py-4 border border-white/30 backdrop-blur-sm rounded-xl bg-white/10">
              <p className="text-white text-lg sm:text-xl md:text-2xl font-medium">
                {formatDateRu(config.date)}
              </p>
              {config.time && (
                <p className="text-white/80 text-base sm:text-lg mt-1">в {formatTime24(config.time)}</p>
              )}
            </div>
          </motion.div>
        )}

        {config.showSocialInHero && config.socialLinks && (
          <motion.div 
            className="flex gap-4 mt-6 justify-center flex-wrap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {config.socialLinks.instagram && (
              <a href={`https://instagram.com/${config.socialLinks.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" 
                className="text-white/70 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            )}
            {config.socialLinks.telegram && (
              <a href={`https://t.me/${config.socialLinks.telegram.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
                className="text-white/70 hover:text-white transition-colors">
                <MessageCircle className="w-5 h-5" />
              </a>
            )}
          </motion.div>
        )}

        <motion.div 
          className="absolute bottom-4 left-0 right-0 flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
        >
          <ChevronDown className="w-6 h-6 text-white/60 animate-bounce" />
        </motion.div>
      </div>
    </section>
  );
}

function CountdownSection({ config, spacingClass }: { config: SiteConfig; spacingClass: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const countdownStyle = config.countdownStyle || 'cards';

  useEffect(() => {
    if (!config.date) return;
    const target = new Date(`${config.date}T${config.time || '00:00'}:00`);
    const interval = setInterval(() => {
      const now = new Date();
      const diff = target.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [config.date, config.time]);

  const labels: Record<string, string> = {
    days: 'дней',
    hours: 'часов',
    minutes: 'минут',
    seconds: 'секунд'
  };

  return (
    <SectionContainer config={config} bg="secondary" spacingClass={spacingClass}>
      <SectionHeader title="До события осталось" config={config} />
      
      <div className={cn(
        "max-w-md mx-auto",
        countdownStyle === 'minimal' ? 'flex items-baseline justify-center gap-1 text-3xl sm:text-4xl md:text-5xl font-bold flex-wrap' : 'grid grid-cols-2 sm:grid-cols-4 gap-3'
      )}>
        {Object.entries(timeLeft).map(([unit, value]) => {
          if (countdownStyle === 'minimal') {
            return (
              <span key={unit} style={{ color: config.colorPrimary }}>
                {String(value).padStart(2, '0')}
                {unit !== 'seconds' && <span className="opacity-30 mx-1">:</span>}
              </span>
            );
          }
          
          if (countdownStyle === 'circles') {
            return (
              <div key={unit} className="text-center">
                <div
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-2 border-3"
                  style={{ borderColor: config.colorAccent, backgroundColor: config.colorBackground }}
                >
                  <span className="text-xl sm:text-2xl font-bold" style={{ color: config.colorPrimary }}>
                    {String(value).padStart(2, '0')}
                  </span>
                </div>
                <p className="text-xs font-medium opacity-60 uppercase tracking-wider">
                  {labels[unit]}
                </p>
              </div>
            );
          }

          return (
            <div key={unit} className="text-center">
              <div
                className={cn(
                  "text-2xl sm:text-3xl font-bold py-3 sm:py-4 flex items-center justify-center mb-2",
                  countdownStyle === 'cards' && "shadow-md"
                )}
                style={{
                  backgroundColor: config.colorBackground,
                  color: config.colorPrimary,
                  borderRadius: 'var(--radius)',
                }}
              >
                {String(value).padStart(2, '0')}
              </div>
              <p className="text-xs font-medium opacity-60 uppercase tracking-wider">
                {labels[unit]}
              </p>
            </div>
          );
        })}
      </div>
    </SectionContainer>
  );
}

function DetailsSection({ config, spacingClass, isEditing, onEdit }: { config: SiteConfig; spacingClass: string; isEditing?: boolean; onEdit?: (field: string, value: string) => void }) {
  const bodySize = config.bodySize === 'small' ? 'text-sm sm:text-base' :
                   config.bodySize === 'large' ? 'text-base sm:text-lg' :
                   'text-sm sm:text-base';

  return (
    <SectionContainer config={config} spacingClass={spacingClass}>
      <SectionHeader title={config.detailsTitle || config.title} config={config} />
      
      {config.description && (
        <EditableText
          value={config.description}
          field="description"
          isEditing={isEditing}
          onEdit={onEdit}
          as="p"
          className={cn(bodySize, "mb-8 leading-relaxed max-w-xl mx-auto opacity-80 whitespace-pre-line text-center break-words")}
          multiline
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
        {config.date && (
          <motion.div
            whileHover={{ y: -2 }}
            className="p-4 sm:p-6 border-2 text-center transition-all"
            style={{ 
              borderColor: config.colorAccent + '40', 
              backgroundColor: config.colorSecondary + '50',
              borderRadius: 'var(--radius)'
            }}
          >
            <Calendar className="w-8 h-8 mx-auto mb-3" style={{ color: config.colorPrimary }} />
            <h3 className="text-lg font-bold mb-1" style={{ color: config.colorPrimary, fontFamily: 'var(--heading-font)' }}>Когда</h3>
            <p className="text-base sm:text-lg font-medium mb-1">
              {formatDateRu(config.date)}
            </p>
            <p className="opacity-70 text-sm">
              {getDayOfWeek(config.date)}
              {config.time && ` • ${formatTime24(config.time)}`}
            </p>
          </motion.div>
        )}

        {config.venue && (
          <motion.div
            whileHover={{ y: -2 }}
            className="p-4 sm:p-6 border-2 text-center transition-all"
            style={{ 
              borderColor: config.colorAccent + '40', 
              backgroundColor: config.colorSecondary + '50',
              borderRadius: 'var(--radius)'
            }}
          >
            <MapPin className="w-8 h-8 mx-auto mb-3" style={{ color: config.colorPrimary }} />
            <h3 className="text-lg font-bold mb-1" style={{ color: config.colorPrimary, fontFamily: 'var(--heading-font)' }}>Где</h3>
            <p className="text-base sm:text-lg font-medium mb-1 break-words">
              {config.venue}
            </p>
            {config.address && (
              <p className="opacity-70 text-sm break-words">
                {config.address}
              </p>
            )}
          </motion.div>
        )}
      </div>
    </SectionContainer>
  );
}

function StorySection({ config, spacingClass }: { config: SiteConfig; spacingClass: string }) {
  return (
    <SectionContainer config={config} bg="secondary" spacingClass={spacingClass}>
      <SectionHeader title="Наша история" config={config} />
      <div className="max-w-xl mx-auto text-center">
        <Heart className="w-8 h-8 mx-auto mb-4 opacity-50" style={{ color: config.colorPrimary }} />
        <p className="text-sm sm:text-base leading-relaxed whitespace-pre-line opacity-80 break-words">
          {config.loveStory}
        </p>
      </div>
    </SectionContainer>
  );
}

function ScheduleSection({ config, spacingClass }: { config: SiteConfig; spacingClass: string }) {
  return (
    <SectionContainer config={config} bg="secondary" spacingClass={spacingClass}>
      <SectionHeader title={config.scheduleTitle || "Программа"} config={config} />

      <div className="max-w-xl mx-auto relative">
        <div className="absolute left-5 sm:left-6 top-4 bottom-4 w-0.5" style={{ backgroundColor: config.colorAccent + '40' }} />
        <div className="space-y-4">
          {config.schedule.map((item, i) => (
            <motion.div 
              key={item.id || i} 
              className="flex gap-3 sm:gap-4 relative z-10"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <div
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 text-xs sm:text-sm font-bold shadow-md border-3 border-white"
                style={{ backgroundColor: config.colorPrimary, color: config.colorSecondary }}
              >
                {formatTime24(item.time)}
              </div>
              <div
                className="flex-grow p-3 sm:p-4 shadow-sm"
                style={{ 
                  backgroundColor: config.colorBackground, 
                  borderRadius: 'var(--radius)'
                }}
              >
                <h4 className="font-bold text-base mb-1 break-words" style={{ color: config.colorPrimary, fontFamily: 'var(--heading-font)' }}>{item.title}</h4>
                {item.description && (
                  <p className="opacity-70 leading-relaxed text-sm break-words">{item.description}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </SectionContainer>
  );
}

function GallerySection({ config, isPreview, spacingClass }: { config: SiteConfig; isPreview?: boolean; spacingClass: string }) {
  const [lightbox, setLightbox] = useState<string | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  
  const layout = config.galleryLayout || 'grid';
  const cols = config.galleryColumns || 3;
  
  const validImages = config.galleryImages.filter(img => img);

  const gridClass = layout === 'masonry' 
    ? `columns-2 ${cols >= 3 ? 'md:columns-3' : ''} gap-2`
    : `grid grid-cols-2 ${cols >= 3 ? 'md:grid-cols-3' : ''} gap-2`;

  if (layout === 'carousel') {
    return (
      <SectionContainer config={config} spacingClass={spacingClass}>
        <SectionHeader title={config.galleryTitle || "Галерея"} config={config} />
        
        <div className="relative -mx-4 px-4">
          <div 
            ref={carouselRef}
            className="flex overflow-x-auto snap-x snap-mandatory gap-3 pb-4 scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {validImages.map((img, i) => (
              <button
                key={i}
                onClick={() => !isPreview && setLightbox(img)}
                className="flex-shrink-0 w-64 sm:w-72 md:w-80 aspect-[4/3] overflow-hidden snap-center group"
                style={{ borderRadius: 'var(--radius)' }}
              >
                <img src={img} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </button>
            ))}
          </div>
          
          {validImages.length > 1 && (
            <div className="flex justify-center gap-3 mt-4">
              <button
                onClick={() => carouselRef.current?.scrollBy({ left: -280, behavior: 'smooth' })}
                className="p-2 rounded-full border-2 hover:bg-gray-50 transition-colors"
                style={{ borderColor: config.colorAccent, color: config.colorPrimary }}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => carouselRef.current?.scrollBy({ left: 280, behavior: 'smooth' })}
                className="p-2 rounded-full border-2 hover:bg-gray-50 transition-colors"
                style={{ borderColor: config.colorAccent, color: config.colorPrimary }}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <AnimatePresence>
          {lightbox && <Lightbox image={lightbox} onClose={() => setLightbox(null)} />}
        </AnimatePresence>
      </SectionContainer>
    );
  }

  return (
    <SectionContainer config={config} spacingClass={spacingClass}>
      <SectionHeader title={config.galleryTitle || "Галерея"} config={config} />
      
      <div className={gridClass}>
        {validImages.map((img, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            viewport={{ once: true }}
            onClick={() => !isPreview && setLightbox(img)}
            className={cn(
              "group relative overflow-hidden bg-gray-100 w-full",
              layout === 'masonry' ? 'mb-2 break-inside-avoid' : 'aspect-square'
            )}
            style={{ borderRadius: 'var(--radius)' }}
          >
            <img
              src={img}
              alt={`Фото ${i + 1}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {lightbox && <Lightbox image={lightbox} onClose={() => setLightbox(null)} />}
      </AnimatePresence>
    </SectionContainer>
  );
}

function Lightbox({ image, onClose }: { image: string; onClose: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4" 
      onClick={onClose}
    >
      <button className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 p-2 rounded-full">
        <X className="w-5 h-5" />
      </button>
      <img src={image} alt="" className="max-w-full max-h-[85vh] object-contain rounded-lg" />
    </motion.div>
  );
}

function VideoSection({ config, spacingClass }: { config: SiteConfig; spacingClass: string }) {
  const videos = config.videos || [];
  
  return (
    <SectionContainer config={config} bg="secondary" spacingClass={spacingClass}>
      <SectionHeader title={config.videosTitle || "Видео"} config={config} />
      
      <div className="grid gap-4 max-w-2xl mx-auto">
        {videos.map((video) => {
          const embedUrl = getVideoEmbedUrl(video.url);
          if (!embedUrl) return null;
          
          return (
            <div key={video.id} className="space-y-2">
              <div 
                className="aspect-video w-full overflow-hidden shadow-md"
                style={{ borderRadius: 'var(--radius)' }}
              >
                <iframe
                  src={embedUrl}
                  className="w-full h-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
              {video.title && (
                <p className="text-center font-medium opacity-80 text-sm break-words">{video.title}</p>
              )}
            </div>
          );
        })}
      </div>
    </SectionContainer>
  );
}

function MapSection({ config, spacingClass }: { config: SiteConfig; spacingClass: string }) {
  const mapQuery = encodeURIComponent(config.address || config.venue || '');
  const zoom = config.mapZoom || 15;

  return (
    <SectionContainer config={config} bg="secondary" spacingClass={spacingClass}>
      <SectionHeader title={config.mapTitle || "Как добраться"} config={config} />
      
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          {config.venue && (
            <p className="text-lg font-bold mb-1 break-words" style={{ color: config.colorPrimary, fontFamily: 'var(--heading-font)' }}>{config.venue}</p>
          )}
          {config.address && (
            <p className="opacity-70 text-sm break-words">{config.address}</p>
          )}
        </div>

        <div className="overflow-hidden shadow-lg bg-gray-100 mb-6" style={{ borderRadius: 'var(--radius)', height: '280px' }}>
          <iframe
            src={`https://yandex.ru/map-widget/v1/?text=${mapQuery}&z=${zoom}`}
            width="100%"
            height="100%"
            frameBorder="0"
            title="Карта"
          />
        </div>

        <div className="text-center">
          <a
            href={`https://yandex.ru/maps/?text=${mapQuery}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 font-bold transition-transform hover:scale-105 active:scale-95 shadow-md text-sm"
            style={{ 
              backgroundColor: config.colorPrimary, 
              color: config.colorSecondary,
              borderRadius: config.borderRadius === 'full' ? '9999px' : 'var(--radius)'
            }}
          >
            <MapPin className="w-4 h-4" />
            Открыть в Яндекс Картах
          </a>
        </div>
      </div>
    </SectionContainer>
  );
}

function DressCodeSection({ config, spacingClass }: { config: SiteConfig; spacingClass: string }) {
  return (
    <SectionContainer config={config} spacingClass={spacingClass}>
      <SectionHeader title="Дресс-код" config={config} />
      <div className="max-w-xl mx-auto text-center">
        <Shirt className="w-10 h-10 mx-auto mb-4 opacity-70" style={{ color: config.colorPrimary }} />
        <p className="text-sm sm:text-base leading-relaxed whitespace-pre-line opacity-80 mb-6 break-words">
          {config.dressCode}
        </p>
        
        {config.dressCodeColors && config.dressCodeColors.length > 0 && (
          <div className="flex justify-center gap-3 flex-wrap">
            {config.dressCodeColors.map((color, idx) => (
              <div 
                key={idx}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-3 border-white shadow-md"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        )}
      </div>
    </SectionContainer>
  );
}

function RSVPSection({ config, siteId, isPreview, onSubmit, spacingClass }: {
  config: SiteConfig;
  siteId?: string;
  isPreview?: boolean;
  onSubmit?: (response: Omit<RSVPResponse, 'id' | 'createdAt'>) => void;
  spacingClass: string;
}) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [attendance, setAttendance] = useState<'yes' | 'no' | 'maybe'>('yes');
  const [guests, setGuests] = useState(1);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isPreview) return;
    if (!name.trim()) return;

    if (onSubmit) {
      onSubmit({
        siteId: siteId || '',
        name: name.trim(),
        phone: phone.trim(),
        attendance,
        guestsCount: guests,
        message: message.trim(),
      });
      setSubmitted(true);
    }
  };

  const inputStyle = {
    borderColor: config.colorAccent + '40',
    backgroundColor: config.colorBackground,
    borderRadius: 'var(--radius)'
  };

  if (submitted) {
    return (
      <SectionContainer config={config} bg="secondary" spacingClass={spacingClass}>
        <div className="text-center py-8">
          <CheckCircle2 className="w-14 h-14 mx-auto mb-4 text-green-500" />
          <h2 className="text-2xl font-bold mb-2" style={{ color: config.colorPrimary, fontFamily: 'var(--heading-font)' }}>Спасибо!</h2>
          <p className="opacity-70">Ваш ответ успешно отправлен.</p>
        </div>
      </SectionContainer>
    );
  }

  return (
    <SectionContainer config={config} bg="secondary" spacingClass={spacingClass}>
      <SectionHeader title={config.rsvpTitle || "Подтвердите участие"} config={config} />
      
      {config.rsvpDescription && (
        <p className="text-center opacity-70 mb-6 max-w-md mx-auto text-sm break-words">
          {config.rsvpDescription}
        </p>
      )}
      
      <div className="max-w-sm mx-auto">
        <form
          onSubmit={handleSubmit}
          className="p-4 sm:p-6 shadow-lg"
          style={{ 
            backgroundColor: config.colorBackground, 
            borderRadius: 'var(--radius)'
          }}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 opacity-80">Ваше имя *</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full px-3 py-2.5 border-2 outline-none transition-colors text-sm"
                style={inputStyle}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 opacity-80">Телефон</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3 py-2.5 border-2 outline-none transition-colors text-sm"
                style={inputStyle}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 opacity-80">Вы придёте?</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'yes' as const, label: 'Да' },
                  { value: 'maybe' as const, label: 'Возможно' },
                  { value: 'no' as const, label: 'Нет' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setAttendance(opt.value)}
                    className="py-2.5 border-2 font-medium transition-all text-xs sm:text-sm"
                    style={{
                      borderRadius: 'var(--radius)',
                      borderColor: attendance === opt.value ? config.colorPrimary : config.colorAccent + '40',
                      backgroundColor: attendance === opt.value ? config.colorPrimary : 'transparent',
                      color: attendance === opt.value ? config.colorSecondary : config.colorText,
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {attendance !== 'no' && (
              <div>
                <label className="block text-sm font-medium mb-1.5 opacity-80">Количество гостей</label>
                <select
                  value={guests}
                  onChange={e => setGuests(Number(e.target.value))}
                  className="w-full px-3 py-2.5 border-2 outline-none transition-colors text-sm"
                  style={inputStyle}
                >
                  {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1.5 opacity-80">Сообщение</label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={2}
                className="w-full px-3 py-2.5 border-2 outline-none transition-colors resize-none text-sm"
                style={inputStyle}
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 font-bold transition-transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 shadow-md text-sm"
              style={{ 
                backgroundColor: config.colorPrimary, 
                color: config.colorSecondary,
                borderRadius: config.borderRadius === 'full' ? '9999px' : 'var(--radius)',
              }}
            >
              <Send className="w-4 h-4" />
              Отправить
            </button>
          </div>
        </form>
      </div>
    </SectionContainer>
  );
}

function FooterSection({ config }: { config: SiteConfig }) {
  return (
    <section className="py-8 md:py-10 text-center relative" style={{ backgroundColor: config.colorPrimary }}>
      <div className="relative z-10 space-y-3 px-4">
        {config.showSocialInFooter && config.socialLinks && (
          <div className="flex items-center justify-center gap-4 mb-4 flex-wrap">
            {config.socialLinks.instagram && (
              <a href={`https://instagram.com/${config.socialLinks.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" 
                className="opacity-70 hover:opacity-100 transition-opacity" style={{ color: config.colorSecondary }}>
                <Instagram className="w-5 h-5" />
              </a>
            )}
            {config.socialLinks.telegram && (
              <a href={`https://t.me/${config.socialLinks.telegram.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
                className="opacity-70 hover:opacity-100 transition-opacity" style={{ color: config.colorSecondary }}>
                <MessageCircle className="w-5 h-5" />
              </a>
            )}
            {config.socialLinks.hashtag && (
              <span className="flex items-center gap-1 opacity-70 text-sm" style={{ color: config.colorSecondary }}>
                <Hash className="w-4 h-4" />
                {config.socialLinks.hashtag.replace('#', '')}
              </span>
            )}
          </div>
        )}
        
        {config.footerText ? (
          <p className="opacity-80 whitespace-pre-line text-sm break-words" style={{ color: config.colorSecondary }}>
            {config.footerText}
          </p>
        ) : (
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <Heart className="w-4 h-4" style={{ color: config.colorSecondary }} fill={config.colorSecondary} />
            <span className="opacity-80 text-sm" style={{ color: config.colorSecondary }}>{config.names}</span>
            <Heart className="w-4 h-4" style={{ color: config.colorSecondary }} fill={config.colorSecondary} />
          </div>
        )}
      </div>
    </section>
  );
}
