jQuery.noConflict();var $j=jQuery;Object.keys||(Object.keys=function(b){var a=[],c;for(c in b)a.push(c);return a});Object.empty||(Object.empty=function(b){for(var a in b)return false;return true});Function.prototype.bind||(Function.prototype.bind=function(b){var a=this;return function(){a.apply(b,arguments)}});var _indexOf=Array.prototype.indexOf;
Array.prototype.indexOf=function(b){if(b instanceof Function){for(var a=0,c=this.length;a<c;a++)if(b(this[a]))return a;return-1}return _indexOf.apply(this,arguments)};
var GC={android:navigator&&navigator.userAgent&&navigator.userAgent.match(/Android/)?1:0,apple:navigator&&navigator.userAgent&&navigator.userAgent.match(/Mac OS/)?1:0,supportTouch:"ontouchstart"in document.documentElement,supportLS:"undefined"!=typeof localStorage,

Core:{
	_prefix:"http://c.airgames.com",
	_included:{},_pending:{},_executing:{},revision:function(){return isNaN(parseInt("20120913165023"))?(new Date).getTime():"20120913165023"},sdk:function(){return typeof SDK!="undefined"||parent.document!=document&&window.parent.AG!=

null},executing:function(b){GC.Core._executing[b]=true},executed:function(b){GC.Core._included[b]=true;delete GC.Core._executing[b];if(b in GC.Core._pending){var a=GC.Core._pending[b];delete GC.Core._pending[b];for(b=0;b<a.length;b++)a[b]()}}}};
(function(b){b("<div>").ajaxError(function(a,b,g,d){g.dataType=="script"&&console.log("SCRIPT ERROR from "+g.url+"\n\n"+d.stack)});GC.Core.ready=function(){for(var a=Array.prototype.slice.call(arguments,0),c=a.pop(),g=a.length,d=function(){--g==0&&c(b)},e=0,h=a.length;e<h;e++){var f=a[e];f in GC.Core._included?d():f in GC.Core._pending?GC.Core._pending[f].push(d):GC.Core._pending[f]=[d]}};GC.Core._normalize=function(a){return a.match(/^http/)||!GC.Core._prefix?a:a[0]=="/"?GC.Core._prefix+a.substring(1):
GC.Core._prefix+a};GC.Core._include=function(a,c){
		if(a in GC.Core._included)
			c();
		else if(a in GC.Core._pending)
			GC.Core._pending[a].push(c);
		else{
			GC.Core._pending[a]=[c];
			a in GC.Core._executing || b.getScript(GC.Core._normalize(a),
				function(){
					a in GC.Core._executing || GC.Core.executed(a)
				}
				)
		}
	};
	GC.Core.init=function(a){GC.Core._prefix=a||"";if(GC.Core._prefix.length>0&&!GC.Core._prefix.match(/.+\/$/))GC.Core._prefix=GC.Core._prefix+"/"};GC.Core.include=function(){var a=Array.prototype.slice.call(arguments,
0),c;c=a[a.length-1]instanceof Function?a.pop():function(){};for(var g=[],d=0,e=0,h=a.length;e<h;e++){var f=a[e];if(f instanceof Array)for(var i=0,j=f.length;i<j;i++){g.push(f[i]);d++}else{g.push(f);d++}}var k=0;if(d)for(e=0;e<d;e++)GC.Core._include(g[e],function(){++k==d&&c(b)});else c(b)};GC.Core.style=function(a){if(!(a in GC.Core._included)){GC.Core._included[a]=true;b(document).ready(function(){b("<link>").attr("href",GC.Core._normalize(a)).attr("rel","stylesheet").attr("type","text/css").appendTo(b(document.body))})}}})(jQuery);