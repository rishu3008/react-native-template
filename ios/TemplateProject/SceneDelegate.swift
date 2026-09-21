import UIKit
import React_RCTAppDelegate

/// iOS 26 requires apps built against the current SDK to adopt the UIScene
/// life cycle. React Native 0.87 ships no scene support of its own, so the
/// window is created here and handed to RCTReactNativeFactory, which accepts
/// any UIWindow regardless of how it was vended.
class SceneDelegate: UIResponder, UIWindowSceneDelegate {
  var window: UIWindow?

  func scene(
    _ scene: UIScene,
    willConnectTo session: UISceneSession,
    options connectionOptions: UIScene.ConnectionOptions
  ) {
    guard let windowScene = scene as? UIWindowScene,
          let appDelegate = UIApplication.shared.delegate as? AppDelegate,
          let factory = appDelegate.reactNativeFactory
    else {
      return
    }

    let window = UIWindow(windowScene: windowScene)
    self.window = window

    factory.startReactNative(
      withModuleName: "TemplateProject",
      in: window,
      launchOptions: appDelegate.launchOptions
    )
  }
}
