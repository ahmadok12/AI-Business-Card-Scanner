export interface BusinessCard {
  id: string;
  name: string;
  title?: string;
  company?: string;
  phone?: string;
  secondaryPhone?: string;
  whatsapp?: string;
  whatsappQrUrl?: string;
  wechat?: string;
  wechatQrUrl?: string;
  email?: string;
  website?: string;
  address?: string;
  socialLinks?: string;
  notes?: string;
  blockName: string;
  tags: string[];
  frontImageUrl?: string;
  backImageUrl?: string;
  createdAt: number;
  updatedAt: number;
}

export type MediaType = 'image' | 'audio' | 'text';

export interface MediaItem {
  id: string;
  type: MediaType;
  title: string;
  blockName: string;
  dataUrl?: string;
  textContent?: string;
  audioDuration?: number;
  cardId?: string;
  cardName?: string;
  sectionName?: string;
  createdAt: number;
}

export interface AppSettings {
  geminiApiKey: string;
  geminiModel: string;
  defaultBlockName: string;
  autoCaptureEnabled: boolean;
  autoCaptureHoldTime: number;
  theme: 'light';
}

export interface DetectedQR {
  type: 'wechat' | 'whatsapp' | 'generic';
  label: string;
  box_2d?: [number, number, number, number]; // [ymin, xmin, ymax, xmax] 0-1000
  croppedDataUrl?: string;
}

export interface OCRResult {
  name: string;
  title: string;
  company: string;
  phone: string;
  secondaryPhone: string;
  whatsapp: string;
  whatsappQrUrl?: string;
  wechat: string;
  wechatQrUrl?: string;
  email: string;
  website: string;
  address: string;
  socialLinks: string;
  notes: string;
  tags: string[];
  qrCodes?: DetectedQR[];
  rawText?: string;
}

export interface UsageStats {
  scansUsed: number;
  maxFreeScans: number;
  deviceId: string;
  isProUser: boolean;
}
