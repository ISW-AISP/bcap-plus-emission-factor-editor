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

### ✅ **Export Options**
- **JSON**: Raw data export for programmatic use
- **CSV**: Flat tabular export for spreadsheets
- **HTML Reference**: Formatted, self-contained reference document with collapsible sections, scope badges, per-row audit data, and print-friendly styles — generated dynamically from live database data

### ✅ **User Experience**
- Category-based navigation (fuels, packaging, transport, etc.)
- Modal editing with validation feedback
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

## 🔄 Version Management

### Semantic Versioning
This project follows semantic versioning (MAJOR.MINOR.PATCH):
- **PATCH** (1.0.x): Bug fixes, minor updates, documentation changes
- **MINOR** (1.x.0): New features, non-breaking changes, UI improvements
- **MAJOR** (x.0.0): Breaking changes, major refactoring, database schema changes

### Updating Version Numbers
**Important**: Update the version number before pushing to GitHub.

Use the npm scripts to bump version:
```bash
# Bug fixes and minor updates
npm run version:patch    # 1.0.0 -> 1.0.1

# New features
npm run version:minor    # 1.0.0 -> 1.1.0  

# Breaking changes
npm run version:major    # 1.0.0 -> 2.0.0
```

Or directly use the bump script:
```bash
node bump-version.js [patch|minor|major]
```

### Build and Release Process
1. Update version: `npm run version:patch` (or minor/major)
2. Commit changes: `git add . && git commit -m "Bump version to x.x.x"`
3. Push to GitHub: `git push`
4. Build release: `npm run build`
5. The version number will be included in the output filename (e.g., `Carbon-Halo-Emission-Editor-1.0.1.dmg`)

### Application Updates
To update the application:
1. Download the latest release with the new version number
2. Replace the old app with the new version
3. All user data is stored in MongoDB, so no data migration is needed

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