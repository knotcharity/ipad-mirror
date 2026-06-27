import ReplayKit
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