//精彩七人制
angular.module('app').controller(
    'wonderfulCtrl',
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

    $scope.title = '精彩七人制';
    $scope.shuoAvatarFlag = $stateParams.avatar;
    $scope.type = '2';
    $scope.mainWrapper = $('.fans-show-main');
    function refresh(){
        watchTabfactory.refresh($scope, 'getFansshows');

        menuShare(angular.extend(angular.copy($rootScope.shareDefaultParams), {
            title: '菠萝球迷秀-精彩七人制'
        }));
    }
    refresh();
});

//精彩七人制 列表组件
application
.directive("wonderfulList", function() {
    return {
        templateUrl: 'application/wonderful/wonderful-list-dir.html',
        restrict: "E",
        replace: true,
        transclude: true,
        scope: {
            list: "="
        },
        controller: 'wonderfulListCtrl'
    };
})
.controller('wonderfulListCtrl', function($scope, $rootScope, $timeout, $element, $http, $stateParams, connector, config, loading) {
    $scope.picRoot = config.picRoot();
});