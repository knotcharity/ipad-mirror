const fs = require('fs');
const path = require('path');
const xcode = require('xcode');

const pbxPath = path.join(__dirname, '../ios/ipadapp.xcodeproj/project.pbxproj');
const project = xcode.project(pbxPath);
project.parseSync();

const extName = 'BroadcastExtension';
const bundleId = 'com.ipadmirror.app.broadcast';

const target = project.addTarget(extName, 'app_extension', extName, bundleId);

project.addBuildPhase(
  ['BroadcastExtension/SampleHandler.swift'],
  'PBXSourcesBuildPhase',
  'Sources',
  target.uuid
);
project.addBuildPhase([], 'PBXFrameworksBuildPhase', 'Frameworks', target.uuid);
project.addBuildPhase([], 'PBXResourcesBuildPhase', 'Resources', target.uuid);

// Write the project file first
fs.writeFileSync(pbxPath, project.writeSync());

// Now directly patch the file to set SWIFT_VERSION
let content = fs.readFileSync(pbxPath, 'utf8');

// Print what SWIFT_VERSION lines exist
const lines = content.split('\n').filter(l => l.includes('SWIFT_VERSION'));
console.log('SWIFT_VERSION lines before patch:', JSON.stringify(lines));

// Replace empty SWIFT_VERSION with 5.0
content = content.replace(/SWIFT_VERSION = "";/g, 'SWIFT_VERSION = 5.0;');
content = content.replace(/SWIFT_VERSION = ;/g, 'SWIFT_VERSION = 5.0;');
content = content.replace(/SWIFT_VERSION = \"\";/g, 'SWIFT_VERSION = 5.0;');

const linesAfter = content.split('\n').filter(l => l.includes('SWIFT_VERSION'));
console.log('SWIFT_VERSION lines after patch:', JSON.stringify(linesAfter));

fs.writeFileSync(pbxPath, content);
console.log('Extension target added and Swift version patched!');