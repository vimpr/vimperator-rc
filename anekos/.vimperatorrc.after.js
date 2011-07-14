// vim: ft=javascript ts=2 sw=2 :
(function () {

  if (0) { // context.anchored = false をデフォルトにする {{{
  plugins.libly.$U.around(
    CompletionContext.prototype,
    'init',
    function (next) {
      let result =  next();
      if (this.hasOwnProperty('anchored'))
        this.anchored = false;
      return result;
    }
  )
  } // }}}

  if (1) { // ;F 連ヒントをバッファする {{{
    let scheduled = [];
    plugins.libly.$U.around(
      events,
      'onEscape',
      function (next) {
        try {
          if (scheduled.length)
            scheduled.forEach(function (elem) buffer.followLink(elem, liberator.NEW_BACKGROUND_TAB));
        } finally {
          scheduled = [];
          return next();
        }
      }
    );
    hints._hintModes['F'].action = function (elem) (liberator.log(elem),scheduled.push(elem), hints.show("F"));
  }
  // }}}

})();
