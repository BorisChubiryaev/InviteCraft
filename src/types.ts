export interface User {
  id: string;
  email: string;
  name: string;
  password: string;
}

export interface SiteData {
  id: string;
  userId: string;
  templateId: string;
  published: boolean;
  slug: string;
  createdAt: string;
  updatedAt: string;
  config: SiteConfig;
}

export interface SocialLinks {
  instagram?: string;
  telegram?: string;
  whatsapp?: string;
  tiktok?: string;
  website?: string;
  hashtag?: string;
}

export interface VideoItem {
  id: string;
  url: string;
  title?: string;
}

export interface SiteConfig {
  title: string;
  subtitle: string;
  names: string;
  date: string;
  time: string;
  venue: string;
  address: string;
  description: string;
  heroImage: string;
  heroMediaType?: 'image' | 'gif' | 'video';
  galleryImages: string[];
  videos?: VideoItem[];
  colorPrimary: string;
  colorSecondary: string;
  colorAccent: string;
  colorBackground: string;
  colorText: string;
  fontFamily: string;
  headingFont?: string;
  sections: SectionConfig[];
  rsvpEnabled: boolean;
  countdownEnabled: boolean;
  mapEnabled: boolean;
  dressCode: string;
  schedule: ScheduleItem[];
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
  buttonStyle: 'solid' | 'outline' | 'ghost';
  animation: 'none' | 'fade' | 'slide' | 'zoom';
  texture: 'none' | 'dots' | 'lines' | 'paper' | 'hearts' | 'confetti';
  // Advanced customization
  heroStyle?: 'fullscreen' | 'centered' | 'split' | 'minimal';
  heroOverlay?: number; // 0-100
  heroTextAlign?: 'left' | 'center' | 'right';
  countdownStyle?: 'classic' | 'minimal' | 'cards' | 'circles';
  galleryLayout?: 'grid' | 'masonry' | 'carousel';
  galleryColumns?: 2 | 3 | 4;
  socialLinks?: SocialLinks;
  showSocialInHero?: boolean;
  showSocialInFooter?: boolean;
  footerText?: string;
  dressCodeColors?: string[];
  rsvpTitle?: string;
  rsvpDescription?: string;
  mapZoom?: number;
  // Typography
  headingSize?: 'small' | 'medium' | 'large' | 'xlarge';
  bodySize?: 'small' | 'medium' | 'large';
  // Divider
  dividerStyle?: 'line' | 'dots' | 'hearts' | 'flowers' | 'none';
  // Spacing
  sectionSpacing?: 'compact' | 'normal' | 'spacious';
  // Effects
  parallaxHero?: boolean;
  floatingElements?: boolean;
  gradientText?: boolean;
  // Stories / Our Story
  loveStory?: string;
  // Custom sections titles
  detailsTitle?: string;
  scheduleTitle?: string;
  galleryTitle?: string;
  mapTitle?: string;
  videosTitle?: string;
}

export interface ScheduleItem {
  id: string;
  time: string;
  title: string;
  description: string;
}

export interface SectionConfig {
  id: string;
  type: 'hero' | 'details' | 'countdown' | 'schedule' | 'gallery' | 'map' | 'dresscode' | 'rsvp' | 'video' | 'story';
  label: string;
  enabled: boolean;
  order: number;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  previewGradient: string;
  previewEmoji: string;
  defaultConfig: SiteConfig;
}

export interface RSVPResponse {
  id: string;
  siteId: string;
  name: string;
  phone: string;
  attendance: 'yes' | 'no' | 'maybe';
  guestsCount: number;
  message: string;
  createdAt: string;
}
