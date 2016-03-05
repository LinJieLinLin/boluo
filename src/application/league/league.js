angular.module('app').controller(
    'leagueCtrl', 
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
    $scope.tabTitle = $stateParams.name;
    $scope.userData = {};

    $scope.goPage = function(argPage) {
        if (!$scope.unionsInfo.join) {
            alert('您还未加入' + $scope.unionsInfo.info.name);
            // return;
        }
        $state.go(argPage, {
            name: $scope.unionsInfo.info.name,
            nid: $scope.unionsInfo.info.nid
        });
    };
    $scope.goThemeDetail = function(argPid) {
        $state.go('themeDetail', {
            pid: argPid
        });
    };
    $scope.goActiveDetail = function(argPid) {
        $state.go('activeDetail', {
            aid: argPid
        });
    };
    $scope.goActive = function() {
        $state.go('unionsActive', {
            pid: 890,
            nid: $scope.unionsInfo.info.nid
        });
    };
    $scope.picRoot = config.picRoot();
    $scope.getUnionsInfoData = {
        nid: $stateParams.nid
    };
    $scope.unionsInfo = {};
    $scope.getUnionsInfo = function() {
        var hideLoadingUnionsInfo = loading.show({
            element: angular.element('.main')
        });
        connector.getUnionsInfo($scope.getUnionsInfoData).then(function(data) {
            $scope.unionsInfo = data.Data;
            $scope.unionsInfo.style = {
                'background-image': 'url(' + $scope.picRoot + $scope.unionsInfo.info.bg + ')'
            };
            hideLoadingUnionsInfo();

            menuShare({
                title: '菠萝球迷圈-菠萝盟-' + data.Data.info.name,
                imgUrl: $scope.picRoot + $scope.unionsInfo.info.bg,
                desc: ''
            });
        }, function(e) {
            alert(e.data.data.errMsg);
            hideLoadingUnionsInfo();
        });
    };

    $scope.getPostsData = {
        nid: $stateParams.nid,
        page: 1,
        pagesize: 10
    };
    $scope.postsList = [];

    function refresh() {
        $scope.hideEndHeightFlag = true;
        $scope.mainWrapper = $('.main');
        watchTabfactory.refresh($scope, 'getPosts');
    }

    $scope.followUnion = function(argType) {
        var hideLoadingFollow = loading.show({
            element: angular.element('.league-btn')
        });
        $scope.followUnionData = {
            nid: $stateParams.nid,
            uid: $scope.userData.id
        };
        if (argType == 'add') {
            connector.setFollow($scope.followUnionData).then(function(data) {
                if ($scope.unionsInfo && angular.isDefined) {
                    $scope.unionsInfo.join = 1;
                }
                hideLoadingFollow();
            }, function(e) {
                alert(e.data.data.errMsg);
                hideLoadingFollow();
            });
        } else if (argType == 'quite') {
            connector.setMisfollow($scope.followUnionData).then(function(data) {
                if ($scope.unionsInfo && angular.isDefined) {
                    $scope.unionsInfo.join = 0;
                }
                hideLoadingFollow();
            }, function(e) {
                alert(e.data.data.errMsg);
                hideLoadingFollow();
            });
        }
    };

    $scope.picRoot = config.picRoot();

    function init(user){
        $scope.userData = user;
        $scope.getUnionsInfo();
        refresh();
    }
    currentUser().then(function(user) {
        init(user);
    }, function (err){
        init(err);
    });
});
