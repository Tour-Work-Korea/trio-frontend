package com.triofrontendapp

import android.view.WindowManager
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class SoftInputModeModule(
  reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "SoftInputMode"

  @ReactMethod
  fun setAdjustResize() {
    setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE)
  }

  @ReactMethod
  fun setAdjustPan() {
    setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_PAN)
  }

  private fun setSoftInputMode(mode: Int) {
    currentActivity?.runOnUiThread {
      currentActivity?.window?.setSoftInputMode(mode)
    }
  }
}
