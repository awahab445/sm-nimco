/// Optional helper: register the device FCM token with the Nest backend.
///
/// Call after Firebase Messaging.getToken() and whenever the token refreshes:
/// ```dart
/// await api.post('/vendor/sessions/fcm-token', data: {'fcmToken': token});
/// ```
library;

/// Builds the JSON body for `POST /vendor/sessions/fcm-token`.
Map<String, String> fcmTokenRequestBody(String fcmToken) {
  return {'fcmToken': fcmToken.trim()};
}
