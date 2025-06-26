package expo.modules.fusionforge

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import android.util.Log

class ExpoFusionForgeModule : Module() {
  override fun definition() = ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module.
    Name("ExpoFusionForgeModule")

    // Defines a synchronous hello() function that returns a string.
    Function("hello") {
      "Hello from ExpoFusionForgeModule (Android)!"
    }

    // Defines a JavaScript function that always returns a Promise and whose native code
    // is by default dispatched on the different thread than the JavaScript runtime runs on.
    AsyncFunction("setValueAsync") { value: String ->
      // Send an event to JavaScript.
      // sendEvent("onChange", mapOf(
      //   "value" to value
      // ))
      Log.d("ExpoFusionForgeModule", "setValueAsync called with value: $value")
    }

    Function("logFromNative") { message: String ->
        Log.d("ExpoFusionForgeModule", "logFromNative: $message")
    }

    // Enables the module to be used as a native view. Definition components that are accepted native views are:
    // - ViewManager
    // - SimpleViewManager
    // View("View") {
    //   ExpoFusionForgeView(it)
    // }
  }

  private val TAG = "ExpoFusionForgeModule"
}
