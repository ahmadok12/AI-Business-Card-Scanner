import { useState, useEffect } from 'react';
import type { BusinessCard, MediaItem, AppSettings, OCRResult } from './types';
import {
  getUsageStats,
  incrementScansUsed,
  setProUserStatus,
  resetScansForTesting,
  getAllCards,
  saveCard,
  deleteCard,
  getAllMedia,
  saveMediaItem,
  deleteMediaItem,
  getSettings,
  saveSettings,
  seedDemoData,
  clearAllDatabase
} from './services/db';
import { Navbar } from './components/Navbar';
import type { TabType } from './components/Navbar';
import { HomeTab } from './components/tabs/HomeTab';
import { ContactsTab } from './components/tabs/ContactsTab';
import { MediaTab } from './components/tabs/MediaTab';
import { SettingsTab } from './components/tabs/SettingsTab';
import { ScannerModal } from './components/ScannerModal';
import { ReviewCardModal } from './components/ReviewCardModal';
import { CardDetailModal } from './components/CardDetailModal';
import { QuickAttachModal } from './components/QuickAttachModal';
import { UpgradeModal } from './components/UpgradeModal';
import { VoiceRecorderModal } from './components/VoiceRecorderModal';
import { CameraCaptureModal } from './components/CameraCaptureModal';
import { ToastContainer } from './components/Toast';
import type { ToastMessage } from './components/Toast';
import type { StagedMediaItem } from './components/AttachedMediaSection';

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [cards, setCards] = useState<BusinessCard[]>([]);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [reviewState, setReviewState] = useState<{
    isOpen: boolean;
    frontImage: string;
    ocr: OCRResult;
  } | null>(null);
  const [selectedCard, setSelectedCard] = useState<BusinessCard | null>(null);
  const [quickAttachCard, setQuickAttachCard] = useState<BusinessCard | null>(null);
  const [isVoiceRecorderOpen, setIsVoiceRecorderOpen] = useState(false);
  const [isAddPhotoOpen, setIsAddPhotoOpen] = useState(false);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [usageStats, setUsageStats] = useState(getUsageStats());

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const loadData = async () => {
    try {
      const [dbCards, dbMedia, dbSettings] = await Promise.all([
        getAllCards(),
        getAllMedia(),
        getSettings()
      ]);
      setCards(dbCards);
      setMediaItems(dbMedia);
      setSettings(dbSettings);

      if (dbCards.length === 0 && dbMedia.length === 0) {
        await seedDemoData();
        const [seededCards, seededMedia] = await Promise.all([
          getAllCards(),
          getAllMedia()
        ]);
        setCards(seededCards);
        setMediaItems(seededMedia);
      }
    } catch (err) {
      console.error('Failed to load DB:', err);
      showToast('error', 'Error reading offline database');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleScanComplete = (scannedImage: string, ocrResult: OCRResult) => {
    // Increment scan quota
    const updatedQuota = incrementScansUsed();
    setUsageStats(getUsageStats());
    if (!usageStats.isProUser) {
      if (updatedQuota.remaining > 0) {
        showToast('info', `OCR Extracted! (${updatedQuota.remaining} of 10 free scans remaining)`);
      } else {
        showToast('info', 'You have used all 10 free scans on this device');
      }
    }
    setReviewState({
      isOpen: true,
      frontImage: scannedImage,
      ocr: ocrResult
    });
  };

  const handleSaveCard = async (
    newCard: BusinessCard,
    stagedMedia?: StagedMediaItem[]
  ) => {
    try {
      await saveCard(newCard);

      // Save card front photo to media
      if (newCard.frontImageUrl) {
        const mediaImg: MediaItem = {
          id: 'media_img_' + Date.now(),
          type: 'image',
          title: `Card - ${newCard.name}`,
          blockName: newCard.blockName,
          dataUrl: newCard.frontImageUrl,
          cardId: newCard.id,
          cardName: newCard.name,
          createdAt: Date.now()
        };
        await saveMediaItem(mediaImg);
      }

      // Save all staged media items attached before saving
      if (stagedMedia && stagedMedia.length > 0) {
        for (const item of stagedMedia) {
          const m: MediaItem = {
            id: item.id,
            type: item.type,
            title: item.title,
            blockName: newCard.blockName,
            dataUrl: item.dataUrl,
            textContent: item.textContent,
            audioDuration: item.audioDuration,
            sectionName: item.sectionName || 'Section 1',
            cardId: newCard.id,
            cardName: newCard.name,
            createdAt: Date.now()
          };
          await saveMediaItem(m);
        }
      }

      const [updatedCards, updatedMedia] = await Promise.all([
        getAllCards(),
        getAllMedia()
      ]);
      setCards(updatedCards);
      setMediaItems(updatedMedia);
      showToast('success', `Saved contact for ${newCard.name}!`);
    } catch (err) {
      console.error('Save card error:', err);
      showToast('error', 'Failed to save contact');
    }
  };

  const handleUpdateCard = async (updatedCard: BusinessCard) => {
    try {
      await saveCard(updatedCard);
      const updatedCards = await getAllCards();
      setCards(updatedCards);
      setSelectedCard(updatedCard);
      showToast('success', 'Contact updated');
    } catch (err) {
      showToast('error', 'Failed to update contact');
    }
  };

  const handleDeleteCard = async (id: string) => {
    try {
      await deleteCard(id);
      const updatedCards = await getAllCards();
      setCards(updatedCards);
      if (selectedCard?.id === id) setSelectedCard(null);
      showToast('info', 'Contact deleted');
    } catch (err) {
      showToast('error', 'Failed to delete contact');
    }
  };

  const handleAddMedia = async (media: MediaItem) => {
    try {
      await saveMediaItem(media);
      const updatedMedia = await getAllMedia();
      setMediaItems(updatedMedia);
      showToast('success', `Saved ${media.type === 'audio' ? 'voice note' : media.type === 'image' ? 'photo' : 'note'}!`);
    } catch (err) {
      showToast('error', 'Failed to save media');
    }
  };

  const handleDeleteMedia = async (id: string) => {
    try {
      await deleteMediaItem(id);
      const updatedMedia = await getAllMedia();
      setMediaItems(updatedMedia);
      showToast('info', 'Item removed');
    } catch (err) {
      showToast('error', 'Failed to delete media');
    }
  };

  const handleUpdateSettings = async (newSettings: AppSettings) => {
    try {
      await saveSettings(newSettings);
      setSettings(newSettings);
    } catch (err) {
      showToast('error', 'Failed to update settings');
    }
  };

  const handleLoadDemo = async () => {
    try {
      await seedDemoData();
      await loadData();
      showToast('success', 'Demo business cards and media loaded!');
    } catch (err) {
      showToast('error', 'Failed to seed demo data');
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAllDatabase();
      setCards([]);
      setMediaItems([]);
      showToast('info', 'Database reset');
    } catch (err) {
      showToast('error', 'Failed to clear data');
    }
  };

  const handleImportBackup = async (importedCards: BusinessCard[], importedMedia: MediaItem[]) => {
    try {
      for (const card of importedCards) {
        await saveCard(card);
      }
      for (const item of importedMedia) {
        await saveMediaItem(item);
      }
      await loadData();
    } catch (err) {
      showToast('error', 'Import failed');
    }
  };

  if (isLoading || !settings) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center animate-bounce">
            <span className="font-bold text-xl">CS</span>
          </div>
          <p className="text-xs font-semibold text-slate-500">Initializing CardSnap AI...</p>
        </div>
      </div>
    );
  }

  const associatedMediaForSelected = selectedCard
    ? mediaItems.filter((m) => m.cardId === selectedCard.id)
    : [];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex justify-center selection:bg-indigo-100 selection:text-indigo-900">
      <div className="w-full max-w-md min-h-screen bg-slate-50 flex flex-col relative px-4 pt-4">
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />

        <main className="flex-1">
          {activeTab === 'home' && (
            <HomeTab
              cards={cards}
              onOpenScanner={() => setIsScannerOpen(true)}
              onOpenVoiceRecorder={() => setIsVoiceRecorderOpen(true)}
              onOpenAddPhoto={() => setIsAddPhotoOpen(true)}
              onOpenCardDetail={(card) => setSelectedCard(card)}
              onOpenQuickAttach={(card) => setQuickAttachCard(card)}
              onLoadDemoData={handleLoadDemo}
              totalMediaCount={mediaItems.length}
              totalAudioCount={mediaItems.filter((m) => m.type === 'audio').length}
              scansUsed={usageStats.scansUsed}
              maxScans={usageStats.maxFreeScans}
              isProUser={usageStats.isProUser}
              onOpenUpgrade={() => setIsUpgradeOpen(true)}
            />
          )}

          {activeTab === 'contacts' && (
            <ContactsTab
              cards={cards}
              onOpenCardDetail={(card) => setSelectedCard(card)}
              onOpenQuickAttach={(card) => setQuickAttachCard(card)}
              onOpenScanner={() => setIsScannerOpen(true)}
            />
          )}

          {activeTab === 'media' && (
            <MediaTab
              mediaItems={mediaItems}
              onAddMedia={handleAddMedia}
              onDeleteMedia={handleDeleteMedia}
              defaultBlockName={settings.defaultBlockName}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsTab
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onLoadDemoData={handleLoadDemo}
              onClearAllData={handleClearAll}
              cards={cards}
              media={mediaItems}
              onImportBackup={handleImportBackup}
              showToast={showToast}
              scansUsed={usageStats.scansUsed}
              maxScans={usageStats.maxFreeScans}
              isProUser={usageStats.isProUser}
              deviceId={usageStats.deviceId}
              onOpenUpgrade={() => setIsUpgradeOpen(true)}
              onResetScans={() => {
                resetScansForTesting();
                setUsageStats(getUsageStats());
              }}
            />
          )}
        </main>

        <Navbar
          activeTab={activeTab}
          onChangeTab={(tab) => setActiveTab(tab)}
          onOpenScanner={() => setIsScannerOpen(true)}
          cardsCount={cards.length}
        />

        {/* Camera Scanner Modal (Auto-Capture is OFF by default) */}
        <ScannerModal
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          onScanComplete={handleScanComplete}
          apiKey={settings.geminiApiKey}
          modelName={settings.geminiModel}
          autoCaptureDefault={settings.autoCaptureEnabled}
          onLimitReached={() => setIsUpgradeOpen(true)}
        />

        {/* Review & Edit Scanned Card Modal (With WhatsApp, WeChat & Media Block Before Saving) */}
        {reviewState?.isOpen && (
          <ReviewCardModal
            isOpen={reviewState.isOpen}
            onClose={() => setReviewState(null)}
            onSave={handleSaveCard}
            frontImage={reviewState.frontImage}
            initialOcr={reviewState.ocr}
            defaultBlockName={settings.defaultBlockName}
          />
        )}

        {/* Contact Details & Edit Modal (With WhatsApp, WeChat & Media Block After Saving) */}
        <CardDetailModal
          card={selectedCard}
          isOpen={!!selectedCard}
          onClose={() => setSelectedCard(null)}
          onDelete={handleDeleteCard}
          onUpdate={handleUpdateCard}
          associatedMedia={associatedMediaForSelected}
          onAddMedia={handleAddMedia}
          onDeleteMedia={handleDeleteMedia}
        />

        {/* Quick Attach Media Modal (For list view "Attach Media" button) */}
        <QuickAttachModal
          card={quickAttachCard}
          isOpen={!!quickAttachCard}
          onClose={() => setQuickAttachCard(null)}
          onAddMedia={handleAddMedia}
        />

        {/* Global 1-Tap Voice Recorder Modal */}
        <VoiceRecorderModal
          isOpen={isVoiceRecorderOpen}
          onClose={() => setIsVoiceRecorderOpen(false)}
          onSave={(url, duration, title) => {
            handleAddMedia({
              id: 'media_' + Date.now(),
              type: 'audio',
              title,
              blockName: settings.defaultBlockName,
              dataUrl: url,
              audioDuration: duration,
              createdAt: Date.now()
            });
          }}
          defaultBlockName={settings.defaultBlockName}
        />

        {/* Global Add Photo Modal with Live Camera option */}
        <CameraCaptureModal
          isOpen={isAddPhotoOpen}
          onClose={() => setIsAddPhotoOpen(false)}
          onCapture={(img) => {
            const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const dateStr = new Date().toLocaleDateString([], { month: 'short', day: 'numeric' });
            handleAddMedia({
              id: 'media_' + Date.now(),
              type: 'image',
              title: `Photo - ${settings.defaultBlockName} (${dateStr} ${timeStr})`,
              blockName: settings.defaultBlockName,
              dataUrl: img,
              createdAt: Date.now()
            });
          }}
          title="Add Photo"
        />
        {/* Subscription / 10 Free Scans Paywall Modal */}
        <UpgradeModal
          isOpen={isUpgradeOpen}
          onClose={() => setIsUpgradeOpen(false)}
          scansUsed={usageStats.scansUsed}
          maxScans={usageStats.maxFreeScans}
          onUpgradeSimulated={() => {
            setProUserStatus(true);
            setUsageStats(getUsageStats());
            setIsUpgradeOpen(false);
            showToast('success', 'Upgraded to CardSnap Pro Unlimited!');
          }}
          onOpenSettings={() => {
            setIsUpgradeOpen(false);
            setActiveTab('settings');
          }}
        />
      </div>
    </div>
  );
}

export default App;
