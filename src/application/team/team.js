angular.module('app').controller(
    'teamCtrl', 
    function (
        $scope, 
        $rootScope, 
        $sce, 
        $state, 
        loading, 
        loc, 
        connector, 
        currentUser, 
        config, 
        confirm,
        menuShare
    ) {
    $scope.picRoot = config.ip + 'pic/';
    $scope.shareParams = {};
    currentUser().then(function (user) {
        var id = $state.params.id;
        $scope.user = user;
        connector.getTeamInfo({uid: user.id, tid: id}).then(function (rs) {
            var data = rs.Data;
            var desc = data.introduction || '';
            $scope.team = data;
            $scope.team.introduction = $sce.trustAsHtml($scope.team.introduction || '');
            if (!$scope.team.bg_pic) {
                $scope.team.bg_pic = '/image/bg/item_auto_bg.png';
            }
            $scope.coverBg = {
                'background-image': 'url("' + config.filterImgUrl($scope.picRoot + $scope.team.bg_pic) + '"), url(/image/bg/item_auto_bg.png)',
                // 'background-size': 'cover'
            };
            $scope.shareParams = {
                title: '菠萝盟-' + data.name,
                imgUrl: config.filterImgUrl($scope.picRoot + data.avatar),
                desc: desc.replace(/\s|\r/g, '').substring(0, 120)
            };
            menuShare($scope.shareParams);
        });
    });
    $scope.navList = [{
        name: '看帖',
        url: 'team.topic'
    },{
        name: '活动',
        url: 'team.activity'
    },{
        name: '成员',
        url: 'team.member'
    },
    // {
    //     name: '联盟'
    // }
    ];
    $scope.navStyle = {
        width: 100/$scope.navList.length + '%'
    };
    $scope.currentNav = $scope.navList[0].name;
    $scope.enterTab = function (nav) {
        $scope.currentNav = nav.name;
        $state.go(nav.url);
    };
    $scope.joinTeam = function () {
        var h = confirm({
            msg: '是否加入团队 ' + $scope.team.name + '?',
            success: function () {
                connector.joinTeam({
                    uid: $scope.user.id,
                    tid: $scope.team.tid
                }).then(function () {
                    $scope.team.joined = 1;
                }, function (e) {
                    if (e.type ==1 ) {
                        window.alert(e.data.data.errMsg);
                    }
                });
                h();
            },
            cancel: function () {
                h();
            }
        });
    };
}).controller('topicCtrl', function ($scope, $state, $sce, connector, loading, currentUser, menuShare, config) {
    $scope.$parent.currentNav = '看帖';

    var id = $state.params.id;

    function init(user){
        connector.getTeamTopicList({uid: user.id, tid: id}).then(function (list) {
            $scope.topicList = list.Data;
            angular.forEach($scope.topicList, function (item){
                item.content = $sce.trustAsHtml(item.content || '');
            });
            if($scope.$parent){
                menuShare($scope.$parent.shareParams);
            }
        });
    }

    currentUser().then(function (user) {
        $scope.$parent.hideActionBar = false;
        init(user);
    }, function (err){
        $scope.$parent.hideActionBar = true;
        init(err);
    });
}).controller('topicDetailCtrl', function ($scope, $sce, $stateParams, connector, currentUser, menuShare, config) {
    var id = $stateParams.tid;
    function getReply(user) {
        connector.getTopicReply({sid: id, uid: user.id}).then(function (data) {
            $scope.topicComment = data.Data;
        });
    }
    function getDetail(user) {
        connector.getTopicDetail({sid: id, uid: user.id}).then(function (rs) {
            var data = rs.Data;
            if(!data.picurl){
                data.picurl = [];
            }
            var desc = data.content || '';
            $scope.topic = data;
            $scope.topic.content = $sce.trustAsHtml($scope.topic.content || '');
            var avatar = (/(^http:\/\/|^https:\/\/)/).test(data.avatar) ? data.avatar : $scope.picRoot + data.avatar;
            menuShare({
                title: '菠萝盟-' + data.title,
                imgUrl: config.filterImgUrl($scope.picRoot + (data.picurl[0] || avatar)),
                desc: desc.replace(/\s|\r/g, '').substring(0, 120)
            });
        });
    }
    function init(user){
        $scope.user = user;
        getDetail(user);
        getReply(user);
    }
    currentUser().then(function (user) {
        init(user);
    }, function (err){
        init(err);
    });
    $scope.$parent.hideActionBar = true;
    $scope.replyTopic = function () {
        if (!$scope.reply) {return;}
        connector.replyTopic({
            uid: $scope.user.id, 
            pid: id, 
            content: $scope.reply
        }).then(function (data) {
            $scope.reply = '';
            getReply($scope.user);
        });
    };
}).controller('newTopicCtrl', function ($scope, $state, currentUser, config, connector, upload) {
    var u;
    $scope.$watch('$parent.team.name', function (value) {
        $scope.teamName = value;
    });
    $scope.picList = [];
    $scope.$parent.hideActionBar = true;
    currentUser().then(function (user) {
        $scope.user = user;
        $scope.topic = {
            tid: $state.params.id,
            type: 1,
            uid: user.id
        };
        $scope.publish = function () {
            $scope.topic.pic = $scope.picList.join(',');
            connector.createPost($scope.topic).then(function (data) {
                window.alert('发帖成功');
                $state.go('team.topic');
            });
        };
        $scope.upload = function () {
            u = upload({
                url: config.ip + 'api.php/hui/toPostPic',
                key: 'pic',
                formData: {
                    uid: $scope.user.id
                }
            });
            u().then(function (data) {
                $scope.picList.push(data.Data.url.pic);
                console.log($scope.picList);
            });
        };
    });
    $scope.removePic = function (img) {
        var index = $scope.picList.indexOf(img);
        $scope.picList.splice(index, 1);
    };
}).controller('teamActivityCtrl', function ($scope, $state, $rootScope, connector, loading, currentUser, loc, menuShare, config) {
    $scope.$parent.currentNav = '活动';

    var tid = $state.params.id;
    $scope.parseLoc = function (code) {
        if ($rootScope.locationList.original[code]) {
            return $rootScope.locationList.original[code].dname;
        } else {
            return code;
        }
    };
    function getList (user) {
        connector.getTeamActList({tid: tid, uid: user.id}).then(function (data) {
            $scope.activityList = data.Data;
            if($scope.$parent){
                menuShare($scope.$parent.shareParams);
            }
        });
    }
    function init(user){
        getList(user);
        $scope.stick = function (e, item, stick) {
            e.stopPropagation();
            connector.stickAct({uid: user.id, aid: item.aid, stick: stick}).then(function () {
                getList(user);
                window.alert(stick == 2 ? '置顶成功' : '取消置顶成功');
            });
        };
    }

    currentUser().then(function (user) {
        $scope.$parent.hideActionBar = false;
        init(user);
    }, function (err){
        $scope.$parent.hideActionBar = true;
        init(err);

    });
}).filter('time', function () {
    return function (num) {
        if (+num) {
            return moment(+num*1000).format('YYYY年MM月DD HH:mm');
        } else {
            return '';
        }
    };
}).controller('teamActDetailCtrl', function ($scope, $state, config, confirm, connector, currentUser, menuShare){
    var params = $state.params;
    function getComment (user) {
        connector.getActComment({uid: user.id, aid: params.aid, type: 2}).then(function (data) {
            $scope.comments = data.Data;
            getReply(user);
        });
    }
    function getReply(user) {
        angular.forEach($scope.comments, function (item) {
            connector.getTopicReply({sid: item.sid, uid: user.id}).then(function (data) {
                item.comments = data.Data;
            });
        });
    }
    $scope.$parent.hideActionBar = true;

    $scope.goToList = function () {
        if ($scope.team.admin_id == $scope.user.id) {
            $state.go('team.activityDetail.list');        
        }
    };
    $scope.close = function (event) {
        event.stopPropagation();
        $scope.showDropdown = false;
        var hide = confirm({
            msg: '确认关闭活动？',
            success: function () {
                hide();
                connector.closeAct({
                    uid: $scope.user.id,
                    aid: $scope.act.aid
                }).then(function () {
                    window.alert('关闭活动成功。');
                    $state.go('team.activity');
                });
            },
            cancel: function () {
                hide();
            },
            text: {
                success: '确认',
                cancel: '取消'
            }
        });
    };
    $scope.edit = function (event) {
        event.stopPropagation();
        $state.go('team.activityDetail.edit');
    };
    $scope.list = function (event) {
        event.stopPropagation();
        $state.go('team.activityDetail.list');
    };
    $scope.dropDown = function (event) {
        function hide () {
            $scope.showDropdown = false;
            try {$scope.$digest();} catch (e) {}
            angular.element('.view-page').off('click', hide);
        }
        event.stopPropagation();
        $scope.showDropdown = true;
        angular.element('.view-page').on('click', hide);
    };
    $scope.loadDetail = function (user) {
        connector.getActDetail({uid: user.id, aid: params.aid}).then(function (rs) {
            var data = rs.Data;
            var desc = data.introduces || '';
            if(!data.pics || !data.pics.length){
                data.pics = [{}];
            }
            menuShare({
                title: '菠萝盟-' + data.name,
                imgUrl: config.filterImgUrl($scope.picRoot + (data.pics[0]['big_pic'] || avatar)),
                desc: desc.replace(/\s|\r/g, '').substring(0, 120)
            });
            $scope.act = data;
            $scope.isJoined = function () {
                if ($scope.act.status == 2) {
                    return true;
                }
                var flag = false;
                angular.forEach($scope.act.members, function (u) {
                    if (u.uid == user.id) {
                        flag = true;
                    }
                });
                return flag;
            };
            $scope.replyAct = function () {
                if (!$scope.replyModeTopic) {
                    connector.createPost({
                        uid: user.id,
                        content: $scope.reply,
                        tid: params.aid,
                        type: 2,
                        title: $scope.reply
                    }).then(function () {
                        getComment(user);
                        $scope.reply = '';
                    });
                } else {
                    connector.replyTopic({
                        uid: $scope.user.id, 
                        pid: $scope.replyModeTopic.sid, 
                        content: $scope.reply
                    }).then(function () {
                        $scope.reply = '';
                        getReply(user);
                        $scope.replyModeTopic = null;
                    });
                }
            };
            getComment(user);
        });
    };
    function init(user){
        $scope.user = user;
        $scope.loadDetail(user);
        $scope.replyTopic = function (t) {
            $scope.reply = '回复' + t.nickname + ': ';
            $scope.replyModeTopic = t;
            angular.element('.send-act-comment input').focus();
        };
        $scope.enroll = function () {
            if (!$scope.e || !$scope.e.name || !$scope.e.mobile) {
                window.alert('请完善报名信息。');
                return;
            }
            var api = 'http://bole.chokking.com/wxpay/example/jsapi.php?';
            var params = {} || config.getDefaultParams();
            params.uid = config.uid();
            params.total_fee = $scope.act.money;
            params.product = $scope.act.name;
            params.type = 1;
            params.ma_aid = $scope.act.aid;
            params.ma_name = $scope.e.name;
            params.ma_mobile = $scope.e.mobile;
            if($scope.e.we_chat){
                params.ma_we_chat = $scope.e.we_chat;
            }
            angular.forEach(params, function (v,k){
                api += k + '=' + v + '&';
            });
            var url = api.substring(0, api.length - 1);
            localStorage.setItem('recharge_redirect', $state.current.name);
            localStorage.setItem('redirect_option', JSON.stringify($state.params));
            window.location.href = url;
            // connector.enrollAct({
            //     uid: user.id, 
            //     aid: params.aid, 
            //     name: $scope.e.name, 
            //     mobile: $scope.e.mobile, 
            //     we_chat: $scope.e.we_chat, 
            //     pay_money: $scope.act.money
            // }).then(function (data) {
            //     window.alert('报名成功');
            //     $scope.showEnroll = false;
            //     $scope.act.members = $scope.act.members || [];
            //     $scope.act.members.push({uid: $scope.user.id, avatar: $scope.user.avatar});
            // });
        };
    }
    currentUser().then(function (user) {
        init(user);
    }, function (err){
        init(err);
    });
}).controller('myTeamCtrl', function ($scope, config, currentUser, connector) {
    $scope.navTab = [];
    $scope.picRoot = config.ip + 'pic/';
    currentUser().then(function (user) {
        connector.getMyTeam({uid: user.id}).then(function (data) {
            $scope.myTeam = data.Data;
        });
        connector.getJoinTeam({uid: user.id}).then(function (data) {
            $scope.joinTeam = data.Data;
        });
        connector.getHotTeam({uid: user.id}).then(function (data) {
            $scope.hotTeam = data.Data;
        });
    });
}).controller('newActivityCtrl', function ($scope, $state, config, upload, currentUser, connector, location) {
    var tid = $state.params.id;
    var u;
    $scope.act = {};
    $scope.act.enrollment_date_d = moment().format('YYYY-MM-DDTHH:mm');
    $scope.act.start_time_d = moment().format('YYYY-MM-DDTHH:mm');
    $scope.act.end_time_d = moment().format('YYYY-MM-DDTHH:mm');
    $scope.picRoot = config.ip + 'pic/';
    $scope.picList = [];
    $scope.$parent.hideActionBar = true;
    $scope.chooseLocation = function () {
        location(function (obj) {
            $scope.act.city = obj.city.code;
            $scope.act.cityname = obj.city.dname;
        });
    };
    currentUser().then(function (user) {
        $scope.act.uid = user.id;
        $scope.act.tid = tid;
    });
    $scope.newAct = function () {
        var arr = [];
        angular.forEach($scope.picList, function (item) {
            arr.push(item.url);
        });
        $scope.act.enrollment_date = moment($scope.act.enrollment_date_d).unix();
        $scope.act.start_time = moment($scope.act.start_time_d).unix();
        $scope.act.end_time = moment($scope.act.end_time_d).unix();
        $scope.act.pic = arr.join(',');
        connector.newActivity($scope.act).then(function (data) {
            window.alert('创建主题成功');
            $state.go('team.activity');
        });
    };
    $scope.upload = function () {
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
            $scope.picList.push({url: data.Data.url.pic});
            $scope.uploading = false;
        }, function (err) {
            $scope.uploading = false;
            if (err.type == 1) {
                window.alert(err.data.data.errMsg);
            }
        });
    };
    $scope.deleteImg = function (pic) {
        var index = $scope.picList.indexOf(pic);
        $scope.picList.splice(index, 1);
    };
}).controller('teamActEditCtrl', function ($scope, $state, currentUser, upload, config, connector, location) {
    function pick(obj, list) {
        var result = {};
        var keys;
        if (angular.isArray(list)) {
            keys = list;
        } else {
            keys = [].slice.call(arguments, 1);
        }
        angular.forEach(keys, function (k) {
            result[k] = obj[k];
        });
        return result;
    }
    currentUser().then(function (user) {
        $scope.user = user;
        $scope.newAct = function () {
            var arr = [];
            angular.forEach($scope.picList, function (item) {
                if (!item.sid) {
                    arr.push(item.url);
                }
            });
            $scope.$parent.act.pic = arr.join(',');
            $scope.$parent.act.uid = user.id;
            $scope.$parent.act.enrollment_date = moment($scope.$parent.act.enrollment_date_d).unix();
            $scope.$parent.act.start_time = moment($scope.$parent.act.start_time_d).unix();
            $scope.$parent.act.end_time = moment($scope.$parent.act.end_time_d).unix();
            connector.updateAct(pick($scope.$parent.act, [
                'aid',
                'enrollment_date',
                'place',
                'people_num',
                'introduces',
                'fellowship_team',
                'pic',
                'uid',
                'name',
                'end_time',
                'start_time'
                ])).then(function (data) {
                window.alert('更新成功');
                $state.go('team.activityDetail');
                $scope.$parent.loadDetail(user);
            }, function (err) {
                if (err.type == 1) {
                    window.alert(err.data.data.errMsg);
                }
            });
        };
    });
    $scope.$parent.hideActionBar = true;

    $scope.chooseLocation = function () {
        location(function (obj) {
            $scope.$parent.act.city = obj.city.code;
            $scope.$parent.act.cityname = obj.city.dname;
        });
    };
    $scope.picList = [];
    $scope.$watch('$parent.act', function (value) {
        if (value) {
            $scope.$parent.act.enrollment_date_d = moment($scope.$parent.act.enrollment_date * 1000).format('YYYY-MM-DDTHH:mm');
            $scope.$parent.act.start_time_d = moment($scope.$parent.act.start_time * 1000).format('YYYY-MM-DDTHH:mm');
            $scope.$parent.act.end_time_d = moment($scope.$parent.act.end_time * 1000).format('YYYY-MM-DDTHH:mm');
            angular.forEach(value.pics, function (item) {
                $scope.picList.push({url: item.big_pic, sid: item.sid});
            });
        }
    });
    $scope.upload = function () {
        var u = upload({
            url: config.ip + 'api.php/hui/toPic',
            key: 'pic',
            formData: {
                uid: $scope.user.id
            }
        });
        u().then(function (data) {
            $scope.picList.push({url: data.Data.url.pic});
        });
    };
    $scope.deleteImg = function (pic) {
        if (pic.sid) {
            connector.deleteImg({uid: $scope.user.id, sid: pic.sid}).then(function () {
            });
        }
        var index = $scope.picList.indexOf(pic);
        $scope.picList.splice(index, 1);
    };
}).controller('teamListCtrl', function ($scope, $state, currentUser, connector) {
    currentUser().then(function (user) {
        connector.actMember({uid: user.id, aid: $state.params.aid}).then(function (data) {
            $scope.list = data.Data;
        });
    });
    $scope.$parent.hideActionBar = true;

}).controller('teamMemberCtrl', function ($scope, $state, currentUser, connector, menuShare) {

    $scope.$parent.currentNav = '成员';

    function init(user){
        $scope.user = user;
        connector.getTeamMember({uid: user.id, tid: $state.params.id}).then(function (data) {
            $scope.member = data.Data;
            if($scope.$parent){
                menuShare($scope.$parent.shareParams);
            }
        });
    }

    currentUser().then(function (user) {
        $scope.$parent.hideActionBar = false;
        init(user);
    }, function (err){
        $scope.$parent.hideActionBar = true;
        init(err);
    });

    $scope.transfer = function (user) {
        connector.transferAdmin({
            uid: $scope.user.id,
            tid: $scope.team.tid,
            muid: user.uid
        }).then(function () {
            window.alert('转让成功');
            $state.go('team.member');
        }, function (e) {
            if (e.type == 1) {
                window.alert(e.data.data.errMsg);
            }
        });
    };
}).controller('teamEditCtrl', function ($scope, $state, config, location, currentUser, connector, upload) {
    $scope.picRoot = config.ip + 'pic/';
    var u = function () {
        var ul = upload({
            url: config.ip + 'api.php/hui/toPostPic',
            key: 'pic',
            formData: {
                uid: $scope.user.id
            }
        });
        return ul();
    };
    $scope.$parent.hideActionBar = true;

    // $scope.team = {};
    currentUser().then(function (user) {
        $scope.user = user;
        connector.unionList({uid: user.id}).then(function (data) {
            $scope.teamList = data.Data;
        });
        $scope.uploadAvatar = function () {
            u().then(function (data) {
                $scope.$parent.team.icon_pic = data.Data.url.pic;
            });
        };
        $scope.uploadBg = function () {
            u().then(function (data) {
                $scope.$parent.team.bg_pic = data.Data.url.pic;
            });
        };
    });
    $scope.title = '团队设置';
    $scope.setLocation = function () {
        location(function (obj) {
            $scope.$parent.team.city = obj.city.code;
            $scope.$parent.team.city_name = obj.city.dname;
        });
    };
    $scope.save = function () {
        $scope.$parent.team.uid = $scope.user.id;
        if ($scope.team.short_name.length > 6) {
            window.alert('团队短名字最长为6个字符。');
            return ;
        }
        connector.updateTeam($scope.$parent.team).then(function () {
            window.alert('团队信息更新成功');
            $state.go('team.member');
        }, function (e) {
            if (e.type == 1) {
                window.alert(e.data.data.errMsg);
            }
        });
    };
    $scope.upload = function () {
        u = upload({
            url: config.ip + 'api.php/hui/toPic',
            key: 'pic',
            formData: {
                uid: $scope.user.id
            }
        });
        u().then(function (data) {
            $scope.picList.push(data.Data.url.pic);
        });
    };
}).controller('newTeamCtrl', function ($scope, $state, config, location, currentUser, connector, upload) {
    $scope.picRoot = config.ip + 'pic/';
    var u = function () {
        var ul = upload({
            url: config.ip + 'api.php/hui/toPostPic',
            key: 'pic',
            formData: {
                uid: $scope.user.id
            }
        });
        return ul();
    };
    $scope.team = {};
    currentUser().then(function (user) {
        $scope.user = user;
        $scope.team.uid = user.id;
        connector.unionList({uid: user.id}).then(function (data) {
            $scope.teamList = data.Data;
        });
        $scope.uploadAvatar = function () {
            u().then(function (data) {
                $scope.team.icon_pic = data.Data.url.pic;
            });
        };
        $scope.uploadBg = function () {
            u().then(function (data) {
                $scope.team.bg_pic = data.Data.url.pic;
            });
        };
    });
    $scope.title = '我的团队';
    $scope.setLocation = function () {
        location(function (obj) {
            $scope.team.city = obj.city.code;
            $scope.team.city_name = obj.city.dname;
        });
    };
    $scope.save = function () {
        if ($scope.team.short_name.length > 5) {
            window.alert('团队短名字最长为5个字符。');
            return ;
        }
        connector.createTeam($scope.team).then(function (data) {
            window.alert('创建团队成功');
            $state.go('myTeam');
        });
    };

}).controller('searchTeamCtrl', function ($scope, currentUser, connector, loading, locationList, config) {
    currentUser().then(function (user) {
        locationList.then(function (data) {
            var list = [];
            angular.forEach(data, function (value) {
                angular.forEach(value.child, function (item) {
                    list.push(item);
                });
            });
            $scope.locationList = list;
        });

        connector.unionList({uid: user.id}).then(function (data) {
            $scope.unionList = data.Data;
        });

        $scope.search = function () {
            var hide = loading.show();
            connector.searchTeam({
                name: $scope.searchName,
                city: $scope.city,
                nid: $scope.nid
            }).then(function (data) {
                angular.forEach(data.Data, function (item) {
                    if (item.pic.indexOf('http') == -1) {
                        item.pic = config.ip + 'pic/' + item.pic;
                    }
                });
                $scope.teamList = data.Data;
                hide();
            }, function (e) {
                hide();
                if (e.type === 1) {
                    window.alert(e.data.data.errMsg);
                } else {
                    window.alert('搜索团队失败！网络错误！');
                }
            });
        };
    });
});