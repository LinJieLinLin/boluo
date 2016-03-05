angular.module('app')
    .run(function ($rootScope, $state) {
        $rootScope.shareDefaultParams = {
            title: '菠萝球迷圈',
            imgUrl: 'http://'+ location.host + '/image/icon/boluo_avatar_logo.png',
            desc: '赶快关注"菠萝球迷圈"微信公众号,享受足球带来的精彩!'
        };
        $rootScope.isTourist = !window.location.href.match(/uid=\d*/,'');
        $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
            if (error.type === 1) {
                window.alert(error.data.data.errMsg);
                $state.go('landing');
            }
            console.error(error);
        });
        var domain = ["http://bolo.hk.damn.so", "http://localhost:9010/","http://192.168.1.27:9010"];
        var host = location.host;
        if(!domain.join(',').match(new RegExp(host,'ig'))){
            // jQuery = $ = angular = window = document = null;
        }
    })
    .run(function ($rootScope, $state, config, connector, request) {
        function signPackage(){
            request({
                method: 'GET',
                url: 'http://bole.chokking.com/api.php?s=test/signPackage',
                params: {
                    uid: config.uid(),
                    v: config.version(),
                    app: config.app(),
                    serial: config.serial()
                }
            }).then(function (rs){
                if(rs.errMsg){
                    alrt(rs.errMsg);
                    return;
                }
                var data = rs.Data;
                wx.config({
                    debug: false,
                    appId: data.appId,
                    timestamp: data.timestamp,
                    nonceStr: data.nonceStr,
                    signature: data.signature,
                    jsApiList: [
                        'checkJsApi',
                        'onMenuShareTimeline',
                        'onMenuShareAppMessage',
                        'onMenuShareQQ',
                        'onMenuShareWeibo',
                        'onMenuShareQZone'
                    ]
                });
                wx.ready(function (){

                });
            }, function (err){
                alert(err.data.data.errMsg);
            });
        }
        signPackage();
    })
    .run(function ($state, $timeout) {
        var query = window.location.search.substring(1);
        var tmpArr = query.split('&');
        var flag = false;
        var url = localStorage.getItem('recharge_redirect');
        var option = {};
        try {
            option = JSON.parse(localStorage.getItem('redirect_option'));
        } catch (e) {}
        angular.forEach(tmpArr, function (item) {
            var arr = item.split('=');
            var name = arr[0];
            var value = arr[1];
            if (name === 'pay') {
                flag = true;
            }
        });
        if (flag && url) {
            $timeout(function () {
                $state.go(url, option);
            },0);
            localStorage.removeItem('recharge_redirect');
            localStorage.removeItem('redirect_option');
        }
    })
    .factory('menuShare', function($rootScope, $q, connector, config, $timeout) {
        var timer;
        var shareLock = (function getShareQuery(){
            var query = window.location.href.split('?');
            var share;
            if(query[1]){
                share = query[1].match(/share=share*/);
            }
            return share;
        })();

        function createShareUrl(){
            var shareApi = 'http://bole.chokking.com/api.php?s=test/t1&url=';
            var href = window.location.href;
            var query = href.split('?');
            var url;
            if(query[1] && !query[1].match(/share=share*/)){
                var hash = query[1].replace(/uid=\d*/,'');
                url = query[0] + '?share=share'+ ((/^\/#\//).test(hash) || (/^&/).test(hash) ? '' : '&') + hash;
            }
            else if(!query[1]){
                var params = query[0].split('/#/');
                url = params[0] + '?share=share/#/' + (params[1] || '');
            }
            else{
                url = href;
            }
            return shareApi + encodeURIComponent(location.hash.substring(1, location.hash.length));
        }

        function appendShare(){
            $rootScope.isSharePage = shareLock;
            if (shareLock && !$('#share-header').length) {
                var link = 'http://mp.weixin.qq.com/s?__biz=MzIzMjA1OTk3NQ==&mid=441971771&idx=1&sn=6e9c4beed20f2ff49d0b2a08deaaa454&scene=0&previewkey=LrAUzKKo3d4E208N2IkRn8NS9bJajjJKzz%2F0By7ITJA%3D#wechat_redirect';
                $('body').append([
                    '<header class="header" id="share-header">',
                        '<div class="title"><a href="'+ link +'" class="b">点击关注菠萝球迷圈</a><span class="close" onclick="$(\'#share-header\').remove()"></span></div>',
                    '</header>'
                ].join(''));
            }
        }
        
        appendShare();
        
        return function (params, success, cancel) {
            if(shareLock){
                appendShare();
                $('title').html(params.title);
                $('meta[name="description"]').attr('content', params.desc);
                $('meta[name="description"]').attr('content', params.desc);
            }
            $timeout.cancel(timer);
            timer = $timeout(function (){
                var title = params.title || $rootScope.shareDefaultParams. title;
                var link = params.link || createShareUrl();
                var imgUrl = params.imgUrl || $rootScope.shareDefaultParams. imgUrl;
                var desc = params.desc || $rootScope.shareDefaultParams. desc;
                wx.onMenuShareTimeline({
                    title: title,
                    link: link,
                    imgUrl: imgUrl,
                    trigger: triggerCallb,
                    success: successCallb,
                    fail: failCallb,
                    cancel: cancelCallb
                });
                wx.onMenuShareAppMessage({
                    title: title,
                    desc: desc,
                    link: link,
                    imgUrl: imgUrl,
                    type: params.type || '', // 分享类型,music、video或link，不填默认为link
                    dataUrl: params.dataUrl || '', // 如果type是music或video，则要提供数据链接，默认为空
                    trigger: triggerCallb,
                    success: successCallb,
                    fail: failCallb,
                    cancel: cancelCallb
                });
                wx.onMenuShareQQ({
                    title: title,
                    desc: desc,
                    link: link,
                    imgUrl: imgUrl,
                    trigger: triggerCallb,
                    success: successCallb,
                    fail: failCallb,
                    cancel: cancelCallb
                });
                wx.onMenuShareWeibo({
                    title: title,
                    desc: desc,
                    link: link,
                    imgUrl: imgUrl,
                    trigger: triggerCallb,
                    success: successCallb,
                    fail: failCallb,
                    cancel: cancelCallb
                });
                wx.onMenuShareQZone({
                    title: title,
                    desc: desc,
                    link: link,
                    imgUrl: imgUrl,
                    trigger: triggerCallb,
                    success: successCallb,
                    fail: failCallb,
                    cancel: cancelCallb
                });
                function triggerCallb(){
                }
                function successCallb(){
                    if(typeof success === 'function'){
                        success();
                    }
                }
                function failCallb(){
                }
                function cancelCallb(){
                    if(typeof cancel === 'function'){
                        cancel();
                    }
                }
            }, 500);
        };
    })
    .config(['$httpProvider', function ($httpProvider) {
        // Modifying 'Content-Type' to 'application/x-www-form-urlencoded' instead of 'application/json'
        // will make post request to use 'form data' to transfer the request body, instead of using 'request payload'
        // which the backend server doesn't support.
        $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
    }])
    .controller('mainCtrl', function($scope, $rootScope, $http, $timeout, currentUser, connector, config) {

        function removeToStartPage() {
            $('.to-start').fadeOut(function() {
                $(this).remove();
            });
        }

        removeToStartPage();

        $rootScope.backPage = function(ev) {
            history.go(-1);
            if(ev){
                ev.stopPropagation();
            }
        };

        currentUser().then(function () {
            // console.log('current user ', $rootScope.user);
        });

        $rootScope.icon = {
            voice: '/image/icon/famous_sound_icon.png',
            dk: '/image/icon/famous_famous_icon.png',
            subscription: '/image/icon/famous_book_icon.png',
            wonderful: '/image/icon/famous_tv_icon.png',
            defaultAvatar: '/image/icon/midweek_bolo.png'
        };


        $rootScope.srefUrl = {
            voice: 'list({tab: "voice"})',
            dk: 'list({tab: "dk"})',
            subscription: 'list({tab: "subscription"})'
        };

        // $rootScope.$on('$stateChangeStart', function(toState, toParams, fromState, fromParams) {
        // });

        // $rootScope.$on('$stateChangeSuccess', function(toState, toParams, fromState, fromParams) {
        // });
    })
    .factory('currentUser', function($rootScope, $q, connector, config) {
        return function () {
            if ($rootScope.user) {
                var defer = $q.defer();
                defer.resolve($rootScope.user);
                return defer.promise;
            } else {
                return $rootScope.requestUser || 
                    ($rootScope.requestUser = connector.refreshUserInfo());
            }
        };
    })
    .factory('config', function() {
        return {
            ip: 'http://api.chokking.com/',  //外网
            // ip: 'http://14.23.49.202:8081/',  //内网
            uid: function (){
                var href = location.href;
                var q = href.split('?');
                var uid;
                if(q[1] && q[1].match(/uid=\d*/)){
                    uid = q[1].match(/uid=\d*/).join('').split('=')[1];
                }
                return uid;
            },
            picRoot: function (){
                return 'http://api.chokking.com/pic/';
            },
            app: function() {
                return '2';
            },
            version: function(type) {
                return '1.4.0';
            },
            token: function() {
                return '80C66A399B5C6ED96FF488BD264338FE';
            },
            serial: function() {
                return '59fd9617-81f3-4448-a952-d8fd3a1b3665';
            },
            socketio: 'http://14.23.49.202:2120',
            getDefaultParams: function (){
                var _this = this;
                function getTimestamp() {
                    return '1449195895' || parseInt(new Date().getTime() / 1000) + '';
                }
                return {
                    v: _this.version(),
                    app: _this.app(),
                    token: _this.token(),
                    serial: _this.serial(),
                    timestamp: getTimestamp()
                };
            },
            filterImgUrl: function (value){
                var url = value;
                var picRoot = this.picRoot().replace(/(\.|\/)/ig, '\\$1');
                if(url.match(new RegExp('(' + picRoot + 'http\:\/\/|'+ picRoot + 'https\:\/\/)', ''))){
                    url = value.replace(new RegExp(picRoot, ''), '');
                }
                return url;
            },
            filterHtmlText: function (html){
                var div = $('<div></div>');
                var text = div.html(html).text();
                div.remove();
                return text;
            }
        };
    })
    .factory('request', function($http, $q) {
        return function(option) {
            return $http(option).then(function(response) {
                var defer = $q.defer();
                if (angular.isUndefined(response.data.code)) {
                    defer.reject({
                        type: -1,
                        data: response
                    });
                } else if (response.data.code !== 0) {
                    defer.reject({
                        type: 1,
                        data: response
                    });
                } else {
                    defer.resolve(response.data);
                }
                return defer.promise;
            }, function(err) {
                throw {
                    type: -1,
                    data: err
                };
            });
        };
    })
    .factory('connector', function($rootScope, request, config) {

        function getDefaultOption(params, method, api) {
            var p = config.getDefaultParams();
            return {
                method: method,
                url: config.ip + 'api.php/' + api,
                params: method === 'GET' ? angular.extend(p, params) : undefined,
                data: method === 'POST' ? $.param(angular.extend(p, params)) : undefined
            };
        }

        function http(params, filter, method, api) {
            var option = getDefaultOption(params, method, api);
            return request(angular.extend(option, filter));
        }
        return {
            newsLikes: function(params, filter) {
                return http(params, filter, 'GET', 'news/likes');
            },
            newsToCommment: function(params, filter) {
                return http(params, filter, 'GET', 'news/toCommment');
            },
            newsCommments: function(params, filter) {
                return http(params, filter, 'GET', 'news/commments');
            },
            magicBuy: function(params, filter) {
                return http(params, filter, 'GET', 'magic/buy');
            },
            guess: function(params, filter) {
                return http(params, filter, 'GET', 'guess');
            },
            newsRecDetail: function(params, filter) {
                return http(params, filter, 'GET', 'news/recDetail');
            },
            newsRecommend: function(params, filter) {
                return http(params, filter, 'GET', 'news/recommend');
            },
            huiUnions: function(params, filter) {
                return http(params, filter, 'GET', 'hui/unions');
            },
            huiSort: function(params, filter) {
                return http(params, filter, 'GET', 'hui/sort');
            },
            atlasPicAddZanCai: function(params, filter) {
                return http(params, filter, 'GET', 'atlas/picAddZanCai');
            },
            atlasPicCommentsZanCai: function(params, filter) {
                return http(params, filter, 'GET', 'atlas/picCommentsZanCai');
            },
            atlasPicAddComment: function(params, filter) {
                return http(params, filter, 'GET', 'atlas/picAddComment');
            },
            atlasGetPicComment: function(params, filter) {
                return http(params, filter, 'GET', 'atlas/getPicComment');
            },
            befans: function(params, filter) {
                return http(params, filter, 'GET', 'befans');
            },
            fanShowPklists: function(params, filter) {
                return http(params, filter, 'GET', 'fanShow/pklists');
            },
            dynamicMomentList: function(params, filter) {
                return http(params, filter, 'GET', 'atlas/dynamicMomentList');
            },
            fansshows: function(params, filter) {
                return http(params, filter, 'GET', 'fansshows');
            },
            dynamicMomentDetailList: function(params, filter) {
                return http(params, filter, 'GET', 'atlas/dynamicMomentDetailList');
            },
            fansShowComment: function(params, filter) {
                return http(params, filter, 'POST', 'fansShow/comment');
            },
            fansShowPkinfo: function(params, filter) {
                return http(params, filter, 'GET', 'fanShow/pkinfo');
            },
            fansShowDz: function(params, filter) {
                return http(params, filter, 'GET', 'fansShow/dz');
            },
            fansShowContributions: function(params, filter) {
                return http(params, filter, 'GET', 'fansShow/contributions');
            },
            fansShowMagicReceive: function(params, filter) {
                return http(params, filter, 'GET', 'fansShow/magicReceive');
            },
            fansShowComments: function(params, filter) {
                return http(params, filter, 'GET', 'fansShow/comments');
            },
            atlasList: function(params, filter) {
                return http(params, filter, 'GET', 'atlas/atlasList');
            },
            taShow: function(params, filter) {
                return http(params, filter, 'GET', 'fansShow/taShow');
            },
            blq: function(params, filter) {
                return http(params, filter, 'GET', 'blq');
            },
            advert: function(params, filter) {
                return http(params, filter, 'GET', 'advert');
            },
            dkl: function(params, filter) {
                return http(params, filter, 'GET', 'dkl');
            },
            tags: function(params, filter) {
                return http(params, filter, 'GET', 'tags');
            },
            livehome: function(params, filter) {
                return http(params, filter, 'GET', 'livehome');
            },
            homepage: function(params, filter) {
                return http(params, filter, 'GET', 'homepage');
            },
            audioOwn: function(params, filter) {
                return http(params, filter, 'GET', 'audio/own');
            },
            audioInfo: function(params, filter) {
                return http(params, filter, 'GET', 'audio/info');
            },
            audioLike: function(params, filter) {
                return http(params, filter, 'GET', 'audio/like');
            },
            audioComment: function(params, filter) {
                return http(params, filter, 'POST', 'audio/comment');
            },
            comments: function(params, filter) {
                return http(params, filter, 'GET', 'comments');
            },
            liveInfo: function (params, filter){
                return http(params, filter, 'GET', 'liveInfo');
            },
            enterOrLeaveChatroom: function (params, filter) {
                return http(params, filter, 'GET', 'inorout');
            },
            chooseTeam: function (params, filter) {
                return http(params, filter, 'GET', 'fans');
            },
            matchScore: function (params, filter) {
                return http(params, filter, 'GET', 'score');
            },
            matchNum: function (params, filter) {
                return http(params, filter, 'GET', 'shownum');
            },
            matchInfo: function (params, filter) {
                return http(params, filter, 'GET', 'matchinfo');
            },
            getGroupChatRecord: function (params, filter) {
                return http(params, filter, 'GET', 'gethxchar');
            },
            getLuckyMoney: function (params, filter) {
                return http(params, filter, 'GET', 'qhb');
            },
            getPurchaseList: function (params, filter) {
                return http(params, filter, 'GET', 'goldens');
            },
            getMemberLevel: function (params, filter) {
                return http(params, filter, 'GET', 'Pay/memberLevels');
            },
            useMagic: function (params, filter) {
                return http(params, filter, 'GET', 'magic/use');
            },
            buyVIP: function (params, filter) {
                return http(params, filter, 'GET', 'buyprivilege');
            },
            askExpert: function (params, filter) {
                return http(params, filter, 'GET', 'questions');
            },
            getFunProgramList: function (params, filter) {
                return http(params, filter, 'GET', 'jingcai');
            },
            sendMsg: function (params, filter) {
                return http(params, filter, 'GET', 'chatroom/sendMessage');
            },
            myfollows: function(params, filter) {
                return http(params, filter, 'GET', 'myfollows');
            },
            follows: function(params, filter) {
                return http(params, filter, 'GET', 'follows');
            },
            authorLike: function(params, filter) {
                return http(params, filter, 'GET', 'author/like');
            },
            cancelfollows: function(params, filter) {
                return http(params, filter, 'GET', 'cancelfollows');
            },
            userInfo: function (params, filter) {
                return http(params, filter, 'GET', 'member').then(function (data) {
                    var avatar = data.Data.avatar || '';
                    if (avatar.indexOf('http://') == -1 && avatar.indexOf('https://') == -1) {
                        avatar = config.picRoot() + data.Data.avatar;
                    }
                    return {
                        avatar: avatar,
                        picRoot: data.picRoot,
                        name: data.Data.username,
                        nickname: data.Data.nickname,
                        signature: data.Data.signature,
                        follow: data.Data.follows,
                        fans: data.Data.fans,
                        age: data.Data.age,
                        sex: data.Data.sex == 1 ? 'male' : (data.Data.sex == 2 ? 'female' : undefined),
                        location: {
                            city: data.Data.cname,
                            cityCode: data.Data.city,
                            district: data.Data.dname,
                            districtCode: data.Data.district,
                            province: data.Data.pname,
                            provinceCode: data.Data.province
                        },
                        level: data.Data.level,
                        id: data.Data.uid,
                        needValidate: data.Data.validate,
                        hx: {
                            username: data.Data.hxUsername,
                            password: data.Data.hxPassword
                        },
                        isFollowed: !!data.Data.isFollow,
                        isBindMobile: !!data.Data.bindmobile,
                        giftBuy: data.Data.buys,
                        favTeam: data.Data.myFavoriteTeams,
                        favStar: data.Data.myFavoriteStars,
                        giftOwn: data.Data.owns,
                        boluo: data.Data.goldens,
                        bean: data.Data.beans,
                        originalData: data,
                        bg: data.Data.center_pic
                    };
                }, function (e) {
                    throw e;
                });
            },
            refreshUserInfo: function (){
                var _this = this;
                return _this.userInfo({
                    fuid: config.uid(), 
                    uid: config.uid()
                }).then(function (user) {
                    return _this.getBoloNum({uid: user.id}).then(function (data) {
                        user.boloNum = data.Data.bolo;
                        user.charm = data.Data.charms;
                        user.activity = data.Data.activity;
                        user.stars = data.Data.stars;

                        $rootScope.user = user;
                        $rootScope.$broadcast('currentUser', user);
                        $rootScope.requestUser = null;
                        return user;
                    });
                }, function (e) {
                    $rootScope.requestUser = null;    
                    $rootScope.user = {};
                    return $rootScope.user;
                });
            },
            getFollowList: function (params, filter) {
                return http(params, filter, 'GET', 'myfans');
            },
            requestFriend: function (params, filter) {
                return http(params, filter, 'GET', 'friendreq');
            },
            editNickname: function (params, filter) {
                return http(params, filter, 'GET', 'nickname');
            },
            editSign: function (params, filter) {
                return http(params, filter, 'GET', 'sign');
            },
            changeSex: function (params, filter) {
                return http(params, filter, 'GET', 'chmodsex');
            },
            changeAge: function (params, filter) {
                return http(params, filter, 'GET', 'chmodage');
            },
            changeLocation: function (params, filter) {
                return http(params, filter, 'GET', 'chmoddistrict');
            },
            editFavStar: function (params, filter) {
                return http(params, filter, 'GET', 'chmodmystars');
            },
            editFavTeam: function (params, filter) {
                return http(params, filter, 'GET', 'chmodmyteams');
            },
            getTeamList: function (params, filter) {
                return http(params, filter, 'GET', 'football/teamlist');
            },
            getStarList: function (params, filter) {
                return http(params, filter, 'GET', 'starslist');
            },
            getMyGiftList: function (params, filter) {
                return http(params, filter, 'GET', 'user/myGifts');
            },
            getMsgList: function (params, filter) {
                return http(params, filter, 'GET', 'mymessage');
            },
            delMsg: function (params, filter) {
                return http(params, filter, 'GET', 'messagedel');
            },
            myCharms: function (params, filter) {
                return http(params, filter, 'GET', 'mycharms');
            },
            myActivity: function (params, filter) {
                return http(params, filter, 'GET', 'myactivity');
            },
            myTask: function (params, filter) {
                return http(params, filter, 'GET', 'mytasks');
            },
            isSign: function (params, filter) {
                return http(params, filter, 'GET', 'reward/isSign');
            },
            userSign: function (params, filter) {
                return http(params, filter, 'GET', 'signin');
            },
            getBoloNum: function (params, filter) {
                return http(params, filter, 'GET', 'getindex');
            },
            followUser: function (params, filter) {
                return http(params, filter, 'GET', 'user/follows');
            },
            getLocationList: function (params, filter) {
                return http(params, filter, 'GET', 'districts');
            },
            getGiftList: function (params, filter) {
                return http(params, filter, 'GET', 'myMagics');
            },
            sendGift: function (params, filter) {
                return http(params, filter, 'GET', 'magic/send');
            },
            goodsList: function (params, filter) {
                return http(params, filter, 'GET', 'goods/list');
            },
            friendGiftList: function (params, filter) {
                return http(params, filter, 'GET', 'magic/fslist');
            },
            commentatorGiftList: function (params, filter) {
                return http(params, filter, 'GET', 'magic/commentator');
            },
            sendCommGift: function (params, filter) {
                return http(params, filter, 'GET', 'fansShow/flower');
            },
            endMatchList: function (params, filter) {
                return http(params, filter, 'GET', 'endmatchlists');
            },
            getRecommendTeam: function (params, filter) {
                return http(params, filter, 'GET', 'meng/pushing');
            },
            getIndexAct: function (params, filter) {
                return http(params, filter, 'GET', 'meng/indexActivity');
            },
            getTeamInfo: function (params, filter) {
                return http(params, filter, 'GET', 'meng/detailTeam');
            },
            getTeamTopicList: function (params, filter) {
                return http(params, filter, 'GET', 'meng/postList');
            },
            getTopicDetail: function (params, filter) {
                return http(params, filter, 'GET', 'meng/detailPost');
            },
            getTopicReply: function (params, filter) {
                return http(params, filter, 'GET', 'meng/getPostReply');
            },
            replyTopic: function (params, filter) {
                return http(params, filter, 'GET', 'meng/replyPost');
            },
            getTeamActList: function (params, filter) {
                return http(params, filter, 'GET', 'meng/activityList');
            },
            getActDetail: function (params, filter) {
                return http(params, filter, 'GET', 'meng/detailActivity');
            },
            stickAct: function (params, filter) {
                return http(params, filter, 'GET', 'meng/activityStick');
            },
            actMember: function (params, filter) {
                return http(params, filter, 'GET', 'meng/activityMemberList');
            },
            updateAct: function (params, filter) {
                return http(params, filter, 'GET', 'meng/updateActivity');
            },
            getActComment: function (params, filter) {
                return http(params, filter, 'GET', 'meng/commentList');
            },
            newActivity: function (params, filter) {
                return http(params, filter, 'GET', 'meng/createActivity');
            },
            createTeam: function (params, filter) {
                return http(params, filter, 'GET', 'meng/addTeam');
            },
            updateTeam: function (params, filter) {
                return http(params, filter, 'GET', 'meng/updateTeam');
            },
            getMyTeam: function (params, filter) {
                return http(params, filter, 'GET', 'meng/myTeam');
            },
            searchTeam: function (params, filter) {
                return http(params, filter, 'GET', 'meng/searchTeam');
            },
            getJoinTeam: function (params, filter) {
                return http(params, filter, 'GET', 'meng/joinedTeam');
            },
            getHotTeam: function (params, filter) {
                return http(params, filter, 'GET', 'meng/teamPopularity');
            },
            enrollAct: function (params, filter) {
                return http(params, filter, 'GET', 'meng/enroll');
            },
            createPost: function (params, filter) {
                return http(params, filter, 'GET', 'meng/createPost');
            },
            closeAct: function (params, filter) {
                return http(params, filter, 'GET', 'meng/closeActivity');
            },
            getTeamMember: function (params, filter) {
                return http(params, filter, 'GET', 'meng/teamMemberList');
            },
            deleteImg: function (params, filter) {
                return http(params, filter, 'GET', 'meng/delPic');
            },
            transferAdmin: function (params, filter) {
                return http(params, filter, 'GET', 'meng/changeAdmin');
            },
            joinTeam: function (params, filter) {
                return http(params, filter, 'GET', 'meng/joinTeam');
            },
            unionList: function (params, filter) {
                return http(params, filter, 'GET', 'meng/unionsList');
            },
            getHotUnions: function(params, filter) {
                return http(params, filter, 'GET', 'hui/hotUnions');
            },
            getUnionsInfo: function(params, filter) {
                return http(params, filter, 'GET', 'hui/unionsInfo');
            },
            getPosts: function(params, filter) {
                return http(params, filter, 'GET', 'hui/posts');
            },
            setFollow: function(params, filter) {
                return http(params, filter, 'GET', 'hui/follow');
            },
            setMisfollow: function(params, filter) {
                return http(params, filter, 'GET', 'hui/misfollow');
            },
            setToPost: function(params, filter) {
                return http(params, filter, 'POST', 'hui/toPost');
            },
            getThePost:function(params, filter) {
                return http(params, filter, 'GET', 'hui/thePost');
            },
            getReplys:function(params, filter) {
                return http(params, filter, 'GET', 'hui/replys');
            },
            setToReply:function(params, filter) {
                return http(params, filter, 'POST', 'hui/toReply');
            },
            getAccusation:function(params, filter) {
                return http(params, filter, 'GET', 'hui/accusation');
            },
            getDelPost:function(params, filter) {
                return http(params, filter, 'GET', 'hui/delPost');
            },
            getUActivitys:function(params, filter) {
                return http(params, filter, 'GET', 'hui/uActivitys');
            },               
            setToActivity:function(params, filter) {
                return http(params, filter, 'POST', 'hui/toActivity');
            },  
            getActivityInfo:function(params, filter) {
                return http(params, filter, 'GET', 'hui/activityInfo');
            },
            getMyUnions:function(params, filter) {
                return http(params, filter, 'GET', 'hui/myUnions');
            },  
            setToComment:function(params, filter) {
                return http(params, filter, 'POST', 'hui/toComment');
            },
            getDelActivity:function(params, filter) {
                return http(params, filter, 'GET', 'hui/delActivity');
            }, 
            getAAccusation:function(params, filter) {
                return http(params, filter, 'GET', 'hui/aAccusation');
            }, 
            getComments:function(params, filter) {
                return http(params, filter, 'GET', 'hui/comments');
            },    
            getCommentChilds:function(params, filter) {
                return http(params, filter, 'GET', 'hui/commentChilds');
            },  
            getMagics:function(params, filter) {
                return http(params, filter, 'GET', 'magics');
            },       
            getPool: function(params, filter) {
                return http(params, filter, 'GET', 'hui/pool');
            }
        };
    })
    .factory('locationList', function ($rootScope, $q, connector) {
        if ($rootScope.locationList) {
            var defer = $q.defer();
            defer.resolve($rootScope.locationList.parsed);
            return defer.promise;
        } else {
            return connector.getLocationList().then(function (data) {
                var obj = {};
                var obj2 = {};
                angular.forEach(data.Data, function (item) {
                    obj[item.code] = item;
                });
                angular.forEach(data.Data, function (item) {
                    if (!item.pcode) {
                        obj2[item.code] = item;
                        obj2[item.code].child = {};
                    } else if (obj[item.pcode].pcode) {
                        var p = obj[item.pcode].pcode;
                        var i = obj[p];
                        if (i.child[item.pcode]) {
                            i.child[item.pcode].child = i.child[item.pcode].child || {};
                            i.child[item.pcode].child[item.code] = item;
                        } else {
                            i.child[item.pcode] = obj[item.pcode];
                        }
                    } else {
                        obj2[item.pcode].child[item.code] = item;
                    }
                });
                $rootScope.locationList = {
                    parsed: obj2,
                    original: obj
                };
                return obj2;
            });
        }
    });
