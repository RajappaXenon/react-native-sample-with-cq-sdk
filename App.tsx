/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { startTransition, useEffect } from 'react';
import type {PropsWithChildren} from 'react';
import { NativeModules, Alert, Button } from 'react-native';

const { ClearQuoteModule } = NativeModules;
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

type SectionProps = PropsWithChildren<{
  title: string;
}>;

function Section({children, title}: SectionProps): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
}

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  useEffect(() => {
    // Call the SDK initialization when the app loads
    initializeSDK();
  }, []);

  const initializeSDK = async () => {
    try {
      const result = await ClearQuoteModule.initializeCQSDK("YOUR_SDK_KEY_HERE");
      // Alert.alert('Success', result);  // Show success alert with the result
    } catch (error) {
      Alert.alert('Error', "error");  // Show error alert
    }
  };

  const startInspection = async () => {
    try {
      const result = await ClearQuoteModule.startInspection(JSON.stringify({ name: "sample" }));
      // Alert.alert('Success', result);  // Show success alert with the result
    } catch (error) {
      Alert.alert('Error', "error");  // Show error alert
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.buttonContainer}>
        <Button title="Start inspection" onPress={startInspection} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    margin: 20,
  },
});


export default App;
