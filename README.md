# 🚗 React Native Sample with ClearQuote SDK

**This repository demonstrates how to integrate the ClearQuote Android SDK into a React Native app.**

It is a minimal sample app that shows the full integration path: adding the CQ Android SDK to the native layer, exposing it to JavaScript via a **Kotlin native module**, and calling **initialize** and **start inspection** from your React Native UI. Use it as a step-by-step reference when adding ClearQuote vehicle inspection to your own React Native (Android) project.

> 📌 **Note:** All integration code lives in the **CQ SDK Integration** commit. The key files and snippets below map directly to that implementation.

> 📖 **Full integration document:** For complete SDK method parameters, responses, and detailed integration steps (including Java and Kotlin), see the **[CQ Native Android SDK integration guide](https://docs.google.com/document/d/1qaoIRasNhM7pLG6hKX2aLnKaZr35R-_8GSMnZpDO9Sw/edit?usp=sharing)**.

---

## ✨ What this sample demonstrates

The integration is shown through three pieces you’ll need in your own app:

| Feature | Description |
|--------|-------------|
| 🔑 **SDK initialization** | Initialize the ClearQuote Android SDK with your API key when the app loads so the native layer is ready before starting an inspection. |
| 🌉 **Native bridge (Kotlin)** | A **Kotlin native module** (`ClearQuoteModule`) that exposes the CQ Android SDK to JavaScript, so you can call `initializeCQSDK` and `startInspection` from React Native. |
| 📋 **Start inspection** | A **Start inspection** button in the React Native UI that triggers the full CQ flow (camera, vehicle capture, etc.) via the bridge. |

**In short:** This repo shows *how to integrate* the ClearQuote Android SDK into React Native—add the SDK on Android, bridge it with a native module, then call it from JS. You get a working *initialize once → tap to inspect* example.

---

## 📋 Prerequisites

Before you run or extend this sample, make sure you have:

| Requirement | Details |
|-------------|--------|
| 🟢 **Node.js** | Version **≥ 18** (check with `node -v`). |
| ⚛️ **React Native environment** | Follow the official [Environment Setup](https://reactnative.dev/docs/environment-setup) up to and including “Creating a new application.” |
| 🤖 **Android Studio & SDK** | Required for building and running the Android app (emulator or device). |
| 🔐 **ClearQuote SDK key** | Your API key from ClearQuote. You’ll replace `YOUR_SDK_KEY_HERE` in the app with this value. |

---

## 🚀 Quick start

### 1️⃣ Clone and install

```bash
git clone <your-repo-url>
cd react-native-sample-with-cq-sdk
npm install
```

### 2️⃣ Configure your SDK key

Open **`App.tsx`** and set your ClearQuote SDK key where the SDK is initialized:

```tsx
const result = await ClearQuoteModule.initializeCQSDK("YOUR_SDK_KEY_HERE");
```

Replace `"YOUR_SDK_KEY_HERE"` with your real key. Keep this key secure and avoid committing it to version control in production (use env vars or secure config).

### 3️⃣ Run the app

**Terminal 1** — start the Metro bundler:

```bash
npm start
```

**Terminal 2** — run the Android app:

```bash
npm run android
```

Once the app is open, tap **Start inspection** to launch the ClearQuote inspection flow. 🎉

---

## 📁 Project structure (ClearQuote Android SDK integration)

These are the files that implement the **ClearQuote Android SDK integration** in this React Native app. Everything else is standard React Native boilerplate.

| Path | Purpose |
|------|--------|
| 📄 `App.tsx` | JS entry point: calls `initializeCQSDK` on load and wires the **Start inspection** button to `startInspection`. |
| 📄 `android/.../ClearQuoteModule.kt` | Native bridge: exposes `initializeCQSDK` and `startInspection` to React Native with promise-based APIs. |
| 📄 `android/.../ClearQuotePackage.kt` | Registers `ClearQuoteModule` with React Native so it appears as `NativeModules.ClearQuoteModule`. |
| 📄 `android/.../MainApplication.kt` | Adds `ClearQuotePackage()` to the app’s list of native packages. |
| 📄 `android/app/build.gradle` | Declares the CQ SDK and Firebase dependencies. |
| 📄 `android/settings.gradle` | Adds the JitPack repository so the CQ SDK dependency can be resolved. |

Full path for the Kotlin files: `android/app/src/main/java/com/sampleapp/`.

---

## 💻 Code snippets

For full SDK method parameters, response formats, and detailed integration steps, see the **[CQ Native Android SDK integration guide](https://docs.google.com/document/d/1qaoIRasNhM7pLG6hKX2aLnKaZr35R-_8GSMnZpDO9Sw/edit?usp=sharing)**.

### 📱 JavaScript: Initialize and start inspection

This is how the app talks to the CQ SDK from React Native. Initialize once (e.g. in `useEffect`), then call `startInspection` when the user taps the button.

```tsx
import { NativeModules } from 'react-native';

const { ClearQuoteModule } = NativeModules;

// Initialize once (e.g. on app load)
const initializeSDK = async () => {
  try {
    const result = await ClearQuoteModule.initializeCQSDK("YOUR_SDK_KEY_HERE");
    // result indicates success
  } catch (error) {
    // handle error
  }
};

// Start inspection when user taps a button
const startInspection = async () => {
  try {
    const result = await ClearQuoteModule.startInspection(
      JSON.stringify({ name: "sample" })
    );
    // result contains inspection outcome
  } catch (error) {
    // handle error
  }
};
```

You can pass different payloads in `startInspection` (e.g. vehicle or session identifiers) as a JSON string, depending on what your backend expects.

---

### 🤖 Native (Kotlin): Bridge methods

`ClearQuoteModule.kt` exposes two **promise-based** methods to JavaScript. React Native automatically maps these to async/await on the JS side.

**🔑 Initialize SDK**

```kotlin
@ReactMethod
fun initializeCQSDK(param: String, promise: Promise) {
    val cqSDKInitializer = CQSDKInitializer(reactApplicationContext)
    if (!cqSDKInitializer.isCQSDKInitialized()) {
        cqSDKInitializer.initSDK(sdkKey = param, result = { isInitialized, code, message ->
            if (code == sdkInitializationSuccessCode) {
                promise.resolve(message)
            } else {
                promise.reject("InitializationError", message)
            }
        })
    } else {
        promise.resolve("SDK is already initialized")
    }
}
```

**📋 Start inspection**

```kotlin
@ReactMethod
fun startInspection(param: String, promise: Promise) {
    val currentActivity = reactApplicationContext.currentActivity
    val cqSDKInitializer = CQSDKInitializer(reactApplicationContext)
    if (cqSDKInitializer.isCQSDKInitialized() && currentActivity != null) {
        cqSDKInitializer.startInspection(currentActivity, null, null, null) { isStarted, innerMsg, _ ->
            promise.resolve(innerMsg)
        }
    } else {
        promise.reject("InspectionError", "SDK is not initialized or Activity is null")
    }
}
```

The module uses `CQSDKInitializer` from the CQ Android SDK and forwards success/error back to JS via `promise.resolve` / `promise.reject`.

---

### 📦 Android: CQ SDK dependency

From **`android/app/build.gradle`** — the CQ SDK is pulled from JitPack; Firebase is required by the SDK:

```gradle
dependencies {
    implementation("com.facebook.react:react-android")
    implementation 'com.github.clearquotetech:cq-android-sdk:2.2.9'
    implementation platform('com.google.firebase:firebase-bom:32.8.1')
    implementation 'com.google.firebase:firebase-analytics'
    // ...
}
```

In **`android/settings.gradle`**, the JitPack repository must be present so the CQ artifact can be resolved:

```gradle
repositories {
    google()
    mavenCentral()
    maven { url = uri("https://jitpack.io") }
}
```

---

## 📱 Platform support

| Platform | Status |
|----------|--------|
| 🤖 **Android** | ✅ Supported — CQ SDK fully integrated via `ClearQuoteModule`. |
| 🍎 **iOS** | ⚪ Not included in this sample — integration would require a similar native module in Swift/Obj-C. |

---

## 🛠️ Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start the Metro bundler (keep this running while developing). |
| `npm run android` | Build and run the app on Android (emulator or connected device). |
| `npm run ios` | Build and run the iOS app (no CQ integration in this sample). |
| `npm run lint` | Run ESLint. |
| `npm test` | Run Jest tests. |

---

## 🔧 Troubleshooting

| Issue | What to do |
|-------|------------|
| ⚠️ **“SDK is not initialized yet”** | Ensure `initializeCQSDK` is called and completes successfully before calling `startInspection`. In this sample, initialization runs on app load in `useEffect`. |
| ⚠️ **Build errors (CQ SDK or Firebase)** | Check that `android/settings.gradle` includes the JitPack repo and that `android/app/build.gradle` has the CQ and Firebase dependencies as in the snippets above. Sync Gradle and clean/rebuild if needed. |
| ⚠️ **Metro or runtime errors** | Use the official [React Native troubleshooting guide](https://reactnative.dev/docs/troubleshooting). Common fixes: clear Metro cache (`npm start -- --reset-cache`), rebuild the app, and ensure Node/React Native versions match the prerequisites. |

---

## 📚 Learn more

- **[CQ Native Android SDK integration guide](https://docs.google.com/document/d/1qaoIRasNhM7pLG6hKX2aLnKaZr35R-_8GSMnZpDO9Sw/edit?usp=sharing)** — Full integration document with SDK method parameters, responses, and Java/Kotlin code snippets.  
- [React Native – Environment Setup](https://reactnative.dev/docs/environment-setup)  
- [React Native – Native Modules (Android)](https://reactnative.dev/docs/native-modules-android)  
- [React Native – Integration with existing apps](https://reactnative.dev/docs/integration-with-existing-apps)

---

*Happy building! 🚀*
