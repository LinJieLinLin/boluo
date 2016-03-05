angular.module('app').controller('writeThemeCtrl', function($scope, $rootScope, $element, $state, $stateParams, sideBar, request, config, loading, currentUser, connector, upload) {
    $scope.tabTitle = '发布主题';
    $scope.userData = {};
    currentUser().then(function(user) {
        $scope.userData = user;
    });
    $scope.picRoot = config.picRoot();
    $scope.unionName = $stateParams.name;
    $scope.theme = {
        nid: $stateParams.nid,
        title: '',
        content: '',
        place: '广州',
        picUrl: []
    };
    $scope.setToPost = function() {
        $scope.theme.uid = $scope.userData.id;
        if (!$scope.theme.uid) {
            return;
        } else if (!$scope.theme.title) {
            alert('帖子标题不能为空！');
            return;
        } else if (!$scope.theme.content) {
            alert('帖子内容不能为空！');
            return;
        }
        var hideLoadingToPost = loading.show({
            element: angular.element('.view-page')
        });
        if (angular.isArray($scope.theme.picUrl)) {
            $scope.theme.picUrl = $scope.theme.picUrl.join(',');
        }
        connector.setToPost($scope.theme).then(function(data) {
            $state.go('league', {
                nid: $stateParams.nid,
                name: $stateParams.name
            });
            hideLoadingToPost();
        }, function(e) {
            alert(e.data.data.errMsg);
            hideLoadingToPost();
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
            onchange: function () {
                try {$scope.uploading = true;$scope.$digest();} catch (e) {}
            }
        });
        u().then(function (data) {
            $scope.theme.picUrl.push(data.Data.url.pic);
            $scope.uploading = false;
        }, function (err) {
            $scope.uploading = false;
            if (err.type == 1) {
                window.alert(err.data.data.errMsg);
            }
        });
    };
    //删除图片
    $scope.delPic = function(argIndex) {
        $scope.theme.picUrl.splice(argIndex, 1);
    };
});
