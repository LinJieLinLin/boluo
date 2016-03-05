//推荐
angular.module('app').controller(
    'recommendCtrl',
    function(
        $scope,
        $rootScope, 
        $element, 
        $state, 
        $stateParams, 
        $timeout, 
        sideBar, 
        request, 
        config, 
        loading,
        connector,
        watchTabfactory,
        menuShare
    ) {

    $scope.toggleSideBar = function() {
        sideBar.show();
    };

    $scope.title = '推荐';
    $scope.shuoAvatarFlag = $stateParams.avatar;
    $scope.mainWrapper = $('.recommend-wrapper');
    function refresh(){
        watchTabfactory.refresh($scope, 'getNewsRecommend');
    }
    refresh('refresh');

    $scope.goToRecommendDetail = function(item){
        $state.go('recommend-detail', {vid: item.Id});
    };

    menuShare(angular.extend(angular.copy($rootScope.shareDefaultParams), {
        title: '菠萝球迷圈-最新推荐',
        desc: '关注微信公众号：菠萝球迷圈，大咖名嘴独家点评篇篇精彩！'
    }));
});

//推荐详情
application.controller(
    'recommendDetailCtrl', 
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
        watchTabfactory,
        menuShare
    ) {
    
    $scope.stateParams = $stateParams;
    $scope.tabTitle = '推荐';

    function digest(){
        try {
            $scope.$digest();
        } catch (e) {}
    }

    function createVideo(v){
        var video = '<div class="r-d-video" id="video-container">'+
                    '<video id="video-player" controls preload x-webkit-airplay="true" webkit-playsinline="true" poster="'+ v.poster +'">'+
                    '<source src="'+ v.url +'">'+
                    '<p>您的浏览器不支持 video 标签。</p>'+
                    '</video>'+
                    '</div>';
        var audio = '<audio src="'+ v.url +'" controls="controls" preload x-webkit-airplay="true" webkit-playsinline="true" style="width:100%;">您的浏览器不支持 audio 标签。</audio>';
        return (/\.mp3$/i).test(v.url) ? video : video;
    }

    $scope.mainWrapper = $('.comments-wrapper');

    function refresh(){
        watchTabfactory.refresh($scope, 'getNewsCommments');
    }

    $scope.showComments = function (flag){
        $scope.showCommentsFlag = typeof flag === 'boolean' ? flag : !$scope.showCommentsFlag;
        if($scope.showCommentsFlag){
            refresh('refresh');
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

    $scope.sendComment = function (){
        connector.newsToCommment({
            uid: config.uid(),
            content: $scope.msgContent,
            nid: $stateParams.vid
        }).then(function (rs){
            if(rs.errMsg){
                alert(rs.errMsg);
                return;
            }
            // if(!rs.Data){
            //     rs.Data = {
            //         count: $scope.detailInfo.commentCount + 1
            //     };
            // }
            $scope.detailInfo.commentCount = rs.Data.count;
            $scope.msgContent = '';
            $scope.showEdit();
            $scope.showComments(true);
        }, function (err){
            console.log(err);
            alert(err.data.data.errMsg);
        });
    };

    $scope.newsLikes = function($event, sort, type){
        connector.newsLikes({
            uid: config.uid(),
            sort: sort,
            type: type,
            id: $stateParams.vid
        }).then(function (rs){
            if(rs.errMsg){
                alert(rs.errMsg);
                return;
            }
            $($event.target).addClass('active');
            switch(sort){
                case 1:
                    // if(!rs.Data){
                    //     rs.Data = {
                    //         count: $scope.detailInfo.praiseCount + 1
                    //     };
                    // }
                    $scope.detailInfo.praiseCount = rs.Data.count;
                    break;
                case 2:
                    // if(!rs.Data){
                    //     rs.Data = {
                    //         count: $scope.detailInfo.treadCount + 1
                    //     };
                    // }
                    $scope.detailInfo.treadCount = rs.Data.count;
                    break;
            }
        }, function (err){
            console.log(err);
            alert(err.data.data.errMsg);
        });
    };

    function init(){        
        var data = match.Data;
        if(!data.commentCount){
            data.commentCount = 0;
        }
        if(!data.praiseCount){
            data.praiseCount = 0;
        }
        if(!data.treadCount){
            data.treadCount = 0;
        }
        data.time = moment(new Date(data.PostTime * 1000)).format('YYYY-MM-DD hh:mm:ss');
        $scope.picRoot = config.picRoot();
        $scope.detailInfo = data;
        var vUrl = data.VideoUrl || data.Mp3Url;
        var videoHtml = createVideo({
            url: $sce.trustAsResourceUrl(vUrl),
            poster: data.Img
        });
        if(vUrl){
            if($scope.detailInfo.Content.match(/(\n|\r)/)){
                $scope.detailInfo.Content = $scope.detailInfo.Content.replace(/(\n|\r)/, videoHtml + '$1');
            }else{
                $scope.detailInfo.Content = videoHtml + $scope.detailInfo.Content;
            }
        }
        $scope.detailInfo.Content = $sce.trustAsHtml($scope.detailInfo.Content);
        
        menuShare({
            title: data.Title,
            imgUrl: data.Img,
            desc: config.filterHtmlText(data.Desc)
        });

        refresh('refresh');
    }

    init();
});