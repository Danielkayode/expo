import { requireNativeModule } from 'expo-modules-core';

// It loads the native module object from the JSI or falls back to
// the bridge module (from NativeModulesProxy) if the remote debugger is on.
const NativeModule = requireNativeModule('ExpoFusionForgeModule');

export function hello(): string {
  return NativeModule.hello();
}

export async function setValueAsync(value: string): Promise<void> {
  return await NativeModule.setValueAsync(value);
}

// Add other functions as needed for future features.
// For example:
// export async function getBackendDataAsync(params: Record<string, any>): Promise<Record<string, any>> {
//   return await NativeModule.getBackendDataAsync(params);
// }
//
// export function registerTelemetryEvent(eventName: string, eventData: Record<string, any>): void {
//   NativeModule.registerTelemetryEvent(eventName, eventData);
// }

console.log("ExpoFusionForgeModule loaded via JS");
NativeModule.logFromNative("JS called logFromNative during module load");

export default NativeModule;
