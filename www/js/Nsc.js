var Tuber = {
    _gameName : "nsc",
    _started : false,
    _toast    : null,
    _handlers : [],
    _messages : [],
    _lastPoll : 0,
    _subscribeId : 0,
    _useWebSocket : 0,
    _socket : null,
    _lastXhr : null,
    
    toast : function(toast) { Tuber._toast = toast; },
    init : function(gameName) {
        Tuber._gameName = gameName;
        return(Tuber);
    },
    start : function() {
        if (!Tuber._timer) {
            Tuber._timer = setInterval(function(){Tuber.keepAlive();}, 2000);
        }
        
        Tuber._lastPoll = new Date().getTime();
        Tuber._started = true;
        if (Tuber._useWebSocket) {
            if (Tuber._socket) return;
            
            var socket = io.connect("ws://"+GC.Utils.parseUrl(""+document.location).host,{port:81});
            socket.on("connect", function(){
                Tuber._socket = this;
                socket.emit("get", {resource:"tubes",apiKey:Nsc.theUser.get().apiKey})
            });
            socket.on("msg", function(msgs) {Tuber.onMessage(msgs)});
            socket.on("disconnect", function(){
                Tuber._started = false;
                Tuber._socket = null;
                io.sockets = {};
            });
            socket.on("error", function(e) { 
                io.sockets = {};
                Tuber._started = false;
                Tuber._socket = null;
                Tuber.onError(e.status||400, e) 
            });
        }
        else if (!Tuber._lastXhr) {
            Tuber._lastXhr = Nsc.User.instance.tube(function(msgs) {
                Tuber._lastXhr = null;
                if (Tuber._started) Tuber.start();
                Tuber.onMessage(msgs);
            }, function(status, e) { 
                Tuber._lastXhr = null;
                if (status) Tuber.onError(status, e);
                // else suspended
            });
        }
        return(Tuber);
    },
    onError : function(status, e) {
        if (status==0) {}
        else if (status==401) {
            Nsc.User.instance.setUser(null);
            Tuber._started = false;
            for(var i=0,size=Tuber._handlers.length; i<size; i++) {
                Tuber._handlers[i].onError(status, e);
            }
        }
        else if (status==409) {
            Nsc.User.instance.setTubeId(e.tubeId).setApiKey(e.apiKey);
            Tuber.start();
        }
        //else let keep alive retry
        //else setTimeout(function() { Tuber.start(); }, 1000);  // server unavailable, try again in one second
    },
    
    onMessage : function(msgs) {
        var unhandled = [];
        for(var i=0,size=msgs.length; i<size; i++) {
            var handled = false;
            var msg = msgs[i];
            if (!msg.msgId) msg.msgId = GC.Utils.guid();
            for(var j = Tuber._handlers.length; j>0; j--) {
                var handler = Tuber._handlers[j-1];
                if (handler && handler.peek(msgs[i]) && handler.handle(msg)) handled = true;
            }
            if (!handled) unhandled.push(msg);
        }
        if (unhandled.length && Tuber._toast) Tuber._toast.toast(msgs)
        return(unhandled.length==0);
    },
    keepAlive : function() {
        if (Tuber._started && Nsc.User.instance.loggedIn() && (Tuber._lastXhr==null || Tuber._lastPoll+70000)<new Date().getTime()) {
            Tuber._lastXhr = null;
            Tuber.start();
        }
    },
    register : function(handler) {
        var msgs = [];
        for(var i = 0; i < Tuber._messages.length; i++) {
            var msg = Tuber._messages[i];
            if (!handler.peek(msg) || !handler.handle(msg)) msgs.push(msg);
        }
        Tuber._messages = msgs;
        Tuber._handlers.push(handler);
    },
    unregister : function(handler) {
        var i = Tuber._handlers.indexOf(handler);
        if (i>=0) Tuber._handlers.splice(i,1);
    },
    
    stop : function() {
        if (Tuber._lastXhr) {
            Tuber._lastXhr.abort();
            Tuber._lastXhr = null;
        }
        
        clearInterval(Tuber._timer);
        Tuber._timer = null;
        Tuber._started = false;
        
        if (Tuber._socket) {
            Tuber._socket.disconnect();
            Tuber._socket = null;
        }
        Nsc.User.instance.unload();
    }
};

window.addEventListener("pageshow", function(e) {
    if (e.persisted) {
        Tuber.start();
    }    
});
window.addEventListener("pagehide", function(e) {
    if (e.persisted) Tuber.stop();
});
window.addEventListener("unload", function() {
    Tuber.stop();
});

Tuber.Handler = function() {
};
Tuber.Handler.prototype.onError = function(status, e) {
};
// return true if you handled it, otherwise false
// handled message is removed from message queue
Tuber.Handler.prototype.handle = function(msg) {
    return(false);
};
// unhandled message handler
Tuber.Handler.prototype.toast = function(msgs) {
};
// return true if you can handle it, otherwise false
Tuber.Handler.prototype.peek = function(msg) {
    return(false);
};

var Nsc = {
    Unknown : "Someone"     // unknown user display name
};

var Hookt = {
    m_callbacks : [],
    resume: function() {
        jQuery.each(Hookt.m_callbacks, function(i,cb) {cb()});
    },
    register: function(handler) {
        if (handler instanceof Function) Hookt.m_callbacks.push(handler);
    }
};

GC.Core.executing("/gc/sm/static/libs/Nsc.js");

//var deps = ["http://c.airgames.com/gc/sm/static/libs/NscCache.js", "http://c.airgames.com/gc/sm/static/libs/utils.js", "http://c.airgames.com/gc/sm/static/libs/jhttp.js", "http://c.airgames.com/gc/sm/static/libs/jquery-cookie.js"];
//var deps = ["js/NscCache.js", "js/utils.js", "js/jhttp.js", "js/jquery-cookie.js"];
var deps = [];
if (Tuber._useWebSocket && typeof(io)=="undefined") deps.push("/socket.io/socket.io.js");

GC.Core.include(deps, function($) {
    var API_VERSION = "/1";
    
    // Nsc Http client (always pass "api-key" in http header)
    function NscHttp() {
        this.apiKey = null;
    };
    NscHttp.prototype = new JsonHttp();
    NscHttp.prototype.request = function(method, url, header, body, success, fail) {
        if (!header) header = {};
        if (this.apiKey) header["api-key"] = this.apiKey;
        return(JsonHttp.prototype.request.call(this, method, url, header, body, success, fail));
    };        
    var theHttp = GC.Http = new NscHttp();
    
    // currently logged in user
    var theUser = Nsc.theUser = new Users(theHttp).init();
    
    // profile cache manager
    var theProfiles = Nsc.theProfiles = new Profiles("default", theHttp).init();
    var theDisplays = Nsc.theDisplays = new Profiles("display", theHttp).init();
    var theStatus = Nsc.theStatus = new Profiles("status", theHttp).init();
    var thePresence = Nsc.thePresence = new Presence(theHttp).init();
    
    // game configs
    var theGameConfigs = Nsc.theGameConfigs = new GameConfigs(theHttp).init();
    
    // friends cache manager
    var theFriends = Nsc.theFriends = new Friends(theHttp);
    // recent players cache manager
    var theRecents = Nsc.theRecents = new Recents(theHttp);
    // game stats
    var theStats = Nsc.theStats = new GameStats(theHttp);
    // game/chat messages
    var theMessages = Nsc.theMessages = new Messages();
    // friend invites
    var theFRequests = Nsc.theFRequests = new FRequests();
    // instant msgs
    var theIMsgs = Nsc.theIMsgs = new IMsgs();
    // hookt cache manager
    var theHookt = Nsc.theHookt = new HooktFriends(theHttp);
    // airg friend list
    var theAirG = Nsc.theAirG = new AirGFriends(theHttp);
    // games
    var theGames = Nsc.theGames = new Games(theHttp);
    // flags
    var theGamers = Nsc.theGamers = new GamerFlags(theHttp);
    // countries
    var theCountries = Nsc.theCountries = new Countries(theHttp);
    // forums
    var theForumSummary = Nsc.theForumSummary = new ForumSummary(theHttp);
    var theCategories = Nsc.theCategories = new Categories(theHttp).init();
    var theSubjects = Nsc.theSubjects = new Subjects(theHttp);
    
    // add private message cm to user object
    theUser.addPrivate(theIMsgs);
    theUser.addPrivate(theGames);
    
    StaticVars = function() {
        Cache.call(this, "static");
    };
    StaticVars.prototype = new Cache();
    StaticVars.prototype.fetch = function(key, success, fail) { success(null) };
    var theStaticVars = Nsc.theStaticVars = new StaticVars().init();
    
    Nsc.Events = {
        GetFriends : 1,
        
        start : function(event, msg) {
            $(window).trigger("nsc.events.start", {e:event,msg:msg});
        },
        stop : function(event) {
            $(window).trigger("nsc.events.stop", {e:event});
        },
        onStart : function(cb) {
            $(window).bind("nsc.events.start", cb?cb:function(e,data) {
                if (data.msg) GC.Wait.start(data.msg);
            });
        },
        onStop : function(cb) {
            $(window).bind("nsc.events.stop", cb?cb:function(e,data) {
                GC.Wait.stop();
            });
        }
    };
    
    // poke throttle
    function Pokes() {
        Cache.call(this, "pokes");
    }
    Pokes.prototype = new Cache();
    Pokes.prototype.fetch = function(key, success, fail) {
        return(success({poke:0}));
    };
    Pokes.prototype.poke = function(gameId, userId, next) {
        var self = this;
        var key = gameId+userId;
        this.get(key, function(data) {
            if (data.poke) next(false);
            else {
                self.set(key, {poke:1,_expire:new Date().getTime()+60000});
                next(true);
            }
        }, function(){
            next(true);
        });
    };
    Pokes.prototype.save = function(){};    // do not save to local storage
    var thePokes = new Pokes();
    
    // merged buds and friends into one, sorted by online
    // not a cache manager, but uses friends/recents/profiles/presence cache to combine the result
    function NscBuds() {}   
    NscBuds.prototype.get = function(userId, success, fail) {
        theFriends.get(userId, function(friends) {
            theRecents.get(userId, function(recents) {
                var userIds = {};
                for(var i=0,size=friends.length; i<size; i++) userIds[friends[i]] = {};
                for(var i=0,size=recents.length; i<size; i++) userIds[recents[i].userId] = {};
                
                // get display
                var uids = Object.keys(userIds);
                theDisplays.get(uids, function(displays) {
                    for(var uid in userIds) {
                        userIds[uid] = GC.Utils.merge({}, displays[uid]);
                        userIds[uid].userId = uid;
                    }
                    
                    // get presence
                    thePresence.get(uids, function(presences) {
                        var ret = [];
                        for(var uid in userIds) {
                            userIds[uid].online = presences[uid].online;
                            ret.push(userIds[uid]);
                        }
                        
                        ret.sort(function(l,r) {
                            if ((l.online==1 && r.online==1) || (l.online<0 && r.online<0)) {
                                // sort by display
                                if (l.display.toLowerCase()<r.display.toLowerCase()) return(-1);
                                else return(1);
                            }
                            else if (l.online>0) return(-1);
                            else return(1);
                        });
                        
                        success(ret);
                    });
                });
            }, fail);
        }, fail);
    };
    var theBuds = Nsc.theBuds = new NscBuds();
    
    Nsc.Facebook = {
        appId : "187995777917493",
        _initialized : false,
        initialize : function(success) {
            if (Nsc.Facebook._initialized || $("#fb-root").get(0)) return(success());
            
            $("<div>")
                .css("display", "none")
                .attr("id", "fb-root")
                .appendTo($(document.body));
                
            GC.Core.include("http://connect.facebook.net/en_US/all.js", function() {
                FB.init({
                    appId:Nsc.Facebook.appId, 
                    cookie:true,
                    status:true, 
                    xfbml:true,
                    oauth:true
                });
                
                Nsc.Facebook._initialized = true;
                success();
            });
        },
        
        login : function(success, fail) {
            FB.login(function(response) {
                if (response.status=="connected") FB.api("/me", function(user) { success(response.authResponse.accessToken, user.id, user.email, user.name) });
                else fail();
            }, {scope:"email"});
        }
    };

    // tuber message handler
    Nsc.MsgHandler = function(gameName) {
        this.m_game = gameName;
    };
    Nsc.MsgHandler.prototype = new Tuber.Handler();
    Nsc.MsgHandler.prototype.onGameCreated = function(msg, title, gameName, url) {
        return(false);
    };
    Nsc.MsgHandler.prototype.onGameInvited = function(msg, title, gameName, url) {
        return(false);
    };
    Nsc.MsgHandler.prototype.onInvited = function(msg, title, url) {
        return(false);
    };
    Nsc.MsgHandler.prototype.onFriendRequest = function(msg) {
        return(false);
    };
    Nsc.MsgHandler.prototype.onTurnNotification = function(msg, title, url) {
        return(false);
    };
    Nsc.MsgHandler.prototype.peek = function(msg) {
        var self = this;
        if (msg.created) msg.created = GC.Utils.date(msg.created);
        if (msg.game) {
            // game is created
            theGames.set(msg.gameId, msg.game);
            theGameConfigs.get(msg.game.game, function(config) {
                msg._url = config.url+"?gameId="+msg.gameId;
                msg._game = msg.game.game;
                theMessages.add(theUser.get().userId, msg);
                self.onGameCreated(msg, config.title, msg._game, msg._url);
            }, function(){});
            return(false);
        }
        else if (msg.system) {
            if (msg.system.inviteUrl) {
                if (msg.system.data && msg.system.data.game && msg.system.data.pin) {
                    theGameConfigs.get(msg.system.data.game, function(config) {
                        var data = msg.system.data;
                        var url = config.url+"?icode="+data.pin;
                        msg._url = url;
                        msg._game = msg.system.data.game;
                        if (data.gameId) msg.gameId = data.gameId;
                        theMessages.add(theUser.get().userId, msg);
                        
                        if (data.gameId) self.onGameInvited(msg, msg.system.title, msg._game, url);
                        else self.onInvited(msg, msg.system.title, data.game, url);
                    }, function(){});
                }
                return(false);
            }
            else if (msg.system.profile) {
                switch(msg.system.app) {
                case "status":  theStatus.del(msg.userId).save(); break;
                default:
                    theProfiles.del(msg.userId).save();
                    theDisplays.del(msg.userId).save();
                    break;
                }
                return(false);
            }
            else if (msg.system.friend) {
                theFriends.del(theUser.get().userId).save();
                return(false);
            }
            else if (msg.system.buds) {
                theRecents.addBuds(theUser.get().userId, msg.system.buds);
                return(false);
            }
            else if (msg.system.frequest) {
                theFRequests.add(theUser.get().userId, msg, function(){self.onFriendRequest(msg)}, function(){});
            }
            else {
                // don't know how to handle
                return(false);
            }
        }
        else if (msg.msg) {
            if (msg.chatId) return(true);
            else if (msg.gameId) {              // game message
                // handle game notifications
                if (msg.msg && msg.msg.action) {
                    theGames.get(msg.gameId, function(game) {
                        theGameConfigs.get(game.game, function(config) {
                            msg._game = game.game;
                            msg._url = config.url+"?gameId=" + game.gameId;
                            theMessages.add(theUser.get().userId, msg);
                            switch(msg.msg.action) {
                            case "turn":
                                self.onTurnNotification(msg, config.title, msg._url);
                                break;
                            }
                        }, function(){});
                    }, function(){});
                    return(false);
                }
                else return(true);
            }
            else if (msg.targetId) {                              // instant messages
                if (msg.userId==Nsc.theUser.get().userId) theIMsgs.add(msg.targetId, msg);
                else theIMsgs.add(msg.userId, msg);
                return(true);
            }
        }
        else return(false);                     // unknown msg
    };
    
    Nsc.User = function() {
        this.photoUrl = "http://c.airg.ca/im/im/profile/{id}/{width}/{height}/1/1/{id}.png";
        this.avatarUrl = "http://airgames.com/images/_avatars/01/{avatarId}.png";
        this.airgUrl = "http://c.airg.ca/im/gtf/";
        this.airgCrop = "jpg/90/90/256/1/90/1";
        this.mode = "airgames";
        this.userId = null;
        this.tubeId = null;
        this.user = null;
        Nsc.User.instance = this;
    };
    Nsc.User.prototype.init = function(next) {
        var self = this;
        this.get(API_VERSION+"/profileconfigs", function(data) {
            self.photoUrl = data.photoUrl.replace("{category}","profile").replace("{type}","png");
            self.avatarUrl = data.avatarUrl;
            self.airgUrl = data.airgUrl;
            self.airgCrop = data.airgCrop;
            self.mode = data.mode;
            if (data.facebookId) Nsc.Facebook.appId = data.facebookId;
            
            theUser.auth(function(user) {
                self.setUser(user);
                theFriends.init();
                theRecents.init();
                theStats.init();
                theMessages.init();
                theIMsgs.init();
                theFRequests.init(user.userId);
                theHookt.init();
                theGames.init();
                theGamers.init();
                next();
            }, next);
        }, function(status){next({status:status})});        
    };
    Nsc.User.prototype.setProfile = function(profile, success, fail) {
        this.post(API_VERSION+"/profiles/"+this.userId+"/default", profile, function(profile) {
            theDisplays.set(this.userId, theDisplays._construct(profile)).save();
            success(profile);
        }.bind(this), fail);
    };
    Nsc.User.prototype.get = function(url, success, fail) {
        return(theHttp.get(url, success, fail));
    };
    //url, [header], body, success, fail
    Nsc.User.prototype.post = function() {
        var args = Array.prototype.slice.call(arguments),
            url = args.shift(), fail = args.pop(), success = args.pop(),
            body = JSON.stringify(args.pop()), header = args.pop()||{};
        return(theHttp.post(url, header, body, success, fail));
    };
    Nsc.User.prototype.put = function(url, body, success, fail) {
        return(theHttp.put(url, JSON.stringify(body), success, fail));
    };
    //url, [header], success, fail
    Nsc.User.prototype.del = function() {
        var args = Array.prototype.slice.call(arguments),
            url = args.shift(), fail = args.pop(), success = args.pop(), header = args.pop()||{};
        return(theHttp.del(url, header, success, fail));
    };

    Nsc.User.prototype.logout = function(success, fail) {
        if (this.loggedIn()) {
            Tuber.stop();
            if (!success) success = function(){};
            if (!fail) fail = function(){};
            this.del(API_VERSION+"/devices/"+this.tubeId, success, fail);
        }
        this.setUser(null);
    };
    Nsc.User.prototype.gameStats = function(gameName, userId, success) {
        theStats.get(gameName, userId, success);
    };
    Nsc.User.prototype.profile = function(userId, success) {
        theDisplays.get(userId, success);
    };
    Nsc.User.prototype.profiles = function(userIds, success) {
        theDisplays.get(userIds, success);
    };
    Nsc.User.prototype.displays = function(success, fail) {
        this.get(API_VERSION + "/displays", success, function(){success([])});
    };
    Nsc.User.prototype.avatars = function(success, fail) {
        this.get(API_VERSION + "/avatars", success, fail);
    };
    Nsc.User.prototype.countries = function(success, fail) {
        this.get(API_VERSION + "/countries", success, fail);
    };
    Nsc.User.prototype.addBuds = function(buds, success, fail) {
        theRecents.addBuds(this.userId, buds);
        this.buds(success, fail);
    };
    Nsc.User.prototype.hookt = function(success, fail) {
        theHookt.get(this.userId, success, fail);
    };
    Nsc.User.prototype.airg = function(success, fail) {
        theAirG.get(this.userId, success, fail);
    };
    Nsc.User.prototype.buds = function(success, fail) {
        theBuds.get(this.userId, success, fail);
    };
    Nsc.User.prototype.friends = function(success, fail) {
        theFriends.get(this.userId, success, fail);
    };
    Nsc.User.prototype.loggedIn = function() { return(this.user!=null); };
    Nsc.User.prototype.credential = function(uid) {
        if (typeof(uid)!="string") return(null);
        else if (uid.match(/^[a-f0-9A-F]{32,32}$/)) return({userId:uid});
        else if (uid.match(/^\d{7,}$/)) {
            if (uid.length==10) uid = "1"+uid;
            return({phonenumber:uid});
        }
        else {
            uid = uid.replace(/\s/g, '');
            if (uid.match(/.+@.+\..+/)) return({email:uid});
            else return(null);
        }
    };
    Nsc.User.prototype.setEmail = function(email, success, fail) {
        this.put(API_VERSION+"/users/"+this.userId+"/email", email, success, fail);
    };
    Nsc.User.prototype.password = function(uid, success, fail) {
        var data = this.credential(uid);
        if (data) this.post(API_VERSION+"/users/password", this.credential(uid), success, fail);
        else fail(400);
    };
    Nsc.User.prototype.setTubeId = function(tubeId) {
        this.tubeId = tubeId;
        theUser.setTubeId(tubeId);
        return(this);
    };
    Nsc.User.prototype.setApiKey = function(apiKey) {
        GC.Http.apiKey = apiKey;
        theUser.setApiKey(apiKey);
        return(this);
    };
    Nsc.User.prototype.setUser = function(user) {
        if (user) {
            this.userId = user.userId;
            this.tubeId = user.tubeId;
            this.user = user;
            GC.Http.apiKey = user.apiKey;
        }
        else {
            this.userId = "";
            this.tubeId = "";
            this.user = null;
            theUser.reset();
            GC.Http.apiKey = null;
        }
    };
    Nsc.User.prototype.reset = function() {
        this.setUser(null);
    };
    Nsc.User.prototype.syncFriend = function(success, fail) {
        theFriends.del(GC.Sm.user.userId);
        this.buds(success, fail);
    };
    Nsc.User.prototype.addFriend = function(uid, success, fail) {
        var payload = this.credential(uid);
        if (!payload) return(fail(400, {}));
        
        var self = this;
        this.post(API_VERSION+"/contacts/" + this.userId + "/friends", payload, success, fail);
    };
    Nsc.User.prototype.delFriend = function(uid, success, fail) {
        var self = this;
        this.del(API_VERSION+"/contacts/"+this.userId+"/friends/"+uid, function(){
            theFriends.del(self.userId);
            success();
        }, fail);
    };
    Nsc.User.prototype.accept = function(rid, success, fail) {
        var self = this;
        this.post(API_VERSION+"/contacts/"+this.userId+"/friends", {rid:rid}, function(friendId) {
            theFriends.addFriend(self.userId, friendId);
            success(friendId);
        }, fail);
    };
    Nsc.User.prototype.postMsg = function(targetId, text, success, fail) {
        var self = this;
        this.post(API_VERSION+"/imsgs/"+targetId, {_persist:1,text:text}, function(msg) {
            msg._read = 1;
            theIMsgs.add(targetId, msg);
            success(msg);
        }, fail);
    };
    Nsc.User.prototype._signin = function(method, uid, password, success, fail) {
        var payload = this.credential(uid);
        if (!payload) return(fail(400, {}));
        
        payload.password = password;

        var self = this;
        theUser.singInOrUp(method, payload, function(user) {
            self.setUser(user);
            success(user);
        }, fail);
    };
    Nsc.User.prototype.email = function(email, success, fail) {
        this.get(API_VERSION+"/emails/"+GC.Utils.escapeUrl(email), success, fail);
    };
    Nsc.User.prototype.register = function(uid, password, success, fail) {
        this._signin("register", uid, password, success, fail);
    };
    Nsc.User.prototype.login = function(uid, password, success, fail) {
        this._signin("login", uid, password, success, fail);
    };
    Nsc.User.prototype.facebook = function(success, fail) {
        var self = this;
        Nsc.Facebook.initialize(function() {
            Nsc.Facebook.login(function(accessToken, facebookId, email, name) {
                var payload = {
                    accessToken : accessToken,
                    facebookId : facebookId,
                    email : email,
                    display : name
                };
                self.post(API_VERSION+"/users/register", payload, function(user) {
                    theUser.set(user);
                    self.setUser(user);
                    success();
                }, fail);
            }, fail);
        });
    };
    Nsc.User.prototype.getGameConfig = function(gameId, success, fail) {
        var self = this;
        theGames.get(gameId, function(game) {
            theGameConfigs.get(game.game, success, fail);
        }, fail);
    };
    Nsc.User.prototype.enqueue = function(gameId, success, fail) {
        this.post(API_VERSION+"/games/"+gameId, {queue:1}, success, fail);
    };
    Nsc.User.prototype.dequeue = function(gameId, success, fail) {
        this.post(API_VERSION+"/games/"+gameId, {queue:0}, success, fail);
    };
    Nsc.User.prototype.poke = function(gameId, targetId, success, fail) {
        var self = this;
        thePokes.poke(gameId, targetId, function(canPoke) {
            if (canPoke) self.notify(gameId, [targetId], {ping:1,query:"afk"}, success, fail);
            else fail(null);
        }, fail);
    };
    Nsc.User.prototype.setPassword = function(password, success, fail) {
        this.put(API_VERSION+"/users/"+this.userId+"/password", password, success, fail);
    };
    Nsc.User.prototype.notify = function() {
        var args = Array.prototype.slice.call(arguments, 0);
        var gameId = args.shift(), 
            fail = args.pop(),
            success = args.pop(),
            payload = args.pop();
            userIds = args.pop();
        
        this.post(API_VERSION+"/games/"+gameId+"/messages"+(userIds?"/"+userIds:""), payload, function(msg) {
            if (msg.msg && msg.msg.text) this.messages().add(gameId, msg);  // if a text message, add to message list
            success(msg);
        }.bind(this), fail);
    };
    Nsc.User.prototype.tube = function(success, fail) {
        return(this.get(API_VERSION+"/tubes/"+this.tubeId, success, fail));
    };
    Nsc.User.prototype.unload = function() {
        if (this.tubeId) return(this.post(API_VERSION+"/tubes/"+this.tubeId, {sync:1}, {unload:1}, function(){}, function(){}));
    };
    Nsc.User.prototype.messages = function() { return(theMessages) };
    Nsc.User.prototype.getSystemMsgs = function(success, fail) { return(this.messages().get(this.userId, success, fail)) };
    Nsc.User.prototype.chatMessages = function(gameId, success, fail) { theMessages.get(gameId, success, fail) };
    Nsc.User.prototype.scores = function(gameName, success, fail) {
        this.get(API_VERSION+"/scores/"+this.userId+"/"+gameName, success, fail);
    };
    Nsc.User.prototype.createGame = function(game, userIds, success, fail) {
        this.post(API_VERSION+"/games", {game:game,users:userIds}, success, fail);
    };
    Nsc.User.prototype.createIcode = function(game, gameId, success, fail) {
        this.sendIcode({game:game,data:{gameId:gameId}}, success, fail);
    };
    Nsc.User.prototype.sendIcode = function(payload, success, fail) {
        this.post(API_VERSION+"/icodes?silent=1", payload, success, fail);
    };
    Nsc.User.prototype.queryIcode = function(code, success, fail) {
        this.get(API_VERSION+"/icodes/"+code, success, fail);
    };
    Nsc.User.prototype.photo = function(photo, width, height) {
        if (photo.photoId) {
            if (photo.photoId.match(/\{crop\}/)) return(this.airgUrl+photo.photoId.replace("{crop}", this.airgCrop)+".jpg");
            else return(this.photoUrl.replace(/\{id\}/g, photo.photoId).replace("{width}", width).replace("{height}", height));
        }
        else if (photo.avatarId) return(this.avatar(photo.avatarId));
        else return("/gc/sm/static/images/profile.png");
    };
    Nsc.User.prototype.avatar = function(avatarId) { return(this.avatarUrl.replace("{avatarId}", avatarId)) };
    Nsc.User.prototype.hideView = function() {
        this.put(API_VERSION+"/devices/"+this.deviceId+"/online", 2, function(){}, function(){});
    };
    Nsc.User.prototype.showView = function() {
        this.put(API_VERSION+"/devices/"+this.deviceId+"/online", 1, function(){}, function(){});
    };
    Nsc.User.prototype.inviteUser = function(game, gameId, payload, success, fail) {
        payload.game = game;
        payload.data = { gameId:gameId };
        this.post(API_VERSION+"/icodes", payload, function(ret) {
            if (payload.hooktId) {
                theGamers.get(hooktId, function(enabled) { 
                    if (enabled) success(ret);
                    else fail(405);
                }, fail);
            }
            else success(ret);
        }, fail);
    };
    /* forum */
    Nsc.User.prototype.forumMod = function(success, fail) {
        this.get(API_VERSION+"/forums/mods/"+this.userId, success, fail);
    };
    Nsc.User.prototype.forumSticky = function(tId, sId, sticky, success, fail) {
        this.put(API_VERSION+"/forums/subjects/"+tId+"/"+sId+"/sticky", sticky?true:false, success, fail);
    };
    Nsc.User.prototype.forumLock = function(tId, sId, lock, success, fail) {
        this.put(API_VERSION+"/forums/subjects/"+tId+"/"+sId+"/lock", lock?true:false, success, fail);
    };
    Nsc.User.prototype.forumTopics = function(cId, success, fail) {
        this.get(API_VERSION+"/forums/topics/"+cId, success, fail);
    };
    Nsc.User.prototype.forumGetPosts = function(sId, offset, size, success, fail) {
        this.get(API_VERSION+"/forums/posts/"+sId+"?offset="+offset+"&size="+size, success, fail);
    };
    Nsc.User.prototype.forumCreatePost = function(sId, msg, success, fail) {
        this.post(API_VERSION+"/forums/posts/"+sId, {text:""+msg}, success, fail);
    };
    Nsc.User.prototype.forumCreateThread = function(tId, subject, msg, success, fail) {
        var self = this;
        this.post(API_VERSION+"/forums/subjects/"+tId, {subject:subject}, function(subject) {
            self.forumCreatePost(subject._id, msg, function(msg){success(subject,msg)}, fail);
        }, fail);
    };
    Nsc.User.prototype.forumDelThread = function(tId, sId, success, fail) {
        this.del(API_VERSION+"/forums/subjects/"+tId+"/"+sId, success, fail);
    };
    Nsc.User.prototype.forumDelPost = function(sId, mId, success, fail) {
        this.del(API_VERSION+"/forums/posts/"+sId+"/"+mId, success, fail);
    };
    Nsc.User.prototype.forumBan = function(userId, duration, reason, success, fail) {
        this.post(API_VERSION+"/forums/bans", {userId:userId,duration:duration,reason:reason}, success, fail);
    };

    GC.Core.executed("/gc/sm/static/libs/Nsc.js");
});