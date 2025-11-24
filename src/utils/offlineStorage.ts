interface OfflineDraft {
  id: string;
  type: 'photo' | 'message' | 'comment';
  data: any;
  timestamp: number;
}

const DRAFTS_KEY = 'frame-offline-drafts';

export const offlineStorage = {
  // Save a draft
  saveDraft: (type: OfflineDraft['type'], data: any): string => {
    const drafts = offlineStorage.getDrafts();
    const id = `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const draft: OfflineDraft = {
      id,
      type,
      data,
      timestamp: Date.now(),
    };
    drafts.push(draft);
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
    return id;
  },

  // Get all drafts
  getDrafts: (): OfflineDraft[] => {
    try {
      const drafts = localStorage.getItem(DRAFTS_KEY);
      return drafts ? JSON.parse(drafts) : [];
    } catch {
      return [];
    }
  },

  // Get drafts by type
  getDraftsByType: (type: OfflineDraft['type']): OfflineDraft[] => {
    return offlineStorage.getDrafts().filter(draft => draft.type === type);
  },

  // Remove a draft
  removeDraft: (id: string): void => {
    const drafts = offlineStorage.getDrafts().filter(draft => draft.id !== id);
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
  },

  // Clear all drafts
  clearDrafts: (): void => {
    localStorage.removeItem(DRAFTS_KEY);
  },

  // Cache photo data
  cachePhoto: (photoId: string, photoData: any): void => {
    try {
      localStorage.setItem(`photo-${photoId}`, JSON.stringify(photoData));
    } catch (error) {
      console.error('Failed to cache photo:', error);
    }
  },

  // Get cached photo
  getCachedPhoto: (photoId: string): any => {
    try {
      const cached = localStorage.getItem(`photo-${photoId}`);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  },
};
