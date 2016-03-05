angular.module('app').controller(
    'pineappleCtrl', 
    function(
        $scope, 
        $rootScope, 
        $element, 
        $state, 
        $stateParams, 
        sideBar, 
        request, 
        config, 
        loading
    ) {

    $scope.tabTitle = '菠萝盟';

    $scope.toggleSideBar = function() {
        sideBar.show();
    };

    $scope.navTab = [{
        name: '球迷秀',
        tab: 'fansShow',
        sref: 'pineapple.fansShow({avatar: 1})'
    },{
        name: '盟聊吧',
        tab: 'postBar',
        sref: 'pineapple.postBar({avatar: 1})'
    },{
        name: '盟活动',
        tab: 'activity',
        sref: 'pineapple.activity({avatar: 1})'
    }];

    $scope.goPage = function(argPage){
        $state.go(argPage, {
            name: '曼联',
            nid: 1
        });
    };
});