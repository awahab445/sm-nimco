/// Detects NestJS `{ "message": "USER_BLOCKED" }` on HTTP 403 and runs kick-out.
///
/// Wire into Dio:
/// ```dart
/// dio.interceptors.add(
///   UserBlockedInterceptor(
///     onBlocked: () async {
///       await secureStorage.deleteAll();
///       heartbeat.stop();
///       navigatorKey.currentState?.pushNamedAndRemoveUntil('/login', (_) => false);
///       showBlockedDialog(); // "Your access has been blocked by the Super Admin."
///     },
///   ),
/// );
/// ```
class UserBlockedInterceptor {
  UserBlockedInterceptor({required this.onBlocked});

  final Future<void> Function() onBlocked;
  bool _handling = false;

  static const blockedMessage = 'USER_BLOCKED';
  static const blockedAlert =
      'Your access has been blocked by the Super Admin.';

  /// Call from your Dio `onError` / response interceptor.
  Future<void> handleStatus({
    required int? statusCode,
    required Object? responseData,
  }) async {
    if (statusCode != 403) return;
    if (!_isUserBlockedPayload(responseData)) return;
    if (_handling) return;
    _handling = true;
    try {
      await onBlocked();
    } finally {
      _handling = false;
    }
  }

  bool _isUserBlockedPayload(Object? data) {
    if (data is Map) {
      final message = data['message'];
      if (message == blockedMessage) return true;
      if (message is List && message.contains(blockedMessage)) return true;
    }
    if (data is String && data.contains(blockedMessage)) return true;
    return false;
  }
}
