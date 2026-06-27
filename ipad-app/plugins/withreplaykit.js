const { withInfoPlist, withEntitlementsPlist } = require('@expo/config-plugins');

module.exports = function withReplayKit(config) {
  config = withInfoPlist(config, (config) => {
    config.modResults['NSMicrophoneUsageDescription'] =
      'Microphone access is needed for screen recording audio.';
    config.modResults['NSCameraUsageDescription'] =
      'Camera access is needed for streaming.';
    config.modResults['RPBroadcastUsageDescription'] =
      'Screen recording is used to stream your Procreate canvas to OBS.';
    return config;
  });

  config = withEntitlementsPlist(config, (config) => {
    config.modResults['com.apple.developer.broadcast-services'] = true;
    return config;
  });

  return config;
};