// vim:sw=2 ts=2 et si fdm=marker ft=javascript:

(function () {

  // Plugins                                                                     {{{
  liberator.globalVariables.plugin_loader_plugins = <>
    &#x8DF3;
    _libly
    _smooziee
    alert
    alias
    appendAnchor
    asdfghjkl
    auto-bookmark
    auto-focus-frame
    auto_detect_link
    auto_reload
    auto_source
    !anti-auto-focus
    bitly
    buffer-multiple-hints
    caret-hint
    commandBookmarklet
    copy
    !dc
    direct_bookmark
    edit-vimperator-files
    !embed-esc
    epub-reader
    erection
    every
    feedSomeKeys_3
    forcefocuscontent
    gmail-commando
    google-plus-commando
    google-results
    google-translator
    grep
    hatenaStar
    !happy_hacking_vimperator
    hint-tombloo
    hints-for-embedded
    hints-yank-paste
    !hints-ext
    ldc-completer
    liberator-overlay-ext
    lo
    longcat
    loginManager
    !maine_coon
    memo
    migemized_find
    migemo_completion

    migemo_hint
    multi-exec
    multi_requester
    mpd-currentsong
    microsoft-translator
    my-style
    namakubi
    nicolist
    option-selector
    PDF.js
    pino
    prevent-pseudo-domain
    readitlater
    refe
    sbmcommentsviewer
    !statstat
    statusbar_panel
    stella
    slideshare
    subscldr
    !piyo-ui
    tab-history
    tabsort
    tombloo
    twittperator
    umihara
    usi
    video-controller
    walk-input
    !win-mouse
    x-hint
    zoom-em-all
  </>.toString().split(/\s+/).filter(function(n) !/^!/.test(n));

  if (liberator.has('Unix')) {
    liberator.globalVariables.plugin_loader_plugins = liberator.globalVariables.plugin_loader_plugins.filter(function (n) n !== 'win-mouse');
  }

  // }}}

  // Utils                                                                       {{{

  function s2b (s, d) (!/^(\d+|false)$/i.test(s)|parseInt(s)|!!d*2)&1<<!s;

  function around (obj, name, func) {
    let next = obj[name];
    obj[name] = function ()
      let (self = this, args = arguments)
        func.call(self,
                  function () next.apply(self, args),
                  args);
  }

  function commandMap (maps, cmd, args, cmdModes) {
    const lastBang = /\!$/;
    if (!cmdModes)
      cmdModes = [modes.NORMAL];
    let special = !!cmd.match(lastBang);
    if (special)
      cmd = cmd.replace(lastBang, '')
    mappings.addUserMap(
      cmdModes, maps, cmd + ' ' + (args || ''),
      function () commands.get(cmd).execute(args || '', special)
    );
  }

  function commandOpenMap (maps, cmd, cmdModes) {
    if (!cmdModes)
      cmdModes = [modes.NORMAL];
    mappings.addUserMap(
      cmdModes, maps, cmd,
      function () commandline.open(cmd[0], cmd.replace(/^./,''), modes.EX)
    );
  }

  function addUserCommand (cmd, fun, opts, desc) {
    commands.addUserCommand(
      (cmd instanceof Array) ? cmd : [cmd],
      desc || cmd,
      fun,
      opts || {}
    );
  }

  function addUserMap (cmd, fun, opts, cmdModes, desc) {
    mappings.addUserMap(
      cmdModes || [modes.NORMAL],
      (cmd instanceof Array) ? cmd : [cmd],
      desc || cmd,
      fun,
      opts || {}
    );
  }

  function addAutoCommand (URI, onEnter, onLeave) {
    let entered = false;
    autocommands.add('LocationChange', '(?!' + URI + ')', function () {
      if (entered) {
        entered = false;
        onLeave();
      }
    });
    autocommands.add('LocationChange', URI, function () {
        onEnter();
        entered = true;
    });
  }


  function getElementsByXPath(xpath, root) {
    let iterator = document.evaluate(xpath, root || document, null,
                                     XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
    let result = [];
    let node;
    while (node = iterator.iterateNext())
      result.push(node);
    return result;
  }

  // }}}

  // OS Settings {{{
  (function () {
    if (liberator.has('Unix')) {
      // ページキャッシュもあるし速度的には変化がないと思うが SSD に残っているのが嫌なので…
      options.setPref('browser.cache.disk.parent_directory', '/tmp/firefox/default');
    }
  })(); // }}}

  // Copy commandline                                                            {{{
  mappings.addUserMap(
    [modes.COMMAND_LINE],
    ['<C-S-c>'],
    'Copy current commandline',
    function() {
      util.copyToClipboard(commandline.command);
    }
  );

  mappings.addUserMap(
    [modes.COMMAND_LINE],
    ['<C-c>'],
    'Copy current commandline arguments',
    function() {
      util.copyToClipboard(commandline.command.replace(/^\S+\s*/, ''))
    }
  );

  let (
    remove = mappings.getDefault(modes.NORMAL, 'd').action
  )
    around(
      mappings.getDefault(modes.NORMAL, '<C-o>'),
      'action',
      function (next) (gBrowser.sessionHistory.index > 0 ? next : remove)(-1)
    );


  // }}}

  // reload images                                                               {{{

  if (1) {

    (function () {
      var obj = {
        reload: function () {
          obj.core.call(this, content.window);
        },
        core: function (aWindow) {
          var w = aWindow;
          for(var i = 0, j = w.frames.length; i < j; ++i) {
            arguments.callee.call(this,w.frames[i]);
          }
          var cnt = 0, req, img, list = w.document.images;
          for(var i = 0, j = list.length; i < j; ++i) {
            img = list[i];
            if (img instanceof Ci.nsIImageLoadingContent && img.currentURI) {
              req = img.getRequest(Ci.nsIImageLoadingContent.CURRENT_REQUEST);
              if(req && !(req.imageStatus & req.STATUS_LOAD_COMPLETE)){
                img.forceReload();
                ++cnt;
              }
            }
          }
          liberator.echo('reload image:' + cnt);
        }
      };
      commands.addUserCommand(
        ['reloadimage'],
        'reload images',
        obj.reload,
        {},
        true
      );
    })();
  }

  // }}}

  // Util funcitons for commandline {{{
  {
    let flasher = Cc['@mozilla.org/inspector/flasher;1'].createInstance(Ci.inIFlasher);
    flasher.color = '#FF0000';
    flasher.thickness = 2;

    let (c = modules.userContext) {
      c.__defineGetter__("doc", function() content.document.wrappedJSObject);
      c.__defineGetter__("win", function() content.window.wrappedJSObject);
      c.echo = liberator.echo;
      c.log = liberator.log;
      c.A = Array.slice;
      c.flash = function flash (elem, time) {
        let count = 10;
        let h = setInterval(
          function () {
            if (count === 0)
              return clearInterval(h);
            if (count % 2 === 0)
              flasher.drawElementOutline(elem);
            else
              flasher.repaintElement(elem);
            --count;
          },
          100
        );
        return elem;
      };
      c.time = function (func, self, args) {
        let [a, r, b] = [new Date(), func.apply(self, args || []), new Date()];
        let msg = 'time: ' + ((b.getTime() - a.getTime()) / 1000) + 'msec';
        Application.log(msg);
        return msg;
      };
    }
  }
  // }}}

  if (1) { // ScrapBook                                                                   {{{
    commands.addUserCommand(
      ['scrap'],
      'Scrap current page by Scrapbook',
      function () ScrapBookBrowserOverlay.execCapture(0, null, false, "urn:scrapbook:root"),
      {},
      true
    );
  } // }}}

  if (1) { // コマンドラインの ! をトグル {{{
    // http://twitter.com/eagletmt/status/13462934115
    mappings.addUserMap(
      [modes.COMMAND_LINE],
      ['<C-x>'],
      'toggle bang',
      function () {
        let [, cmd, bang, args] = commands.parseCommand(commandline.command);
        bang = bang ? '' : '!';
        commandline.command = cmd + bang + ' ' + args;
      }
    );
  }
  // }}}

  if (1) { // コマンドラインの <C-a> を2段階移動にする {{{
    mappings.addUserMap(
      [modes.COMMAND_LINE],
      ['<C-a>'],
      'Go to head.',
      function () {
        let e = Editor.getEditor();
        let m = e.value.match(/^\s*\S+\s/);

        if (!m) {
          editor.executeCommand("cmd_beginLine", 1);
          return;
        }

        if (e.selectionStart <= m[0].length) {
          editor.executeCommand("cmd_beginLine", 1);
          return;
        }

        editor.executeCommand("cmd_beginLine", 1);
        editor.executeCommand("cmd_wordNext", 1);
        editor.executeCommand("cmd_charNext", 1);
      },
      {}
    );
  }//}}}

  if (1) { // abbreviation 略語機能を日本語区切りで使えるようにする {{{
    // http://vimperator.g.hatena.ne.jp/nokturnalmortum/20100430/1272628087
    // 一-龠 ァ-ヶ ー あ-ん 、。！？
    let nonkw = "\\s\"'\\u4e00-\\u9fa0\\u30A1-\\u30F6\\u30FC\\u3042-\\u3093\\u3001\\u3002\\uFF01\\uFF1F";
    let keyword = "[^" + nonkw + "]";
    let nonkeyword = "[" + nonkw + "]";
    let fullId = keyword + "+";
    let endId = nonkeyword + "+" + keyword;
    let nonId = "\\S*" + nonkeyword;
    abbreviations._match = fullId + "|" + endId + "|" + nonId;
  }
  // }}}

  if (1) { // Copy.js                                                                 {{{
    function shortAmazon () {
      var asin = content.document.getElementById('ASIN').value;
      var base = 'http://amazon.jp/';
      var dirs = ['dp/', 'o/ASIN/', 'gp/product/'];

      if (asin) {
        for each (var it in dirs) {
          if (content.document.location.pathname.indexOf(it) != 1)
            return base + it + asin;
        }
      }
    }

    // for copy.js
    liberator.globalVariables.copy_templates = [
      {
        label: 'bookmark',
        value: "[%TITLE%]\n%URL%\n"
      },
      {
        label: 'titleAndURL',
        value: '%TITLE%\n%URL%\n'
      },
      {
        label: 'title',
        value: '%TITLE%'
      },
      {
        label: 'hatena',
        value: '[%URL%:title=%TITLE%]'
      },
      {
        label: 'hatenacite',
        value: '>%URL%:title=%TITLE%>\n%SEL%\n<<'
      },
      {
        label: 'markdown',
        value: '[%SEL%](%URL% "%TITLE%")'
      },
      {
        label: 'htmlblockquote',
        value: '<blockquote cite="%URL%" title="%TITLE%">%HTMLSEL%</blockquote>'
      },
      {
        label: 'amazon',
        value: 'Short Amazon',
        custom: shortAmazon
      },
      {
        label: 'ASIN',
        value: 'copy ASIN code from Amazon for Hatena',
        custom: function() ('asin:'+content.document.getElementById('ASIN').value+':detail')
      },
      {
        label: 'domain',
        value: 'domain',
        custom: function () content.document.domain.replace(/^[^.]+\.([^.]+\.([^.]{3}|[^.]{2}\.[^.]{2}))$/, '$1') },
      {
        label: 'nico',
        value: 'for hatena diary',
        custom: function () ('[niconico:'+buffer.URL.match(/[a-z]{2,3}\d+/)+']')
      },
      {
        label: 'genkyu',
        value: '><blockquote cite="%URL%" title="%TITLE%"><\n%SEL%\n></blockquote><'
      },
      {
        label: 'hgenkyu',
        value: '><blockquote cite="%URL%" title="%TITLE%"><\n%HTMLSEL%\n></blockquote><'
      },
      {
        label: 'quoteWithTitleAndURL',
        value: '\u3010%TITLE%\u3011\n%SEL%\n%URL%'
      },
      {
        label: 'crchangeset',
        value: 'http://coderepos.org/share/changeset/'
      },
      {
        label: 'gogle',
        value: 'gogle',
        custom: function () JSON.parse(util.httpGet("http://ggl-shortener.appspot.com/?url="+encodeURIComponent(buffer.URL)).responseText).short_url
      },
      {
        label: 'link',
        value: '<a href="%URL%">%TITLE%</a>'
      }
    ];
  } // }}}

  if (0) { // statstat {{{
    liberator.globalVariables.statstat_expression =
      function() {
        try {
          if (liberator.mode == modes.INSERT)
            return liberator.focus.value.length;
          let [, cmd, ,as] = commands.parseCommand(commandline.command);
          if (/^tw$/(cmd))
            return plugins.twittperator.Utils.parseSayArg(as).text.length;
          return as ? as.length : '-';
        } catch (e) {
          return 'error';
        }
      }
  } // }}}

  if (1) { // mouse over hint mode                                                        {{{
    hints.addMode(
      'm',
      'mouse over',
      function (elem, count) {
        let evt = elem.ownerDocument.createEvent('MouseEvents');
        evt.initMouseEvent(
          'mouseover',
          true, true,
          elem.ownerDocument.defaultView,
          0, 0, 0, 0, 0,
          false, false, false, false, 0, null
        );
        elem.dispatchEvent(evt);
      },
      function () options.get('hinttags').get()
    );
  } // }}}

  if (1) { // Kill Menu Mode and shortcut keys on Hint mode {{{
    // imap されていないキーで無視したいものは、inoremap <C-n> <nop> などとしておく
    window.addEventListener(
      'keypress',
      function (event) {
        function killEvent ()
          (event.preventDefault(), event.stopPropagation());

        if (liberator.mode === modes.COMMAND_LINE && modes.extended === modes.HINTS) {
          let key = events.toString(event);
          if (/^<[CA]/.test(key))
            killEvent();
        }

        if (modes.isMenuShown) {
          let key = events.toString(event);
          if (key == '<Space>')
            return;
          let map = mappings.get(modes.INSERT, events.toString(event));
          if (map) {
            killEvent();
            map.execute();
          }
        }
      },
      false
    );
  } // }}}

  if (1) { // auto_detect_link.js                                                         {{{
    liberator.globalVariables.autoDetectLink = {
      nextPatterns: [
        //[NnＮｎ][EeＥｅ][XxＸｘ][TtＴｔ]/,
        /[Nn\uff2e\uff4e][Ee\uff25\uff45][Xx\uff38\uff58][Tt\uff34\uff54]/,
        //[FfＦｆ](?:[OoＯｏ][RrＲｒ])?[WwＷｗ](?:[AaＡａ][RrＲｒ])?[DdＤｄ]/,
        /[Ff\uff26\uff46](?:[Oo\uff2f\uff4f][Rr\uff32\uff52])?[Ww\uff37\uff57](?:[Aa\uff21\uff41][Rr\uff32\uff52])?[Dd\uff24\uff44]/,
        //^\s*(?:次|つぎ)[への]/, /つづく|続/, /(?:[^目]|^)次|つぎ/, /進む/,
        /^\s*(?:\u6B21|\u3064\u304E)[\u3078\u306E]/, /\u3064\u3065\u304F|\u7D9A/, /(?:[^\u76EE]|^)\u6B21|\u3064\u304E/, /\u9032\u3080/,
        //^\s*>\s*$/, />+|≫/
        /^\s*>\s*$/, />+|\u226b/
      ],
      backPatterns: [
        //[BbＢｂ][AaＡａ][CcＣｃ][KkＫｋ]/, /[PpＰｐ][RrＲｒ][EeＥｅ][VvＶｖ]/,
        /[Bb\uff22\uff42][Aa\uff21\uff41][Cc\uff23\uff43][Kk\uff2b\uff4b]/, /[Pp\uff30\uff50][Rr\uff32\uff52][Ee\uff25\uff45][Vv\uff36\uff56]/,
        //^\s*前[への]/, /前/, /戻る/,
        /^\s*\u524d[\u3078\u306e]/, /\u524d/, /\u623b\u308b/,
        //^\s*<\s*$/, /<+|≪/
        /^\s*<\s*$/, /<+|\u226a/
      ],
      force: true,
      clickButton: true,
    };
  } // }}}

  if (1) { //ブックマークキーワードを展開 {{{
    mappings.addUserMap(
      [modes.COMMAND_LINE],
      ['<C-o>'],
      'Expand bookmark keyword.',
      function ()
        let ([, cmd, bang, args] = commands.parseCommand(commandline.command))
          (commandline.command = commandline.command.replace(args, util.stringToURLArray(args).join(', ')))
    );
  } // }}}

  if (1) { // Download Toolbar のクリア {{{
    commands.addUserCommand(
      ['dltbc'],
      'Clear download toolbar',
      function () {
        document.querySelector('#downbarClearButton').click();
      },
      {},
      true
    );
  } // }}}

  if (1) { // 親ウィンドウ(フレーム)にフォーカスを移動 {{{
    //let map = mappings.getDefault(modes.NORMAL, '<ESC>');
    mappings.addUserMap(
      [modes.NORMAL],
      ['<ESC>'],
      'Focus to parent window',
      function() {
        if (modes.passNextKey || modes.passAllKeys)
          return events.onEscape();
        Buffer.focusedWindow = Buffer.focusedWindow.parent;
      },
      {}
    );
  } // }}}

  if (1) { // コマンドラインをエディタで編集 {{{
    mappings.addUserMap(
      [modes.COMMAND_LINE],
      ['<C-i>'],
      'Edit commandline by external editor',
      function () {
        io.withTempFiles(
          function (file) {
            file.write(commandline.command);
            editor.editFileExternally(file.path);
            commandline.open(":", file.read(), modes.EX);
            return true;
          }
        );
      }
    );
  } // }}}

  if (1) { // サイト内検索 {{{
    commands.addUserCommand(
      ['sitesearch'],
      'Search in this site',
      function (args) {
        liberator.open(
          'http://www.google.com/search?q=' +
            encodeURIComponent(args.literalArg) +
            '+site%3A' +
            window.content.location.hostname,
          liberator.NEW_TAB
        );
      },
      {
        completer: function (context) completion.url(context, 'S'),
        literal: 0,
      },
      true
    );
  } // }}}

  if (1 && liberator.has('Windows')) { // win-mouse なヒント追加 {{{
    hints.addMode(
      'w',
      'Move cursor',
      function (elem) plugins.winMouse.API.move({elem: elem}),
      function () '//img|//a|//span|//object|//embed'
    );
    hints.addMode(
      'W',
      'Move and click cursor',
      function (elem) plugins.winMouse.API.click({elem: elem}),
      function () '//img|//a|//span|//object|//embed'
    );
  } // }}}

  if (1) { // liberator-overlay-ext の透過トグル {{{
    mappings.addUserMap(
      [modes.COMMAND_LINE],
      ['<C-g>', '<C-t>'],
      'Toggle commandline transparency',
      function () plugins.liberatorOverlayExt.toggleShowBackground()
    );
  } // }}}

  if (1) { // autocmd を echomsg しないようにする {{{
    let (original = liberator.echomsg)
      liberator.echomsg = function (msg) {
        const REAC = RegExp('@chrome://liberator/content/autocommands\\.js:\\d+');
        if (Error().stack.split(/\n/).some(RegExp.prototype.test.bind(REAC)) && /Executing .* Auto commands for .*/.test(msg))
          liberator.log(msg);
        else
          original.apply(liberator, arguments);
      };
  } // }}}

  if (1) { // :mess の出力をコピーする {{{
    commands.addUserCommand(
      ['messcopy'],
      'Copy messages to clipboard',
      function () {
        util.copyToClipboard(
          commandline._messageHistory._messages.map(
            function(it)
              let (v = it.str) (
                typeof v === 'xml'    ? v.textContent :
                typeof v === 'object' ? (v + "\n" + v.stack) :
                v
              )
          ).join("\n\n")
        );
      },
      {},
      true
    );
  } // }}}

  if (1) { // Reblog from All Tabs {{{
    commands.addUserCommand(
      ['reblogall'],
      'reblog all',
      function() {
        var itab=0;
        var ntab=tabs.count;
        liberator.echo(ntab);
        for(itab=0;itab<ntab;itab++){
          if(plugins.libly.$U.getFirstNodeFromXPath('//*[@id="tumblr_controls"]')){
            //reblog and close
            liberator.echo('rebloging',itab);
            liberator.execute('tombloo ReBlog\ -\ Tumblr');
            liberator.sleep(1000);
            liberator.execute('tabclose');
          }else{
            //next tab
            //liberator.echo('no reblog');
            liberator.execute('tabnext');
          }
        }
      }
    );
  }// }}}

  if (1) { // <Esc> でコマンドラインをキャンセルしても履歴を保存する {{{
    mappings.addUserMap(
      [modes.COMMAND_LINE],
      ['<Esc>'],
      'I wish to escape to the blue sky.',
      (function () {
        if (this._history && this._history.save)
          this._history.save();
        events.onEscape();
      }).bind(commandline),
      {}
    );
  } // }}}

  if (1) { // 画像表示オプション (set image) {{{
    options.add(
      ['image'],
      'Image display options',
      'number',
      1,
      {
        scope: Option.SCOPE_GLOBAL,
        setter: function (value) {
          options.setPref('permissions.default.image', value);
          return value;
        },
        getter: function (value) {
          return options.getPref('permissions.default.image');
        },
        completer: function () {
          return [
            [1, 'Allow all images to load, regardless of origin'],
            [2, 'Block all images from loading.'],
            [3, 'Prevent third-party images from loading.']
          ];
        },
        validator: function (value) {
          return (1 <= value) && (value <= 3);
        }
      }
    );
  } // }}}

})();


