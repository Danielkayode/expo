import { HomeFilledIcon, SettingsFilledIcon } from '@expo/styleguide-native';
import { NavigationContainer, useTheme, useNavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import * as React from 'react';
import { Platform, StyleSheet, Linking } from 'react-native';
import url from 'url'; // Added for parsing FusionForge connect URLs

import BottomTab, { getNavigatorProps } from './BottomTabNavigator';
import { HomeStackRoutes, SettingsStackRoutes, ModalStackRoutes } from './Navigation.types';
import defaultNavigationOptions from './defaultNavigationOptions';
import DiagnosticsIcon from '../components/Icons';
import { ColorTheme } from '../constants/Colors';
import Themes from '../constants/Themes';
import { AccountModal } from '../screens/AccountModal';
import { BranchDetailsScreen } from '../screens/BranchDetailsScreen';
import { BranchListScreen } from '../screens/BranchListScreen';
import { DiagnosticsStackScreen } from '../screens/DiagnosticsScreen';
import { FeedbackFormScreen } from '../screens/FeedbackFormScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { ProjectScreen } from '../screens/ProjectScreen';
import { ProjectsListScreen } from '../screens/ProjectsListScreen';
import QRCodeScreen from '../screens/QRCodeScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { SnacksListScreen } from '../screens/SnacksListScreen';
import {
  alertWithCameraPermissionInstructions,
  requestCameraPermissionsAsync,
} from '../utils/PermissionUtils';

// TODO(Bacon): Do we need to create a new one each time?
const HomeStack = createStackNavigator<HomeStackRoutes>();
const SettingsStack = createStackNavigator<SettingsStackRoutes>();

// We have to disable this option on Android to not use `react-native-screen`,
// which aren't correcly installed in the Home app.
const shouldDetachInactiveScreens = Platform.OS !== 'android';

function useThemeName() {
  const theme = useTheme();
  return theme.dark ? ColorTheme.DARK : ColorTheme.LIGHT;
}

function HomeStackScreen() {
  const themeName = useThemeName();

  return (
    <HomeStack.Navigator
      initialRouteName="Home"
      detachInactiveScreens={shouldDetachInactiveScreens}
      screenOptions={defaultNavigationOptions(themeName)}>
      <HomeStack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerShown: false,
        }}
      />
      <HomeStack.Screen
        name="ProjectsList"
        component={ProjectsListScreen}
        options={{
          title: 'Projects',
        }}
      />
      <HomeStack.Screen
        name="SnacksList"
        component={SnacksListScreen}
        options={{
          title: 'Snacks',
        }}
      />
      <HomeStack.Screen
        name="ProjectDetails"
        component={ProjectScreen}
        options={{
          title: 'Project',
        }}
      />
      <HomeStack.Screen
        name="Branches"
        component={BranchListScreen}
        options={{
          title: 'Branches',
        }}
      />
      <HomeStack.Screen
        name="BranchDetails"
        component={BranchDetailsScreen}
        options={{
          title: 'Branch',
        }}
      />
      <HomeStack.Screen
        name="FeedbackForm"
        component={FeedbackFormScreen}
        options={{
          title: 'Share your feedback',
        }}
      />
    </HomeStack.Navigator>
  );
}

function SettingsStackScreen() {
  const themeName = useThemeName();

  return (
    <SettingsStack.Navigator
      initialRouteName="Settings"
      detachInactiveScreens={shouldDetachInactiveScreens}
      screenOptions={defaultNavigationOptions(themeName)}>
      <SettingsStack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          headerBackImage: () => <></>,
        }}
      />
    </SettingsStack.Navigator>
  );
}

const RootStack = createStackNavigator();

function TabNavigator(props: { theme: string }) {
  return (
    <BottomTab.Navigator
      {...getNavigatorProps(props)}
      initialRouteName="HomeStack"
      detachInactiveScreens={shouldDetachInactiveScreens}>
      <BottomTab.Screen
        name="HomeStack"
        component={HomeStackScreen}
        options={{
          tabBarIcon: ({ color }) => <HomeFilledIcon style={styles.icon} color={color} size={24} />,
          tabBarLabel: 'Home',
        }}
      />

      {Platform.OS === 'ios' && (
        <BottomTab.Screen
          name="DiagnosticsStack"
          component={DiagnosticsStackScreen}
          options={{
            tabBarIcon: (props) => <DiagnosticsIcon {...props} style={styles.icon} size={24} />,
            tabBarLabel: 'Diagnostics',
          }}
        />
      )}
      <BottomTab.Screen
        name="SettingsScreen"
        component={SettingsStackScreen}
        options={{
          title: 'Settings',
          tabBarIcon: (props) => <SettingsFilledIcon {...props} style={styles.icon} size={24} />,
          tabBarLabel: 'Settings',
        }}
      />
    </BottomTab.Navigator>
  );
}

const ModalStack = createStackNavigator<ModalStackRoutes>();

export default (props: { theme: ColorTheme }) => {
  const navigationRef = useNavigationContainerRef<ModalStackRoutes>();
  const isNavigationReadyRef = React.useRef(false);
  const initialURLWasConsumed = React.useRef(false);

  React.useEffect(() => {
    const handleFusionForgeLink = (linkUrl: string): boolean => {
      if (!linkUrl) return false;

      const parsedUrl = url.parse(linkUrl, true); // true to parse query string
      if (parsedUrl.protocol === 'exp:' && parsedUrl.hostname === 'fusionforge-connect') {
        const projectUrl = parsedUrl.query?.projectUrl;
        if (projectUrl && typeof projectUrl === 'string') {
          try {
            const decodedProjectUrl = decodeURIComponent(projectUrl);
            console.log(`FusionForge Dev Client: Attempting to open project: ${decodedProjectUrl}`);
            // Ensure it's a valid Expo project URL before opening
            // This is a basic check, a more robust validation might be needed
            if (decodedProjectUrl.startsWith('exp:') || decodedProjectUrl.startsWith('exps:') || decodedProjectUrl.startsWith('http:') || decodedProjectUrl.startsWith('https:')) {
              Linking.openURL(decodedProjectUrl).catch(err => {
                console.error("FusionForge Dev Client: Failed to open project URL via deep link", err);
                // Optionally, navigate to an error screen or show a toast
              });
              return true; // Indicates the link was handled
            } else {
              console.warn(`FusionForge Dev Client: Invalid projectUrl format: ${decodedProjectUrl}`);
            }
          } catch (e) {
            console.error(`FusionForge Dev Client: Error decoding projectUrl: ${projectUrl}`, e);
          }
        } else {
          console.warn(`FusionForge Dev Client: projectUrl not found in deep link: ${linkUrl}`);
        }
      }
      return false; // Link was not a FusionForge connect link or was invalid
    };

    const handleDeepLinks = async ({ url: linkUrl }: { url: string | null }) => {
      if (!linkUrl || !isNavigationReadyRef.current) {
        return;
      }

      // Attempt to handle as a FusionForge connect link first
      if (handleFusionForgeLink(linkUrl)) {
        return; // FusionForge link handled, stop further processing
      }

      // Existing deep link logic (e.g., for QR scanner)
      // Note: Original code had Platform.OS === 'ios' check here, but this useEffect also runs getInitialURL.
      // Re-evaluating if that platform check is strictly necessary for this part or was for something else.
      // For now, keeping the structure, but FusionForge link handles for all platforms.
      if (Platform.OS === 'android' || Platform.OS === 'ios') { // Modified to include iOS for general deep links if not FF
        const nav = navigationRef.current;
        if (!nav) {
          return;
        }
        if (linkUrl.startsWith('expo-home://qr-scanner')) {
          if (await requestCameraPermissionsAsync()) {
            nav.navigate('QRCode');
          } else {
            await alertWithCameraPermissionInstructions();
          }
        }
        // Potentially other non-FusionForge, non-QR scanner deep links could be handled here if needed
      }
    };

    if (!initialURLWasConsumed.current) {
      initialURLWasConsumed.current = true;
      Linking.getInitialURL().then((initialUrl) => {
        if (initialUrl) {
          // Try to handle initial URL as FusionForge link first
          if (handleFusionForgeLink(initialUrl)) {
            return;
          }
          // If not a FusionForge link, proceed with other deep link handling
          handleDeepLinks({ url: initialUrl });
        }
      });
    }

    const deepLinkSubscription = Linking.addEventListener('url', (event) => handleDeepLinks({ url: event.url }));

    return () => {
      isNavigationReadyRef.current = false;
      deepLinkSubscription.remove();
    };
  }, []);

  return (
    <NavigationContainer
      theme={Themes[props.theme]}
      ref={navigationRef}
      onReady={() => {
        isNavigationReadyRef.current = true;
      }}>
      <ModalStack.Navigator
        initialRouteName="RootStack"
        detachInactiveScreens={shouldDetachInactiveScreens}
        screenOptions={({ route: _route, navigation: _navigation }) => ({
          headerShown: false,
          gestureEnabled: true,
          cardOverlayEnabled: true,
          cardStyle: { backgroundColor: 'transparent' },
          presentation: 'modal',
          // NOTE(brentvatne): it is unclear what this was intended for, it doesn't appear to be needed?
          // headerStatusBarHeight: navigation.getState().routes.indexOf(route) > 0 ? 0 : undefined,
          ...TransitionPresets.ModalPresentationIOS,
        })}>
        <ModalStack.Screen name="RootStack">
          {() => (
            <RootStack.Navigator
              initialRouteName="Tabs"
              detachInactiveScreens={shouldDetachInactiveScreens}
              screenOptions={{ presentation: 'modal' }}>
              <RootStack.Screen name="Tabs" options={{ headerShown: false }}>
                {() => <TabNavigator theme={props.theme} />}
              </RootStack.Screen>
              <RootStack.Screen
                name="Account"
                component={AccountModal}
                options={({ route: _route, navigation: _navigation }) => ({
                  headerShown: false,
                  ...(Platform.OS === 'ios' && {
                    gestureEnabled: true,
                    cardOverlayEnabled: true,
                    // NOTE(brentvatne): it is unclear what this was intended for, it doesn't appear to be needed?
                    // headerStatusBarHeight:
                    //   navigation
                    //     .getState()
                    //     .routes.findIndex((r: RouteProp<any, any>) => r.key === route.key) > 0
                    //     ? 0
                    //     : undefined,
                    ...TransitionPresets.ModalPresentationIOS,
                  }),
                })}
              />
            </RootStack.Navigator>
          )}
        </ModalStack.Screen>
        <ModalStack.Screen name="QRCode" component={QRCodeScreen} />
      </ModalStack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  icon: {
    marginBottom: Platform.OS === 'ios' ? -3 : 0,
  },
});
