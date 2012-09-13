jQuery.noConflict();
var $j = jQuery;

if (!Object.keys) {
    Object.keys = function(obj) {
        var keys = [];
        for(var k in obj) { keys.push(k); }
        return(keys);
    };
}
if (!Object.empty) {
    Object.empty = function(obj) {
        for(var k in obj) return(false);
        return(true);
    };
}
if (!Function.prototype.bind) {
    Function.prototype.bind = function(ctx) {
        var func = this;
        return(function() {
            func.apply(ctx, arguments);
        });
    };
}
var _indexOf = Array.prototype.indexOf;
Array.prototype.indexOf = function(toSearch) {
    if (toSearch instanceof Function) {
        for(var i=0,size=this.length; i<size; i++) {
            if (toSearch(this[i])) return(i);
        }
        return(-1);
    }
    else return(_indexOf.apply(this, arguments));
};

var GC = {
    android : (navigator&&navigator.userAgent&&navigator.userAgent.match(/Android/))?1:0,
    apple : (navigator&&navigator.userAgent&&navigator.userAgent.match(/Mac OS/))?1:0,
    supportTouch :  ("ontouchstart" in document.documentElement),   // supports touch events
    supportLS :     typeof(localStorage)!="undefined"               // supports local storage
};

GC.Core = {
    _prefix : "http://c.airgames.com",
    _included : {},
    _pending : {},
    _executing : {},
    
    revision : function(){
        var rev = "{revision}";
        if (isNaN(parseInt(rev))) return(new Date().getTime());
        else return(rev);
    },
    
    sdk : function() { return(typeof(SDK)!="undefined" || (parent.document!=document && window.parent.AG!=null)); },
    
    executing : function(filename) {
        GC.Core._executing[filename] = true;
    },
    
    executed : function(filename) {
        GC.Core._included[filename] = true;
        delete GC.Core._executing[filename];
        if (filename in GC.Core._pending) {
            var cbs = GC.Core._pending[filename];
            delete GC.Core._pending[filename];
            for(var i = 0; i < cbs.length; i++) cbs[i]();
        }
    }
};

(function($) {
    $("<div>").ajaxError(function(e, jqxhr, settings, exception) {
        if (settings.dataType=='script') {
            console.log("SCRIPT ERROR from " + settings.url + "\n\n" + exception.stack);
        }
    });
    
    GC.Core.ready = function() {
        var args = Array.prototype.slice.call(arguments, 0);
        var next = args.pop();
        
        var count = args.length;
        var cb = function() { if (--count==0) next($) };
        for(var i=0,size=args.length; i<size; i++) {
            var filename = args[i];
            if (filename in GC.Core._included) cb();
            else if (filename in GC.Core._pending) GC.Core._pending[filename].push(cb);
            else GC.Core._pending[filename] = [cb];
        }
    };
    
    GC.Core._normalize = function(filename) {
        if (filename.match(/^http/) || !GC.Core._prefix) return(filename);
        else {
            if (filename[0]=="/") return(GC.Core._prefix+filename.substring(1));
            else return(GC.Core._prefix+filename);
        }
    };
    
    GC.Core._include = function(filename, next) {
        if (filename in GC.Core._included) next();
        else if (filename in GC.Core._pending) GC.Core._pending[filename].push(next);
        else {
            GC.Core._pending[filename] = [next];
            if (filename in GC.Core._executing) {}      // already loaded and waiting for it to complete executing
            else $.getScript(GC.Core._normalize(filename), function(){
                if (filename in GC.Core._executing) {}  // callback will be called by GC.Core.executed
                else GC.Core.executed(filename);
            });
        }
    };
    
    GC.Core.init = function(prefix) {
        GC.Core._prefix = prefix || "";
        if (GC.Core._prefix.length>0 && !GC.Core._prefix.match(/.+\/$/)) GC.Core._prefix += "/";
    };
    
    GC.Core.include = function() {
        var args = Array.prototype.slice.call(arguments, 0);
        var success;
        if (args[args.length-1] instanceof Function) success = args.pop();
        else success = function(){};
        
        // expand arrays
        var files = [], total = 0;
        for(var i=0,size=args.length; i<size; i++) {
            var filename = args[i];
            if (filename instanceof Array) {
                for(var j=0,count=filename.length; j<count; j++) {
                    files.push(filename[j]);
                    total++;
                }
            }
            else {
                files.push(filename);
                total++;
            }
        }
        
        var c = 0;
        if (total) {
            for(var i=0; i<total; i++) {
                GC.Core._include(files[i], function(){
                    if (++c==total) success($);
                });
            }
        }
        else success($);
    };
    
    GC.Core.style = function(filename) {
        if (filename in GC.Core._included) return;
        else {
            GC.Core._included[filename] = true;
            $(document).ready(function(){
                $("<link>")
                    .attr("href", GC.Core._normalize(filename))
                    .attr("rel", "stylesheet")
                    .attr("type", "text/css")
                    .appendTo($(document.body));
            });
        }
    };
})(jQuery);