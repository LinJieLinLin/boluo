angular.module('app').controller(
    'leagueListCtrl',
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
        currentUser
    ) {
        // $scope.shuoAvatarFlag = $stateParams.avatar;
        $scope.tabTitle = "联盟列表";
        $scope.picRoot = config.picRoot();

        $scope.goPage = function(argPage) {
            $state.go(argPage);
        };

        $scope.getMyUnions = function(index) {
            $scope.curTabIndex = index;
            var loadingHide = loading.show({
                element: $('.league-list-main')
            });
            connector.getMyUnions({
                uid: $scope.userData.id
            }).then(function(rs) {
                loadingHide();
                if (rs.errMsg) {
                    alert(rs.errMsg);
                    return;
                }
                $scope.unionList = rs.Data;
            }, function(err) {
                loadingHide();
                alert(err.data.data.errMsg);
            });
        };

        function huiSort() {
            $scope.loadingReady = false;
            connector.huiSort({
                uid: $scope.userData.id
            }).then(function(rs) {
                $scope.loadingReady = true;
                if (rs.errMsg) {
                    alert(rs.errMsg);
                    return;
                }
                var data = rs.Data;
                $scope.tabList = data;
                $scope.tabList.unshift({
                    name: '我的联盟'
                });
                huiUnions($scope.tabList[0], 0);
            }, function(err) {
                $scope.loadingReady = true;
                alert(err.data.data.errMsg);
            });
        }

        function huiUnions(item, index) {
            $scope.unionList = [];
            if (item.name === '我的联盟') {
                $scope.getMyUnions(0);
                return;
            }
            $scope.curTabIndex = index;
            var loadingHide = loading.show({
                element: $('.league-list-main')
            });
            connector.huiUnions({
                uid: $scope.userData.id,
                sid: item.sid
            }).then(function(rs) {
                loadingHide();
                if (rs.errMsg) {
                    alert(rs.errMsg);
                    return;
                }
                $scope.unionList = rs.Data;
            }, function(err) {
                loadingHide();
                alert(err.data.data.errMsg);
            });
        }

        function init(user) {
            $scope.userData = user;
            huiSort();
        }

        currentUser().then(function(user) {
            init(user);
        }, function (err){
            init(err);
        });

        $scope.toggleTab = huiUnions;
    });
