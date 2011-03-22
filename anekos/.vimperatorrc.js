// vim:sw=2 ts=2 et si fdm=marker ft=javascript:

liberator.log('_vimperatorrc.js loading');

(function () {

  // Plugins                                                                     {{{
  liberator.globalVariables.plugin_loader_plugins = <>
    _libly
    _smooziee
    alias
    appendAnchor
    !asdfghjkl
    auto-focus-frame
    auto_detect_link
    auto_reload
    auto_source
    bitly
    caret-hint
    commandBookmarklet
    copy
    edit-vimperator-files
    feedSomeKeys_3
    gmail-commando
    google-translator
    hatenaStar
    hints-for-embedded
    hints-yank-paste
    lo
    memo
    migemo_completion
    migemo_hint
    multi-exec
    multi_requester
    namakubi
    option-selector
    pino
    readcatlater
    sbmcommentsviewer
    statstat
    statusbar_panel
    stella
    subscldr
    tabsort
    tombloo
    hint-tombloo
    umihara
    usi
    twittperator
    video-controller
    x-hint
    zoom-em-all
    &#x8DF3;
  </>.toString().split(/\s+/).filter(function(n) !/^!/.test(n));
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

  // Read Cat Later                                                              {{{

  commandOpenMap(['<leader>l', '<A-l>'], ':readcatlater ');
  commandOpenMap(['<leader>n', '<leader>L', '<A-n>'], ':readcatnow ');
  commandOpenMap(['<leader>N', '<A-N>'], ':readcatnow! ');

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

  // ScrapBook                                                                   {{{

  commands.addUserCommand(
    ['scrap'],
    'Scrap current page by Scrapbook',
    function () sbBrowserOverlay.execCapture(0, null, false, "urn:scrapbook:root")
  );

  // }}}

  // コマンドラインの ! をトグル {{{
  // http://twitter.com/eagletmt/status/13462934115
  if (1) {
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

  // kei_s さんの空気(ドメイン)を読んでマジカル・オープン {{{
  if (1) {
    // https://gist.github.com/600896
    liberator.registerObserver('enter',function(){
      let tldStr = "(?:museum|travel|aero|arpa|coop|info|jobs|name|nvus|biz|com|edu|gov|int|mil|net|org|pro|xxx|ac|ad|ae|af|ag|ai|ak|al|am|an|ao|aq|ar|as|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|bi|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|ca|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|co|cr|cs|ct|cu|cv|cx|cy|cz|dc|de|dj|dk|dm|do|dz|ec|ee|eg|eh|er|es|et|eu|fi|fj|fk|fl|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gp|gq|gr|gs|gt|gu|gw|gy|hi|hk|hm|hn|hr|ht|hu|ia|id|ie|il|im|in|io|iq|ir|is|it|je|jm|jo|jp|ke|kg|kh|ki|km|kn|kp|kr|ks|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mi|mk|ml|mm|mn|mo|mp|mq|mr|ms|mt|mu|mv|mw|mx|my|mz|na|nc|nd|ne|nf|ng|nh|ni|nj|nl|nm|no|np|nr|nu|ny|nz|oh|ok|om|or|pa|pe|pf|pg|ph|pk|pl|pm|pn|pr|ps|pt|pw|py|qa|re|ri|ro|ru|rw|sa|sb|sc|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|st|su|sv|sy|sz|tc|td|tf|tg|th|tj|tk|tl|tm|tn|to|tp|tr|tt|tv|tw|tx|tz|ua|ug|uk|um|us|ut|uy|uz|va|vc|ve|vg|vi|vn|vt|vu|wa|wf|wi|ws|wv|wy|ye|yt|yu|za|zm|zw)"
      let regexp = new RegExp("^(?:[a-zA-Z0-9-.]+\\."+tldStr+"|[0-9]+\\.[0-9]+\\.[0-9]+\\.[0-9]+)(?:\/|$)","i");

      // thanks to @anekos http://vimperator.g.hatena.ne.jp/nokturnalmortum/20100730/1280474980
      // See Also http://code.google.com/p/vimperator-labs/source/browse/common/content/liberator.js
      // See Also http://code.google.com/p/vimperator-labs/source/browse/common/content/util.js
      return;
      plugins.libly.$U.around(
        liberator,
        'open',
        function (next, args) {
          let [urls, where, force] = args;
          if (typeof urls == "string") {
            if ( !/^(?:\.{0,2}|~)\//.test(urls) && /^[a-zA-Z0-9-.\/]+$/.test(urls) && !regexp.test(urls) ) {
              args[0] = "google " + urls;
            }
          }
          return next();
        }
      )
    });
  }
  // }}}

  // abbreviation 略語機能を日本語区切りで使えるようにする {{{
  if (1) {
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

  // Copy.js                                                                     {{{
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

  // }}}

  // statstat {{{
  if (1) {
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

  // mouse over hint mode                                                        {{{

  if (1) {
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

  // numeronym {{{
  commands.addUserCommand(
    ['numeronym', 'numerorym', 'lotion', 'munemomym'],
    'Nume Nume',
    function (args) liberator.echo(let ([,a,b,c] = /^(.)(.+)(.)$/(args.literalArg.trim())) (a+b.length+c)),
    {
      literal: 0
    },
    true
  );
  // }}}

  // Kill Menu Mode {{{
  // imap されていないキーで無視したいものは、inoremap <C-n> <nop> などとしておく
  if (1) {
    window.addEventListener(
      'keypress',
      function (event) {
        function killEvent ()
          (event.preventDefault(), event.stopPropagation());

        if (liberator.mode === modes.COMMAND_LINE && modes.extended === modes.HINTS) {
          let key = events.toString(event);
          if (/^<[CA]/(key))
            killEvent();
        }

        if (liberator.mode === modes.INSERT && modes.extended === modes.MENU) {
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
  }

  // }}}

  // auto_detect_link.js                                                         {{{

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

  // }}}

  // Readability {{{
  if (0) {
    let readability = function () { /// {{{
      liberator.open("javascript:(function(){readStyle='style-apertura';readSize='size-large';readMargin='margin-narrow';_readability_script=document.createElement('SCRIPT');_readability_script.type='text/javascript';_readability_script.src='http://lab.arc90.com/experiments/readability/js/readability.js?x='+(Math.random());document.getElementsByTagName('head')[0].appendChild(_readability_script);_readability_css=document.createElement('LINK');_readability_css.rel='stylesheet';_readability_css.href='http://lab.arc90.com/experiments/readability/css/readability.css';_readability_css.type='text/css';_readability_css.media='all';document.getElementsByTagName('head')[0].appendChild(_readability_css);_readability_print_css=document.createElement('LINK');_readability_print_css.rel='stylesheet';_readability_print_css.href='http://lab.arc90.com/experiments/readability/css/readability-print.css';_readability_print_css.media='print';_readability_print_css.type='text/css';document.getElementsByTagName('head')[0].appendChild(_readability_print_css);})();");
    }; // }}}

    commands.addUserCommand(
      'readability',
      'readability bookmarklet',
      function () {
        readability();
      },
      {}
    );
  }
  // }}}

  // ;F 連ヒントをバッファする {{{
  if (1) {
    liberator.registerObserver(
      'enter',
      function () {
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
    );
  }
  // }}}

  //ブックマークキーワードを展開 {{{
  if (1) {
    mappings.addUserMap(
      [modes.COMMAND_LINE],
      ['<C-o>'],
      'Expand bookmark keyword.',
      function ()
        let ([, cmd, bang, args] = commands.parseCommand(commandline.command))
          (commandline.command = commandline.command.replace(args, util.stringToURLArray(args).join(', ')))
    );
  } // }}}

  // Download Toolbar のクリア {{{
  if (1) {
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

  // 上のウィンドウにフォーカスを移動 {{{
  if (1) {
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

  // コマンドラインをエディタで編集 {{{
  if (1) {
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

  // サイト内検索 {{{
  if (1) {
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


})();


liberator.log('_vimperatorrc.js loaded');
liberator.registerObserver('enter', function () liberator.echo('Initialized.'));

