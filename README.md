# CardSnap AI - Business Card OCR Scanner & Smart Contact Manager

A mobile-friendly, minimal, light-themed Business Card OCR Scanner web application powered by **Google Gemini AI**.

## 🌟 Features
- **📷 Smart Card Scanner**: Manual capture and auto-stability capture with card framing guides.
- **⚡ Gemini Vision OCR**: Extracts Full Name, Title, Company, Phones, Emails, Website, Physical Address, and Notes into structured contacts.
- **✂️ Auto QR Code Cropping**: Detects WeChat & WhatsApp QR codes from the scanned card and automatically crops them as ready-to-scan attachments.
- **💬 WhatsApp & WeChat Integration**: 1-tap WhatsApp chat links (`wa.me`) and WeChat ID copying.
- **🎙️ 1-Tap Voice Recording**: Instant audio notes with custom player, scrub bar, and **1x / 1.5x / 2x** playback speed toggles.
- **📎 Attached Media Block**: Staged voice memos, card backs, and text notes before & after saving.
- **🏷️ Default Block Category**: Configurable category name applied automatically without re-entry.
- **💾 Offline IndexedDB Storage**: Persistent storage with vCard (.vcf) export, JSON backup, and restore.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+

### Installation
```bash
git clone https://github.com/ahmadok12/AI-Business-Card-Scanner.git
cd AI-Business-Card-Scanner
npm install
npm run dev
```

### Build for Production
```bash
npm run build
```
