angular.module('app').controller(
    'activityCtrl', 
    function(
        $scope, 
        $rootScope, 
        $element, 
        $state, 
        $stateParams, 
        confirm, 
        sideBar, 
        request, 
        config, 
        loading, 
        currentUser, 
        connector,
        menuShare
    ) {
    $scope.$parent.curTab = 'activity';
    $scope.$parent.shuoAvatarFlag = $stateParams.avatar;
    $scope.picRoot = config.picRoot();
    function init(user){
        var hideLoadingRecommend = loading.show({element: angular.element('.recommend-team')});
        connector.getRecommendTeam({uid: user.id}).then(function (data) {
            $scope.recommendList = data.Data;
            hideLoadingRecommend();
        }, function (err){
            hideLoadingRecommend();
        });
        var hideActList = loading.show({element: angular.element('.latest-activity, .later-activity')});
        connector.getIndexAct({uid: user.id}).then(function (data) {
            $scope.lastestAct = data.Data.official;
            $scope.laterAct = data.Data.activity;
            hideActList();
        }, function (err){
            hideActList();
        });
        menuShare(angular.extend(angular.copy($rootScope.shareDefaultParams), {
            title: '菠萝球迷圈-盟活动',
            desc: '关注微信公众号：菠萝球迷圈。这位同志，还没找到组织吗？全城球迷团队都在这喔！'
        }));
    }
    currentUser().then(function (user) {
        init(user);
    }, function (err){
        init(err);
    });

    $scope.enterOfficialAct = function (act) {
        if (act.url) {
            window.location = act.url;
        } else {
            $state.go('team.activityDetail', {id: act.tid, aid: act.aid, avatar: 0});
        }
    };

    $scope.isOutDate = function (num) {
        return moment.unix(num).isBefore(moment());
    };

}).filter('countTime', function () {
    return function (num) {
        if (+num) {
            return moment.unix(num).fromNow(true);
        } else {
            return '0天';
        }
    };
});