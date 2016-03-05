(function (win){
    var w = $(win);
    var h = $("html");
    function fn(){
        h.css("font-size", w.width() / 320 + "rem");
    }
    fn();
    w.bind('resize', fn);
})(window);

var application = angular.module('app', ['ngTouch', 'tmpl', 'ui.router']);

application.config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/');
    $stateProvider
        //菠萝盟
        .state('pineapple', {
            url: '/pineapple',
            templateUrl: 'application/pineapple/pineapple.html',
            controller: 'pineappleCtrl'
        })
        //球迷秀
        .state('pineapple.fansShow', {
            url: '/fansShow/:avatar',
            templateUrl: 'application/fans-show/fans-show.html',
            controller: 'fansShowCtrl'
        })
        //精彩七人制
        .state('wonderful', {
            url: '/wonderful',
            templateUrl: 'application/wonderful/wonderful.html',
            controller: 'wonderfulCtrl'
        })
        //星球拍客
        .state('paike', {
            url: '/paike',
            templateUrl: 'application/paike/paike.html',
            controller: 'paikeCtrl'
        })
        //星球拍客栏目最新，人气
        .state('paikeTab', {
            url: '/paikeTab/:tab',
            templateUrl: 'application/paike/paike-tab.html',
            controller: 'paikeTabCtrl'
        })
        //精彩图集列表页
        .state('atlas', {
            url: '/atlas',
            templateUrl: 'application/atlas/atlas.html',
            controller: 'atlasCtrl'
        })
        //精彩图集详情页
        .state('photoswipe', {
            url: '/photoswipe/:pid/:title',
            templateUrl: 'application/photoswipe/photoswipe.html',
            controller: 'photoswipeCtrl'
        })
        //精彩图集评论页
        .state('atlasGetPicComment', {
            url: '/atlasGetPicComment/:pid/:title',
            templateUrl: 'application/photoswipe/photoswipe-comments.html',
            controller: 'atlasGetPicCommentCtrl'
        })
        //盟聊吧        
        .state('pineapple.postBar', {
            url: '/postBar/:avatar',
            templateUrl: 'application/post-bar/post-bar.html',
            controller: 'postBarCtrl'
        })
        //发布主题
        .state('writeTheme', {
            url: '/writeTheme/:name/:nid/:avatar',
            templateUrl: 'application/write-theme/write-theme.html',
            controller: 'writeThemeCtrl'
        })
        //帖子详情
        .state('themeDetail', {
            url: '/themeDetail/:pid/:avatar',
            templateUrl: 'application/post-bar/theme-detail.html',
            controller: 'themeDetailCtrl'
        }) 
        //回复详情
        .state('themeBuild', {
            url: '/themeBuild/:pid/:i/:avatar',
            templateUrl: 'application/post-bar/theme-build.html',
            controller: 'themeDetailCtrl'
        }) 
        //活动回复详情
        .state('activeBuild', {
            url: '/activeBuild/:aid/:cid/:i/:avatar',
            templateUrl: 'application/post-bar/active-build.html',
            controller: 'activeDetailCtrl'
        }) 
        //联盟活动列表
        .state('unionsActive', {
            url: '/unionsActive/:nid/:avatar',
            templateUrl: 'application/post-bar/unions-active.html',
            controller: 'unionsActiveCtrl'
        })  
        //联盟发布活动
        .state('writeActive', {
            url: '/writeActive/:nid/:avatar',
            templateUrl: 'application/post-bar/write-active.html',
            controller: 'writeActiveCtrl'
        })  
        //联盟活动详情
        .state('activeDetail', {
            url: '/activeDetail/:aid/:avatar',
            templateUrl: 'application/post-bar/active-detail.html',
            controller: 'activeDetailCtrl'
        })   
        //联盟页
        .state('league', {
            url: '/league/:name/:nid/:avatar',
            templateUrl: 'application/league/league.html',
            controller: 'leagueCtrl'
        })
        //联盟列表
        .state('leagueList', {
            url: '/league-list/:avatar',
            templateUrl: 'application/league-list/league-list.html',
            controller: 'leagueListCtrl'
        })
        //盟活动
        .state('pineapple.activity', {
            url: '/activity/:avatar',
            templateUrl: 'application/activity/activity.html',
            controller: 'activityCtrl'
        })
        .state('team', {
            url: '/team/:avatar/:id',
            templateUrl: 'application/team/team.html',
            controller: 'teamCtrl',
            resolve: {
                loc: function (locationList) {
                    return locationList;
                }
            }
        })
        .state('team.member', {
            url: '/member',
            templateUrl: 'application/team/member.html',
            controller: 'teamMemberCtrl'
        })
        .state('team.edit', {
            url: '/edit',
            templateUrl: 'application/team/edit.html',
            controller: 'teamEditCtrl'
        })
        .state('team.transferAdmin', {
            url: '/transfer-admin',
            templateUrl: 'application/team/transfer-admin.html',
            controller: 'teamMemberCtrl'
        })
        .state('team.topic', {
            url: '/topic',
            templateUrl: 'application/team/topic.html',
            controller: 'topicCtrl'
        })
        .state('team.newTopic', {
            url: '/new-topic',
            templateUrl: 'application/team/new-topic.html',
            controller: 'newTopicCtrl'
        })
        .state('team.topicDetail', {
            url: '/topic/:tid',
            templateUrl: 'application/team/topic-detail.html',
            controller: 'topicDetailCtrl'
        })
        .state('team.activity', {
            url: '/activity',
            templateUrl: 'application/team/activity.html',
            controller: 'teamActivityCtrl'
        })
        .state('team.activityDetail', {
            url: '/activity/:aid',
            templateUrl: 'application/team/activity-detail.html',
            controller: 'teamActDetailCtrl'
        })
        .state('team.activityDetail.edit', {
            url: '/edit',
            templateUrl: 'application/team/new-activity.html',
            controller: 'teamActEditCtrl'
        })
        .state('team.activityDetail.list', {
            url: '/user',
            templateUrl: 'application/team/user-list.html',
            controller: 'teamListCtrl'
        })
        .state('team.newActivity', {
            url: '/new-activity',
            templateUrl: 'application/team/new-activity.html',
            controller: 'newActivityCtrl'
        })
        .state('myTeam', {
            url: '/my-team',
            templateUrl: 'application/team/my-team.html',
            controller: 'myTeamCtrl'
        })
        .state('searchTeam', {
            url: '/search-team',
            templateUrl: 'application/team/search.html',
            controller: 'searchTeamCtrl'
        })
        .state('createTeam', {
            url: '/new-team',
            templateUrl: 'application/team/edit.html',
            controller: 'newTeamCtrl'
        })
        //推荐
        .state('recommend', {
            url: '/recommend/:avatar',
            templateUrl: 'application/recommend/recommend.html',
            controller: 'recommendCtrl'
        })        
        //推荐详情
        .state('recommend-detail', {
            url: '/recommend-detail/:vid',
            templateUrl: 'application/recommend/detail.html',
            controller: 'recommendDetailCtrl',
            resolve: {
                match: function ($stateParams, currentUser, connector, config, loading) {
                    var hide = loading.show();
                    function getDetail(user){
                        return connector.newsRecDetail({
                            uid: config.uid(),
                            id: $stateParams.vid
                        },{
                            url: 'http://bole.chokking.com/news.php?s=news/recDetail'
                        }).then(function (rs){
                            hide();
                            return rs;
                        }, function (err){
                            hide();
                            return err;
                        });
                    }
                    return currentUser().then(function (user) {
                        return getDetail(user);
                    }, function (err){
                        return getDetail(err);
                    });
                }
            }
        })
        //头条
        .state('headlines', {
            url: '/headlines/:avatar',
            templateUrl: 'application/headlines/headlines.html',
            controller: 'headlinesCtrl'
        })
        //新闻详情
        .state('newsDetail', {
            url: '/newsDetail/:url/:id/:avatar',
            templateUrl: 'application/headlines/detail.html',
            controller: 'newsDetailCtrl'
        })
        //大咖聊
        .state('landing', {
            url: '/',
            templateUrl: 'application/landing/landing.html',
            controller: 'landingCtrl'
        })
        /**
         * tab: voice        : 好声音
         * tab: voiceOwn     : 好声音频道
         * tab: dk           : 大咖与你聊
         * tab: subscription : 我的订阅
         */
        .state('list', {
            url: '/list/:tab/:avatar',
            templateUrl: 'application/landing/landing.html',
            controller: 'listCtrl'
        })
        //视频详情
        .state('watch', {
            url: '/watch',
            templateUrl: 'application/watch/watch.html',
            controller: 'watchCtrl'
        })
        //拍客详情
        .state('watch.paike', {
            url: '/paike/:vid',
            templateUrl: 'application/watch/watch-paike.html',
            controller: 'watchPaikeCtrl',
            resolve: {
                match: function ($stateParams, currentUser, connector, loading) {
                    var hide = loading.show();
                    function getDetail(user){
                        return connector.fansShowPkinfo({
                            liveid: $stateParams.vid
                        }).then(function (rs){
                            hide();
                            return rs;
                        }, function (err){
                            hide();
                            return err;
                        });
                    }
                    return currentUser().then(function (user) {
                        return getDetail(user);
                    }, function (err){
                        return getDetail(err);
                    });
                }
            }
        })
        //精彩七人制详情
        .state('watch.wonderful', {
            url: '/wonderful/:vid',
            templateUrl: 'application/watch/watch-wonderful.html',
            controller: 'watchWonderfulCtrl',
            resolve: {
                match: function ($stateParams, currentUser, connector, loading) {
                    var hide = loading.show();
                    var vid = $stateParams.vid;
                    function getDetail(user){
                        // return connector.matchInfo({
                        return connector.liveInfo({
                            uid: user.id, 
                            liveid: vid
                        }).then(function (data) {
                            return connector.matchScore({
                                uid: user.id, 
                                liveid: vid, 
                                matchid: data.Data.matchid
                            }).then(function (d) {
                                hide();
                                data.Data.matchScore = d.Data;
                                return data;
                            }, function (err){
                                hide();
                                data.Data.matchScore = err;
                                return data;
                            });
                        }, function (err){
                            hide();
                            return err;
                        });
                    }
                    return currentUser().then(function (user) {
                        return getDetail(user);
                    }, function (err){
                        return getDetail(err);
                    });
                }
            }
        })
        //好声音详情
        .state('watch.voice', {
            url: '/voice/:vid',
            templateUrl: 'application/watch/watch-voice.html',
            controller: 'watchVoiceCtrl',
            resolve:  {
                detailInfo: function ($stateParams, currentUser, connector, loading, $q) {
                    var hide = loading.show();
                    function getDetail(user){
                        return connector.audioInfo({
                            aid: $stateParams.vid
                        }).then(function (rs){
                            hide();
                            return rs;
                        }, function (err){
                            hide();
                            return err;
                        });
                    }
                    return currentUser().then(function (user) {
                        return getDetail(user);
                    }, function (err){
                        return getDetail(err);
                    });
                }
            }
        })
        //大咖聊详情
        .state('watch.dk', {
            url: '/Dk/:vid',
            templateUrl: 'application/watch/watch-dk.html',
            controller: 'watchDkCtrl',
            resolve: {
                match: function ($stateParams, currentUser, connector, loading) {
                    var hide = loading.show();
                    var vid = $stateParams.vid;
                    function getDetail(user){
                        return connector.matchInfo({
                            uid: user.id, 
                            liveid: vid
                        }).then(function (data) {
                            return connector.matchScore({
                                uid: user.id, 
                                liveid: vid, 
                                matchid: data.Data.matchid
                            }).then(function (d) {
                                hide();
                                data.Data.matchScore = d.Data;
                                return data;
                            }, function (err){
                                hide();
                                data.Data.matchScore = err;
                                return data;
                            });
                        }, function (err){
                            hide();
                            return err;
                        });
                    }
                    return currentUser().then(function (user) {
                        return getDetail(user);
                    }, function (err){
                        return getDetail(err);
                    });
                }
            },
            onEnter: function ($stateParams, currentUser, connector) {
                var vid = $stateParams.vid;
                function getDetail(user){
                    return connector.enterOrLeaveChatroom({status: 1, liveid: vid, uid: user.id});
                }
                return currentUser().then(function (user) {
                    return getDetail(user);
                }, function (err){
                    return getDetail(err);
                });
            },
            onExit: function ($stateParams, currentUser, connector) {
                var vid = $stateParams.vid;
                function getDetail(user){
                    return connector.enterOrLeaveChatroom({status: 2, liveid: vid, uid: user.id});
                }
                return currentUser().then(function (user) {
                    return getDetail(user);
                }, function (err){
                    return getDetail(err);
                });
            }
        })
        //用户详情
        .state('user', {
            url: '/user/:id',
            templateUrl: 'application/user-info/user-detail.html',
            controller: 'userDetailCtrl',
            resolve:  {
                user: function ($stateParams, currentUser, connector, loading) {
                    var id = $stateParams.id;
                    var hide = loading.show();
                    return currentUser().then(function (user) {
                        hide();
                        if (id == user.id) {
                            return connector.getMyGiftList({uid: user.id}).then(function (data) {
                                user.giftList = data.Data;
                                return user;
                            });
                        } else {
                            return connector.userInfo({fuid: id, uid: user.id});
                        }
                    }, function (e) {
                        hide();
                        window.alert(e.data.data.errMsg);
                    });
                }
            }
        })
        //用户个人资料编辑
        .state('user.edit', {
            url: '/edit',
            templateUrl: 'application/user-info/user-edit.html',
            controller: 'userEditCtrl',
        })
        //编辑昵称
        .state('user.edit.name', {
            url: '/username',
            templateUrl: 'application/user-info/edit-username.html'
        })
        //编辑签名
        .state('user.edit.signature', {
            url: '/signature',
            templateUrl: 'application/user-info/edit-signature.html'
        })
        //编辑关注的球队
        .state('user.edit.fav-team', {
            url: '/fav-team',
            templateUrl: 'application/user-info/edit-fav-team.html'
        })
        // 编辑关注的球星
        .state('user.edit.fav-star', {
            url: '/fav-star',
            templateUrl: 'application/user-info/edit-fav-star.html'
        })
        // 魅力指数
        .state('charm', {
            url: '/charm',
            templateUrl: 'application/user-info/charm.html',
            controller: 'myCharmCtrl'
        })
        // 活跃值指数
        .state('user.activity', {
            url: '/activity',
            templateUrl: 'application/user-info/activity.html',
            controller: 'myActCtrl'
        })
        // 礼物
        .state('user.gift', {
            url: '/gift/:type',
            templateUrl: 'application/user-info/gift.html',
            controller: 'myGiftCtrl'
        })
        // 关注
        .state('user.follow', {
            url: '/follow/:type',
            templateUrl: 'application/user-info/follow.html',
            controller: 'myFollowCtrl'
        })
        // 好友申请
        .state('user.addFriend', {
            url: '/friend-request/:target',
            templateUrl: 'application/user-info/add-friend.html',
            controller: 'requestFriendCtrl'
        })
        // 我的任务
        .state('task', {
            url: '/task',
            templateUrl: 'application/user-info/task.html',
            controller: 'myTaskCtrl'
        })
        // 用户消息
        .state('user.msg', {
            url: '/msg',
            templateUrl: 'application/user-info/msg.html',
            controller: 'myMsgCtrl'
        })
        //完场数据
        .state('data', {
            url: '/data',
            templateUrl: 'application/user-info/data.html',
            controller: 'dataCtrl'
        })
        //查看特权
        .state('lookPrivilege', {
            url: '/lookPrivilege',
            templateUrl: 'application/user-info/look-privilege.html',
            controller: 'lookPrivilegeCtrl'
        })
        //商城
        .state('mall', {
            url: '/mall',
            templateUrl: 'application/user-info/mall.html',
            controller: 'mallCtrl'
        })
        //充值
        .state('recharge', {
            url: '/recharge',
            templateUrl: 'application/user-info/recharge.html',
            controller: 'rechargeCtrl',
            resolve: {
                list: function (currentUser, connector, loading) {
                    var hide = loading.show();
                    return currentUser().then(function (user) {
                        hide();
                        return connector.getPurchaseList({uid: user.id});
                    }, function (e){
                        hide();
                        window.alert(e.data.data.errMsg);
                    });
                },
                member: function (currentUser, connector, loading) {
                    var hide = loading.show();
                    return currentUser().then(function (user) {
                        hide();
                        return connector.getMemberLevel({uid: user.id});
                    }, function (e){
                        hide();
                        window.alert(e.data.data.errMsg);
                    });
                }
            }
        });
});