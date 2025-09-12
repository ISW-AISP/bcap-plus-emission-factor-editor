# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a standalone Electron-based MongoDB Emission Data Editor application for managing Carbon Halo BCAP emission lookup data. The application provides direct database connectivity for editing emission factors. The project consists of:
- An Electron desktop application for cross-platform deployment
- Direct MongoDB database connectivity for real-time emission factor editing
- JSON data file containing emission factors for various fuel types
- Secure tunneling through Cloudflare Warp for database access

## Architecture

### Key Components

1. **BCAP_Plus.Emission_Lookup.json**: Primary emission factor database containing:
   - Fuel types (bottled gas, diesel, natural gas, petrol, etc.)
   - Energy content factors and units
   - Scope 1 and Scope 3 CO2 emission factors
   - CH4 and N2O emission factors
   - Mobile vs stationary emission distinctions

2. **MongoDB Emission Data Editor/**: Standalone Electron application
   - Desktop application built with Electron framework
   - Direct MongoDB connectivity through secure tunneling
   - CSV import/export functionality
   - Real-time database editing interface
   - main.js: Electron main process entry point

### Data Structure

The emission data follows this hierarchical structure:
- Top-level fuel categories
- Energy content factors with unit conversions
- Emission factors by scope (Scope 1, Scope 3)
- Sub-categories for mobile/stationary sources where applicable

## Development Notes

### Working with Emission Data
- The JSON file uses MongoDB ObjectId format for document identification
- Emission factors are in kg CO2-e/GJ units
- Fuel units vary by type (kL for liquids, t for solids, MJ for gases)

### Electron Application
- Standalone desktop application packaged with Electron
- Cross-platform support (Windows, macOS, Linux)
- Direct MongoDB connection without web server intermediary
- Includes CSV export/import capabilities for data portability

### Security & Access Control
- **Cloudflare Warp Tunneling**: Secure connection to MongoDB through Cloudflare Warp
- **Email Whitelist**: Only pre-authorized email addresses can establish connections
- **One-Time Code (OTC)**: Users receive an email with a one-time code to authenticate and establish the tunnel
- **Encrypted Connection**: All database traffic is encrypted through the Warp tunnel

## Version Management

The application uses semantic versioning (MAJOR.MINOR.PATCH) maintained in package.json. Version numbers should be updated before each GitHub push following these guidelines:

### Version Bump Guidelines
- **Patch (x.x.1)**: Bug fixes, minor updates, documentation changes
- **Minor (x.1.0)**: New features, non-breaking changes, UI improvements  
- **Major (1.0.0)**: Breaking changes, major refactoring, database schema changes

### Version Update Process
1. **Before pushing to GitHub**, update the version using the bump-version.js script:
   ```bash
   node bump-version.js patch   # For bug fixes (1.0.0 -> 1.0.1)
   node bump-version.js minor   # For new features (1.0.0 -> 1.1.0)
   node bump-version.js major   # For breaking changes (1.0.0 -> 2.0.0)
   ```

2. **Commit the version change**:
   ```bash
   git add package.json
   git commit -m "Bump version to x.x.x"
   ```

3. **Build the application** (version will be included in output filename):
   ```bash
   npm run build
   ```

The Electron Builder automatically uses the version from package.json in the output filename (e.g., `Carbon-Halo-Emission-Editor-1.0.1.dmg`).