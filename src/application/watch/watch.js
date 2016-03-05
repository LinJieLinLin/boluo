application.controller('watchCtrl', function($scope, $rootScope, $sce, $element, $stateParams, $interval, $swipe, config, connector) {
    $scope.stateParams = $stateParams;

    var loadingTimer;
    var btndiv;
    var btndivTimer;
    var tiemer;
    var video;
    var perloader;
    var pro;
    var k;
    var p;

    var sx = 0;
    var dx = 0;
    var mc = 0;
    var pw = 0;
    var vd = 0;
    var vc = 0;

    function timerHideBtndiv(time){
        btndivTimer = setTimeout(function (){
            btndiv.stop(true).fadeOut(800);
        },time);
    }

    function btndivFage(type){
        clearTimeout(btndivTimer);
        switch(type){
            case 'show':
                btndiv.stop(true).fadeIn(200);
                break;
            case 'hide':
                timerHideBtndiv(4000);
                break;
            case 'toggle':
                if($scope.playFlag){
                    var is = btndiv.is(':hidden');
                    if(typeof is === 'boolean'){
                        btndiv.stop(true).fadeToggle(is ? 200 : 800, function (){
                            if($(this).is(':visible')){
                                timerHideBtndiv(4000);
                            }
                        });
                    }
                }
                break;
        }
    }

    function initBoluoPlayerParams(autoPlayFlag){
        btndiv = $element.find('.video-control');
        video = $element.find('#video-player').get(0);
        perloader = $element.find('.perloader-mask');
        pro = $element.find('.play-progress');
        k = pro.find('.k');
        p = pro.find('.p');

        sx = 0;
        dx = 0;
        mc = 0;
        pw = pro.width();
        vd = video.duration;
        vc = video.currentTime;

        video.controls = false;

        //播放
        video.onplay = function() {
            togglePlay(true);
        };
        //播放
        video.onplaying = function() {
            togglePlay(true);
        };
        //暂停
        video.onpause = function() {
            togglePlay(false);
        };
        //播放结束
        video.onended = function() {
            togglePlay(false);
        };

        $(video).unbind('touchstart').bind('touchstart', function (){
            btndivFage('toggle');
        });

        initBoluoPlayer();

        if(autoPlayFlag){
            play();
        }
    
        // console.dir(video);
    }

    function digest() {
        try {
            $scope.$digest();
        } catch (err) {}
    }

    function showPerloader(){
         perloader.show();
    }

    function hidePerloader(){
         perloader.hide();
    }

    function togglePlay(flag) {
        vd = video.duration;
        $scope.playFlag = flag;
        if(flag){
            btndivFage('hide');
            hidePerloader();
            startInterval();
        }else{
            btndivFage('show');
            cancelInterval();
        }
        digest();
    }

    function setProgress(num) {
        var total = isNaN(vd) ? 1 : vd;
        var v = num / total * 100;
        p.css('width', v + '%');
        k.css('left', v + '%');
    }

    function setCurrentTime(num) {
        video.currentTime = num;
    }

    function startInterval() {
        clearInterval(tiemer);
        tiemer = setInterval(function() {
            setProgress(video.currentTime);
        }, 200);
    }

    function cancelInterval() {
        clearInterval(tiemer);
    }

    function play() {
        if(video && $scope.video.url){
            video.play();
            togglePlay(true);
        }
    }

    function pause() {
        if(video){
            video.pause();
            togglePlay(false);
        }
    }

    function fullScreen() {
        if(video.webkitSupportsFullscreen){
            video.webkitEnterFullscreen();
        }
    }

    function start(c) {
        pause();
        sx = c.x;
        pw = pro.width();
        vd = video.duration;
        vc = video.currentTime;
        cancelInterval();
    }

    function move(c) {
        dx = c.x - sx;
        var v = dx / pw * vd + vc;
        mc = v < 0 ? 0 : v > vd ? vd : v;
        setProgress(mc);
    }

    function end(c) {
        setCurrentTime(mc);
        startInterval();
        play();
    }

    function kBindSwipe(){
        if(!k.get(0).bindSwipeLock){
            k.get(0).bindSwipeLock = 1;
            $swipe.bind(k, {
                start: start,
                move: move,
                end: end,
                cancel: end
            });
        }
    }

    function loaderInterval(){
        clearInterval(loadingTimer);
        loadingTimer = setInterval(function() {
            if(video.readyState === 0){
                showPerloader();
            }else{
                hidePerloader();
            }
        }, 50);
    }
    
    function initBoluoPlayer(){
        
        //开始加载
        video.onloadstart = function() {
            showPerloader();
        };
        //加载媒体
        video.onloadedmetadata = function() {
            showPerloader();
        };
        //加载数据
        video.onloadeddata = function() {
            showPerloader();
        };
        //在找
        video.onseeking = function() {
            showPerloader();
        };
        //可以播放
        video.oncanplaythrough = function() {
            hidePerloader();
        };

        kBindSwipe();

        loaderInterval();

        setProgress(video.currentTime);
    }

    $scope.play = play;
    $scope.pause = pause;
    $scope.fullScreen = fullScreen;

    $scope.video = {
        // poster: 'http://api.chokking.com/pic/15/09/16/400x400_2015091605271084.jpg',
        // url: $sce.trustAsResourceUrl('http://112.74.192.59/recplay2/vod/storage/20150922/20150922151425_20150922151549.mp4')
    };

    $scope.createVideo = function(v, p){
        var container = $('#video-container');
        if(!v.url || (/^rtmp\:\/\//).test(v.url)){
            container.html(
                [
                    '<div class="video-img-show" style="background-image:url('+ v.poster +')"></div>'
                ].join('')
            );
        }else{
            container.html(
                [
                    '<video id="video-player" preload x-webkit-airplay="true" webkit-playsinline="true" poster="'+ v.poster +'">',
                    '<source src="'+ v.url +'">',
                    '<p>您的浏览器不支持 video 标签。</p>',
                    '</video>'
                ].join('')
            );
            initBoluoPlayerParams(p);
        }
    };

    $scope.likeVideo = function (){
        var f = $scope.detailInfo.isLike;
        var a = ['audioLike', 'audioLike'];
        var t = a[f];
        connector[t]({
            aid: $scope.detailInfo.aid,
            uid: config.uid(),
            v: config.version()
        }).then(function (rs){
            $scope.detailInfo.isLike = f ? 0 : 1;
            console.info(rs, t);
        }, function (err){
            console.error(err);
            alert(err.data.data.errMsg);
        });
    };
});

//tab切换工厂，带滚动到底部加载
application.factory('watchTabfactory', function ($rootScope, $compile, $timeout, $sce, config, connector, loading) {
    var page;
    var pagesize;
    var loadingHide;
    var loadingFlag;
    var mainWrapper;
    function checkScrollBar($scope){
        $timeout(function (){
            $scope.showScrollLoadingFlag = mainWrapper.get(0).scrollHeight > mainWrapper.height();
        },500);
    }
    function loadingShowFn($scope){
        loadingHide = loading.show({element: mainWrapper});
    }
    function loadingHideFn($scope){
        loadingFlag = false;
        $scope.scrollLoadingReady = true;
        if(loadingHide){
            loadingHide();
            loadingHide = null;
        }
    }
    function loadMore($scope, fn){
        if(loadingFlag || $scope.noMoreFlag){
            return;
        }
        page++;
        fn($scope);
    }
    function scrollFn($scope, fn){
        if($scope.noScrollFnFlag){
            mainWrapper.unbind('scroll');
            return;
        }
        mainWrapper.unbind('scroll').bind('scroll', function (){
            var t = parseInt($(this).scrollTop());
            var maxt = $(this).get(0).scrollHeight - $(this).height() - 20;
            if(t >= maxt){
                loadMore($scope, fn);
            }
        });
    }
    //好声音请求评论
    function getComments($scope, refreshFlag){
        loadingFlag = true;
        if(refreshFlag){
            loadingShowFn($scope);
        }
        connector.comments({
            uid: config.uid(),
            aid: $scope.stateParams.vid,
            page: page,
            pagesize: pagesize
        }).then(function (rs){
            loadingHideFn($scope);
            var data = rs.Data;
            if(!data || !data.length){
                if(page > 1){
                    $scope.noMoreFlag = true;
                }
                return;
            }
            $scope.picRoot = config.picRoot();
            angular.forEach(data, function (item){
                item.avatar = config.filterImgUrl($scope.picRoot + item.avatar);
            });
            $scope.list = $scope.list.concat(data);
            checkScrollBar($scope);
        }, function (err){
            if(page > 1){
                page--;
            }
            loadingHideFn($scope);
            console.error(err);
            alert(err.data.data.errMsg);
        });
    }
    //球迷秀/拍客请求评论
    function fansShowComments($scope, refreshFlag){
        loadingFlag = true;
        if(refreshFlag){
            loadingShowFn($scope);
        }
        connector.fansShowComments({
            uid: config.uid(),
            liveid: $scope.stateParams.vid,
            page: page,
            pagesize: pagesize
        }).then(function (rs){
            loadingHideFn($scope);
            var data = rs.Data;
            if(!data || !data.length){
                if(page > 1){
                    $scope.noMoreFlag = true;
                }
                return;
            }
            $scope.picRoot = config.picRoot();
            angular.forEach(data, function (item){
                item.avatar = config.filterImgUrl($scope.picRoot + item.avatar);
            });
            $scope.list = $scope.list.concat(data);
            checkScrollBar($scope);
        }, function (err){
            if(page > 1){
                page--;
            }
            loadingHideFn($scope);
            console.error(err);
            alert(err.data.data.errMsg);
        });
    }
    //请求相关频道
    function getAudioOwn($scope, refreshFlag) {
        if($scope.$parent.error){
            return;
        }
        loadingFlag = true;
        if(refreshFlag){
            loadingShowFn($scope);
        }
        connector.audioOwn({
            uid: config.uid(),
            v: config.version(),
            special: $scope.$parent.detailInfo.special,
            page: page,
            pagesize: pagesize
        }).then(function(rs) {
            loadingHideFn($scope);
            var data = rs.Data;
            if(!data || !data.length){
                if(page > 1){
                    $scope.noMoreFlag = true;
                }
                return;
            }
            $scope.picRoot = config.picRoot();
            angular.forEach(data, function(item) {
                item.time = moment(new Date(item.dateline * 1000)).format('YYYY-MM-DD hh:mm');
            });
            $scope.list = $scope.list.concat(data);
            checkScrollBar($scope);
        }, function(err) {
            if(page > 1){
                page--;
            }
            loadingHideFn($scope);
            console.error(err);
            alert(err.data.data.errMsg);
        });
    }
    //请求(他/她)的视频
    function getTaVideo($scope, refreshFlag){
        $scope.noScrollFnFlag = true;
        if($scope.$parent.error){
            return;
        }
        loadingFlag = true;
        if(refreshFlag){
            loadingShowFn($scope);
        }

        var fuid = (function (){
            var uid = [];
            angular.forEach($scope.detailInfo.commentator, function (item){
                uid.push(item.uid);
            });
            return uid.join(',');
        })();

        connector.taShow({
            uid: config.uid(),
            fuid: fuid
        }).then(function (rs){
            loadingHideFn($scope);
            var data = rs.Data;
            if(!data || !data.length){
                if(page > 1){
                    $scope.noMoreFlag = true;
                }
                return;
            }
            $scope.picRoot = config.picRoot();
            $scope.list = $scope.list.concat(data);
            // checkScrollBar($scope);
        }, function (err){
            if(page > 1){
                page--;
            }
            loadingHideFn($scope);
            console.error(err);
            alert(err.data.data.errMsg);
        });
    }
    //请求(他/她)的图集
    function getTaAtlas($scope, refreshFlag){
        if($scope.$parent.error){
            return;
        }
        loadingFlag = true;
        if(refreshFlag){
            loadingShowFn($scope);
        }

        var fuid = (function (){
            var uid = [];
            angular.forEach($scope.detailInfo.commentator || $scope.detailInfo.author, function (item){
                uid.push(item.uid);
            });
            return uid.join(',');
        })();

        connector.atlasList({
            host_uid: fuid,
            p: page,
            pageSize: pagesize
        }).then(function (rs){
            loadingHideFn($scope);
            var data = rs.Data;
            if(!data || !data.length){
                if(page > 1){
                    $scope.noMoreFlag = true;
                }
                return;
            }
            $scope.picRoot = config.picRoot();
            $scope.list = $scope.list.concat(data);
            checkScrollBar($scope);
        }, function (err){
            if(page > 1){
                page--;
            }
            loadingHideFn($scope);
            console.error(err);
            alert(err.data.data.errMsg);
        });
    }
    //球迷秀栏目
    function getFansshows($scope, refreshFlag){
        loadingFlag = true;
        if(refreshFlag){
            loadingShowFn($scope);
        }
        connector.fansshows({
            uid: config.uid(),
            type: $scope.type,
            page: page,
            pagesize: pagesize
        }).then(function (rs){
            loadingHideFn($scope);
            var data = rs.Data.info;
            if(!data || !data.length){
                if(page > 1){
                    $scope.noMoreFlag = true;
                }
                return;
            }
            $scope.picRoot = config.picRoot();
            $scope.list = $scope.list.concat(data);
            checkScrollBar($scope);
        }, function (err){
            alert(err.data.data.errMsg);
        });
    }
    //精彩图集列表
    function getDynamicMomentList($scope, refreshFlag){
        loadingFlag = true;
        if(refreshFlag){
            loadingShowFn($scope);
        }
        connector.dynamicMomentList({
            p: page,
            pageSize: pagesize
        }).then(function (rs){
            loadingHideFn($scope);
            var data = rs.Data;
            if(!data || !data.length){
                if(page > 1){
                    $scope.noMoreFlag = true;
                }
                return;
            }
            $scope.picRoot = config.picRoot();
            $scope.list = $scope.list.concat(data);
            checkScrollBar($scope);
        }, function (err){
            alert(err.data.data.errMsg);
        });
    }
    //拍客栏目最新，人气
    function getFanShowPklists($scope, refreshFlag){
        loadingFlag = true;
        if(refreshFlag){
            loadingShowFn($scope);
        }
        connector.fanShowPklists({
            type: $scope.type,
            sub_type: $scope.sub_type,
            page: page,
            pageSize: pagesize
        }).then(function (rs){
            loadingHideFn($scope);
            var data = rs.Data;
            if(!data.info || !data.info.length){
                if(page > 1){
                    $scope.noMoreFlag = true;
                }
                return;
            }
            $scope.picRoot = config.picRoot();
            $scope.list = $scope.list.concat(data.info);
            $scope.column = data.column;
            checkScrollBar($scope);
        }, function (err){
            alert(err.data.data.errMsg);
        });
    }
    //精彩图集评论
    function getAtlasGetPicComment($scope, refreshFlag){
        loadingFlag = true;
        if(refreshFlag){
            loadingShowFn($scope);
        }
        connector.atlasGetPicComment({
            uid: config.uid(),
            pid: $scope.stateParams.pid,
            p: page,
            pageSize: pagesize
        }).then(function (rs){
            loadingHideFn($scope);
            var data = rs.Data;
            if(!data || !data.length){
                if(page > 1){
                    $scope.noMoreFlag = true;
                }
                return;
            }
            $scope.picRoot = config.picRoot();
            angular.forEach(data, function (item){
                item.time = moment(new Date(item.dateline * 1000)).format('YYYY-MM-DD hh:mm');
                item.avatar = config.filterImgUrl($scope.picRoot + item.avatar);
            });
            $scope.list = $scope.list.concat(data);
            checkScrollBar($scope);
        }, function (err){
            if(page > 1){
                page--;
            }
            loadingHideFn($scope);
            console.error(err);
            alert(err.data.data.errMsg);
        });
    }
    //推荐列表
    function getNewsRecommend($scope, refreshFlag){
        loadingFlag = true;
        if(refreshFlag){
            loadingShowFn($scope);
        }
        connector.newsRecommend({
            uid: config.uid(),
            page: page,
            pagesize: pagesize
        },{
            url: 'http://bole.chokking.com/news.php?s=news/recommend'
        }).then(function (rs){
            loadingHideFn($scope);
            var data = rs.Data;
            if(!data || !data.length){
                if(page > 1){
                    $scope.noMoreFlag = true;
                }
                return;
            }
            $scope.picRoot = config.picRoot();
            angular.forEach(data, function (item){
                item.time = moment(new Date(item.PostTime * 1000)).format('YYYY-MM-DD hh:mm');
                item.Desc = $sce.trustAsHtml(item.Desc || '');
            });
            $scope.list = $scope.list.concat(data);
            checkScrollBar($scope);
        }, function (err){
            if(page > 1){
                page--;
            }
            loadingHideFn($scope);
            console.error(err);
            alert(err.data.data.errMsg);
        });
    }
    //盟聊吧帖子列表
    function getPool($scope, refreshFlag) {
        loadingFlag = true;
        if (refreshFlag) {
            loadingShowFn($scope);
        }

        $scope.getPoolData = {
            page: page,
            pagesize: pagesize
        };
        connector.getPool($scope.getPoolData).then(function(rs) {
            loadingHideFn($scope);
            data = rs.Data;
            if (!data) {
                if (page > 1) {
                    $scope.noMoreFlag = true;
                }
                return;
            }
            $scope.tipList = $scope.tipList.concat(data);
            checkScrollBar($scope);
        }, function(err) {
            if (page > 1) {
                page--;
            }
            loadingHideFn($scope);
            console.error(err);
            alert(err.data.data.errMsg);
        });
    }
    //单个联盟帖子列表
    function getPosts($scope, refreshFlag) {
        loadingFlag = true;
        if (refreshFlag) {
            loadingShowFn($scope);
        }
        $scope.getPostsData.page = page;
        $scope.getPostsData.pagesize = pagesize;
        connector.getPosts($scope.getPostsData).then(function(rs) {
            loadingHideFn($scope);
            data = rs.Data.list;
            if (!data) {
                if (page > 1) {
                    $scope.noMoreFlag = true;
                }
                return;
            }
            $scope.postsList = $scope.postsList.concat(data);
            checkScrollBar($scope);
        }, function(err) {
            if (page > 1) {
                page--;
            }
            loadingHideFn($scope);
            console.error(err);
            alert(err.data.data.errMsg);
        });
    }
    //帖子回复列表
    function getReplys($scope, refreshFlag) {
        loadingFlag = true;
        if (refreshFlag) {
            loadingShowFn($scope);
        }
        $scope.getReplysData.page = page;
        $scope.getReplysData.pagesize = pagesize;
        connector.getReplys($scope.getReplysData).then(function(rs) {
            loadingHideFn($scope);
            data = rs.Data;
            if (!data) {
                if (page > 1) {
                    $scope.noMoreFlag = true;
                }
                return;
            }
            $scope.replyList = $scope.replyList.concat(data);
            checkScrollBar($scope);
        }, function(err) {
            if (page > 1) {
                page--;
            }
            loadingHideFn($scope);
            console.error(err);
            alert(err.data.data.errMsg);
        });
    }
    //联盟活动列表
    function getUActivitys($scope, refreshFlag) {
        loadingFlag = true;
        if (refreshFlag) {
            loadingShowFn($scope);
        }       
        $scope.getUActivitysData.page = page;
        $scope.getUActivitysData.pagesize = pagesize;
        connector.getUActivitys($scope.getUActivitysData).then(function(rs) {
            loadingHideFn($scope);
            data = rs.Data;
            if (!data) {
                if (page > 1) {
                    $scope.noMoreFlag = true;
                }
                return;
            }
            $scope.activeList = $scope.activeList.concat(data);
            checkScrollBar($scope);
        }, function(err) {
            if (page > 1) {
                page--;
            }
            loadingHideFn($scope);
            console.error(err);
            alert(err.data.data.errMsg);
        });
    }
    //联盟活动回复
    function getActiveComments($scope, refreshFlag) {
        loadingFlag = true;
        if (refreshFlag) {
            loadingShowFn($scope);
        }       
        $scope.getCommentsData.page = page;
        $scope.getCommentsData.pagesize = pagesize;
        connector.getComments($scope.getCommentsData).then(function(rs) {
            loadingHideFn($scope);
            data = rs.Data;
            if (!data) {
                if (page > 1) {
                    $scope.noMoreFlag = true;
                }
                return;
            }
            $scope.replyList = $scope.replyList.concat(data);
            checkScrollBar($scope);
        }, function(err) {
            if (page > 1) {
                page--;
            }
            loadingHideFn($scope);
            console.error(err);
            alert(err.data.data.errMsg);
        });
    }
    //推荐新闻评论
    function getNewsCommments($scope, refreshFlag){
        loadingFlag = true;
        if(refreshFlag){
            loadingShowFn($scope);
        }
        connector.newsCommments({
            uid: config.uid(),
            nid: $scope.stateParams.vid,
            page: page,
            pagesize: pagesize
        }).then(function (rs){
            loadingHideFn($scope);
            var data = rs.Data;
            if(!data || !data.length){
                if(page > 1){
                    $scope.noMoreFlag = true;
                }
                return;
            }
            $scope.picRoot = config.picRoot();
            angular.forEach(data, function (item){
                item.time = moment(new Date(item.dateline * 1000)).format('YYYY-MM-DD hh:mm');
                item.content = $sce.trustAsHtml(item.content || '');
            });
            $scope.list = $scope.list.concat(data);
            checkScrollBar($scope);
        }, function (err){
            if(page > 1){
                page--;
            }
            loadingHideFn($scope);
            console.error(err);
            alert(err.data.data.errMsg);
        });
    }

    return {
        refresh: function ($scope, fnName){
            $scope.scrollLoadingReady = false;
            $scope.noMoreFlag = null;
            $scope.list = [];
            page = 1;
            pagesize = 20;
            mainWrapper = $scope.mainWrapper || $('.main-wrapper');
            this[fnName]($scope, 'refresh');
            scrollFn($scope, this[fnName]);
        },
        getComments: getComments,
        getAudioOwn: getAudioOwn,
        getTaVideo: getTaVideo,
        getTaAtlas: getTaAtlas,
        getDynamicMomentList: getDynamicMomentList,
        getFanShowPklists: getFanShowPklists,
        getFansshows: getFansshows,
        getPool: getPool,
        getPosts:getPosts,
        getReplys:getReplys,
        getUActivitys:getUActivitys,
        getActiveComments:getActiveComments,
        getAtlasGetPicComment: getAtlasGetPicComment,
        getNewsRecommend: getNewsRecommend,
        getNewsCommments: getNewsCommments,
        fansShowComments: fansShowComments
    };
});

//球迷秀 精彩七人制
application.controller(
    'watchWonderfulCtrl', 
    function(
        $scope, 
        $rootScope, 
        $timeout, 
        $sce, 
        $http, 
        $stateParams, 
        $element, 
        config, 
        connector, 
        match, 
        loading,
        sendGift,
        menuShare
    ) {

    var tab = ['discuss','ta-video','ta-atlas','contribution'];
    $scope.stateParams = $stateParams;
    $scope.fxNavBar = false;
    $scope.curTab = null;
    $scope.navList = [{
        tab: tab[0],
        name: '评论',
        init: 'discussInit'
    }, {
        tab: tab[1],
        name: 'TA的视频',
        init: 'taVideoInit'
    }, {
        tab: tab[2],
        name: 'TA的图集',
        init: 'taAtlasInit'
    }, {
        tab: tab[3],
        name: '贡献榜',
        init: 'contributionInit'
    }];

    function runTabInit(attr){
        $timeout.cancel($scope.runTabInitTimer);
        if($scope[attr]){
            $scope[attr]();
            return;
        }
        $scope.runTabInitTimer = $timeout(function (){
            runTabInit(attr);
        });
    }

    $scope.toggleTab = function (item){
        $scope.curTab = item.tab;
        runTabInit(item.init);
    };

    $scope.togglePublishDiscuss = function() {
        $scope.togglePublishFlag = !$scope.togglePublishFlag;
    };

    $scope.isDiscussTab = function() {
        return $scope.curTab === 'discuss';
    };

    $scope.editDiscussPublish = function() {
        return $scope.isDiscussTab() && $scope.togglePublishFlag;
    };

    $scope.fansShowComment = function (content){
        if(!content){
            alert('不能为空');
            return;
        }
        connector.fansShowComment({
            uid: config.uid(),
            liveid: $stateParams.vid,
            content: content,
        }).then(function (rs){
            $scope.commentContent = '';
            $scope.togglePublishDiscuss();
            $scope.$broadcast("fansShowComment", rs);
        }, function (err){
            console.error(err, 'for audio/comment api error info');
            alert(err.data.data.errMsg);
        });
    };
    $scope.sendGift = function (user) {
        sendGift({
            from: 'wonderful',
            liveid: match.Data.liveid,
            chatroomid: match.Data.dkl,
            target: match.Data.commentator,
            type: 1
        }, function (err, success) {
            fansShowMagicReceive();
            $scope.$broadcast("fansShowComment");            
        });
    };
    $scope.picRoot = config.picRoot();

    function fansShowMagicReceive(){
        var commentatorid = (function (){
            var id = [];
            angular.forEach($scope.detailInfo.commentator, function (item){
                id.push(item.uid);
            });
            return id.join(',');
        })();

        connector.fansShowMagicReceive({
            uid: config.uid(),
            liveid: $stateParams.vid,
            commentatorid: commentatorid
        }).then(function (rs){
            var data = rs.Data;
            $scope.detailInfo.fansShowMagicReceive = data;
            $scope.$parent.detailInfo.fansShowMagicReceive = data;
        }, function (err){
            alert(err.data.data.errMsg);
        });
    }

    function getDetailInfo(){
        var data = match.Data;
        if(!data.commentator){
            data.commentator = data.ownerinfo;
        }
        if(angular.isNumber(data.islike)){
            data.isLike = data.islike;
        }
        $scope.detailInfo = data;
        $scope.$parent.detailInfo = data;
        $scope.$parent.video.url = $sce.trustAsResourceUrl(match.Data.url_video);
        $scope.$parent.video.poster = config.picRoot() + match.Data.cover;
        $scope.$parent.createVideo($scope.$parent.video);

        angular.forEach(match.Data.commentator, function (c) {
            c.avatar = config.filterImgUrl(config.picRoot() + c.avatar);
        });

        $scope.toggleTab($scope.navList[0]);

        fansShowMagicReceive();

        likeVideo();

        menuShare({
            title: data.matchname,
            imgUrl: config.picRoot() + data.cover,
            desc: data.introduction
        });
    }

    function likeVideo(){
        $scope.$parent.likeVideo = function (){
            var f = $scope.detailInfo.isLike;
            var a = ['fansShowDz', 'fansShowDz'];
            var t = a[f];
            connector[t]({
                liveid: $scope.detailInfo.liveid,
                uid: config.uid()
            }).then(function (rs){
                $scope.detailInfo.isLike = f ? 0 : 1;
            }, function (err){
                console.error(err);
                alert(err.data.data.errMsg);
            });
        };
    }

    getDetailInfo();
});

//球迷秀 - TA的视频
application
.directive("vTaVideoTab", function() {
    return {
        templateUrl: 'application/watch/watch-ta-video.html',
        restrict: "E",
        replace: true,
        transclude: true,
        scope: {},
        controller: 'watchTaVideoCtrl'
    };
})
.controller('watchTaVideoCtrl', function($scope, $rootScope, $stateParams, watchTabfactory) {
    $scope.stateParams = $stateParams;
    
    $scope.detailInfo = $scope.$parent.detailInfo;

    function refresh(){
        watchTabfactory.refresh($scope, 'getTaVideo');
    }
    $scope.$parent.taVideoInit = refresh;

    $scope.playToChoice = function (item, index){
        $scope.choicePlayIndex = index;
        $scope.$parent.createVideo({
            url: item.url_video,
            poster: $scope.picRoot + item.cover
        }, 'autoPlay');
    };
});

//球迷秀 - TA的图集
application
.directive("vTaAtlasTab", function() {
    return {
        templateUrl: 'application/watch/watch-ta-atlas.html',
        restrict: "E",
        replace: true,
        transclude: true,
        scope: {},
        controller: 'watchTaAtlasCtrl'
    };
})
.controller('watchTaAtlasCtrl', function($scope, $rootScope, $stateParams, watchTabfactory) {
    $scope.stateParams = $stateParams;
    
    $scope.detailInfo = $scope.$parent.detailInfo;

    function refresh(){
        watchTabfactory.refresh($scope, 'getTaAtlas');
    }
    $scope.$parent.taAtlasInit = refresh;
});

//球迷秀 - 贡献榜
application
.directive("vContributionTab", function() {
    return {
        templateUrl: 'application/watch/watch-contribution.html',
        restrict: "E",
        replace: true,
        transclude: true,
        scope: {},
        controller: 'watchContributionCtrl'
    };
})
.controller('watchContributionCtrl', function($scope, $rootScope, $stateParams, watchTabfactory, connector, config, loading) {
    $scope.stateParams = $stateParams;
    
    $scope.detailInfo = $scope.$parent.detailInfo;

    function refresh(){
        watchTabfactory.refresh($scope, 'getContribution');
    }
    $scope.$parent.contributionInit = refresh;

    function toggleContribution(item, index){
        var mainWrapper = $('.main-wrapper');
        var loadingHide = loading.show({element: mainWrapper});
        $scope.currentTabIndex = index;
        $scope.loadingReady = false;
        connector.fansShowContributions({
            uid: config.uid(),
            liveid: $stateParams.vid,
            fuid: item.uid
        }).then(function (rs){
            var data = rs.Data;
            $scope.loadingReady = true;
            $scope.list = data;
            loadingHide();
        }, function (err){
            $scope.loadingReady = true;
            alert(err.data.data.errMsg);
            loadingHide();
        });
    }

    $scope.toggleContribution = toggleContribution;


    $scope.$parent.contributionInit = function (){
        toggleContribution($scope.detailInfo.commentator[0], 0);
    };
});

//球迷秀 - 评论
application
.directive("vFansShowDiscussTab", function() {
    return {
        templateUrl: 'application/watch/watch-fans-show-discuss.html',
        restrict: "E",
        replace: true,
        transclude: true,
        scope: {},
        controller: 'watchFansShowDiscussCtrl'
    };
})
.controller('watchFansShowDiscussCtrl', function($scope, $rootScope, $stateParams, watchTabfactory) {
    $scope.stateParams = $stateParams;
    function refresh(){
        watchTabfactory.refresh($scope, 'fansShowComments');
    }
    $scope.$parent.discussInit = refresh;

    $scope.$on("fansShowComment", function (ev, rs){
        refresh();
    });
});

//拍客
application.controller(
    'watchPaikeCtrl', 
    function(
        $scope, 
        $rootScope, 
        $timeout, 
        $sce, 
        $http, 
        $stateParams, 
        $element, 
        config, 
        connector, 
        match,
        loading,
        sendGift,
        menuShare
    ) {

    var tab = ['discuss','ta-atlas'];
    $scope.stateParams = $stateParams;
    $scope.fxNavBar = false;
    $scope.fxFtBar = false;
    $scope.curTab = null;
    $scope.navList = [{
        tab: tab[0],
        name: '评论',
        init: 'discussInit'
    }, {
        tab: tab[1],
        name: '精彩图集',
        init: 'taAtlasInit'
    }];

    function runTabInit(attr){
        $timeout.cancel($scope.runTabInitTimer);
        if($scope[attr]){
            $scope[attr]();
            return;
        }
        $scope.runTabInitTimer = $timeout(function (){
            runTabInit(attr);
        });
    }

    $scope.toggleTab = function (item){
        $scope.curTab = item.tab;
        runTabInit(item.init);
    };

    $scope.sendGift = function (user) {
        sendGift({
            from: 'wonderful',
            liveid: match.Data.liveid,
            chatroomid: 0,
            target: match.Data.author,
            type: 1
        }, function (err, success) {
            fansShowMagicReceive();
            $scope.$broadcast('fansShowComment');
        });
    };

    $scope.togglePublishDiscuss = function() {
        $scope.togglePublishFlag = !$scope.togglePublishFlag;
    };

    $scope.isDiscussTab = function() {
        return $scope.curTab === 'discuss';
    };

    $scope.editDiscussPublish = function() {
        return $scope.isDiscussTab() && $scope.togglePublishFlag;
    };

    $scope.fansShowComment = function (content){
        if(!content){
            alert('不能为空');
            return;
        }
        connector.fansShowComment({
            uid: config.uid(),
            liveid: $stateParams.vid,
            content: content,
        }).then(function (rs){
            $scope.commentContent = '';
            $scope.togglePublishDiscuss();
            $scope.$broadcast("fansShowComment", rs);
        }, function (err){
            console.error(err, 'for audio/comment api error info');
            alert(err.data.data.errMsg);
        });
    };

    $scope.follows = function(){
        var f = $scope.detailInfo.isFollow;
        var a = ['befans','befans'];
        var t = a[f];
        connector[t]({
            uid: config.uid(),
            starid: (function (){
                var id = [];
                angular.forEach($scope.detailInfo.author, function (item){
                    id.push(item.uid);
                });
                return id.join(',');
            })(),
            act: parseInt(f) + 1
        }).then(function (rs){
            $scope.detailInfo.isFollow = f ? 0 : 1;
        }, function (err){
            console.error(err);
            alert(err.data.data.errMsg);
        });
    };

    function getAudioInfo(){        
        var data = match.Data;
        if(angular.isNumber(data.isLikeOrTread)){
            data.isLike = data.isLikeOrTread;
        }
        data.time = moment(new Date(data.dateline * 1000)).format('YYYY-MM-DD hh:mm:ss');
        $scope.picRoot = config.picRoot();
        $scope.detailInfo = data;
        $scope.detailInfo.isFollow = $scope.detailInfo.isFans;
        $scope.$parent.detailInfo = data;
        $scope.$parent.video.url = $sce.trustAsResourceUrl(match.Data.url_video || match.Data.url_audio);
        $scope.$parent.video.poster = $scope.picRoot + match.Data.bg;
        $scope.$parent.createVideo($scope.$parent.video);

        angular.forEach(match.Data.author, function (c) {
            c.avatar = config.filterImgUrl(config.picRoot() + c.avatar);
        });
        
        fansShowMagicReceive();
        likeVideo();
        $scope.toggleTab($scope.navList[0]);

        menuShare({
            title: data.matchname,
            imgUrl: config.picRoot() + data.bg,
            desc: data.introduction
        });
    }

    function likeVideo(){
        $scope.$parent.likeVideo = function (){
            var f = $scope.detailInfo.isLike;
            var a = ['fansShowDz', 'fansShowDz'];
            var t = a[f];
            connector[t]({
                liveid: $scope.detailInfo.liveid,
                uid: config.uid()
            }).then(function (rs){
                $scope.detailInfo.isLike = f ? 0 : 1;
                if($scope.detailInfo.isLike){
                    $scope.detailInfo.likes = parseInt($scope.detailInfo.likes) + 1;
                }
            }, function (err){
                console.error(err);
                alert(err.data.data.errMsg);
            });
        };
    }

    function fansShowMagicReceive(){
        var commentatorid = (function (){
            var id = [];
            angular.forEach($scope.detailInfo.author, function (item){
                id.push(item.uid);
            });
            return id.join(',');
        })();

        connector.fansShowMagicReceive({
            uid: config.uid(),
            liveid: $stateParams.vid,
            commentatorid: commentatorid
        }).then(function (rs){
            var data = rs.Data;
            $scope.detailInfo.fansShowMagicReceive = data;
            $scope.$parent.detailInfo.fansShowMagicReceive = data;
        }, function (err){
            alert(err.data.data.errMsg);
        });
    }

    getAudioInfo();
});

//好声音
application.controller(
    'watchVoiceCtrl', 
    function(
        $scope, 
        $rootScope, 
        $timeout, 
        $sce, 
        $http, 
        $stateParams, 
        $element, 
        config, 
        sendGift, 
        connector, 
        detailInfo,
        menuShare
    ) {

    var tab = ['discuss','related'];
    $scope.stateParams = $stateParams;
    $scope.fxNavBar = false;
    $scope.fxFtBar = false;
    $scope.curTab = null;
    $scope.navList = [{
        tab: tab[0],
        name: '评论',
        init: 'discussInit'
    }, {
        tab: tab[1],
        name: '相关频道',
        init: 'relatedInit'
    }];

    function runTabInit(attr){
        $timeout.cancel($scope.runTabInitTimer);
        if($scope[attr]){
            $scope[attr]();
            return;
        }
        $scope.runTabInitTimer = $timeout(function (){
            runTabInit(attr);
        });
    }

    $scope.toggleTab = function (item){
        $scope.curTab = item.tab;
        runTabInit(item.init);
    };

    $scope.togglePublishDiscuss = function() {
        $scope.togglePublishFlag = !$scope.togglePublishFlag;
    };

    $scope.isDiscussTab = function() {
        return $scope.curTab === 'discuss';
    };

    $scope.editDiscussPublish = function() {
        return $scope.isDiscussTab() && $scope.togglePublishFlag;
    };

    $scope.audioComment = function (content){
        if(!content){
            alert('不能为空');
            return;
        }
        connector.audioComment({
            uid: config.uid(),
            aid: $stateParams.vid,
            content: content,
        }).then(function (rs){
            $scope.commentContent = '';
            $scope.togglePublishDiscuss();
            $scope.$broadcast("audioComment", rs);
        }, function (err){
            console.error(err, 'for audio/comment api error info');
            alert(err.data.data.errMsg);
        });
    };
    $scope.sendGift = function () {
        sendGift({
            from: 'wonderful',
            chatroomid: 0,
            liveid: detailInfo.Data.aid,
            target:detailInfo.Data.commentator,
            type: 2
        }, function (err, success) {

        });
    };

    $scope.follows = function(){
        var f = $scope.detailInfo.isFollow;
        var a = ['follows','cancelfollows'];
        var t = a[f];
        connector[t]({
            sid: $scope.detailInfo.special,
            uid: config.uid(),
            v: config.version()
        }).then(function (rs){
            $scope.detailInfo.isFollow = f ? 0 : 1;
        }, function (err){
            console.error(err);
            alert(err.data.data.errMsg);
        });
    };

    $scope.authorLike = function (item){
        var fuid = item.uid;
        var aid = $scope.detailInfo.aid;
        connector.authorLike({
            uid: config.uid(),
            fuid : fuid,
            aid: aid
        }).then(function (rs){
            item.isAuthorLike += 1;
            if(item.likes){
                item.likes += 1;
            }else{
                item.likes = 1;
            }
        }, function (err){
            console.log(err);
            alert(err.data.data.errMsg);
        });
    };

    function getAudioInfo(){
        if(detailInfo.code !== 0){
            $scope.error = detailInfo;
            console.error(detailInfo);
            alert(detailInfo.data.data.errMsg);
            return;
        }
        var data = detailInfo.Data;
        $scope.detailInfo = data;
        $scope.$parent.detailInfo = data;
        $scope.picRoot = config.picRoot();
        $scope.$parent.video.poster = $scope.picRoot + data.playerimg;
        $scope.$parent.video.url = $sce.trustAsResourceUrl(data.url);
        $scope.$parent.createVideo($scope.$parent.video);
        angular.forEach($scope.detailInfo.commentator, function (c) {
            c.avatar = config.filterImgUrl(config.picRoot() + c.avatar);
        });
        $scope.toggleTab($scope.navList[0]);

        menuShare({
            title: data.title,
            imgUrl: config.picRoot() + data.playerimg,
            desc: data.introduction
        });
    }

    getAudioInfo();
});

//好声音 - 评论
application
.directive("vDiscussTab", function() {
    return {
        templateUrl: 'application/watch/watch-discuss.html',
        restrict: "E",
        replace: true,
        transclude: true,
        scope: {},
        controller: 'watchDiscussCtrl'
    };
})
.controller('watchDiscussCtrl', function($scope, $rootScope, $stateParams, watchTabfactory) {
    $scope.stateParams = $stateParams;
    function refresh(){
        watchTabfactory.refresh($scope, 'getComments');
    }
    $scope.$parent.discussInit = refresh;

    $scope.$on("audioComment", function (ev, rs){
        refresh();
    });
});

//好声音 - 相关频道
application
.directive("vRelatedTab", function() {
    return {
        templateUrl: 'application/watch/watch-related.html',
        restrict: "E",
        replace: true,
        transclude: true,
        scope: {},
        controller: 'watchRelatedCtrl'
    };
})
.controller('watchRelatedCtrl', function($scope, $rootScope, $stateParams, watchTabfactory) {
    $scope.stateParams = $stateParams;
    function refresh(){
        watchTabfactory.refresh($scope, 'getAudioOwn');
    }
    $scope.$parent.relatedInit = refresh;
});

//大咖聊
application.controller('watchDkCtrl', function(
    $scope, 
    $sce, 
    $rootScope, 
    $http, 
    $stateParams, 
    $state,
    $element, 
    $document, 
    $timeout,
    config, 
    match, 
    loading,
    sendGift, 
    connector,
    menuShare,
    displayEffect) {

    $scope.$parent.liveRoomFlag = true;

    $scope.starHref = config.ip + 'api.php/guardStarExpert.html?serial=' +
        config.serial() + 
        '&uid=' + 
        $scope.user.id + 
       'app=1&v=' + 
       config.version() +
       '&token=' +
       config.token();
    var page, timeoutHandler, lastMsgId, effectMap;
    var mainWrapper = $('.main-wrapper');

    effectMap = {
        7: 18,
        10 : 15,
        11: 14,
        2: 11,
        17: 27,
        22: 32,
        33: 54,
        6: 12
    };

    var socket = io(config.socketio);

    function digest(){
        try{
            $scope.$digest();
        }catch(err){}
    }

    function getScore() {
        connector.matchScore({
            uid: $scope.user.id, 
            liveid: $stateParams.vid, 
            matchid: $scope.match.matchid
        }).then(function (data) {
            $scope.match.matchScore = data.Data;
            digest();
        });
    }
    function getNum() {
        connector.matchNum({
            uid: $scope.user.id,
            liveid: $stateParams.vid
        }).then(function (data) {
            $scope.match.membernum = data.Data.membernum;
            digest();
        });
    }
    socket.on('connect', function(){
      ///socket.emit('login', uid);
      console.log('connetct success');
    });
    // 后端推送来消息时
    socket.on('new_msg', function(msg){
        try {
            var data = JSON.parse(msg);
            if (!data.data) {return;}
            angular.forEach(data.data, function (value, key) {
                angular.forEach(value.split(','), function (liveid) {
                    if (liveid != $stateParams.vid) {return;}
                    switch(parseInt(key)) {
                        case 1: 
                            getScore();
                            break;
                        case 5: 
                            getNum();
                            break;
                    }
                });
            });
        } catch (e) {}
    });

    $scope.$parent.$watch('showScore', function (v) {
        if (v) {
            getNum();
            getScore();
        }
    });

    function perloaderClassHandler(evName){
        $('.perloader-up')[evName]('visible');
    }

    function checkScrollPerloader(){
        var flag = mainWrapper.get(0).scrollHeight > mainWrapper.height();
        $scope.perloaderHide = !flag;
        $scope.$digest();
        perloaderClassHandler('addClass');
    }

    function parseTime (timestamp, format) {
        var d = new Date(timestamp);
        var year = d.getFullYear();
        var month  = d.getMonth() + 1;
        var day = d.getDate();
        var hour = d.getHours();
        var minute = d.getMinutes();
        var second = d.getSeconds();
        month = month > 9 ? month : '0' + month.toString();
        day = day > 9 ? day : '0' + day.toString();
        hour = hour > 9 ? hour : '0' + hour.toString();
        minute = minute > 9 ? minute : '0' + minute.toString();
        second = second > 9 ? second : '0' + second.toString();
        format = format.replace(/yy/g, year);
        format = format.replace(/MM/g, month);
        format = format.replace(/dd/g, day);
        format = format.replace(/hh/g, hour);
        format = format.replace(/mm/g, minute);
        format = format.replace(/ss/g, second);
        return format;
    }

    var emojiReg = /\[emo\d+\]/igm;

    function parseMsg (msg) {
        var effectList = [5,4,15,16,19,20, 21, 29, 24, 25];
        var liveEffectList = [10, 7];
        var hideList = [11];
        var bg = '/image/bg/privilege_accessories_textbg_{{vipType}}_{{dir}}.png';
        var bubbleBg = '/image/bg/mall_bubble_{{bubbleType}}_{{dir}}.png';
        var crown = '/image/bg/privilege_accessories_{{vipType}}.png';
        var vipType, bubbleType;
        msg.isHide = hideList.indexOf(msg.ext.sign) !== -1;
        msg.isEffect = effectList.indexOf(msg.ext.sign) !== -1;
        msg.isLiveEffect = liveEffectList.indexOf(msg.ext.sign) !== -1;
        msg.isSelf = msg.ext.uid == $scope.user.id;
        msg.isImg = msg.ext.showType == 1;
        msg.isMp3 = msg.ext.showType == 2;
        msg.isVideo = msg.ext.showType == 3;
        msg.isImgAndMsg = msg.ext.showType == 4;
        msg.isLink = msg.ext.showType == 5;
        msg.style = {
            'border-image-slice': '40 30 20 30 fill'
        };
        msg.textStyle = {};
        switch(+msg.ext.privilege) {
            case 1: {
                vipType = msg.ext.sex == 1 ? 'shaoye' : 'xjby';
                break;
            }
            case 2: {
                vipType = msg.ext.sex == 1 ? 'dizhu' : 'bxcm';
                break;
            }   
            case 3: {
                vipType = msg.ext.sex == 1 ? 'tuhao' : 'mrtx';
                break;
            }
        }
        if (vipType) {
            msg.crown = crown.replace('{{vipType}}', vipType);
            bg = bg.replace('{{vipType}}', vipType);
            bg = bg.replace('{{dir}}', msg.isSelf ? 'right' : 'left');
            msg.style['border-image-source'] = 'url("' + bg +'")';
            msg.isVipBubble = true;
        }
        switch(msg.ext.sign) {
            // 零食道具
            case 5:  {
                bubbleType = 'snacks';
                msg.style.color = '#148dd0';
                break;
            }
            // 加油道具
            case 16: {
                bubbleType = 'fight';
                msg.style.color = '#ffffff';
                break;
            }
            // 啤酒道具
            case 4: {
                bubbleType = 'beer';
                msg.style.color = '#ae9100';
                break;
            }
            // 冠军奖杯道具
            case 20: {
                bubbleType = 'cup';
                msg.style.color = '#dd6b00';
                break;
            }
            // 赠送给用户特效
            case 29: {
                bubbleType = 'default';
                msg.style.color = '#ffffff';
                msg.isSendUserGift = true;
                break;
            }
            // 金球道具
            case 19: {
                bubbleType = 'ball';
                msg.style.color = '#4e7400';
                break;
            }
            // 皇冠道具
            case 21: {
                bubbleType = 'crown';
                msg.style.color = '#7b0000';
                break;
            }
            // 金靴道具
            case 15: {
                bubbleType = 'shoe';
                msg.style.color = '#ae9100';
                break;
            }
            // 特效 加油
            case 24: {
                bubbleType = 'fight_green';
                msg.style.color = '#ffffff';
                msg.ext.magicDes = msg.ext.msg;
                break;
            }
            // 特效 金靴
            case 25: {
                bubbleType = 'shoe_effect';
                msg.style.color = '#ffffff';
                break;
            }
            // 专家发言
            case 12: {
                bubbleType = 'expert';
                msg.style.color = '#666666';
                msg.style['border-image-slice'] = '45 30 20 30 fill';
                msg.textStyle.color = '#ef8d11';
                msg.isVipBubble = true;

                break;
            }
            // 管理员发言
            case 13: {
                bubbleType = 'admin';
                msg.style.color = '#666666';
                msg.style['border-image-slice'] = '45 30 20 30 fill';
                msg.textStyle.color = '#1b9fff';
                msg.isVipBubble = true;
                
                break;
            }
        }
        if (bubbleType) {
            bubbleBg = bubbleBg.replace('{{dir}}', msg.isSelf ? 'right' : 'left');
            bubbleBg = bubbleBg.replace('{{bubbleType}}', bubbleType);
            msg.style['border-image-source'] = 'url("' + bubbleBg + '")';
        }
        if(msg.isImg && msg.msg && !(/^(https:\/\/|http:\/\/)/).test(msg.msg)){
            msg.msg = config.picRoot() + msg.msg;
        }
        if (msg.isMp3 || msg.isVideo) {
            msg.msg = $sce.trustAsResourceUrl(msg.msg);
        } else {
            msg.msg = $sce.trustAsHtml(msg.msg.replace(emojiReg, function (target) {
                var emoji = target.substring(1, target.length - 1);
                return '<img class="emoji" src="/image/emoji/' + emoji +'.png" />';
            }));
        }
    }

    function handleSendGift (err, success) {
        if (err) {
            window.alert(err);
            console.error(err);
        } else if (success) {
            loadData();
        }
    }

    function getChatRecord (option) {
        return connector.getGroupChatRecord(option).then(function (data) {
            var list = data.Data;
            angular.forEach(list, function (item) {
                parseMsg(item);
                if (item.ext.avatar) {
                    if (item.ext.avatar === 'defaultAvatar') {
                        item.avatar = '/image/icon/user_sidebar_autopic.png';
                    } else {
                        var isAbsUrl = item.ext.avatar.indexOf('http://') !== -1 ||
                            item.ext.avatar.indexOf('https://') !== -1;
                        item.avatar = isAbsUrl ? item.ext.avatar :
                            config.picRoot() + item.ext.avatar;
                    }
                } else {
                    item.avatar = item.ext.headImgUrl;
                }
                item.time = parseTime(+item.timestamp, 'MM-dd hh:mm');
            });
            list.hasNext = data.hasNext;
            return list;
        }, function (e) {
            perloaderClassHandler('removeClass');
            $scope.errMsg = e.data.data.errMsg;
            var result = [];
            result.hasNext = 0;
            return result;
        });
    }

    function loadMore (event) {
        var e = mainWrapper;
        var length = $scope.msgList.length;
        if (!length || $scope.showLoadMore) {
            return;
        }
        event.preventDefault();
        $scope.showLoadMore = true;
        getChatRecord({
            uid: $scope.user.id,
            groupid: $scope.curId,
            pagesize: 20,
            msgid: $scope.msgList[0].msg_id
        }).then(function (data) {
            $scope.showLoadMore = false;
            $scope.noMoreData = !data.hasNext;
            if ($scope.noMoreData) {
                e.unbind('scroll');
                $scope.errMsg = '没有更多聊天记录了';
            }
            $scope.msgList.splice.apply($scope.msgList, [0, 0].concat(data));
            setTimeout(function () {
                var perloaderHeight = $('.perloader-up').height();
                var top = e.find('.msg-' + (length - 1)).position().top - perloaderHeight;
                e.scrollTop(top);
                checkScrollPerloader();
            }, 10);
        });
    }

    function loadData () {
        return getChatRecord({
            uid: $scope.user.id,
            groupid: $scope.curId,
            pagesize: $scope.msgList.length >= 20 ? $scope.msgList.length : 20
        }).then(function (data) {
            angular.forEach(data, function (item) {
                var flag = false;
                angular.forEach($scope.msgList, function (i) {
                    if (i.msg_id == item.msg_id) {
                        flag = true;
                    }
                });
                if (!flag) {
                    $scope.msgList.push(item);
                }
            });
            // if (!data.hasNext) {
            //     $scope.errMsg = '没有更多聊天记录了';
            // }
        });
    }

    function initScrollBar () {
        var e = mainWrapper;
        e.unbind('scroll');
        e.scrollTop(e.get(0).scrollHeight);
        e.bind('scroll', function (event) {
            var top = $(this).scrollTop();
            if (top <= 20) {
                loadMore(event);
            }
        });
        checkScrollPerloader();
    }

    function beginPullingData () {
        if (!timeoutHandler) {timeoutHandler = true;}
        setTimeout(function () {
            if ($scope.curId) {
                loadData().then(function () {
                    if(!$scope.msgList.length){
                        return;
                    }
                    var curMsg = $scope.msgList[$scope.msgList.length - 1];
                    if (lastMsgId != curMsg.msg_id && !curMsg.isSelf) {
                        displayEffect(effectMap[curMsg.ext.sign], {
                            target: curMsg.ext,
                            msg: curMsg.ext.msg
                        });
                    }
                    beginPullingData();
                    lastMsgId = curMsg.msg_id;
                    try {$scope.$digest();} catch (e) {}
                });
            } else {
                timeoutHandler = null;
            }
        }, 1000);
    }

    $scope.$on('$stateChangeStart', function () {
        $scope.curId = null;
    });

    menuShare({
        title: match.Data.matchname,
        imgUrl: config.picRoot() + match.Data.bg,
        desc: match.Data.introduction
    });
    
    $scope.$parent.liveChatLock = match.Data.m3u8;
    $scope.$parent.video.url = $sce.trustAsResourceUrl(match.Data.m3u8 || match.Data.url_video);
    $scope.$parent.video.poster = config.picRoot() + match.Data.bg;
    $scope.$parent.createVideo($scope.$parent.video);

    angular.forEach(match.Data.commentator, function (c) {
        c.avatar = config.picRoot() + c.avatar;
    });

    $scope.$parent.likeVideoLock = true;

    $scope.msgList = [];
    $scope.match = match.Data;
    $scope.$parent.match = $scope.match;
    $scope.$parent.scoreBg = {
        'background-image': 'url("' + config.picRoot() + $scope.match.bg + '")'
    };
    $scope.stateParams = $stateParams;
    $scope.curTab = 'chatroom';
    $scope.curId = match.Data.dkl;
    $scope.navList = [{
        name: 'VIP频道',
        tab: 'vip',
        sref: 'watch.dk.vip'
    }, {
        name: '聊天室',
        tab: 'chatroom',
        sref: 'watch.dk.chatroom'
    }, {
        name: '名家',
        tab: 'expert',
        sref: 'watch.dk.expert'
    }, {
        name: '竞猜抢宝',
        tab: 'quiz',
        sref: 'watch.dk.quiz'
    }, {
        name: '精选节目',
        tab: 'choice',
        sref: 'watch.dk.choice'
    }];
    $scope.picRoot = config.picRoot();
    $scope.chat = {msg: undefined};
    $scope.isVip = match.Data.myPrivilege != '0';
    $scope.selectedVIP = match.Data.privilege[0];
    $scope.showBuyVip = false;

    angular.forEach(match.Data.privilege, function (item) {
        if (item.pid == match.Data.myPrivilege) {
            $scope.vipInfo = item;
        }
    });

    $scope.buyVipWrapper = function (show) {
        $scope.showBuyVip = show;
    };

    $scope.buyVip = function () {
        connector.buyVIP({
            uid: $scope.user.id,
            liveid: match.Data.liveid,
            pid: $scope.selectedVIP.pid
        }).then(function (data) {
            window.alert('购买特权成功');
            $scope.showBuyVip = false;
            $scope.isVip = true;
            $scope.showWelcome = true;
            $scope.vipInfo = $scope.selectedVIP;
            $timeout(function () {
                $scope.showWelcome = false;
            }, 3000);
        }, function (err) {
            if (err.type == 1) {
                window.alert('购买特权失败：' + err.data.data.errMsg);
            } else {
                window.alert('购买特权失败');
            }
        });
    };

    $scope.selectVIP = function (item) {
        $scope.selectedVIP = item;
    };

    $scope.$watch('$parent.playFlag', function (v) {
        $scope.vPlayFlag = v;
    });

    $scope.goToTab = function (tab) {
        perloaderClassHandler('removeClass');
        if ($scope.curTab != tab.tab) {
            $scope.msgList = [];
        }
        $scope.curTab = tab.tab;
        $scope.errMsg = null;
        $scope.noMoreData = false;
        if ($scope.isVip && $scope.vipInfo) {
            $scope.chatroomBg = {
                'background-image': 'url("' + $scope.picRoot + $scope.vipInfo.chatroombg +'")',
                'background-size': 'cover',
                'background-position': 'center'
            };
        }
        switch ($scope.curTab) {
            case 'chatroom': {
                $scope.curId = match.Data.dkl;
                break;
            }
            case 'vip': {
                $scope.curId = match.Data.vippd;
                break;
            }
            case 'expert': {
                $scope.curId = match.Data.mj;
                break;
            }
            case 'choice': {
                $scope.curId = null;
                getFunProgramList();
                break;
            }
            case 'quiz': {
                $scope.curId = null;
                //
                break;
            }
            default: {
                $scope.curId = null;
            }
        }
        if ($scope.curId) {
            var hide = loading.show({element: mainWrapper});
            loadData().then(function () {
                hide();
                if ($scope.msgList.length) {
                    lastMsgId = $scope.msgList[$scope.msgList.length -1].msg_id;
                }
                setTimeout(function () {
                    initScrollBar();
                }, 100);
                if (!timeoutHandler) {
                    beginPullingData();
                }
            });
        }
    };

    $scope.goToTab($scope.navList[1]);

    $scope.getGuessSrc = function(){
        var url = config.ip + 'api.php/guess?';
        var params = config.getDefaultParams();
        params.liveid = $stateParams.vid;
        params.uid = config.uid();
        angular.forEach(params, function (value, key){
            url += key +'='+ value +'&';
        });
        var src = $sce.trustAsResourceUrl(url.substring(0, url.length - 1));
        return src;
    };

    $scope.playVideo = function () {
        if ($scope.vPlayFlag) {
            $scope.$parent.pause();
        } else {
            $scope.$parent.play();
        }
    };

    $scope.chooseTeam = function (team) {
        var hide = loading.show();
        connector.chooseTeam({
            tid: team.teamid,
            liveid: match.Data.liveid,
            uid: $scope.user.id
        }).then(function () {
            hide();
            $scope.match.fans = team.teamid;
        }, function (e) {
            if (e.type == 1) {
                window.alert(e.data.data.errMsg);
            }
        });
    };

    $scope.showBar = function (msg, event) {
        if (!msg.ext.uid) {
            return;
        }
        $scope.msgShowBarId = msg.msg_id;
        event.stopPropagation();
        function hideBar () {
            $scope.msgShowBarId = null;
            $scope.$digest();
            $('.view-page').unbind('click');
        }
        $('.view-page').unbind('click').bind('click', hideBar);
    };

    $scope.atUser = function (msg, event) {
        event.stopPropagation();
        $scope.togglePublishFlag = true;
        $scope.chat.msg = $scope.chat.msg ? 
            $scope.chat.msg + ' @' + msg.ext.nickname : 
            '@' + msg.ext.nickname;
        $scope.msgShowBarId = null;
    };

    $scope.sendGiftToUser = function (msg, event) {
        event.stopPropagation();
        sendGift({
            from: 'user',
            liveid: $stateParams.vid,
            target: {id: msg.ext.uid},
            chatroomid: $scope.curId
        }, function (err, success) {
            handleSendGift(err, success);
        });
        $scope.msgShowBarId = null;
    };

    $scope.sendGiftToComm = function (user) {
        sendGift({
            from: 'commentator',
            liveid: $stateParams.vid,
            chatroomid: $scope.curId,
            target: user
        }, function (err, success, cb, selected, from, amount) {
            if (cb) {
                cb().then(function () {
                    displayEffect(0, {
                        target: user.nickname,
                        sender: $scope.user.nickname,
                        giftUrl: config.picRoot() + selected.pic,
                        amount: amount
                    });
                    var sign;
                    $scope.chat.msg = selected.description;
                    angular.forEach(effectMap, function (value, key) {
                        if (key == selected.magicid) {
                            sign = key;
                        }
                    });
                    $scope.sendMsg(sign).then(function () {
                        $scope.chat.msg = '';
                    });
                });
            }
            // handleSendGift(err, success);
        });
    };

    $scope.useToolToUser = function (msg, event) {
        event.stopPropagation();
        sendGift({
            from: 'userTool',
            liveid: $stateParams.vid,
            target: {id: msg.ext.uid},
            chatroomid: $scope.curId
        }, function (err, success) {
            handleSendGift(err, success);
        });
        $scope.msgShowBarId = null;
    };

    $scope.addFriend = function (msg, event) {
        event.stopPropagation();
        var id = msg.ext.uid;
        $state.go('user.addFriend', {id: id, target: id});
        $scope.msgShowBarId = null;
    };

    $scope.getUserInfo = function (msg, event) {
        event.stopPropagation();
        var id = msg.ext.uid;
        $state.go('user', {id: id});
        $scope.msgShowBarId = null;
    };


    var sendGiftCallback;
    $scope.sendGift = function () {
        sendGift({
            from: 'chatroom', 
            liveid: $stateParams.vid,
            chatroomid: $scope.curId,
        }, function (err, success, cb, magic) {
            if (cb) {
                console.log(magic);
                $scope.chatFormNav.push({
                    name: magic.name,
                    active: true
                });
                $scope.curFormTab = magic.name;
                $scope.togglePublishFlag = true;
                sendGiftCallback = cb;
            } else {
                handleSendGift(err, success);
            }
        });
    };

    $scope.sendMsg = function (sign) {
        if (!$scope.chat.msg) {return;}
        if ($scope.curFormTab === '传声筒') {
            if (sendGiftCallback) {
                sendGiftCallback({
                    content: $scope.chat.msg
                }).then(function (data) {
                    displayEffect(14, {
                        target: $scope.user,
                        msg: $scope.chat.msg
                    });
                    $scope.togglePublishFlag = false;
                    sendGiftCallback = null;
                    $scope.chat.msg = '';
                });
            } else {
                $scope.togglePublishFlag = false;
                $scope.chat.msg = '';
            }
        } else if ($scope.curFormTab === '抢答卡') {
            if (sendGiftCallback) {
                sendGiftCallback({
                    content: $scope.chat.msg
                }).then(function (data) {
                    displayEffect(34, {
                        target: $scope.user,
                        msg: $scope.chat.msg
                    });
                    $scope.togglePublishChat();
                    sendGiftCallback = null;
                    $scope.chat.msg = '';
                });
            } else {
                $scope.togglePublishFlag = false;
                $scope.chat.msg = '';
            }
        } else  {
            var msg = $scope.chat.msg;
            if ($scope.curFormTab === '名家提问') {
                msg = '@' + $scope.qaNicname.nickname + ' ' + msg;
                connector.askExpert({
                    uid: $scope.user.id,
                    fuid: $scope.qaNicname.uid,
                    content: $scope.chat.msg,
                    liveid: match.Data.liveid                
                }).then(function (data) {
                    loadData();
                    $scope.chat.msg = '';
                });
            }
            return connector.sendMsg({
                uid: $scope.user.id,
                sign: sign,
                content: msg,
                chatroom: $scope.curId,
                avatar: $scope.user.avatar,
                level: $scope.user.level,
                fromuser: $scope.user.nickname
            }).then(function (data) {
                loadData();
                $scope.chat.msg = '';
                $scope.togglePublishFlag = false;
            });
        }
    };

    $scope.getLuckyMoney = function (id, type) {
        connector.getLuckyMoney({
            signid: id, 
            type: type, 
            uid: $scope.user.id
        }).then(function (data) {
            console.log(data);
        });
    };

    $scope.togglePublishChat = function() {
        $scope.togglePublishFlag = !$scope.togglePublishFlag;
    };

    $scope.fxNavBar = function() {
        return true;
    };

    $scope.fxFtBar = function() {
        return true;
    };

    $scope.isChatTab = function() {
        return ($scope.curTab === 'vip' && $scope.isVip )|| $scope.curTab === 'chatroom';
    };

    $scope.editChatPublish = function() {
        return $scope.isChatTab() && $scope.togglePublishFlag;
    };

    function initFormTab(){
        $scope.chatFormNav = [{
            name: '聊天室',
            active: true
        },{
            name: '名家提问'
        }];
        $scope.curFormTab = $scope.chatFormNav[0].name;
        $scope.qaNicname = $scope.match.commentator[0];
    }

    initFormTab();

    $scope.toggleFormNav = function (item){
        $scope.curFormTab = item.name;
    };

    $scope.toggleNickname = function (index){
        var i = index + 1;
        i = i % $scope.match.commentator.length;
        $scope.qaNicname = $scope.match.commentator[i];
    };

    $scope.playToChoice = function (item, index){
        $scope.choicePlayIndex = index;
        $scope.$parent.showScore = false;
        $scope.$parent.liveRoomFlag = false;
        $scope.$parent.liveChatLock = false;
        $scope.$parent.video.url = $sce.trustAsResourceUrl(item.url);
        $scope.$parent.createVideo({
            url: $scope.$parent.video.url,
            poster: $scope.picRoot + item.pic
        }, 'autoPlay');
    };

    function getFunProgramList(){
        var hide = loading.show({element: mainWrapper});
        $scope.choiceListReady = 0;
        connector.getFunProgramList({
            liveid: match.Data.liveid, 
            uid: $scope.user.id
        }).then(function (data) {
            hide();
            $scope.choiceList = data.Data;
            $scope.choiceListReady = 1;
            $scope.choiceListMsg = null;
        }, function (err){
            hide();
            $scope.choiceListReady = 1;
            $scope.choiceListMsg = err.data.data.errMsg;
            console.log(err);
            alert(err.data.data.errMsg);
        });
    }
});