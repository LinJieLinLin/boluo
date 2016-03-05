angular.module('app')
    .controller('landingCtrl', function($scope, $rootScope, $element, $state, $stateParams, listPageFactory) {
        $scope.tabTitle = '大咖聊';
        $scope.shuoAvatarFlag = true;
        $scope.tabLandingFlag = true;
        $scope.navList = [{
            name: '好声音',
            class: 'voice',
            sref: $rootScope.srefUrl.voice,
            icon: $rootScope.icon.voice
        }, {
            name: '大咖聊',
            class: 'dk',
            sref: $rootScope.srefUrl.dk,
            icon: $rootScope.icon.dk
        }, {
            name: '我的订阅',
            class: 'subscription',
            sref: $rootScope.srefUrl.subscription,
            icon: $rootScope.icon.subscription
        }, {
            hidden: true,
            name: '精彩回顾',
            class: 'wof',
            sref: $rootScope.srefUrl.wonderful,
            icon: $rootScope.icon.wonderful
        }];
        listPageFactory.getDkl($scope, $element, $state, $stateParams);
    })
    .controller('listCtrl', function($scope, $rootScope, $element, $state, $stateParams, listPageFactory, sideBar) {
        $scope.tabName = $stateParams.tab;
        $scope.shuoAvatarFlag = $stateParams.avatar;
        $scope.toggleSideBar = function() {
            sideBar.show();
        };
        switch ($scope.tabName) {
            case 'voice':
                $scope.tagsGet = true;
                $scope.tabVoiceFlag = true;
                $scope.tabTitle = '好声音';
                listPageFactory.getHomepage($scope, $element, $state, $stateParams);
                break;
            case 'dk':
                $scope.tabDkFlag = true;
                $scope.tabTitle = '大咖聊';
                listPageFactory.livehome($scope, $element, $state, $stateParams);
                break;
            case 'voiceOwn':
                $scope.tabOwnFlag = true;
                $scope.tabTitle = $stateParams.tag;
                $scope.listType = 'own';
                listPageFactory.getAudioOwn($scope, $element, $state, $stateParams);
                break;
            case 'subscription':
                $scope.tabSubscriptionFlag = true;
                $scope.tabTitle = '我的订阅';
                listPageFactory.myfollows($scope, $element, $state, $stateParams);
                break;
            case 'wonderful':
                $scope.tabTitle = '精彩回顾';
                break;
            default:
                $scope.tabTitle = '无效链接';
                alert($scope.tabTitle);
        }
    })
    .factory('listPageFactory', function($rootScope, sideBar, connector, config, loading, menuShare) {

        function initBanner($scope, list) {
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

        function getBanner($scope, $element, params) {
            connector.advert(params).then(function(rs) {
                initBanner($scope, rs.Data || []);
            }, function(err) {
                alert(err.data.data.errMsg);
            });
        }

        function destroyBanner($scope) {
            if ($scope.swiper) {
                $scope.swiper.destroy(true, true);
                $scope.swiper = null;
            }
        }

        function getHomepage($scope){
            var loadingHide = loading.show({element: $('body')});
            connector.homepage({
                language: $scope.fitSel.cur.language
            }).then(function(rs) {
                var data = rs.Data;
                $scope.picRoot = config.picRoot()
;
                $scope.tagsList = data.tag;
                $scope.voiceList = data.recommend;
                $scope.$broadcast("listLoadSuccess", rs);
                loadingHide();
            }, function(err) {
                alert('页面数据获取失败');
                $scope.$broadcast("listLoadFail", err);
                loadingHide();
            });
        }

        return {
            getDkl: function($scope, $element, $state, $stateParams) {
                $scope.toggleSideBar = function() {
                    sideBar.show();
                };
                var loadingHide = loading.show({element: $('body')});
                connector.dkl().then(function(rs) {
                    var data = rs.Data;
                    $scope.picRoot = config.picRoot();
                    if(data.length == 2){
                        $scope.voiceList = data[0].info;
                        $scope.liveMatchList = [];
                        $scope.endsList = data[1].info;
                    }else{
                        $scope.voiceList = data[0].info;
                        $scope.liveMatchList = data[1].info;
                        $scope.endsList = data[2].info;
                    }
                    getBanner($scope, $element, {
                        position: 6
                    });
                    $scope.$broadcast("listLoadSuccess", rs, $scope.liveMatchList);
                    loadingHide();
                }, function(err) {
                    alert('页面请求数据失败');
                    $scope.$broadcast("listLoadFail", err);
                    loadingHide();
                });

                $rootScope.$on('$stateChangeStart', function(toState, toParams, fromState, fromParams) {
                    destroyBanner($scope);
                });

                menuShare(angular.extend(angular.copy($rootScope.shareDefaultParams), {
                    title: '菠萝球迷圈-大咖聊天室',
                    desc: '关注微信公众号：菠萝球迷圈，原创节目精彩赛事！大咖赔你聊，你与大咖聊！'
                }));
            },
            getHomepage: function($scope, $element, $state, $stateParams) {
                $scope.typeArr = [{
                    name: '全部',
                    language: undefined
                }, {
                    name: '粤语',
                    language: 1
                }, {
                    name: '普语',
                    language: 2
                }];
                $scope.fitSel = {
                    cur: $scope.typeArr[0]
                };
                $scope.toogleSelect = function() {
                    $scope.selOpen = !$scope.selOpen;
                };
                $scope.clickSelect = function(item) {
                    $scope.fitSel.cur = item;
                    getHomepage($scope);
                };
                getHomepage($scope);

                menuShare(angular.extend(angular.copy($rootScope.shareDefaultParams), {
                    title: '菠萝球迷圈-好声音',
                    desc: '关注微信公众号：菠萝球迷圈，原创节目精彩赛事！大咖赔你聊，你与大咖聊！'
                }));
            },
            getAudioOwn: function($scope, $element, $state, $stateParams) {
                var loadingHide = loading.show({element: $('body')});
                connector.audioOwn({
                    special: $stateParams.sid,
                    page: 1,
                    pagesize: 20
                }).then(function(rs) {
                    var data = rs.Data || [];
                    $scope.picRoot = config.picRoot();
                    $scope.ownList = data;
                    $scope.$broadcast("ownListLoadSuccess", rs);
                    loadingHide();
                }, function(err) {
                    alert(err.data.data.errMsg);
                    $scope.$broadcast("ownListLoadFail", err);
                    loadingHide();
                });
            },
            livehome: function($scope, $element, $state, $stateParams) {
                var loadingHide = loading.show({element: $('body')});
                connector.livehome().then(function(rs) {
                    var data = rs.Data;
                    $scope.picRoot = config.picRoot();
                    angular.forEach(data, function (item){
                        switch(item.column){
                            case '大咖聊天室':
                                $scope.liveMatchList = item.info || [];
                                break;
                            case '精彩回顾':
                                $scope.endsList = item.info || [];
                                break;
                        }
                    });
                    $scope.$broadcast("listLoadSuccess", rs);
                    loadingHide();
                    menuShare(angular.extend(angular.copy($rootScope.shareDefaultParams), {
                        title: '菠萝球迷圈-大咖聊',
                        desc: '关注微信公众号：菠萝球迷圈，原创节目精彩赛事！大咖赔你聊，你与大咖聊！'
                    }));
                }, function(err) {
                    alert(err.data.data.errMsg);
                    $scope.$broadcast("listLoadFail", err);
                    loadingHide();
                });
            },
            myfollows: function ($scope, $element, $state, $stateParams){
                var loadingHide = loading.show({element: $('body')});

                connector.myfollows({
                    uid: config.uid(),
                    page: 1,
                    pagesize: 20
                }).then(function(rs) {
                    var data = rs.Data;
                    $scope.picRoot = config.picRoot();
                    $scope.subscriptionList = data || [];
                    $scope.$broadcast("listLoadSuccess", rs);
                    loadingHide();
                }, function(err) {
                    alert(err.data.data.errMsg);
                    $scope.$broadcast("listLoadFail", err);
                    loadingHide();
                });

                menuShare(angular.extend(angular.copy($rootScope.shareDefaultParams), {
                    title: '菠萝球迷圈-我的订阅',
                    desc: '关注微信公众号：菠萝球迷圈，原创节目精彩赛事！大咖赔你聊，你与大咖聊！'
                }));
            }
        };
    });
