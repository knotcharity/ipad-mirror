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

// Only set Swift version on the BroadcastExtension target's config list
const configListUUID = project.pbxNativeTarget(extName).buildConfigurationList;
const configList = project.pbxXCConfigurationList()[configListUUID];
const buildConfigUUIDs = configList.buildConfigurations.map(c => c.value);
const buildConfigs = project.pbxXCBuildConfigurationSection();

buildConfigUUIDs.forEach(uuid => {
  if (buildConfigs[uuid] && buildConfigs[uuid].buildSettings) {
    buildConfigs[uuid].buildSettings['SWIFT_VERSION'] = '5.0';
    buildConfigs[uuid].buildSettings['TARGETED_DEVICE_FAMILY'] = '"1,2"';
    buildConfigs[uuid].buildSettings['IPHONEOS_DEPLOYMENT_TARGET'] = '14.0';
  }
});

fs.writeFileSync(pbxPath, project.writeSync());
console.log('Extension target added!');