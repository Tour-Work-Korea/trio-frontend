#import <React/RCTBridgeModule.h>
#import <Photos/Photos.h>

@interface ChatPhotoSaver : NSObject <RCTBridgeModule>
@end

@implementation ChatPhotoSaver
RCT_EXPORT_MODULE();
+ (BOOL)requiresMainQueueSetup { return NO; }

RCT_REMAP_METHOD(save, saveURL:(NSString *)source resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
{
  NSURL *url = [NSURL URLWithString:source];
  if (!url || (!url.isFileURL && ![url.scheme.lowercaseString isEqualToString:@"https"])) {
    reject(@"PHOTO_SAVE_FAILED", @"INVALID_URL", nil);
    return;
  }
  [PHPhotoLibrary requestAuthorizationForAccessLevel:PHAccessLevelAddOnly handler:^(PHAuthorizationStatus status) {
    if (status != PHAuthorizationStatusAuthorized && status != PHAuthorizationStatusLimited) {
      reject(@"PHOTO_PERMISSION", @"PHOTO_PERMISSION", nil);
      return;
    }
    void (^saveFile)(NSURL *, BOOL) = ^(NSURL *fileURL, BOOL temporary) {
      [[PHPhotoLibrary sharedPhotoLibrary] performChanges:^{
        [PHAssetChangeRequest creationRequestForAssetFromImageAtFileURL:fileURL];
      } completionHandler:^(BOOL success, NSError *error) {
        if (temporary) [[NSFileManager defaultManager] removeItemAtURL:fileURL error:nil];
        if (success) resolve(@YES);
        else reject(@"PHOTO_SAVE_FAILED", @"SAVE_FAILED", error);
      }];
    };
    if (url.isFileURL) {
      saveFile(url, NO);
      return;
    }
    NSURLSessionConfiguration *configuration = [NSURLSessionConfiguration ephemeralSessionConfiguration];
    configuration.timeoutIntervalForRequest = 30;
    configuration.timeoutIntervalForResource = 60;
    NSURLSession *session = [NSURLSession sessionWithConfiguration:configuration];
    [[session downloadTaskWithURL:url completionHandler:^(NSURL *location, NSURLResponse *response, NSError *error) {
      NSHTTPURLResponse *http = (NSHTTPURLResponse *)response;
      if (error || !location || http.statusCode < 200 || http.statusCode >= 300 || ![response.MIMEType hasPrefix:@"image/"]) {
        reject(@"PHOTO_SAVE_FAILED", @"DOWNLOAD_FAILED", error);
        [session finishTasksAndInvalidate];
        return;
      }
      NSString *extension = response.suggestedFilename.pathExtension;
      if (!extension.length) extension = @"jpg";
      NSURL *target = [[NSURL fileURLWithPath:NSTemporaryDirectory()] URLByAppendingPathComponent:
        [NSString stringWithFormat:@"ddakji-chat-%@.%@", NSUUID.UUID.UUIDString, extension]];
      NSError *moveError;
      if (![[NSFileManager defaultManager] moveItemAtURL:location toURL:target error:&moveError]) {
        reject(@"PHOTO_SAVE_FAILED", @"SAVE_FAILED", moveError);
      } else {
        saveFile(target, YES);
      }
      [session finishTasksAndInvalidate];
    }] resume];
  }];
}
@end
