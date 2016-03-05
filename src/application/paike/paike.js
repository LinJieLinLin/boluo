//拍客
angular.module('app').controller(
    'paikeCtrl',
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
        connector
    ) {

    $scope.title = '星球拍客';
    $scope.shuoAvatarFlag = $stateParams.avatar;
    $scope.picRoot = config.picRoot();
    
});

//拍客 列表组件
application
.directive("paikeList", function() {
    return {
        templateUrl: 'application/paike/paike-list-dir.html',
        restrict: "E",
        replace: true,
        transclude: true,
        scope: {
            list: "="
        },
        controller: 'paikeListCtrl'
    };
})
.controller('paikeListCtrl', function($scope, $rootScope, $timeout, $element, $http, $stateParams, connector, config, loading) {
    $scope.picRoot = config.picRoot();
});

application.controller(
    'paikeTabCtrl',
    function (
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

    var tab = ['最新', '人气'];
    var tabIndex = parseInt($stateParams.tab);
    $scope.shuoAvatarFlag = $stateParams.avatar;
    $scope.title = tab[tabIndex - 1];
    $scope.type = tabIndex;
    $scope.curTabIndex = 0;
    $scope.sub_type = 1;
    $scope.mainWrapper = $('.paike-tab-main');
    function refresh(){
        watchTabfactory.refresh($scope, 'getFanShowPklists');

        menuShare(angular.extend(angular.copy($rootScope.shareDefaultParams), {
            title: '菠萝球迷秀-星拍客-' + tab[tabIndex - 1]
        }));
    }
    refresh('init');

    $scope.toggleTab = function(item, index){
        $scope.curTabIndex = index;
        $scope.sub_type = item.id;
        refresh('init');

        menuShare(angular.extend(angular.copy($rootScope.shareDefaultParams), {
            title: '菠萝球迷秀-星拍客-' + tab[index]
        }));
    };
});