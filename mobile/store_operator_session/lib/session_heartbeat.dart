import 'dart:async';

/// Periodically calls `POST /vendor/sessions/ping` while the operator is signed in.
///
/// Usage:
/// ```dart
/// final heartbeat = SessionHeartbeat(
///   ping: () => api.post('/vendor/sessions/ping'),
///   interval: const Duration(seconds: 45),
/// );
/// heartbeat.start();
/// // on logout / USER_BLOCKED:
/// heartbeat.stop();
/// ```
class SessionHeartbeat {
  SessionHeartbeat({
    required this.ping,
    this.interval = const Duration(seconds: 45),
    this.onError,
  });

  /// Performs the authenticated heartbeat request.
  final Future<void> Function() ping;

  /// How often to ping after the initial launch call.
  final Duration interval;

  /// Optional error sink (network failures should not crash the app).
  final void Function(Object error, StackTrace stack)? onError;

  Timer? _timer;
  bool _running = false;

  bool get isRunning => _running;

  /// Sends an immediate ping, then schedules periodic heartbeats.
  Future<void> start() async {
    stop();
    _running = true;
    await _safePing();
    _timer = Timer.periodic(interval, (_) {
      unawaited(_safePing());
    });
  }

  void stop() {
    _running = false;
    _timer?.cancel();
    _timer = null;
  }

  Future<void> _safePing() async {
    if (!_running) return;
    try {
      await ping();
    } catch (e, st) {
      onError?.call(e, st);
    }
  }
}
