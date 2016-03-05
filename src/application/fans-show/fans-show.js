angular.module('app').controller(
    'fansShowCtrl',
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
        menuShare
    ) {

    $scope.$parent.curTab = 'fansShow';
    $scope.$parent.shuoAvatarFlag = $stateParams.avatar;
    $scope.picRoot = config.picRoot();
    
    function initBanner(list) {
        var flag = list.length > 1;

        angular.forEach(list, function(item) {
            $('.swiper-wrapper').append('<div class="swiper-slide" style="background-image:url(\'' + $scope.picRoot + item.url + '\');"><a href="' + item.link + '?uid=' + config.uid() + '" title="' + item.title + '">&nbsp;</a></div>');
        });

        if (flag) {
            $scope.swiper = new Swiper('.swiper-container', {
                autoplay: 5000,
                loop: flag,
                pagination: '.swiper-pagination',
                paginationClickable: flag
            });
        }
    }

    function getBanner(params) {
        connector.advert(params).then(function(rs) {
            initBanner(rs.Data || []);
        }, function(err) {
            alert(err.data.data.errMsg);
        });
    }

    function getBlq(){
        var loadingHide = loading.show({element: $('body')});
        connector.blq({
            uid: config.uid()
        }).then(function(rs) {
            loadingHide();
            var data = rs.Data || [];
            angular.forEach(data, function (item, index){
                switch(index){
                    case 0:
                        // 精彩七人制
                        $scope.wonderfulList = item.info;
                        break;
                    case 1:
                        // 星球拍客
                        $scope.paikeList = item.info;
                        break;
                    case 2:
                        // 精彩图集
                        $scope.atlasList = item.info;
                        break;
                }
            });

            menuShare(angular.extend(angular.copy($rootScope.shareDefaultParams), {
                title: '菠萝球迷圈-球迷秀',
                desc: '关注微信公众号：菠萝球迷圈。传递你身边的足球，传递我身边的快乐！'
            }));

            // console.log($scope.wonderfulList);
            // console.log($scope.paikeList);
            // console.log($scope.atlasList);
        }, function(err) {
            loadingHide();
            alert(err.data.data.errMsg);
        });
    }

    function init(){
        getBanner({
            position: 3
        });
        getBlq();
    }

    init();
});