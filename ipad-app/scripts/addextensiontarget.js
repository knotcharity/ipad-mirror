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

// Get the config list UUID from the target we just created
const nativeTargets = project.pbxNativeTargetSection();
let configListUUID = null;
for (const key in nativeTargets) {
  const t = nativeTargets[key];
  if (typeof t === 'object' && t.name === extName) {
    configListUUID = t.buildConfigurationList;
    break;
  }
}

if (configListUUID) {
  const configList = project.pbxXCConfigurationList()[configListUUID];
  const buildConfigs = project.pbxXCBuildConfigurationSection();
  configList.buildConfigurations.forEach(c => {
    const config = buildConfigs[c.value];
    if (config && config.buildSettings) {
      config.buildSettings['SWIFT_VERSION'] = '5.0';
      config.buildSettings['TARGETED_DEVICE_FAMILY'] = '"1,2"';
      config.buildSettings['IPHONEOS_DEPLOYMENT_TARGET'] = '14.0';
      config.buildSettings['PRODUCT_BUNDLE_IDENTIFIER'] = bundleId;
    }
  });
}

fs.writeFileSync(pbxPath, project.writeSync());
console.log('Extension target added!');