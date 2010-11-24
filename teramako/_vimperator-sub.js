
// =============================================
// hatena bookmark
// =============================================
if (typeof hBookmark != 'undefined') {
  liberator.loadScript('chrome://hatenabookmark/content/vimperator/plugin/hatenabookmark.js', {__proto__: this});
}

// =============================================
// globalVariables
// =============================================
let (gv = liberator.globalVariables) {
  // =============================================
  // for copy.js
  // =============================================
  gv.copy_templates = [
    { label: 'hatenaAnchor',
      value: '[%URL%:title=%TITLE%]',
      custom: function() "[" + buffer.URL + ":title=" +
        buffer.title.replace(/[\[\]]/g,function(s) "&#" + s.charCodeAt(0) + ";") + "]",
      map: ',ha' },
    { label: 'hatenaBookmark', value: '[%URL%:bookmark]', map: ',hb' },
    { label: 'hatenaQuote',    value: '>%URL%:title=%TITLE%>\n%SEL%\n<<', map: ',hq' },
    { label: 'ldwikiAnchor',   value: '[[%TITLE%>%URL%]]', map: ',la' },
    { label: 'ASIN',           value: 'copy ASIN code from Amazon', custom: function() content.document.getElementById('ASIN').value },
    { label: 'titleAndURL',    value: '%TITLE%\n%URL%' },
    { label: 'title',          value: '%TITLE%', map: ',y' },
    { label: 'anchor',         value: '<a href="%URL%">%TITLE%</a>' },
    { label: 'selanchor',      value: '<a href="%URL%" title="%TITLE%">%SEL%</a>' },
    { label: 'htmlblockquote', value: '<blockquote cite="%URL%" title="%TITLE%">%HTMLSEL%</blockquote>' },
    { label: 'hateb',          value: 'http://b.hatena.ne.jp/entry/%URL%' },
  ];
  // =============================================
  // for twlist
  // =============================================
  gv.twlist_track_words = ["vimp,vimperator,twittperator,pentadactyl"];
};


// =============================================
// Add Mapping C-c copy or stop loading
// ==============================================
mappings.addUserMap([modes.NORMAL,modes.VISUAL],['<C-c>'], 'Copy selected text or stop loading',
	function(){
    var sel = document.commandDispatcher.focusedWindow.getSelection().toString();
		if (sel){
			util.copyToClipboard(sel,true);
		} else {
			BrowserStop();
			liberator.echomsg('Stopped loading !', 5);
		}
	},{ rhs: 'Copy selected text or stop loading' }
);

// =============================================
// Show feed-button to statusbar
// =============================================
(function(){
  if (liberator.version.indexOf("2.") != 0) return;
  var feedPanel = document.createElement('statusbarpanel');
  var feedButton = document.getElementById('feed-button');
  feedPanel.setAttribute('id','feed-panel-clone');
  feedPanel.appendChild(feedButton.parentNode.removeChild(feedButton));
  document.getElementById('status-bar').insertBefore(feedPanel,document.getElementById('security-button'));
})();

// =============================================
// userContext
// =============================================
let (c=modules.userContext) {
  c.__defineGetter__("doc", function() content.document.wrappedJSObject);
  c.__defineGetter__("win", function() content.wrappedJSObject);
  c.echo = liberator.echo;
  c.log = liberator.log

  // =============================================
  // bitly
  // =============================================
  c.bitly = function bitly(uri){
    let params = 
    [p.join("=") for each(p in [
        ["login", "teramako"],
        ["apiKey", "XXXXXXX"],
        ["format", "txt"],
        ["longUrl",encodeURIComponent(uri || buffer.URI)]
      ])].join("&");
    return util.httpGet("http://api.bit.ly/v3/shorten?" + params).responseText;
  };
};

// =============================================
// eijiro command
// =============================================
commands.addUserCommand(["eiji[ro]"], "space alc",
  function (args) {
    liberator.execute("mr alc '" + args.join(" ") + "'");
  }, {
    completer: function (context, args) {
      if (!args.string) return;
      let words = args.string;
      let reg = new RegExp("^" + words, "i");
      context.title = ["Words"];
      if (args.length > 1) context.offset -= words.length;
      context.completions = [
        [elm.textContent, "-"]
        for (elm in util.evaluateXPath("//word",
          util.httpGet("http://eow.alc.co.jp/eow/sg/?q=" + encodeURIComponent(words)).responseXML,
          null, true))
      ];
    }
  }
);

// vim: sw=2 ts=2 et:
