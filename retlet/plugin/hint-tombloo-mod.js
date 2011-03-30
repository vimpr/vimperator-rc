var PLUGIN_INFO =
<VimperatorPlugin>
<name>{NAME}</name>
<description>Hint mode for Tombloo</description>
<author>motemen</author>
<version>0.2</version>
<minVersion>2.0pre</minVersion>
<maxVersion>3.0</maxVersion>
<updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/hint-tombloo.js</updateURL>
<detail><![CDATA[
== SETTINGS ==

let g:hint_tombloo_key   = 'R'
let g:hint_tombloo_xpath = '//img'

== MAPPINGS ==
;R :
    Share target element by Tombloo

]]></detail>
</VimperatorPlugin>;

(function () {

var hintKey   = liberator.globalVariables.hint_tombloo_key   || 'R';
var hintXPath = liberator.globalVariables.hint_tombloo_xpath || '//img';

hints.addMode(
    hintKey,
    'Share by Tombloo',
    function (elem) {
        var tomblooService = Cc['@brasil.to/tombloo-service;1'].getService().wrappedJSObject.Tombloo.Service;

        var d = window.content.document;
        var w = window.content.wrappedJSObject;
        var context = {
            document: d,
            window:   w,
            title:    d.title,
            target:   elem,
        };
        for (let p in w.location) {
            context[p] = w.location[p];
        }

        var extractors = tomblooService.check(context);

        var extractor;
        for (let i = 0; i < extractors.length; i++) {
            extractor = extractors[0];
            break;
        }
    tomblooService.share(context, extractor, false);
    },
    function () hintXPath
);

})();
