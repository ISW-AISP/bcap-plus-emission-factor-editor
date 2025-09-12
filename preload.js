const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    // MongoDB operations
    mongoConnect: (username, password) => 
        ipcRenderer.invoke('mongodb-connect', username, password),
    
    mongoLoad: (collectionName) => 
        ipcRenderer.invoke('mongodb-load', collectionName),
    
    mongoSave: (collectionName, historyCollectionName, document, originalDocument, needsHistory, username) =>
        ipcRenderer.invoke('mongodb-save', { 
            collectionName, 
            historyCollectionName, 
            document, 
            originalDocument, 
            needsHistory,
            username 
        }),
    
    mongoStatus: () => 
        ipcRenderer.invoke('mongodb-status'),
    
    mongoDisconnect: () => 
        ipcRenderer.invoke('mongodb-disconnect'),

    // Utility functions
    showErrorDialog: (title, content) =>
        ipcRenderer.invoke('show-error-dialog', { title, content }),
    
    getAppVersion: () =>
        ipcRenderer.invoke('app-version'),
    
    closeApp: () =>
        ipcRenderer.invoke('close-app')
});

// History backup utility - exposed globally
contextBridge.exposeInMainWorld('mongoUtils', {
    needsHistoryBackup: (document) => {
        // Always create history backup for every save
        // This ensures we have a complete version history
        return true;
    }
});