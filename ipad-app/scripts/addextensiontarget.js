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

project.addBuildPhase(
  [],
  'PBXFrameworksBuildPhase',
  'Frameworks',
  target.uuid
);

project.addBuildPhase(
  [],
  'PBXResourcesBuildPhase',
  'Resources',
  target.uuid
);

fs.writeFileSync(pbxPath, project.writeSync());
console.log('Extension target added to Xcode project!');