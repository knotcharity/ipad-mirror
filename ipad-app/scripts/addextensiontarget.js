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

// Set Swift version
const configurations = project.pbxXCBuildConfigurationSection();
for (const key in configurations) {
  const config = configurations[key];
  if (config.buildSettings && config._id === target.uuid) {
    config.buildSettings['SWIFT_VERSION'] = '5.0';
    config.buildSettings['TARGETED_DEVICE_FAMILY'] = '"1,2"';
    config.buildSettings['IPHONEOS_DEPLOYMENT_TARGET'] = '14.0';
  }
}

fs.writeFileSync(pbxPath, project.writeSync());
console.log('Extension target added to Xcode project!');