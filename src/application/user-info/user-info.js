(function () {
function handleError (h) {
    return function (e) {
        h();
        window.alert(e.data.data.errMsg);
    };
}
angular.module('app')
.controller('userDetailCtrl', function ($scope, $rootScope, $state, config, sendGift, user, loading, connector, menuShare) {
    $scope.isSelf = $scope.user.id == user.id;
    $scope.id = user.id;
    $scope.userInfo = user;
    $scope.picRoot = config.picRoot();

    connector.refreshUserInfo();

    menuShare(angular.extend(angular.copy($rootScope.shareDefaultParams), {
        title: '菠萝球迷圈-"'+ $scope.user.name +'"个人中心',
        desc: '赶快关注"菠萝球迷圈"微信公众号,享受足球带来的精彩!'
    }));

    // $scope.coverBg = {
    //     'background-image': 'url("'+ config.picRoot() + user.bg +'")'
    // };

    $scope.followUser = function () {
        if ($scope.user.id == $scope.userInfo.id) {return;}
        var hide = loading.show();
        connector.followUser({uid: $scope.user.id, fuid: $scope.userInfo.id}).then(function () {
            hide();
            window.alert('关注成功。');
            $scope.userInfo.isFollowed = true;
            $scope.userInfo.fans = +$scope.userInfo.fans + 1;
        }, handleError(hide));
    };

    $scope.type = function (event, maxLength, currentLength) {
        if (currentLength >= maxLength) {
            event.preventDefault();
            return;
        }
    };
    $scope.goToPage = function (page, permit, arg) {
        if ((permit && $scope.user.id == $scope.id) || !permit) {
            $state.go(page, arg);
        }
    };
    $scope.enterEdit = function (type) {
        if ($scope.isSelf) {
            $state.go('user.edit.' + type, {id: $scope.id});
        }
    };
    $scope.sendGift = function () {
        $scope.showSendGift = true;
        sendGift({target: $scope.userInfo}, function (err, success) {
            $scope.showSendGift = false;
            if (err){
                window.alert(err.data.data.errMsg);
            } else if (success) {
                window.alert('赠送礼物成功');
            }
        });
    };
}).controller('myFollowCtrl', function ($scope, $rootScope, $state, user, connector, loading, menuShare) {
    var id = $state.params.id;
    var type = $state.params.type === 'follow' ? 1 : ($state.params.type === 'fans' ? 2 : undefined);
    if (!type) {
        $state.go('home');
        return;
    }
    $scope.type = type === 1 ? '关注' : '粉丝';
    $scope.list = [];
    var hide = loading.show();
    connector.getFollowList({uid: id, type: type}).then(function (data) {
        $scope.list = data.Data;
        hide();

        menuShare(angular.extend(angular.copy($rootScope.shareDefaultParams), {
            title: '菠萝球迷圈-"'+ $scope.user.name +'"的'+ $scope.type
        }));
    }, function (err) {
        window.alert(err.data.data.errMsg);
        hide();
    });
}).controller('userEditCtrl', function ($scope, $state, $swipe, $q, $rootScope, upload, location, config, currentUser, loading, connector) {
    var url = config.ip + 'api.php/avatar';
    $scope.hideFav = function (item, type) {
        var flag = false;
        for (var i = 0, l = $scope.user[type].length; i < l; i += 1) {
            var t = $scope.user[type][i];
            if (item.name == t.name) {
                flag = true;
                break;
            }
        }
        return flag;
    };
    $scope.selectLocation = function () {
        location(function (obj) {
            $scope.showLocationList = false;
            return connector.changeLocation({
                province: obj.province.code,
                city: obj.city.code,
                district: obj.state.code,
                uid: $scope.user.id
            }).then(function () {
                $scope.user.location = {
                    city: obj.city.dname,
                    cityCode: obj.city.code,
                    district: obj.state.dname,
                    districtCode: obj.state.code,
                    province: obj.province.dname,
                    provinceCode: obj.province.code
                };
            });
        });
    };
    $scope.editMode = false;
    $scope.selectFav = function (item, type) {
        if (!$scope.editMode || $scope.user[type].length >= 3) {return;}
        $scope.user[type].push(item);
    };
    $scope.$watch('ageSelect', function (v) {
        if (!v) {return;}
        var hide = loading.show();
        connector.changeAge({uid: $scope.user.id, age: v}).then(function (data) {
            hide();
            connector.userInfo({fuid: $scope.user.id, uid: $scope.user.id}).then(function (user) {
                $rootScope.user = user;
            });
        }, handleError(hide));
    });
    $scope.$watch('user.sex', function (value) {
        if (!value) {return;}
        var hide = loading.show();
        connector.changeSex({uid: $scope.user.id, sex: value == 'male' ? 1 : 2}).then(function () {
            hide();
        }, handleError(hide));
    });
    $scope.removeFav = function (item, type) {
        if (!$scope.editMode) {return;}
        for (var i = 0; i < $scope.user[type].length; i += 1) {
            var t = $scope.user[type][i];
            if (item.name == t.name) {
                $scope.user[type].splice(i, 1);
                i -= 1;
            }
        }
    };
    $scope.done = function (type) {
        var hide = loading.show();
        var arr;
        function request () {
            switch (type) {
                case 'nickname':
                    return connector.editNickname({
                        uid: $scope.user.id,
                        nickname: $scope.user.nickname
                    });
                case 'signature': 
                    return connector.editSign({
                        uid: $scope.user.id,
                        sign: $scope.user.signature
                    });
                case 'favTeam': 
                    $scope.editMode = false;
                    arr = [];
                    angular.forEach($scope.user.favTeam, function (item) {
                        arr.push(+item.fid);
                    });
                    return connector.editFavTeam({
                        myTeams: JSON.stringify(arr),
                        uid: $scope.user.id
                    });
                case 'favStar': 
                    $scope.editMode = false;
                    arr = [];
                    angular.forEach($scope.user.favStar, function (item) {
                        arr.push(+item.fid);
                    });
                    return connector.editFavStar({
                        myStars: JSON.stringify(arr),
                        uid: $scope.user.id
                    });
            }
        }
        request().then(function () {
            hide();
            $state.go('user.edit', {id: $scope.user.id});
        }, handleError(hide));
    };
    var u = upload({
        url: url,
        key: 'avatar',
        formData: {
            uid: $scope.user.id
        }
    });
    $scope.selectAvatar = function () {
        var e = angular.element('.setting-avatar .list-item-content');
        var h = loading.show({element: e});
        u().then(function (data) {
            if (data.Code && data.Code !== 0) {
                window.alert(data.msgError);
                h();
                return;
            }
            $scope.user.avatar = config.ip + data.picRoot + data.Data.src;
            h();
            window.alert('头像上传成功');
        });
    };

    connector.getTeamList().then(function (data) {
        $scope.hotTeam = data.Data;
    });

    connector.getStarList().then(function (data) {
        $scope.hotStar = data.Data;
    });
}).controller('myCharmCtrl', function ($scope, $rootScope, currentUser, config, loading, connector, menuShare) {
    var hide = loading.show();
    currentUser().then(function (user) {
        $scope.user = user;
        connector.myCharms({uid: $scope.user.id}).then(function (data) {
            $scope.charmDetail = data.Data;
        }).then(function () {
            return connector.getGiftList({uid: $scope.user.id, type: 3});
        }).then(function (data) {
            $scope.picRoot = data.picRoot;
            $scope.giftList = data.Data;
            hide();
        }, handleError(hide));

        menuShare(angular.extend(angular.copy($rootScope.shareDefaultParams), {
            title: '菠萝球迷圈-"'+ user.name +'"个人指数'
        }));
    });
}).controller('myActCtrl', function ($scope, $rootScope, loading, connector, menuShare) {
    var hide = loading.show();
    connector.myActivity({uid: $scope.user.id}).then(function (data) {
        $scope.actDetail = data.Data;
        $scope.activityBarStyle = {
            width: ($scope.actDetail.num* 100/+$scope.actDetail.max) + '%'
        };
        hide();

        menuShare(angular.extend(angular.copy($rootScope.shareDefaultParams), {
            title: '菠萝球迷圈-"'+ $scope.user.name +'"活跃值指数'
        }));
    }, handleError(hide));
}).controller('myTaskCtrl', function ($scope, $rootScope, config, currentUser, loading, connector, menuShare) {
    var hide = loading.show();
    $scope.taskDetail = {};
    currentUser().then(function (user) {
        $scope.user = user;
        getTaskList();

        menuShare(angular.extend(angular.copy($rootScope.shareDefaultParams), {
            title: '菠萝球迷圈-"'+ user.name +'"个人任务'
        }));
    });
    function getTaskList () {
        $scope.complete = 0;
        connector.myTask({uid: $scope.user.id}).then(function (data) {
            angular.forEach(data.Data, function (task) {
                if (task.pic) {
                    task.pic = config.picRoot() + task.pic;
                } else {
                    task.pic = '/image/icon/user_sidebar_star.png';
                }
                if (+task.complete) {
                    $scope.complete += 1;
                }
            });
            $scope.taskDetail = data.Data;
            hide();
        });
    }
    $scope.sign = function () {
        connector.userSign({uid: $scope.user.id}).then(function () {
            window.alert('签到成功');
            getTaskList();
        });
    };
}).controller('myMsgCtrl', function ($scope, $rootScope, loading, connector, menuShare) {
    var hide = loading.show();
    connector.getMsgList({uid: $scope.user.id, v: null, app: null}).then(function (data) {
        $scope.msgList = data.Data;
        hide();
        menuShare(angular.extend(angular.copy($rootScope.shareDefaultParams), {
            title: '菠萝球迷圈-"'+ $scope.user.name +'"的消息'
        }));
    });
    $scope.activeTab = 'system';
    $scope.hideDelete = function () {
        if (!$scope.msgList || !$scope.msgList.length) {
            return;
        }
        angular.forEach($scope.msgList, function (msg) {
            msg.showDelete = false;
        });
    };
    $scope.delMsg = function (msg, index) {
        var hide = loading.show();
        if (!msg.mid) {return;}
        connector.delMsg({mid: msg.mid, uid: $scope.user.id}).then(function (data) {
            hide();
            $scope.msgList.splice(index, 1);
        }, handleError(hide));
    };
    $scope.delAll = function () {
        if (!$scope.msgList || !$scope.msgList.length) {return;}
        var hide = loading.show();
        var type = $scope.activeTab == 'system' ? 1 : 2;
        connector.delMsg({
            uid: $scope.user.id, 
            delAll: 1, 
            type: type
        }).then(function () {
            hide();
            for (var i = 0; i < $scope.msgList.length; i += 1) {
                var msg = $scope.msgList[i];
                if ((msg.type == 0 && type ==1) || (msg.type == 1 && type == 2)) {
                    $scope.msgList.splice(i, 1);
                    i -= 1;
                }
            }
        }, handleError(hide));
    };
}).controller('requestFriendCtrl', function ($scope, $state, $q, loading, connector) {
    var hide = loading.show();
    var id = $state.params.target;
    $scope.requestFriendMsg = '我是' + $scope.user.nickname;
    function getUser () {
        if ($scope.$parent.userInfo && $scope.$parent.userInfo.id == id) {
            var defer = $q.defer();
            defer.resolve($scope.$parent.userInfo);
            return defer.promise;
        } else {
            return connector.userInfo({uid: id});
        }
    }
    getUser().then(function (user) {
        hide();
        $scope.friendReq = function () {
            var hide = loading.show();
            connector.requestFriend({
                fuid: user.id,
                fusername: user.nickname,
                username: $scope.user.name,
                uid: $scope.user.id
            }).then(function () {
                hide();
                window.alert('好友申请成功');
                $state.go('user', {id: user.id});
            }, handleError(hide));
        };
    }, handleError(hide));
}).controller('myGiftCtrl', function ($scope, $rootScope, $state, loading, config, connector, menuShare) {
    $scope.type = $state.params.type == 'recieve' ? '收到' : '可送';
    var hide = loading.show();
     // 1购买的 2收到的 3我送出的 4送礼物给好友页面的礼物列表
    var type = $state.params.type == 'recieve' ? 2 : 1;
    function getList () {
        if (type == 2) {
            return connector.getMyGiftList({uid: $scope.user.id});
        } else {
            return connector.getGiftList({uid: $scope.user.id, type: type});
        }
    }
    getList().then(function (data) {
        hide();
        $scope.picRoot = data.picRoot;
        $scope.giftList = data.Data;

        menuShare(angular.extend(angular.copy($rootScope.shareDefaultParams), {
            title: '菠萝球迷圈-"'+ $scope.user.name +'"'+ $scope.type + '的礼物'
        }));
    });
}).controller('lookPrivilegeCtrl', function ($scope, $rootScope, $state, loading, config, connector, menuShare) {
    $scope.picRoot = '/';
    $scope.list = [
        {pic: 'image/icon/recharge_privilege01.png', name: '屌丝/二妹', price: 10},
        {pic: 'image/icon/recharge_privilege02.png', name: '骚年/萌娃', price: 30},
        {pic: 'image/icon/recharge_privilege03.png', name: '高富帅/白富美', price: 60},
        {pic: 'image/icon/recharge_privilege04.png', name: '土豪/富婆', price: 920},
    ];
    menuShare(angular.extend(angular.copy($rootScope.shareDefaultParams), {
        title: '菠萝球迷圈-查看特权'
    }));
}).controller('mallCtrl', function ($scope, $rootScope, $state, loading, config, connector, menuShare) {
    $scope.picRoot = config.picRoot();
    $scope.magicsList = [];
    $scope.goRecharge = function(){
        $state.go('recharge');
    };
    $scope.getMagics = function() {
        var hideLoadingThePost = loading.show({
            element: angular.element('.view-page')
        });
        connector.getMagics({}).then(function(data) {
            $scope.magicsList = data.Data;
            hideLoadingThePost();
            menuShare(angular.extend(angular.copy($rootScope.shareDefaultParams), {
                title: '菠萝球迷圈-商城',
                desc: '赶快关注"菠萝球迷圈"微信公众号,享受足球带来的精彩!'
            }));
        }, function(e) {
            alert(e.data.data.errMsg);
            hideLoadingThePost();
        });
    };
    $scope.countBuyNum = function(argType) {
        if (argType === '-' && $scope.buy.buyNum > 1) {
            $scope.buy.buyNum = $scope.buy.buyNum - 1;
        } else if (argType === '+') {
            $scope.buy.buyNum = $scope.buy.buyNum + 1;
        }
    };
    $scope.getMagics();

    function toggleBuy(flag){
        $scope.buyFlag = flag;
    }

    $scope.cancelBuy = function (flag){
        toggleBuy(false);
        $scope.buy = null;
    };

    $scope.clickBuy = function (m){
        $scope.buy = m;
        $scope.buy.buyNum = 1;
        toggleBuy(true);
    };

    $scope.gotoBuy = function(){
        var unit = $scope.buy.unit;
        connector.magicBuy({
            uid: config.uid(),
            magicid: $scope.buy.magicid,
            num: $scope.buy.buyNum,
            payment: (unit == '金菠萝' ? 1 : unit == '金豆' ? 2 : 1)
        }).then(function (rs){
            if(rs.errMsg){
                alert(rs.errMsg);
                return;
            }
            $scope.cancelBuy();
            connector.refreshUserInfo();
            alert('购买道具成功');
        }, function (err){
            alert(err.data.data.errMsg);
        });
    };
}).controller('rechargeCtrl', function ($scope, $rootScope, currentUser, member, config, confirm, list, $http, menuShare) {
    $scope.picRoot = list.picRoot;
    $scope.list = list.Data;
    $scope.selectItem = function (item) {
        $scope.selected = item;
        angular.forEach($scope.list, function (item) {
            item.selected = false;
        });
        item.selected = true;
    };
    // document.addEventListener('WeixinJSBridgeReady', function onBridgeReady() {
    //     parseUrl();
    //     WeixinJSBridge.log('yo~ ready.');
    // }, false);
    // function parseUrl() {
    //     var search = decodeURIComponent(location.search.substring(0, location.search.length - 1));
    //     var arr1 = search.split('&');
    //     arr1.forEach(function (item) {
    //         var i = item.indexOf('=');
    //         var name = item.substring(0, i);
    //         if (name == 'order') {
    //             var value = item.substring(i + 1);
    //             try {
    //                 var obj = JSON.parse(value);
    //                 var h = confirm({
    //                     msg: '确认购买？',
    //                     success: function () {
    //                         WeixinJSBridge.invoke('getBrandWCPayRequest',obj,function(res){
    //                             if(res.err_msg == "get_brand_wcpay_request:ok" ) {}
    //                                 alert(JSON.stringify(res));
    //                            // 使用以上方式判断前端返回,微信团队郑重提示：res.err_msg将在用户支付成功后返回ok，但并不保证它绝对可靠。
    //                            //因此微信团队建议，当收到ok返回时，向商户后台询问是否收到交易成功的通知，若收到通知，前端展示交易成功的界面；若此时未收到通知，商户后台主动调用查询订单接口，查询订单的当前状态，并反馈给前端展示相应的界面。
    //                         }); 
    //                     }, 
    //                     cancel: function () {
    //                         h();
    //                     }
    //                 });
    //                 console.log(obj);
    //             } catch (e) {
    //                 console.log(e);
    //             }
    //         }
    //     });
    // }
    $scope.selectItem($scope.list[0]);
    currentUser().then(function (user) {
        $scope.recharge = function () {
            var api = 'http://bole.chokking.com/wxpay/example/jsapi.php?';
            var params = {} || config.getDefaultParams();
            params.uid = config.uid();
            params.total_fee = $scope.selected.price;
            params.product = $scope.selected.description;
            params.product_id = $scope.selected.gid;
            angular.forEach(params, function (v,k){
                api += k + '=' + v + '&';
            });
            var url = api.substring(0, api.length - 1);
            window.location.href = url;
        };
        menuShare(angular.extend(angular.copy($rootScope.shareDefaultParams), {
            title: '菠萝球迷圈-充值'
        }));
    });
}).controller('dataCtrl', function ($scope, $rootScope, config, connector, currentUser, loading, menuShare) {
    var hide = loading.show();
    currentUser().then(function (user) {
        return connector.endMatchList({uid: user.id});
    }).then(function (data) {
        angular.forEach(data.Data, function (item) {
            var arr = [];
            angular.forEach(item.commentator, function (u) {
                arr.push(u.nickname);
            });
            item.commentators = arr.join(' ');
            item.guestTeam.avatar  = config.picRoot()+ item.guestTeam.badge;
            item.homeTeam.avatar = config.picRoot()+ item.homeTeam.badge;
        });
        $scope.list = data.Data;
        hide();
        menuShare(angular.extend(angular.copy($rootScope.shareDefaultParams), {
            title: '菠萝球迷圈-完场数据'
        }));
    });
});
})();