// vim:sw=2 ts=2 et si fdm=marker:

liberator.log('_vimperatorrc.js loading');

(function () {

  // Plugins                                                                     {{{
  liberator.globalVariables.plugin_loader_plugins = <>
    _libly
    _smooziee
    alias
    appendAnchor
    asdfghjkl
    auto_reload
    auto_source
    bitly
    caret-hint
    commandBookmarklet
    feedSomeKeys_3
    gmail-commando
    hints-for-embedded
    hints-yank-paste
    ime_controller
    jscompletion
    lo
    multi_requester
    pino
    readcatlater
    readcatlater
    sbmcommentsviewer
    stella
    twittperator
    video-controller
    x-hint
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


})();

liberator.log('_vimperatorrc.js loaded');
liberator.registerObserver('enter', function () liberator.echo('Initialized.'));

