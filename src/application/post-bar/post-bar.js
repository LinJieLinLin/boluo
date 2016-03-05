angular.module('app').controller(
    'postBarCtrl', 
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
        connector, 
        watchTabfactory,
        menuShare
    ) {
    $scope.$parent.curTab = 'postBar';
    $scope.$parent.shuoAvatarFlag = $stateParams.avatar;
    $scope.hotList = [];
    $scope.tipList = [];
    $scope.picRoot = config.picRoot();
    $scope.goLeagueList = function() {
        $state.go('leagueList', {
            avatar: 1
        });
    };
    $scope.goThemeDetail = function(argPid) {
        $state.go('themeDetail', {
            pid: argPid
        });
    };

    $scope.getHotUnions = function() {
        var hideLoadingHotUnions = loading.show({
            element: angular.element('.recommend-team')
        });
        connector.getHotUnions({}).then(function(data) {
            $scope.hotList = data.Data;
            hideLoadingHotUnions();
        });
    };

    currentUser().then(function(user) {
        $scope.getHotUnions();
        refresh();
    }, function (err){
        $scope.getHotUnions();
        refresh();
    });

    function refresh() {
        $scope.hideEndHeightFlag = true;
        $scope.mainWrapper = $('.pineapple-main');
        watchTabfactory.refresh($scope, 'getPool');

        menuShare(angular.extend(angular.copy($rootScope.shareDefaultParams), {
            title: '菠萝球迷圈-盟聊吧',
            desc: '关注微信公众号：菠萝球迷圈。你有支持的球队吗？你是真正的球迷吗？一起聊一聊！'
        }));
    }
});
angular.module('app').controller(
    'themeDetailCtrl', 
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
        currentUser, 
        connector, 
        confirm, 
        watchTabfactory,
        upload, 
        menuShare
    ) {

    $scope.getThePostData = {
        pid: $stateParams.pid
    };
    $scope.index = $stateParams.i;
    $scope.userData = {};
    $scope.picRoot = config.picRoot();
    $scope.theme = {};
    $scope.getThePost = function() {
        var hideLoadingThePost = loading.show({
            element: angular.element('.view-page')
        });
        connector.getThePost($scope.getThePostData).then(function(data) {
            if(!data.Data.picurl){
                data.Data.picurl = [];
            }
            var desc = data.Data.content;
            $scope.theme = data.Data;
            $scope.theme.content = $sce.trustAsHtml($scope.theme.content || '');
            hideLoadingThePost();
            menuShare({
                title: data.Data.title,
                imgUrl: config.filterImgUrl($scope.picRoot + (data.Data.picurl[0] || $rootScope.shareDefaultParams.imgUrl)),
                desc: desc.replace(/\s|\r/g, '').substring(0, 120)
            });
        }, function(e) {
            alert(e.data.data.errMsg);
            hideLoadingThePost();
        });
    };

    $scope.getReplysData = {
        pid: $stateParams.pid,
        page: 1,
        pagesize: 10
    };

    function refresh() {
        $scope.hideEndHeightFlag = true;
        $scope.mainWrapper = $('.main');
        watchTabfactory.refresh($scope, 'getReplys');
    }

    $scope.setToReplyData = {
        uid: $scope.userData.id,
        content: '',
        nid: $scope.theme.nid,
        // picUrl: ['16/01/21/2016012105240417.jpg', '16/01/21/2016012105240417.jpg', '16/01/21/2016012105240417.jpg', '16/01/21/2016012105240417.jpg'],
        picUrl:[],
        pid: $scope.theme.pid
    };
    $scope.setToReply = function() {
        if (!$scope.setToReplyData.content) {
            alert('回复内容不能为空！');
            return;
        }
        if (angular.isArray($scope.setToReplyData.picUrl)) {
            $scope.setToReplyData.picUrl = $scope.setToReplyData.picUrl.join(',');
        }
        $scope.setToReplyData.uid = $scope.userData.id;
        if (!$scope.setToReplyData.pid) {
            $scope.setToReplyData.pid = $scope.theme.pid;
        }
        var hideLoadingToReply = loading.show({
            element: angular.element('.view-page')
        });
        connector.setToReply($scope.setToReplyData).then(function(data) {
            hideLoadingToReply();
            $scope.setToReplyData = {
                uid: $scope.userData.id,
                content: '',
                picUrl:[],
                nid: $scope.theme.nid,
                pid: $scope.theme.pid
            };
            $scope.init();
        }, function(e) {
            alert(e.data.data.errMsg);
            hideLoadingToReply();
        });
    };

    $scope.getDelPostData = {
        uid: $scope.userData.id,
        pid: $stateParams.pid
    };
    $scope.getAccusation = function() {
        var hideLoadingAccusation = loading.show({
            element: angular.element('.view-page')
        });
        $scope.getDelPostData.uid = $scope.userData.id;
        connector.getAccusation($scope.getDelPostData).then(function(data) {
            hideLoadingAccusation();
        }, function(e) {
            alert(e.data.data.errMsg);
            hideLoadingAccusation();
        });
    };
    $scope.accusationTheme = function() {
        var h = confirm({
            msg: '确定举报？',
            success: function() {
                h();
                $scope.getAccusation();
            },
            cancel: function() {
                h();
            }
        });
    };


    $scope.getDelPost = function() {
        var hideLoadingDelPost = loading.show({
            element: angular.element('.view-page')
        });
        $scope.getDelPostData.uid = $scope.userData.id;
        connector.getDelPost($scope.getDelPostData).then(function(data) {
            $scope.replyList = data.Data;
            hideLoadingDelPost();
            $scope.backPage();
        }, function(e) {
            alert(e.data.data.errMsg);
            hideLoadingDelPost();
        });
    };
    $scope.delteTheme = function() {
        var h = confirm({
            msg: '确定删除？',
            success: function() {
                h();
                $scope.getDelPost();
            },
            cancel: function() {
                h();
            }
        });

    };

    $scope.selectReply = function(argData) {
        $scope.setToReplyData.pid = argData.pid;
        $scope.setToReplyData.content = '回复 ' + argData.nickname + ':';
    };

    //图片上传
    $scope.upload = function() {
        u = upload({
            url: config.ip + 'api.php/hui/toPic',
            key: 'pic',
            formData: {
                uid: $scope.userData.id
            },
            onchange: function() {
                try {
                    $scope.uploading = true;
                    $scope.$digest();
                } catch (e) {}
            }
        });
        u().then(function(data) {
            $scope.setToReplyData.picUrl.push(data.Data.url.pic);
            $scope.uploading = false;
        }, function(err) {
            $scope.uploading = false;
            if (err.type == 1) {
                window.alert(err.data.data.errMsg);
            }
        });
    };
    //删除图片
    $scope.delPic = function(argIndex) {
        $scope.setToReplyData.picUrl.splice(argIndex, 1);
    };

    $scope.picRoot = config.picRoot();

    $scope.init = function(user) {
        $scope.replyList = [];
        $scope.userData = user;
        $scope.getThePost();
        refresh();
    };    

    currentUser().then(function(user) {
        $scope.init(user);
    }, function (err){
        $scope.init(err);
    });

    $scope.goBuildPage = function(argPid, argIndex) {
        $state.go('themeBuild', {
            pid: argPid,
            i: argIndex + 1
        });
    };
});
angular.module('app').controller('unionsActiveCtrl', function($scope, $rootScope, $element, $state, $stateParams, sideBar, request, config, loading, currentUser, connector, confirm, watchTabfactory) {
    $scope.userData = {};
    $scope.picRoot = config.picRoot();

    $scope.getUActivitysData = {
        nid: $stateParams.nid,
        page: 1,
        pagesize: 10
    };
    $scope.activeList = [];

    function refresh() {
        $scope.hideEndHeightFlag = true;
        $scope.mainWrapper = $('.main');
        watchTabfactory.refresh($scope, 'getUActivitys');
    }

    $scope.goWriteActive = function() {
        $state.go('writeActive', {
            nid: $stateParams.nid
        });
    };
    $scope.goActiveDetail = function(argPid) {
        $state.go('activeDetail', {
            aid: argPid
        });
    };

    $scope.picRoot = config.picRoot();

    $scope.init = function(user) {
        $scope.userData = user;
        $scope.activeList = [];
        refresh();
    };

    currentUser().then(function(user) {
        $scope.init(user);
    }, function (err){
        $scope.init(err);
    });
});
angular.module('app').controller('writeActiveCtrl', function($scope, $rootScope, $element, $state, $stateParams, sideBar, request, config, loading, currentUser, connector, confirm, upload) {
    $scope.userData = {};
    $scope.picRoot = config.picRoot();
    $scope.tabTitle = '发布活动';

    $scope.setToActivityData = {
        uid: 0,
        title: '',
        content: '',
        place: '',
        member: '',
        picUrl: [],
        start_time: '',
        city: '广州',
        nid: $stateParams.nid
    };
    $scope.setToActivity = function() {
        var hideLoadingToActivitys = loading.show({
            element: angular.element('.view-page')
        });

        $scope.setToActivityData.start_time = (+new Date($scope.setToActivityData.start_time)) / 1000;
        $scope.setToActivityData.uid = $scope.userData.id;
        $scope.setToActivityData.nid = $stateParams.nid;
        connector.setToActivity($scope.setToActivityData).then(function(data) {
            $scope.backPage();
            hideLoadingToActivitys();
        }, function(e) {
            alert(e.data.data.errMsg);
            hideLoadingToActivitys();
        });
    };

    //图片上传
    $scope.upload = function() {
        u = upload({
            url: config.ip + 'api.php/hui/toPic',
            key: 'pic',
            formData: {
                uid: $scope.user.id
            },
            onchange: function() {
                try {
                    $scope.uploading = true;
                    $scope.$digest();
                } catch (e) {}
            }
        });
        u().then(function(data) {
            $scope.setToActivityData.picUrl.push(data.Data.url.pic);
            $scope.uploading = false;
        }, function(err) {
            $scope.uploading = false;
            if (err.type == 1) {
                window.alert(err.data.data.errMsg);
            }
        });
    };
    //删除图片
    $scope.delPic = function(argIndex) {
        $scope.setToActivityData.picUrl.splice(argIndex, 1);
    };

    $scope.init = function() {
        $scope.picRoot = config.picRoot();
        currentUser().then(function(user) {
            $scope.userData = user;
        });
    };
    $scope.init();
});
angular.module('app').controller('activeDetailCtrl', function($scope, $rootScope, $element, $state, $stateParams, sideBar, request, config, loading, currentUser, connector, confirm, watchTabfactory) {
    $scope.index = $stateParams.i;
    $scope.userData = {};
    $scope.picRoot = config.picRoot();
    $scope.active = {};

    $scope.getActivityInfoData = {
        aid: $stateParams.aid
    };
    $scope.getActivityInfo = function() {
        var hideLoadingThePost = loading.show({
            element: angular.element('.view-page')
        });
        connector.getActivityInfo($scope.getActivityInfoData).then(function(data) {
            $scope.active = data.Data;
            hideLoadingThePost();
        }, function(e) {
            alert(e.data.data.errMsg);
            hideLoadingThePost();
        });
    };

    $scope.getCommentsData = {
        aid: $stateParams.aid,
        page: 1,
        pagesize: 10
    };
    $scope.getComments = function() {
        var hideLoadingReplys = loading.show({
            element: angular.element('.view-page')
        });
        connector.getComments($scope.getCommentsData).then(function(data) {
            $scope.replyList = data.Data;
            if ($scope.index) {
                for (var i = 0; i < data.Data.length; i++) {
                    if (data.Data[i].cid == $stateParams.cid) {
                        $scope.active = data.Data[i];
                    }
                }
            }
            hideLoadingReplys();
        }, function(e) {
            alert(e.data.data.errMsg);
            hideLoadingReplys();
        });
    };

    function refresh() {
        $scope.hideEndHeightFlag = true;
        $scope.mainWrapper = $('.main');
        if (!$scope.index) {
            watchTabfactory.refresh($scope, 'getActiveComments');
        } else {
            // watchTabfactory.refresh($scope, 'getCommentChilds');
        }
    }

    $scope.setToCommentData = {
        uid: $scope.userData.id,
        content: '',
        cid: '',
        aid: $scope.active.aid
    };
    $scope.setToComment = function() {
        if (!$scope.setToCommentData.content) {
            alert('回复内容不能为空！');
            return;
        }
        $scope.setToCommentData.uid = $scope.userData.id;
        $scope.setToCommentData.aid = $scope.active.aid;
        if ($scope.index) {
            $scope.setToCommentData.cid = $stateParams.cid;
            $scope.setToCommentData.aid = $stateParams.aid;
        }
        var hideLoadingToComment = loading.show({
            element: angular.element('.view-page')
        });
        connector.setToComment($scope.setToCommentData).then(function(data) {
            hideLoadingToComment();
            $scope.setToCommentData = {
                uid: $scope.userData.id,
                content: '',
                cid: '',
                aid: $scope.active.aid
            };
            $scope.init();
        }, function(e) {
            alert(e.data.data.errMsg);
            hideLoadingToComment();
        });
    };

    $scope.getDelPostData = {
        uid: $scope.userData.id,
        aid: $stateParams.aid
    };
    $scope.getAAccusation = function() {
        var hideLoadingAccusation = loading.show({
            element: angular.element('.view-page')
        });
        $scope.getDelPostData.uid = $scope.userData.id;
        connector.getAAccusation($scope.getDelPostData).then(function(data) {
            hideLoadingAccusation();
        }, function(e) {
            alert(e.data.data.errMsg);
            hideLoadingAccusation();
        });
    };
    $scope.accusationActive = function() {
        var h = confirm({
            msg: '确定举报？',
            success: function() {
                h();
                $scope.getAAccusation();
            },
            cancel: function() {
                h();
            }
        });
    };


    $scope.getDelActivity = function() {
        var hideLoadingDelActivity = loading.show({
            element: angular.element('.view-page')
        });
        $scope.getDelPostData.uid = $scope.userData.id;
        connector.getDelActivity($scope.getDelPostData).then(function(data) {
            $scope.replyList = data.Data;
            hideLoadingDelActivity();
            $scope.backPage();
        }, function(e) {
            alert(e.data.data.errMsg);
            hideLoadingDelActivity();
        });
    };
    $scope.delteActive = function() {
        var h = confirm({
            msg: '确定删除？',
            success: function() {
                h();
                $scope.getDelActivity();
            },
            cancel: function() {
                h();
            }
        });

    };

    $scope.selectReply = function(argData) {
        $scope.setToCommentData.cid = argData.cid;
        $scope.setToCommentData.content = '回复 ' + argData.nickname + ':';
    };

    //活动评论回复列表
    $scope.commentsList = [];
    $scope.getCommentChilds = function() {
        var hideLoadingReplys = loading.show({
            element: angular.element('.view-page')
        });
        $scope.getCommentChildsData = {
            cid: $stateParams.cid
        };
        connector.getCommentChilds($scope.getCommentChildsData).then(function(data) {
            $scope.commentsList = data.Data;
            hideLoadingReplys();
        }, function(e) {
            alert(e.data.data.errMsg);
            hideLoadingReplys();
        });
    };

    $scope.picRoot = config.picRoot();
    
    $scope.init = function(user) {
        $scope.userData = user;
        $scope.replyList = [];
        if ($scope.index) {
            $scope.getComments();
            refresh();
        } else {
            $scope.getActivityInfo();
            refresh();
        }
    };

    currentUser().then(function (user) {
        $scope.init(user);
    }, function (err){
        $scope.init(err);
    });

    $scope.goBuildPage = function(argPid, argIndex) {
        $state.go('activeBuild', {
            aid: $stateParams.aid,
            cid: argPid,
            i: argIndex + 1
        });
    };
});
