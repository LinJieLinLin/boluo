//精彩图集
angular.module('app').controller(
    'atlasCtrl',
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
        connector,
        watchTabfactory,
        menuShare
    ) {

    $scope.title = '精彩图集';
    $scope.shuoAvatarFlag = $stateParams.avatar;
    $scope.type = '2';
    $scope.mainWrapper = $('.fans-show-main');
    function refresh(){
        watchTabfactory.refresh($scope, 'getDynamicMomentList');

        menuShare(angular.extend(angular.copy($rootScope.shareDefaultParams), {
            title: '菠萝球迷秀-精彩图集'
        }));
    }
    refresh('refresh');
});

//精彩图集 列表组件
application
.directive("atlasList", function() {
    return {
        templateUrl: 'application/atlas/atlas-list-dir.html',
        restrict: "E",
        replace: true,
        transclude: true,
        scope: {
            list: "="
        },
        controller: 'atlasListCtrl'
    };
})
.controller('atlasListCtrl', function($scope, $rootScope, $timeout, $element, $http, $stateParams, connector, config, loading) {
    $scope.picRoot = config.picRoot();
    $scope.$watch('list', function (value) {
        if (value) {
            angular.forEach(value, function (item){
                item.time = moment(new Date(item.dateline * 1000)).format('YYYY-MM-DD');
            });
        }
    });
});