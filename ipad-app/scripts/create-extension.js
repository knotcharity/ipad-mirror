const fs = require('fs');
const path = require('path');

const extensionDir = path.join(__dirname, '../ios/BroadcastExtension');

if (!fs.existsSync(extensionDir)) {
  fs.mkdirSync(extensionDir, { recursive: true });
}

const sampleHandler = `import ReplayKit
import Foundation

class SampleHandler: RPBroadcastSampleHandler {
    var webSocket: URLSessionWebSocketTask?
    var session: URLSession?
    
    override func broadcastStarted(withSetupInfo setupInfo: [String : NSObject]?) {
        session = URLSession(configuration: .default)
        let url = URL(string: "ws://10.10.11.193:3000")!
        webSocket = session?.webSocketTask(with: url)
        webSocket?.resume()
        let hello = #"{"type":"ipad-hello"}"#
        webSocket?.send(.string(hello)) { _ in }
    }
    
    override func broadcastFinished() {
        webSocket?.cancel()
    }
    
    override func processSampleBuffer(_ sampleBuffer: CMSampleBuffer, with sampleBufferType: RPSampleBufferType) {
        guard sampleBufferType == .video else { return }
        guard let imageBuffer = CMSampleBufferGetImageBuffer(sampleBuffer) else { return }
        let ciImage = CIImage(cvPixelBuffer: imageBuffer)
        let context = CIContext()
        guard let cgImage = context.createCGImage(ciImage, from: ciImage.extent) else { return }
        let uiImage = UIImage(cgImage: cgImage)
        guard let jpegData = uiImage.jpegData(compressionQuality: 0.7) else { return }
        let base64 = "data:image/jpeg;base64," + jpegData.base64EncodedString()
        webSocket?.send(.string(base64)) { _ in }
    }
}
`;

fs.writeFileSync(path.join(extensionDir, 'SampleHandler.swift'), sampleHandler);

const infoPlist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDisplayName</key>
    <string>iPad Mirror</string>
    <key>CFBundleExecutable</key>
    <string>$(EXECUTABLE_NAME)</string>
    <key>CFBundleIdentifier</key>
    <string>com.ipadmirror.app.broadcast</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundleName</key>
    <string>$(PRODUCT_NAME)</string>
    <key>CFBundlePackageType</key>
    <string>XPC!</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0</string>
    <key>CFBundleVersion</key>
    <string>1</string>
    <key>NSExtension</key>
    <dict>
        <key>NSExtensionPointIdentifier</key>
        <string>com.apple.broadcast-services-upload</string>
        <key>NSExtensionPrincipalClass</key>
        <string>$(PRODUCT_MODULE_NAME).SampleHandler</string>
        <key>RPBroadcastProcessMode</key>
        <string>RPBroadcastProcessModeSampleBuffer</string>
    </dict>
</dict>
</plist>`;

fs.writeFileSync(path.join(extensionDir, 'Info.plist'), infoPlist);

console.log('BroadcastExtension files created!');