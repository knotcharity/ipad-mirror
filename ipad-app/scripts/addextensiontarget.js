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

// Set Swift version on all build configurations for this target
const configList = project.pbxXCConfigurationList();
const buildConfigs = project.pbxXCBuildConfigurationSection();

for (const key in buildConfigs) {
  const config = buildConfigs[key];
  if (typeof config === 'object' && config.buildSettings) {
    config.buildSettings['SWIFT_VERSION'] = '5.0';
    config.buildSettings['TARGETED_DEVICE_FAMILY'] = '"1,2"';
    config.buildSettings['IPHONEOS_DEPLOYMENT_TARGET'] = '14.0';
  }
}

fs.writeFileSync(pbxPath, project.writeSync());
console.log('Extension target added!');