package com.triofrontendapp

import android.content.ContentValues
import android.media.MediaScannerConnection
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.*
import com.facebook.react.uimanager.ViewManager
import java.io.File
import java.net.HttpURLConnection
import java.net.URL
import java.util.UUID

class ChatPhotoSaverPackage : ReactPackage {
  override fun createNativeModules(context: ReactApplicationContext): List<NativeModule> = listOf(ChatPhotoSaver(context))
  override fun createViewManagers(context: ReactApplicationContext): List<ViewManager<*, *>> = emptyList()
}

class ChatPhotoSaver(private val context: ReactApplicationContext) : ReactContextBaseJavaModule(context) {
  override fun getName() = "ChatPhotoSaver"

  @ReactMethod
  fun save(source: String, promise: Promise) {
    Thread {
      var connection: HttpURLConnection? = null
      var inserted: Uri? = null
      var legacyFile: File? = null
      try {
        val uri = Uri.parse(source)
        val input: java.io.InputStream
        val mime: String
        when (uri.scheme) {
          "https" -> {
            connection = URL(source).openConnection() as HttpURLConnection
            connection!!.connectTimeout = 15000
            connection!!.readTimeout = 30000
            if (connection!!.responseCode !in 200..299) throw Exception("DOWNLOAD_FAILED")
            mime = connection!!.contentType?.substringBefore(';') ?: ""
            if (!mime.startsWith("image/")) throw Exception("INVALID_IMAGE")
            input = connection!!.inputStream
          }
          "file", "content" -> {
            mime = context.contentResolver.getType(uri) ?: when (uri.lastPathSegment?.substringAfterLast('.')?.lowercase()) {
              "png" -> "image/png"
              "webp" -> "image/webp"
              "heic", "heif" -> "image/heic"
              else -> "image/jpeg"
            }
            input = context.contentResolver.openInputStream(uri) ?: throw Exception("INVALID_IMAGE")
          }
          else -> throw Exception("INVALID_URL")
        }
        val extension = android.webkit.MimeTypeMap.getSingleton().getExtensionFromMimeType(mime) ?: "jpg"
        val name = "ddakji-chat-${UUID.randomUUID()}.$extension"
        input.use { stream ->
          if (Build.VERSION.SDK_INT >= 29) {
            val values = ContentValues().apply {
              put(MediaStore.Images.Media.DISPLAY_NAME, name)
              put(MediaStore.Images.Media.MIME_TYPE, mime)
              put(MediaStore.Images.Media.RELATIVE_PATH, Environment.DIRECTORY_PICTURES + "/Ddakji")
              put(MediaStore.Images.Media.IS_PENDING, 1)
            }
            val target = context.contentResolver.insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, values)
              ?: throw Exception("SAVE_FAILED")
            inserted = target
            val output = context.contentResolver.openOutputStream(target) ?: throw Exception("SAVE_FAILED")
            output.use { stream.copyTo(it) }
            context.contentResolver.update(target, ContentValues().apply { put(MediaStore.Images.Media.IS_PENDING, 0) }, null, null)
          } else {
            val directory = File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_PICTURES), "Ddakji")
            if (!directory.exists() && !directory.mkdirs()) throw Exception("SAVE_FAILED")
            val file = File(directory, name)
            legacyFile = file
            file.outputStream().use { stream.copyTo(it) }
            MediaScannerConnection.scanFile(context, arrayOf(file.absolutePath), arrayOf(mime), null)
          }
        }
        promise.resolve(true)
      } catch (error: Exception) {
        inserted?.let { try { context.contentResolver.delete(it, null, null) } catch (_: Exception) {} }
        legacyFile?.delete()
        promise.reject(if (error is SecurityException) "PHOTO_PERMISSION" else "PHOTO_SAVE_FAILED", error)
      } finally {
        connection?.disconnect()
      }
    }.start()
  }
}
