const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const { MongoClient, ObjectId } = require('mongodb');
const path = require('path');

// Keep a global reference of the window object
let mainWindow;
let mongoClient = null;
let mongoDatabase = null;

function createWindow() {
    // Create the browser window
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 1000,
        minWidth: 1200,
        minHeight: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        icon: path.join(__dirname, 'assets/icon.png'),
        title: 'MongoDB Emission Data Editor',
        show: false // Don't show until ready
    });

    // Load the index.html of the app
    mainWindow.loadFile('index.html');

    // Show window when ready to prevent visual flash
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    // Open DevTools in development
    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools();
    }

    // Handle window closed
    mainWindow.on('closed', () => {
        mainWindow = null;
        if (mongoClient) {
            mongoClient.close();
        }
    });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// MongoDB IPC Handlers

// Connect to MongoDB with username/password
ipcMain.handle('mongodb-connect', async (event, username, password) => {
    try {
        console.log('Attempting MongoDB Atlas connection...');
        
        if (mongoClient) {
            await mongoClient.close();
        }

        // Embedded Carbon Halo MongoDB Atlas connection string
        const connectionString = `mongodb+srv://${encodeURIComponent(username)}:${encodeURIComponent(password)}@carbonhalo-prod-cluster-pl-0.kvfbo.mongodb.net/`;
        const databaseName = 'BCAP_Plus';

        console.log('Connecting to Carbon Halo production cluster...');
        
        mongoClient = new MongoClient(connectionString, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        
        await mongoClient.connect();
        mongoDatabase = mongoClient.db(databaseName);
        
        // Test connection by listing collections
        const collections = await mongoDatabase.listCollections().toArray();
        console.log(`Connected to ${databaseName} database. Found ${collections.length} collections.`);
        
        return { 
            success: true, 
            message: 'Connected to Carbon Halo database successfully' 
        };
    } catch (error) {
        console.error('MongoDB connection failed:', error);
        mongoClient = null;
        mongoDatabase = null;
        
        // Provide more helpful error messages
        let userMessage = error.message;
        if (error.message.includes('Authentication failed')) {
            userMessage = 'Invalid username or password. Please check your credentials.';
        } else if (error.message.includes('getaddrinfo ENOTFOUND')) {
            userMessage = 'Cannot connect to the database server. Please check your internet connection.';
        } else if (error.message.includes('serverSelectionTimeoutMS')) {
            userMessage = 'Connection timeout. Please check your internet connection and try again.';
        }
        
        return { 
            success: false, 
            message: userMessage
        };
    }
});

// Load data from MongoDB collection
ipcMain.handle('mongodb-load', async (event, collectionName) => {
    try {
        if (!mongoDatabase) {
            throw new Error('No database connection');
        }

        console.log(`Loading data from collection: ${collectionName}`);
        const collection = mongoDatabase.collection(collectionName);
        const documents = await collection.find({}).toArray();
        
        console.log(`Loaded ${documents.length} documents`);
        return { 
            success: true, 
            data: documents 
        };
    } catch (error) {
        console.error('Failed to load data:', error);
        return { 
            success: false, 
            message: error.message 
        };
    }
});

// Save data to MongoDB with history backup
ipcMain.handle('mongodb-save', async (event, { 
    collectionName, 
    historyCollectionName, 
    document, 
    originalDocument, 
    needsHistory,
    username 
}) => {
    try {
        console.log('=== MongoDB Save Handler Started ===');
        console.log('Collection:', collectionName);
        console.log('History Collection:', historyCollectionName);
        console.log('Needs History:', needsHistory);
        console.log('Username:', username || 'unknown');
        
        if (!mongoDatabase) {
            throw new Error('No database connection');
        }

        console.log(`Saving document to ${collectionName}`);
        
        if (!document) {
            console.error('Document is null or undefined');
            throw new Error('Document is null or undefined');
        }
        
        if (!originalDocument) {
            // If no original document, use the document itself
            console.warn('No original document provided, using document for history');
            originalDocument = document;
        }
        
        console.log('Document ID:', JSON.stringify(document._id));
        console.log('Document ID type:', typeof document._id);
        console.log('Original Document ID:', JSON.stringify(originalDocument._id));
        console.log('Original Document ID type:', typeof originalDocument._id);
        console.log('Document keys:', Object.keys(document));
        
        const collection = mongoDatabase.collection(collectionName);
        const historyCollection = mongoDatabase.collection(historyCollectionName);
        let historyRecordsCreated = 0;

        // Parse the original document's _id to ensure correct targeting
        let originalObjectId;
        if (originalDocument && originalDocument._id) {
            console.log('Processing originalDocument._id:', JSON.stringify(originalDocument._id, null, 2));
            
            // Handle different _id formats that might come from the frontend
            if (originalDocument._id && originalDocument._id.$oid) {
                // Format: { $oid: "string" } - preferred format
                console.log('Found $oid format:', originalDocument._id.$oid);
                originalObjectId = new ObjectId(originalDocument._id.$oid);
                console.log('Created ObjectId from $oid');
            } else if (typeof originalDocument._id === 'string') {
                // Format: "string"
                console.log('Found string format:', originalDocument._id);
                originalObjectId = new ObjectId(originalDocument._id);
                console.log('Created ObjectId from string');
            } else {
                // Try to handle any other format
                console.error('Unexpected _id format:', originalDocument._id);
                console.error('Type:', typeof originalDocument._id);
                console.error('Keys:', Object.keys(originalDocument._id || {}));
                throw new Error(`Invalid _id format: ${JSON.stringify(originalDocument._id)}`);
            }
            console.log('Parsed original ObjectId:', originalObjectId.toHexString());
        } else {
            console.error('Original document or its _id is missing');
            throw new Error('Original document or its _id is missing for update.');
        }

        // The documentId for the history record and the update query should be the originalObjectId
        const documentId = originalObjectId;

        // Create history backup if needed
        if (needsHistory && originalDocument) {
            console.log('Creating history backup...');
            
            // Create a deep copy of the original document for history
            const historyRecord = JSON.parse(JSON.stringify(originalDocument));
            
            // Replace the _id with a new one for the history record
            historyRecord._id = new ObjectId();
            
            // Add metadata about when this was archived
            historyRecord.original_id = documentId; // Keep reference to original document
            // Format timestamp in AEST (Australian Eastern Standard Time)
            const aestDate = new Date().toLocaleString('en-AU', {
                timeZone: 'Australia/Sydney',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            });
            historyRecord.archived_date = aestDate + ' AEST';
            historyRecord.archived_by = username || 'unknown'; // Add who made the change
            
            // The archived_version should reflect the version being archived (not the new version)
            // This is already in the originalDocument so no need to set it
            
            await historyCollection.insertOne(historyRecord);
            historyRecordsCreated = 1;
            console.log('History record created with new ObjectId');
        }

        // Update or insert main document
        // NOTE: Version tracking is done at item level in the frontend, not document level
        
        // Convert document _id for save - make sure it's a clean copy without problematic _id
        const documentToSave = { ...document };
        delete documentToSave._id; // Remove the potentially problematic _id from frontend
        documentToSave._id = documentId; // Use the properly parsed ObjectId

        const result = await collection.replaceOne(
            { _id: documentId }, 
            documentToSave,
            { upsert: true }
        );
        
        console.log('Replace result:', {
            matchedCount: result.matchedCount,
            modifiedCount: result.modifiedCount,
            upsertedCount: result.upsertedCount,
            upsertedId: result.upsertedId
        });

        console.log('Document saved successfully');
        console.log('=== MongoDB Save Handler Completed Successfully ===');
        return {
            success: true,
            message: 'Data saved successfully',
            history_records_created: historyRecordsCreated
        };
    } catch (error) {
        console.error('=== MongoDB Save Handler Failed ===');
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
        return {
            success: false,
            message: error.message
        };
    }
});

// Check connection status
ipcMain.handle('mongodb-status', async () => {
    return {
        connected: mongoDatabase !== null,
        client: mongoClient !== null
    };
});

// Disconnect from MongoDB
ipcMain.handle('mongodb-disconnect', async () => {
    try {
        if (mongoClient) {
            await mongoClient.close();
            mongoClient = null;
            mongoDatabase = null;
        }
        return { success: true };
    } catch (error) {
        console.error('Disconnect failed:', error);
        return { success: false, message: error.message };
    }
});

// Handle app updates and other utilities
ipcMain.handle('show-error-dialog', async (event, { title, content }) => {
    return dialog.showErrorBox(title, content);
});

ipcMain.handle('app-version', async () => {
    return app.getVersion();
});

// Handle app close request
ipcMain.handle('close-app', async () => {
    try {
        // Close MongoDB connection if exists
        if (mongoClient) {
            await mongoClient.close();
        }
    } catch (error) {
        console.error('Error closing MongoDB connection:', error);
    }
    
    // Close all windows and quit the app
    app.quit();
});