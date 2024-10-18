package com.sampleapp

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import io.clearquote.assessment.cq_sdk.CQSDKInitializer
import io.clearquote.assessment.cq_sdk.singletons.PublicConstants.sdkInitializationSuccessCode

class ClearQuoteModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "ClearQuoteModule"
    }

    @ReactMethod
    fun initializeCQSDK(param: String, promise: Promise) {
        try {
            val currentActivity = reactApplicationContext.currentActivity
            val cqSDKInitializer = CQSDKInitializer(reactApplicationContext)

            if (!cqSDKInitializer.isCQSDKInitialized()) {
                cqSDKInitializer.initSDK(sdkKey = param, result = { isInitialized, code, message ->
                    if (code == sdkInitializationSuccessCode) {
                        promise.resolve(message)  // Resolve promise on success
                    } else {
                        println("SDK Initialization Error: $message")
                        promise.reject("InitializationError", message)  // Reject on failure with error message
                    }
                })
            } else {
                promise.resolve("SDK is already initialized")
            }

        } catch (e: Exception) {
            println("Exception during SDK initialization: ${e.localizedMessage}")
            promise.reject("Error", e)  // Handle any other exceptions
        }
    }

    @ReactMethod
    fun startInspection(param: String, promise: Promise) {
        try {
            val currentActivity = reactApplicationContext.currentActivity
            val cqSDKInitializer = CQSDKInitializer(reactApplicationContext)

            if (!cqSDKInitializer.isCQSDKInitialized()) {
                promise.reject("InspectionError", "SDK is not initialized yet")
            } else {
                if (currentActivity != null) {
                    cqSDKInitializer.startInspection(currentActivity, null, null, null, result = { isStarted, innerMsg, _ ->
                        promise.resolve(innerMsg)  // Resolve promise with inspection result
                    })
                } else {
                    promise.reject("ActivityError", "Activity is null")
                }
            }
        } catch (e: Exception) {
            println("Exception during inspection: ${e.localizedMessage}")
            promise.reject("InspectionError", e)  // Handle any other exceptions
        }
    }
}
