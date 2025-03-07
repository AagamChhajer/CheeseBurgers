var socket = io.connect('http://' + document.domain + ':' + location.port);
        
function logEvent(event, details = null) {
    socket.emit('log_event', { event: event, details: details });
}

document.addEventListener('mousemove', function(event) {
    logEvent('mouse_move', { x: event.clientX, y: event.clientY });
});

document.addEventListener('keydown', function(event) {
    logEvent('key_press', event.key);
});

document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        logEvent('tab_switched', 'User left the tab');
    } else {
        logEvent('tab_returned', 'User returned to the tab');
    }
});