import type { OCRResult, DetectedQR } from '../types';
import { cropImageRegion } from './imageUtils';

const DEFAULT_FALLBACK_KEY = (import.meta as any).env?.VITE_GEMINI_API_KEY || '';

/**
 * Resizes large mobile camera snapshots to max 1600px for instant fast AI OCR
 */
function optimizeImageForOCR(base64Image: string, maxDim: number = 1600): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;

      if (width <= maxDim && height <= maxDim) {
        resolve(base64Image);
        return;
      }

      if (width > height) {
        height = Math.round((height * maxDim) / width);
        width = maxDim;
      } else {
        width = Math.round((width * maxDim) / height);
        height = maxDim;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(base64Image);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.88));
    };
    img.onerror = () => resolve(base64Image);
    img.src = base64Image;
  });
}

export async function processCardWithGemini(
  imageBase64: string,
  apiKey?: string,
  modelName: string = 'gemini-3-flash-preview'
): Promise<OCRResult> {
  const effectiveKey = apiKey?.trim() || (import.meta as any).env?.VITE_GEMINI_API_KEY || DEFAULT_FALLBACK_KEY;

  if (!effectiveKey) {
    throw new Error('No Gemini API Key found. Please enter an API key in Settings.');
  }

  const optimizedImage = await optimizeImageForOCR(imageBase64);

  let cleanBase64 = optimizedImage;
  let mimeType = 'image/jpeg';

  if (optimizedImage.includes(';base64,')) {
    const parts = optimizedImage.split(';base64,');
    cleanBase64 = parts[1];
    const mimeMatch = parts[0].match(/:(.*?);/);
    if (mimeMatch) {
      mimeType = mimeMatch[1];
    }
  }

  const prompt = `
You are an expert business card reader and OCR vision model.
Analyze this business card image. Extract all text and contact information accurately.

Return ONLY a valid JSON object matching this schema with NO markdown code fences and no extra text:
{
  "name": "Full name of the person",
  "title": "Job title or position",
  "company": "Company or business name",
  "phone": "Primary phone number with country/area code",
  "secondaryPhone": "Alternate phone / office / mobile or empty string",
  "whatsapp": "WhatsApp number with country code if visible or phone number",
  "wechat": "WeChat ID / WX ID / 微信号 if visible on card, else empty string",
  "email": "Email address",
  "website": "Website URL",
  "address": "Full physical or office address",
  "socialLinks": "LinkedIn or other social profile handle if visible",
  "notes": "Any slogan, services list, or additional text on the card",
  "tags": ["Business", "Tag1", "Tag2"],
  "qrCodes": [
    {
      "type": "wechat" | "whatsapp" | "generic",
      "label": "WeChat QR Code" | "WhatsApp QR Code" | "Contact QR Code",
      "box_2d": [ymin, xmin, ymax, xmax]
    }
  ]
}

For qrCodes:
- Look carefully for any 2D QR codes on the card.
- If a QR code is next to WeChat or WeChat logo, set type to "wechat".
- If a QR code is next to WhatsApp or phone number, set type to "whatsapp".
- If any generic QR code is present, set type to "generic".
- box_2d MUST be 4 normalized integers from 0 to 1000 in [ymin, xmin, ymax, xmax] format.
- If no QR codes are visible on the card, return "qrCodes": [].
`;

  const candidateModels = [
    modelName || 'gemini-3-flash-preview',
    'gemini-3-flash-preview',
    'gemini-3.5-flash-lite',
    'gemini-3.7-flash',
    'gemini-flash-latest'
  ];

  const uniqueModels = Array.from(new Set(candidateModels));
  let lastError: any = null;

  for (const model of uniqueModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${effectiveKey}`;

      const requestBody = {
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: cleanBase64
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          response_mime_type: 'application/json'
        }
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gemini API (${model}) returned ${response.status}: ${errText}`);
      }

      const data = await response.json();
      const textOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!textOutput) {
        throw new Error(`No text content returned from Gemini model ${model}`);
      }

      let cleanedJson = textOutput.trim();
      if (cleanedJson.startsWith('```json')) {
        cleanedJson = cleanedJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedJson.startsWith('```')) {
        cleanedJson = cleanedJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      const parsed = JSON.parse(cleanedJson);

      // Process detected QR codes and auto-crop
      let whatsappQrUrl: string | undefined = undefined;
      let wechatQrUrl: string | undefined = undefined;
      const processedQrs: DetectedQR[] = [];

      if (Array.isArray(parsed.qrCodes)) {
        for (const qr of parsed.qrCodes) {
          if (Array.isArray(qr.box_2d) && qr.box_2d.length === 4) {
            try {
              const cropped = await cropImageRegion(optimizedImage, qr.box_2d as [number, number, number, number]);
              processedQrs.push({
                type: qr.type || 'generic',
                label: qr.label || 'QR Code',
                box_2d: qr.box_2d,
                croppedDataUrl: cropped
              });

              if (qr.type === 'whatsapp' && !whatsappQrUrl) {
                whatsappQrUrl = cropped;
              } else if (qr.type === 'wechat' && !wechatQrUrl) {
                wechatQrUrl = cropped;
              } else if (!whatsappQrUrl && !wechatQrUrl) {
                whatsappQrUrl = cropped;
                wechatQrUrl = cropped;
              }
            } catch (cropErr) {
              console.warn('QR crop error:', cropErr);
            }
          }
        }
      }

      return {
        name: parsed.name || '',
        title: parsed.title || '',
        company: parsed.company || '',
        phone: parsed.phone || '',
        secondaryPhone: parsed.secondaryPhone || '',
        whatsapp: parsed.whatsapp || parsed.phone || '',
        whatsappQrUrl,
        wechat: parsed.wechat || '',
        wechatQrUrl,
        email: parsed.email || '',
        website: parsed.website || '',
        address: parsed.address || '',
        socialLinks: parsed.socialLinks || '',
        notes: parsed.notes || '',
        tags: Array.isArray(parsed.tags) ? parsed.tags : [],
        qrCodes: processedQrs,
        rawText: textOutput
      };
    } catch (err: any) {
      console.warn(`Attempt with model ${model} failed:`, err);
      lastError = err;
    }
  }

  throw lastError || new Error('Failed to process business card with Gemini');
}

export async function testGeminiApiKey(apiKey: string, model: string = 'gemini-3-flash-preview'): Promise<boolean> {
  const effectiveKey = apiKey?.trim() || DEFAULT_FALLBACK_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${effectiveKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: 'Respond with: {"status": "ok"}' }] }],
      generationConfig: { response_mime_type: 'application/json' }
    })
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API test failed (${response.status}): ${errorText}`);
  }
  return true;
}
