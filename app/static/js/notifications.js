/**
 * Manager for notifications. Allowed listeners to provide callbacks that
 * will fire whenever a new notification is received
 */

var peernoteNS = peernoteNS || {};
peernoteNS.notifications = {
  notifications: [],   // every notification received so far
  listeners: [],       // callbacks to fire upon receiving new notifications
  lastTimestamp: null, // timestamp to provide api

  init: function() {
    var _this = this;

    _this._getNotifications();
    setInterval(function() {
      _this._getNotifications();
    }, 30000);
  },

  _getNotifications: function() {
    var _this = this;
    var params = {
      count: 10,
    }

    if (_this.lastTimestamp) {
      params.timestamp = _this.lastTimestamp;
    }

    $.get('/api/users/notifications', params, function(data) {
      if (data.status == "success") {
        var new_notifications = [];

        for (var i = 0; i < data.notifications.length; i++) {
          curNotification = data.notifications[i];
          _this.notifications.push(curNotification);
          new_notifications.push(curNotification);
        }

        if (new_notifications.length > 0) {
          for (var i = 0; i < _this.listeners.length; i++) {
            _this.listeners[i](new_notifications);
          }
        }
      }

      _this.lastTimestamp = Math.ceil((new Date()).getTime() / 1000);
    });

  },

  // Subscribe a callback for notifications
  subscribe: function(cb) {
    var _this = this;
    if (_this.notifications.length > 0) {
      cb(_this.notifications);
    }

    _this.listeners.push(cb);
  }

}

peernoteNS.init(function() {
  if (peernoteNS.is_logged_in) {
    peernoteNS.notifications.init();
  }
});
