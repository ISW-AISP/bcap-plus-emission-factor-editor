# Carbon Halo Emission Data Editor

A portable desktop application for editing BCAP+ emission lookup data with automatic history tracking.

## 🚀 Quick Start

### For Users (Pre-built App)
1. Download the appropriate app for your platform:
   - **Mac**: `Carbon-Halo-Emission-Editor.app`
   - **Windows**: `Carbon-Halo-Emission-Editor.exe`  
   - **Linux**: `Carbon-Halo-Emission-Editor.AppImage`

2. Double-click to run - no installation needed!

3. Login with your Carbon Halo database credentials

### For Developers

#### Prerequisites
- Node.js 18+ installed
- MongoDB access (local or cloud)

#### Setup
```bash
# Install dependencies
npm install

# Run in development mode
npm start

# Build for distribution
npm run build        # All platforms
npm run build-mac    # Mac only
npm run build-win    # Windows only
npm run build-linux  # Linux only
```

## 📋 Features

### ✅ **MongoDB Integration**
- Direct connection to MongoDB instances
- Automatic loading of BCAP_Plus.Emission_Lookup collection
- Real-time data synchronization

### ✅ **Smart History Tracking**
- Automatic backup to `Emission_Lookup_History` collection
- **24-hour rule**: Only creates history if last update was 24+ hours ago
- Preserves original document structure with version tracking

### ✅ **Data Validation**
- Real-time validation for emission factors
- Type checking for numerical values
- URL validation for source links
- Unit format validation

### ✅ **User Experience**
- Category-based navigation (fuels, packaging, transport, etc.)
- Modal editing with validation feedback
- Export functionality (JSON/CSV)
- Professional desktop app interface

## 🔧 Usage

1. **Login to Database**
   - Enter your Carbon Halo database username
   - Enter your password
   - Click "Login to Database" (or press Enter)

2. **Navigate Data Categories**
   - Use tabs to switch between categories
   - Each category shows all emission factors and metadata

3. **Edit Values**
   - Click "Edit" on any section
   - Modify values with real-time validation
   - Save to update the database

4. **History Management**
   - History automatically created when needed
   - Previous values preserved in `Emission_Lookup_History`
   - Version tracking for audit trails

## 📁 Project Structure

```
MongoDB Emission Data Editor/
├── main.js              # Electron main process
├── preload.js           # IPC bridge
├── index.html           # UI application
├── package.json         # Dependencies and build config
├── README.md            # This file
└── dist/                # Built applications (after build)
```

## 🛡️ Security

- All MongoDB operations happen in the main process
- Secure IPC communication between processes  
- No credentials stored locally
- Connection strings handled securely

## 📊 Data Format

The application works with MongoDB documents in this structure:
```javascript
{
  "_id": { "$oid": "..." },
  "fuels": {
    "diesel": {
      "energy_content_factor": 38.6,
      "emission_factor_unit": "kg CO2-e/GJ",
      "scope1_CO2_emission_factor": 69.9,
      // ... more fields
    }
  },
  "last_updated": "2025-01-08T10:30:00.000Z",
  "version": 2
}
```

## 🔄 Updates

To update the application:
1. Build new version: `npm run build`
2. Distribute new app files to users
3. Users replace old app with new one

## 📞 Support

For issues or questions:
- Check the MongoDB connection is accessible
- Verify BCAP_Plus database exists
- Ensure Emission_Lookup collection is present

## 🏗️ Build Notes

- Built with Electron for cross-platform compatibility
- Uses MongoDB Node.js driver for database operations
- Tailwind CSS for responsive UI
- Font Awesome icons for professional appearance