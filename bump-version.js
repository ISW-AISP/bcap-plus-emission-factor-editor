#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const packagePath = path.join(__dirname, 'package.json');
const package = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

const versionType = process.argv[2];
const validTypes = ['major', 'minor', 'patch'];

if (!validTypes.includes(versionType)) {
    console.error(`Usage: node bump-version.js [${validTypes.join('|')}]`);
    console.error('\nExamples:');
    console.error('  node bump-version.js patch  # 1.0.0 -> 1.0.1');
    console.error('  node bump-version.js minor  # 1.0.0 -> 1.1.0');
    console.error('  node bump-version.js major  # 1.0.0 -> 2.0.0');
    process.exit(1);
}

const currentVersion = package.version;
const versionParts = currentVersion.split('.').map(Number);

switch (versionType) {
    case 'major':
        versionParts[0]++;
        versionParts[1] = 0;
        versionParts[2] = 0;
        break;
    case 'minor':
        versionParts[1]++;
        versionParts[2] = 0;
        break;
    case 'patch':
        versionParts[2]++;
        break;
}

const newVersion = versionParts.join('.');
package.version = newVersion;

fs.writeFileSync(packagePath, JSON.stringify(package, null, 2) + '\n');

console.log(`Version bumped from ${currentVersion} to ${newVersion}`);
console.log('\nNext steps:');
console.log(`  1. git add package.json`);
console.log(`  2. git commit -m "Bump version to ${newVersion}"`);
console.log(`  3. git push`);
console.log(`  4. npm run build (to create release with new version)`);