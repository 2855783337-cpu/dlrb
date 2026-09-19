/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { JournalEntry, TemplateItem, SecuritySettings, DualSpace } from './types';
import { StorageService } from './utils/storage';
import { Navbar, NavTab } from './components/Navbar';
import { PasscodeLockScreen } from './components/PasscodeLockScreen';
import { HomeFeed } from './components/HomeFeed';
import { CalendarScheduleView } from './components/CalendarScheduleView';
import { TemplateSquare } from './components/TemplateSquare';
import { DualSpaceView } from './components/DualSpaceView';
import { ProfileView } from './components/ProfileView';
import { JournalEditor } from './components/JournalEditor';
import { JournalDetailModal } from './components/JournalDetailModal';
import { StickerStudioModal } from './components/StickerStudioModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('journals');
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [security, setSecurity] = useState<SecuritySettings>(StorageService.getSecuritySettings());
  const [isLocked, setIsLocked] = useState<boolean>(false);

  // Editor states
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [editingJournal, setEditingJournal] = useState<JournalEntry | null>(null);
  const [activeTemplate, setActiveTemplate] = useState<TemplateItem | null>(null);

  // Detail Modal state
  const [viewingJournal, setViewingJournal] = useState<JournalEntry | null>(null);

  // Sticker Studio standalone modal
  const [isStickerStudioOpen, setIsStickerStudioOpen] = useState<boolean>(false);

  // Load all journals
  const refreshJournals = () => {
    const list = StorageService.getJournals();
    setJournals(list);
    const sec = StorageService.getSecuritySettings();
    setSecurity(sec);
  };

  useEffect(() => {
    refreshJournals();
    const sec = StorageService.getSecuritySettings();
    if (sec.appLockEnabled && sec.hasPasscode) {
      setIsLocked(true);
    }
  }, []);

  // Open Editor for New Journal
  const handleStartNewJournal = (prefilledSpaceId?: string) => {
    setEditingJournal(
      prefilledSpaceId
        ? ({
            scope: 'shared',
            spaceId: prefilledSpaceId,
          } as unknown as JournalEntry)
        : null
    );
    setActiveTemplate(null);
    setIsEditorOpen(true);
  };

  // Open Editor to continue existing or draft
  const handleEditJournal = (entry: JournalEntry) => {
    setEditingJournal(entry);
    setActiveTemplate(null);
    setIsEditorOpen(true);
  };

  // Apply template from square
  const handleUseTemplate = (template: TemplateItem) => {
    setEditingJournal(null);
    setActiveTemplate(template);
    setIsEditorOpen(true);
  };

  // Soft Delete to Recycle Bin
  const handleDeleteJournal = (id: string) => {
    StorageService.deleteJournal(id);
    refreshJournals();
    if (viewingJournal?.id === id) {
      setViewingJournal(null);
    }
  };

  // Save success callback
  const handleSaveSuccess = (savedEntry: JournalEntry) => {
    refreshJournals();
    setIsEditorOpen(false);
    setEditingJournal(null);
    setActiveTemplate(null);
    setViewingJournal(savedEntry);
  };

  // If locked, render lock screen
  if (isLocked) {
    return (
      <PasscodeLockScreen
        correctPin={security.passcode || security.pinCode || '1234'}
        biometricEnabled={security.biometricEnabled}
        onUnlock={() => setIsLocked(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F4EFEA] text-[#3D3228] font-sans flex justify-center">
      {/* Container constrained for optimal iOS & mobile simulation while looking elegant on desktop */}
      <div className="w-full max-w-md min-h-screen bg-[#FAF7F2] shadow-xl flex flex-col relative">
        {/* Active Tab View */}
        <div className="flex-1">
          {activeTab === 'journals' && (
            <HomeFeed
              journals={journals}
              onOpenJournal={(j) => setViewingJournal(j)}
              onNewJournal={() => handleStartNewJournal()}
              onOpenStickerStudio={() => setIsStickerStudioOpen(true)}
              onOpenTemplateSquare={() => setActiveTab('templates')}
            />
          )}

          {activeTab === 'calendar' && (
            <CalendarScheduleView
              journals={journals}
              onOpenJournal={(j) => setViewingJournal(j)}
            />
          )}

          {activeTab === 'templates' && (
            <TemplateSquare
              onUseTemplate={handleUseTemplate}
              myJournals={journals.filter((j) => !j.deletedAt && !j.isDraft)}
            />
          )}

          {activeTab === 'spaces' && (
            <DualSpaceView
              journals={journals}
              onOpenJournal={(j) => setViewingJournal(j)}
              onNewSpaceJournal={(spaceId) => handleStartNewJournal(spaceId)}
              onDeleteJournal={handleDeleteJournal}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileView
              onOpenJournal={(j) => setViewingJournal(j)}
              onOpenDraft={handleEditJournal}
              onOpenStickerStudio={() => setIsStickerStudioOpen(true)}
              onRefreshData={refreshJournals}
            />
          )}
        </div>

        {/* Global Bottom Navigation Bar */}
        <Navbar
          currentTab={activeTab}
          onSelectTab={setActiveTab}
          onNewJournal={() => handleStartNewJournal()}
        />

        {/* Full-Screen Journal Editor Modal */}
        {isEditorOpen && (
          <JournalEditor
            initialEntry={editingJournal}
            initialTemplate={activeTemplate}
            onClose={() => {
              setIsEditorOpen(false);
              setEditingJournal(null);
              setActiveTemplate(null);
              refreshJournals();
            }}
            onSaveSuccess={handleSaveSuccess}
          />
        )}

        {/* Journal Detail Reading Modal */}
        {viewingJournal && (
          <JournalDetailModal
            journal={viewingJournal}
            onClose={() => setViewingJournal(null)}
            onEdit={handleEditJournal}
            onDelete={handleDeleteJournal}
          />
        )}

        {/* Standalone Sticker Studio */}
        <StickerStudioModal
          isOpen={isStickerStudioOpen}
          onClose={() => setIsStickerStudioOpen(false)}
        />
      </div>
    </div>
  );
}
