jq=jQuery.noConflict();
var AG_isTouch=function(){
	var b=navigator.userAgent.toLowerCase();
	if((b.indexOf("webkit")!=-1&&b.indexOf("mobile")!=-1)||b.indexOf("android")!=-1||b.indexOf("iphone")!=-1||b.indexOf("ipad")!=-1||b.indexOf("ipod")!=-1||b.indexOf("blackberry")!=-1||b.indexOf("playbook")!=-1||b.indexOf("rim")!=-1||b.indexOf("nokia")!=-1||b.indexOf("bada")!=-1||b.indexOf("webos")!=-1||b.indexOf("meego")!=-1){return true}return false};if(window.console){if(AG_isTouch()){window.log=function(g,h,f,m,l,j){var k=""+g;if(h){k+=" (0):"+h;if(f){k+=" (1):"+f;if(m){k+=" (2):"+m;if(l){k+=" (3):"+l;if(j){k+=" (4):"+j}}}}}window.console.log(k)}}else{window.log=window.console.log.bind(window.console)}}else{window.log=function(){}}
	var AG_start=function(){
		var f=["_btn-b","_btn-circle","_icons-right","_icons20","_icons40","_icons80","_icons120","_inputSearch","_menu4","_tidbit","fantastico","friend-options","header-bg-hookt","hello","indexcard","logo-full","logotype-lite","pencil","switch-bg","switch-sex","tidbit-noimage",
		"_avatars/faces-f","_avatars/faces-m","_avatars/01/_f-no-avatar","_avatars/01/_m-no-avatar","_avatars/01/_u-no-avatar","_avatars/01/_faces/_f-no-avatar","_avatars/01/_faces/_m-no-avatar","_avatars/01/_faces/_u-no-avatar"];
		var b=["art-search","texture-wood-mahogany","texture-wood-oak","ag/ag-1","ag/ag-1-big","ag/ag-5-big","ag/ag-6","ag/ag-6-big","ag/icon-1","ag/icon-5","ag/icon-6","_avatars/01/_bg/_no-background","_landing/landing-transition",];
		var g=f.length;
		var e=b.length;
		var d=g+e;for(i=0;i<g;i++){
			var c=new Image();
			c.src="images/"+f[i]+AG_retinaSuffix()+".png";
			c.index=i;
			c.onload=function(h){
				AG_onImageLoad(this,d)
			}
		}
		for(i=0;i<e;i++){
			var c=new Image();
			c.src="images/"+b[i]+AG_retinaSuffix()+".jpg";
			c.index=i;
			c.onload=function(h){
				AG_onImageLoad(this,d)}
			}
		};
		var AG_counter=0;
		var AG_onImageLoad=function(c,b){
			AG_counter++;
			var d=(AG_counter*50/b);
			AG_setLoadProgress(d);
			if(AG_counter===b){
				setTimeout(function(){
					Main_start()},500)}
			};
			var Main_start=function(){console.log("|INFO| ---- Main_start ... "+AG_counter+" images loaded ------ ");
				GC.Core.include("js/Nsc.js",function(b){a.Main()}
			)};
				var AG_retinaSuffix=function(){if(window.isRetina){return window.isRetina}window.isRetina=(window.devicePixelRatio&&window.devicePixelRatio>1)?"_2":"";return window.isRetina};var AG_setLoadProgress=function(b){if(b<10){return}jq("#AG_load_pct").css("width",b+"%")};function SHA1(f){function e(A,z){var j=(A<<z)|(A>>>(32-z));return j}function t(B){var A="";var j;var C;var z;for(j=0;j<=6;j+=2){C=(B>>>(j*4+4))&15;z=(B>>>(j*4))&15;A+=C.toString(16)+z.toString(16)}return A}function v(B){var A="";var z;var j;for(z=7;z>=0;z--){j=(B>>>(z*4))&15;A+=j.toString(16)}return A}function c(z){z=z.replace(/\r\n/g,"\n");var j="";for(var B=0;B<z.length;B++){var A=z.charCodeAt(B);if(A<128){j+=String.fromCharCode(A)}else{if((A>127)&&(A<2048)){j+=String.fromCharCode((A>>6)|192);j+=String.fromCharCode((A&63)|128)}else{j+=String.fromCharCode((A>>12)|224);j+=String.fromCharCode(((A>>6)&63)|128);j+=String.fromCharCode((A&63)|128)}}}return j}var k;var x,w;var d=new Array(80);var o=1732584193;var m=4023233417;var l=2562383102;var h=271733878;var g=3285377520;var u,s,r,q,p;var y;f=c(f);var b=f.length;var n=new Array();for(x=0;x<b-3;x+=4){w=f.charCodeAt(x)<<24|f.charCodeAt(x+1)<<16|f.charCodeAt(x+2)<<8|f.charCodeAt(x+3);n.push(w)}switch(b%4){case 0:x=2147483648;break;case 1:x=f.charCodeAt(b-1)<<24|8388608;break;case 2:x=f.charCodeAt(b-2)<<24|f.charCodeAt(b-1)<<16|32768;break;case 3:x=f.charCodeAt(b-3)<<24|f.charCodeAt(b-2)<<16|f.charCodeAt(b-1)<<8|128;break}n.push(x);while((n.length%16)!=14){n.push(0)}n.push(b>>>29);n.push((b<<3)&4294967295);for(k=0;k<n.length;k+=16){for(x=0;x<16;x++){d[x]=n[k+x]}for(x=16;x<=79;x++){d[x]=e(d[x-3]^d[x-8]^d[x-14]^d[x-16],1)}u=o;s=m;r=l;q=h;p=g;for(x=0;x<=19;x++){y=(e(u,5)+((s&r)|(~s&q))+p+d[x]+1518500249)&4294967295;p=q;q=r;r=e(s,30);s=u;u=y}for(x=20;x<=39;x++){y=(e(u,5)+(s^r^q)+p+d[x]+1859775393)&4294967295;p=q;q=r;r=e(s,30);s=u;u=y}for(x=40;x<=59;x++){y=(e(u,5)+((s&r)|(s&q)|(r&q))+p+d[x]+2400959708)&4294967295;p=q;q=r;r=e(s,30);s=u;u=y}for(x=60;x<=79;x++){y=(e(u,5)+(s^r^q)+p+d[x]+3395469782)&4294967295;p=q;q=r;r=e(s,30);s=u;u=y}o=(o+u)&4294967295;m=(m+s)&4294967295;l=(l+r)&4294967295;h=(h+q)&4294967295;g=(g+p)&4294967295}var y=v(o)+v(m)+v(l)+v(h)+v(g);return y.toLowerCase()}(function(g,d){var b=g.parse,e=[1,4,5,6,7,10,11];g.parse=function(j){var h,l,c=0;if(l=/^(\d{4}|[+\-]\d{6})(?:-(\d{2})(?:-(\d{2}))?)?(?:T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{3}))?)?(?:(Z)|([+\-])(\d{2})(?::(\d{2}))?)?)?$/.exec(j)){for(var f=0,k;k=e[f];++f){l[k]=+l[k]||0}l[2]=(+l[2]||1)-1,l[3]=+l[3]||1,l[8]!=="Z"&&l[9]!==d&&(c=l[10]*60+l[11],l[9]==="+"&&(c=0-c)),h=g.UTC(l[1],l[2],l[3],l[4],l[5]+c,l[6],l[7])}else{h=b?b(j):NaN}return h}})(Date);(function(N){function M(f,e){var h=(f&65535)+(e&65535),g=(f>>16)+(e>>16)+(h>>16);return g<<16|h&65535}function L(d,c){return d<<c|d>>>32-c}function K(b,m,l,k,j,c){return M(L(M(M(m,b),M(k,c)),j),l)}function J(j,d,o,n,m,l,k){return K(d&o|~d&n,j,d,m,l,k)}function I(j,d,o,n,m,l,k){return K(d&n|o&~n,j,d,m,l,k)}function H(j,d,o,n,m,l,k){return K(d^o^n,j,d,m,l,k)}function G(j,d,o,n,m,l,k){return K(o^(d|~n),j,d,m,l,k)}function F(P,O){P[O>>5]|=128<<O%32,P[(O+64>>>9<<4)+14]=O;var t,s,r,q,h,g=1732584193,f=-271733879,e=-1732584194,b=271733878;for(t=0;t<P.length;t+=16){s=g,r=f,q=e,h=b,g=J(g,f,e,b,P[t],7,-680876936),b=J(b,g,f,e,P[t+1],12,-389564586),e=J(e,b,g,f,P[t+2],17,606105819),f=J(f,e,b,g,P[t+3],22,-1044525330),g=J(g,f,e,b,P[t+4],7,-176418897),b=J(b,g,f,e,P[t+5],12,1200080426),e=J(e,b,g,f,P[t+6],17,-1473231341),f=J(f,e,b,g,P[t+7],22,-45705983),g=J(g,f,e,b,P[t+8],7,1770035416),b=J(b,g,f,e,P[t+9],12,-1958414417),e=J(e,b,g,f,P[t+10],17,-42063),f=J(f,e,b,g,P[t+11],22,-1990404162),g=J(g,f,e,b,P[t+12],7,1804603682),b=J(b,g,f,e,P[t+13],12,-40341101),e=J(e,b,g,f,P[t+14],17,-1502002290),f=J(f,e,b,g,P[t+15],22,1236535329),g=I(g,f,e,b,P[t+1],5,-165796510),b=I(b,g,f,e,P[t+6],9,-1069501632),e=I(e,b,g,f,P[t+11],14,643717713),f=I(f,e,b,g,P[t],20,-373897302),g=I(g,f,e,b,P[t+5],5,-701558691),b=I(b,g,f,e,P[t+10],9,38016083),e=I(e,b,g,f,P[t+15],14,-660478335),f=I(f,e,b,g,P[t+4],20,-405537848),g=I(g,f,e,b,P[t+9],5,568446438),b=I(b,g,f,e,P[t+14],9,-1019803690),e=I(e,b,g,f,P[t+3],14,-187363961),f=I(f,e,b,g,P[t+8],20,1163531501),g=I(g,f,e,b,P[t+13],5,-1444681467),b=I(b,g,f,e,P[t+2],9,-51403784),e=I(e,b,g,f,P[t+7],14,1735328473),f=I(f,e,b,g,P[t+12],20,-1926607734),g=H(g,f,e,b,P[t+5],4,-378558),b=H(b,g,f,e,P[t+8],11,-2022574463),e=H(e,b,g,f,P[t+11],16,1839030562),f=H(f,e,b,g,P[t+14],23,-35309556),g=H(g,f,e,b,P[t+1],4,-1530992060),b=H(b,g,f,e,P[t+4],11,1272893353),e=H(e,b,g,f,P[t+7],16,-155497632),f=H(f,e,b,g,P[t+10],23,-1094730640),g=H(g,f,e,b,P[t+13],4,681279174),b=H(b,g,f,e,P[t],11,-358537222),e=H(e,b,g,f,P[t+3],16,-722521979),f=H(f,e,b,g,P[t+6],23,76029189),g=H(g,f,e,b,P[t+9],4,-640364487),b=H(b,g,f,e,P[t+12],11,-421815835),e=H(e,b,g,f,P[t+15],16,530742520),f=H(f,e,b,g,P[t+2],23,-995338651),g=G(g,f,e,b,P[t],6,-198630844),b=G(b,g,f,e,P[t+7],10,1126891415),e=G(e,b,g,f,P[t+14],15,-1416354905),f=G(f,e,b,g,P[t+5],21,-57434055),g=G(g,f,e,b,P[t+12],6,1700485571),b=G(b,g,f,e,P[t+3],10,-1894986606),e=G(e,b,g,f,P[t+10],15,-1051523),f=G(f,e,b,g,P[t+1],21,-2054922799),g=G(g,f,e,b,P[t+8],6,1873313359),b=G(b,g,f,e,P[t+15],10,-30611744),e=G(e,b,g,f,P[t+6],15,-1560198380),f=G(f,e,b,g,P[t+13],21,1309151649),g=G(g,f,e,b,P[t+4],6,-145523070),b=G(b,g,f,e,P[t+11],10,-1120210379),e=G(e,b,g,f,P[t+2],15,718787259),f=G(f,e,b,g,P[t+9],21,-343485551),g=M(g,s),f=M(f,r),e=M(e,q),b=M(b,h)}return[g,f,e,b]}function E(e){var d,f="";for(d=0;d<e.length*32;d+=8){f+=String.fromCharCode(e[d>>5]>>>d%32&255)}return f}function D(e){var d,f=[];f[(e.length>>2)-1]=undefined;for(d=0;d<f.length;d+=1){f[d]=0}for(d=0;d<e.length*8;d+=8){f[d>>5]|=(e.charCodeAt(d/8)&255)<<d%32}return f}function C(b){return E(F(D(b),b.length*8))}function B(j,h){var o,n=D(j),m=[],l=[],k;m[15]=l[15]=undefined,n.length>16&&(n=F(n,j.length*8));for(o=0;o<16;o+=1){m[o]=n[o]^909522486,l[o]=n[o]^1549556828}return k=F(m.concat(D(h)),512+h.length*8),E(F(l.concat(k),640))}function A(g){var f="0123456789abcdef",k="",j,h;for(h=0;h<g.length;h+=1){j=g.charCodeAt(h),k+=f.charAt(j>>>4&15)+f.charAt(j&15)}return k}function z(b){return unescape(encodeURIComponent(b))}function y(b){return C(z(b))}function x(b){return A(y(b))}function w(d,c){return B(z(d),z(c))}function v(d,c){return A(w(d,c))}function u(e,d,f){return d?f?w(d,e):v(d,e):f?y(e):x(e)}"use strict",typeof define=="function"&&define.amd?define(function(){return u}):N.md5=u})(this);