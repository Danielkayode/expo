import ExpoModulesCore

public class ExpoFusionForgeModule: Module {
  public func definition() -> ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module.
    Name("ExpoFusionForgeModule")

    // Defines a synchronous hello() function that returns a string.
    Function("hello") {
      return "Hello from ExpoFusionForgeModule (iOS)!"
    }

    // Defines a JavaScript function that always returns a Promise and whose native code
    // is by default dispatched on the different thread than the JavaScript runtime runs on.
    AsyncFunction("setValueAsync") { (value: String) in
      // Send an event to JavaScript.
      // self.sendEvent("onChange", [
      //   "value": value
      // ])
      print("ExpoFusionForgeModule (iOS): setValueAsync called with value: \(value)")
    }

    Function("logFromNative") { (message: String) in
        print("ExpoFusionForgeModule (iOS) logFromNative: \(message)")
    }

    // Enables the module to be used as a native view. Definition components that are accepted native views are:
    // - ViewManager
    // - SimpleViewManager
    // View("View") {
    //   ExpoFusionForgeView()
    // }
  }
}
