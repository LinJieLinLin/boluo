angular.module('app').controller(
    'headlinesCtrl', 
    function(
        $scope, 
        $rootScope, 
        $element, 
        $state, 
        $stateParams, 
        sideBar, 
        request, 
        config, 
        loading, 
        currentUser,
        menuShare
    ) {

    $scope.tabTitle = '头条';
    $scope.shuoAvatarFlag = $stateParams.avatar;

    $scope.toggleSideBar = function() {
        sideBar.show();
    };

    var mainWrapper = $('.headlines-wrapper');
    var cateId = '2';
    var way = '0';
    var time = null;
    var pageSize = '10';
    var isfirstvisit = '1';
    var app = '2';
    var serial = 'xxx';

    $scope.headlinesList = [];

    $scope.gotoNewsDetail = function (item){
        $state.go('newsDetail',{url: encodeURIComponent(item.Url), id: item.Id});
    };

    function digest(){
        try {
            $scope.$digest();
        } catch (e) {}
    }

    function loadingHideFn(){
        loadingHide();
        loadingHide = null;
        $scope.loadingReady = true;
        digest();
    }

    function callSuccess(data){
        if(!data.length){
            var len = $scope.headlinesList.length;
            $scope.noMoreFlag = len && !data.length;
            $scope.msg = len ? '没有更多~' : '暂无数据';
        }
        $scope.headlinesList = $scope.headlinesList.concat(data);
        loadingHideFn();
    }

    function callFial(err){
        loadingHideFn();
        console.error(err);
    }

    function getNewses() {
        loadingHide = loading.show({element: $('body') });
        $.ajax({
            method: 'GET',
            // url: 'http://m.fc.6383.com/News/GetNewses',
            url: 'http://bole.chokking.com/news.php?s=news/newsList',
            data: {
                CateId       : cateId,              //新闻栏目id
                Way          : way,                 //0加载最新资讯，1加载更多资讯
                Time         : time,                //way=0的时候拿最大日期时间,way=1的时候拿资讯中最小的日期时间，第一次访问可以不传
                PageSize     : pageSize,
                isfirstvisit : isfirstvisit,        //是否第一次访问
                App          : app,                 //1安卓，2PC，3IOS
                V            : config.version(),    //版本
                Serial       : serial               //串号
            },
            success: function(rs){
                if(typeof rs === 'string'){
                    rs = JSON.parse(rs);
                }
                var data = rs.Data;
                if(data.length){
                    way = 1;
                    isfirstvisit = 0;
                    time = data[data.length-1].DisplayDate;
                }
                callSuccess(data || []);
            },
            error: function (err){
                callFial(err);
            }
        });
    }

    function loadMore(){
        if(loadingHide || $scope.noMoreFlag){
            return;
        }
        getNewses();
    }

    function scrollFn(){
        mainWrapper.unbind('scroll').bind('scroll', function (){
            var t = parseInt($(this).scrollTop());
            var maxt = $(this).get(0).scrollHeight - $(this).height() - 20;
            if(t >= maxt){
                loadMore();
            }
        });
    }

    function init(){
        getNewses();
        scrollFn();

        menuShare(angular.extend(angular.copy($rootScope.shareDefaultParams), {
            title: '菠萝球迷圈-最新头条',
            desc: '关注微信公众号：菠萝球迷圈，获取足坛新鲜热辣快报！'
        }));
    }

    init();
});

angular.module('app').controller(
    'newsDetailCtrl', 
    function(
        $scope, 
        $rootScope, 
        $sce, 
        $element, 
        $state, 
        $stateParams, 
        sideBar, 
        request, 
        config, 
        loading, 
        $timeout, 
        currentUser,
        menuShare
    ) {
    
    var detailUrl = $sce.trustAsResourceUrl(unescape($stateParams.url));
    $scope.shuoAvatarFlag = $stateParams.avatar;
    $scope.tabTitle = detailUrl;
    $scope.detailUrl = detailUrl;
    $scope.commentList = [];
    $scope.picRoot = config.picRoot();

    var page = '1';
    var pageSize = '10';
    var mainWrapper;
    var loadingFlag;

    $scope.toggleSideBar = function() {
        sideBar.show();
    };

    $scope.showComments = function (flag){
        $scope.showCommentsFlag = typeof flag === 'boolean' ? flag : !$scope.showCommentsFlag;
        if($scope.showCommentsFlag){
            getComments('init');
        }
    };

    $scope.showEdit = function (flag){
        $scope.showEditFlag = typeof flag === 'boolean' ? flag : !$scope.showEditFlag;
        if(!$scope.showEditFlag){
            $scope.replyId = '';
            $scope.replyNickName = '';
        }
    };

    $scope.reply = function (item){
        $scope.showEdit();
        $scope.replyId = item.Id;
        $scope.replyNickName =  '回复:'+ item.NickName;
    }; 

    function checkScrollBar(){
        $timeout(function (){
            $scope.showScrollLoadingFlag = mainWrapper.get(0).scrollHeight > mainWrapper.height();
        },500);
    }

    function digest(){
        try {
            $scope.$digest();
        } catch (e) {}
    }

    function loadingHideFn(){
        if(loadingHide){
            loadingHide();
            loadingHide = null;
        }
        $scope.loadingReady = true;
        digest();
    }

    function callSuccess(data){
        if(!data.length){
            var len = $scope.commentList.length;
            $scope.noMoreFlag = len && !data.length;
            $scope.msg = len ? '没有更多~' : '暂无数据';
        }
        $scope.commentList = $scope.commentList.concat(data);
        loadingHideFn();
    }

    function callFial(err){
        loadingHideFn();
        console.error(err);
        alert(err.data.data.errMsg || err.data.data.errMsg);
    }

    $scope.sendComment = function (){
        $.ajax({
            method: 'POST',
            // url: 'http://m.fc.6383.com/Comment/Comment',
            url: 'http://bole.chokking.com/news.php?s=news/CommentComment',
            data: {
                type          : '0',
                Id            : $stateParams.id,
                App           : '2',
                V             : config.version(),
                Serial        : 'xxx' ,
                CiteCommentId : $scope.replyId || '0', 
                Content       : $scope.msgContent,
                userId        : $scope.user.id,
                NickName      : $scope.user.name
            },
            success: function(rs){
                if(typeof rs === 'string'){
                    rs = JSON.parse(rs);
                }
                if(rs.errMsg){
                    alert(rs.errMsg);
                    return;
                }
                $scope.msgContent = '';
                $scope.showEdit();
                $scope.showComments(true);
                digest();
            },
            error: function (err){
                callFial(err);
            }
        });
    };

    function digest() {
        try {
            $scope.$digest();
        } catch (err) {}
    }

    $scope.newsPraise = function($event){
        $.ajax({
            method: 'GET',
            // url: 'http://m.fc.6383.com/News/Praise',
            url: 'http://bole.chokking.com/news.php?s=news/newsPraise',
            data: {
                Id        : $stateParams.id,
                App       : '2',
                V         : config.version(),
                Serial    : 'xxx' ,
                userId  : $scope.user.id,
                NickName  : $scope.user.name
            },
            success: function(rs){
                if(typeof rs === 'string'){
                    rs = JSON.parse(rs);
                }
                if(rs.errMsg){
                    alert(rs.errMsg);
                    return;
                }
                $($event.target).addClass('active');
                $scope.commentsInfo.PraiseCount = rs.Data.Count;
                digest();
            },
            error: function (err){
                callFial(err);
            }
        });
    };

    $scope.newsTread = function($event){
        $.ajax({
            method: 'GET',
            // url: 'http://m.fc.6383.com/News/Tread',
            url: 'http://bole.chokking.com/news.php?s=news/newsTread',
            data: {
                id        : $stateParams.id,
                App       : '2',
                V         : config.version(),
                Serial    : 'xxx' ,
                userId  : $scope.user.id,
                NickName  : $scope.user.name
            },
            success: function(rs){
                if(typeof rs === 'string'){
                    rs = JSON.parse(rs);
                }
                if(rs.errMsg){
                    alert(rs.errMsg);
                    return;
                }
                $($event.target).addClass('active');
                $scope.commentsInfo.PraiseCount = rs.Data.Count;
                digest();
            },
            error: function (err){
                callFial(err);
            }
        });
    };

    function getComments(initFlag){
        if(initFlag){
            $scope.commentList = [];
            page = '1';
            loadingHide = loading.show({element: mainWrapper });
        }
        $scope.loadingReady = false;
        loadingFlag = true;
        $.ajax({
            method: 'GET',
            // url: 'http://m.fc.6383.com/Comment/GetComments',
            url: 'http://bole.chokking.com/news.php?s=news/getComments',
            data: {
                Type      : '0',
                Id        : $stateParams.id,
                PageIndex : page,
                PageSize  : pageSize,
                App       : '2',
                V         : config.version(),
                Serial    : 'xxx' ,
                userId  : $scope.user.id,
                NickName  : $scope.user.name
            },
            success: function(rs){
                loadingFlag = false;
                if(typeof rs === 'string'){
                    rs = JSON.parse(rs);
                }
                if(rs.errMsg){
                    alert(rs.errMsg);
                    return;
                }
                var data = rs.Data;
                if(data || data.length){
                    page++;
                }
                $scope.commentsInfo.CommentCount = rs.Count;
                callSuccess(data || []);
                checkScrollBar();
                digest();
            },
            error: function (err){
                loadingFlag = false;
                callFial(err);
            }
        });
    }

    function getGetCommentsDetails(){
        $.ajax({
            method: 'GET',
            // url: 'http://m.fc.6383.com/News/GetDetails/',
            url: 'http://bole.chokking.com/news.php?s=news/getDetails',
            data: {
                uid: config.uid(),
                Id        : $stateParams.id,
                App       : '2',
                V         : config.version(),
                Serial    : 'xxx' ,
                userId  : $scope.user.id,
                NickName  : $scope.user.name
            },
            success: function(rs){
                if(typeof rs === 'string'){
                    rs = JSON.parse(rs);
                }
                if(rs.errMsg){
                    alert(rs.errMsg);
                    return;
                }
                var data = rs.Data;
                $scope.commentsInfo = data || {};
                digest();
            },
            error: function (err){
                callFial(err);
            }
        });
        
    }

    function getGetNewsDetails(){
        $.ajax({
            method: 'GET',
            // url: 'http://m.fc.6383.com/News/Details/',
            url: 'http://bole.chokking.com/news.php?s=news/newsDetails',
            data: {
                uid: config.uid(),
                Id        : $stateParams.id,
                App       : '2',
                V         : config.version(),
                Serial    : 'xxx' ,
                userId  : $scope.user.id,
                NickName  : $scope.user.name
            },
            success: function(rs){
                if(rs.errMsg){
                    alert(rs.errMsg);
                    return;
                }
                var html = $(rs);
                var imgUrl = html.find('img').eq(0).attr('src');
                var title = html.find('h1').eq(0).find('span').remove().end().html();
                var desc = html.find('.nerwen').eq(0).text();
                if(desc){
                    desc = desc.replace(/\r|\s/g,'').substring(0,120);
                }
                menuShare({
                    title: title,
                    imgUrl: imgUrl,
                    desc: desc
                });
            },
            error: function (err){
                callFial(err);
            }
        });
    }

    function loadMore(){
        if(loadingFlag || $scope.noMoreFlag){
            return;
        }
        getComments();
    }

    function scrollFn(){
        mainWrapper.unbind('scroll').bind('scroll', function (){
            var t = parseInt($(this).scrollTop());
            var maxt = $(this).get(0).scrollHeight - $(this).height() - 20;
            if(t >= maxt){
                loadMore();
            }
        });
    }

    function init(){
        mainWrapper = $('.comments-wrapper');
        getGetCommentsDetails();
        getGetNewsDetails();
        scrollFn();
    }

    currentUser().then(function (user) {
        $scope.user = user;
        init();
    }, function (err){
        $scope.user = err;
        init();
    });
    
});
