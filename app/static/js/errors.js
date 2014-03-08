var peernoteNS = peernoteNS || {};
peernoteNS.errors = {

  record: function(err, isWarning) {
    isWarning = isWarning ? true : false;
    var data = {
      'url': window.location.toString(),
      'path': window.location.pathname,
      'user-agent': window.navigator.userAgent,
      'type': isWarning ? 'warning' : 'error'
    };

    // Copy any optional parameters in the error object.
    var optional = ['message', 'msg', 'name', 'stack', 'lineNumber', 'url'];
    for (var k in optional) {
      if (err[optional[k]])
        data[optional[k]] = err[optional[k]];
    }

    $.post('/api/record-error', data, function(resp) {
      console.log('Logged javascript error', data);
    });
  }

};

window.onerror = function(message, url, lineNumber) {
  peernoteNS.errors.record({
    message: message,
    url: url,
    lineNumber: lineNumber
  });
};
