// あい
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

  if (1) { // コマンドラインのバグしゅうせパッチ {{{
    plugins.libly.$U.around(
      commandline,
      'input',
      function (next, [prompt, callback, extra]) {
        if (callback === finder.closure.onSubmit)
          return next();
        if (extra && (extra.onChange === hints.closure._onInput))
          return next();
        setTimeout(function () next(), 0);
      }
    );
    if (plugins.xHint) {
      [commands.get('xhint'), commands.get('xhintdo')].forEach(function (cmd) {
        plugins.libly.$U.around(
          cmd,
          'action',
          function (next) setTimeout(function () next(), 0)
        );
      });
    }
  } // }}}

  if (1) { // ヒントでリンクを選択して、アプリケーション起動 {{{
    hints._hintModes['save-with-prompt'] = hints._hintModes['a'];
    hints.addMode(
      'a',
      'External Application',
      function (link) {
        commandline.open(
          '',
          'applaunchother ' + util.escapeString(link.href) + ' ',
          modes.EX
        );
      },
      function () options.hinttags
    );

  } // }}}

  if (1) { // migemized_find の履歴に検索履歴 (tabopen/open) を加える {{{
    let open = commands.get('tabopen'), tabopen = commands.get('tabopen');

    plugins.libly.$U.around(
      plugins.migemized_find.migemized,
      'completer',
      function (next, [context]) {
        context.fork(
          'SearchHistory', 0, context,
          function (context) {
            let cs = [];
            let hist = storage['history-command'];
            let len = hist.length;
            let max = 5;

            for (let i = len - 1; 0 <= i; i--) {
              let it = hist.get(i);
              let [, cmd, , args] = commands.parseCommand(it.value);

              if (!args || !args.length || /^,/.test(args) || /(https?|ftp):/.test(args))
                continue;

              let unquotedArgs = args.replace(/['"]/g, '');

              if (!unquotedArgs.length)
                continue;
              if (!(open.hasName(cmd) || tabopen.hasName(cmd)))
                continue;

              cs.push([unquotedArgs, new Date(it.timestamp).toLocaleString()]);

              max--;
              if (max < 0)
                break;
            }
            context.title = ['Search History', 'Timestamp'];
            context.compare = void 0;
            context.completions = cs;
          }
        );

        context.fork(
          'MFHistory', 0, context,
          function (context) next([context])
        );
      },
      true
    );

  }//}}}

})();
