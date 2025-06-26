import { registerRootComponent } from 'expo';

import App from './App';

// Hide this target from the JS inspector
globalThis.__expo_hide_from_inspector__ = 'expo-home';

// Initialize FusionForge global configuration object
if (!globalThis.__FUSIONFORGE_CONFIG__) {
  globalThis.__FUSIONFORGE_CONFIG__ = {
    backendApiUrl: null,
    projectId: null,
    userId: null,
    // Other future properties can be added here
  };
  console.log('FusionForge Dev Client: Initialized __FUSIONFORGE_CONFIG__');
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in the Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
