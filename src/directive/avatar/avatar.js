angular.module('app').directive('avatar', function () {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            url: '='
        },
        controller: function ($scope, $element, config) {
            $scope.avatarStyle = {
                backgroundImage: 'url(/image/icon/user_sidebar_autopic.png)'
            };
            $scope.$watch('url', function (value) {
                if(value){
                    $scope.src = config.filterImgUrl(value);
                }
            });
        },
        template: '<div class="user-avatar" ng-style="avatarStyle"><img ng-src="{{src}}" width="100%" height="100%" ng-show="src" /></div>'
    };
});