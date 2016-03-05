//精彩图集详情页
angular.module('app').controller(
    'photoswipeCtrl',
    function(
        $scope,
        $rootScope,
        $element,
        $timeout,
        $state,
        $stateParams,
        sideBar,
        request,
        config,
        loading,
        connector,
        menuShare
    ) {
        
        var photoswipeList = [];
        var listData = null;
        $scope.stateParams = $stateParams;
        $scope.shuoAvatarFlag = $stateParams.avatar;
        $scope.picRoot = config.picRoot();
        $scope.showPic = function (index){
            openPhotoSwipe(photoswipeList, index);
        };

        function digest() {
            try {
                $scope.$digest();
            } catch (err) {}
        }

        function openPhotoSwipe(list, index) {
            var pswpElement = document.querySelectorAll('.pswp')[0];

            var items = list || [{
                src: 'http://pic.meizitu.com/wp-content/uploads/2015a/11/11/01.jpg',
                w: 20,
                h: 20
            }, {
                src: 'http://pic.meizitu.com/wp-content/uploads/2015a/11/05/01.jpg',
                w: 20,
                h: 20
            }];

            var options = {
                index: index,
                history: false
            };
            var myBar = $('.my-bar');
            var pswpUi = $('.pswp__ui');
            var pswpUiHiddenClass = 'pswp__ui--hidden';
            var gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, items, options);
            gallery.init();
            gallery.listen('close', function () {
                $scope.list = listData;
                digest();
                gallery.destroy();
            });
            gallery.framework.bind(gallery.scrollWrap, 'pswpTap', function(e) {
                if (pswpUi.hasClass(pswpUiHiddenClass)) {
                    myBar.fadeOut('fast');
                } else {
                    myBar.fadeIn('fast');
                }
            });
            gallery.listen('imageLoadComplete', function(index, item) {
                var img = new Image();
                img.src = item.src;
                img.onload = function (){
                    item.w = this.width;
                    item.h = this.height;
                    gallery.updateSize(true);
                    img = null;
                };
            });
            myBar.unbind('click').bind('click', function() {
                if (!pswpUi.hasClass(pswpUiHiddenClass)) {
                    myBar.fadeOut('fast');
                    pswpUi.addClass(pswpUiHiddenClass);
                }
            });
        }

        function init() {
            $('.my-bar').fadeIn('fast');
            connector.dynamicMomentDetailList({
                pid: $stateParams.pid
            }).then(function (rs){
                var data = rs.Data;
                listData = data;
                $scope.title = $stateParams.title;
                $scope.picRoot = config.picRoot();
                angular.forEach(data, function (item){
                    var url = $scope.picRoot + item.big_url;
                    photoswipeList.push({
                        // src: 'http://pic.meizitu.com/wp-content/uploads/2015a/11/05/01.jpg',
                        src: url,
                        w: 20,
                        h: 20
                    });
                });
                if(photoswipeList.length){
                    openPhotoSwipe(photoswipeList, 0);
                    menuShare({
                        title: $stateParams.title,
                        imgUrl: config.picRoot() + data[0].big_url,
                        desc: ''
                    });
                }else{
                    alert('没有图片');
                }
            },function (err){
                alert(err.data.data.errMsg);
            });
            atlasPicCommentsZanCai();
        }

        function atlasPicCommentsZanCai(){
            connector.atlasPicCommentsZanCai({
                uid: config.uid(),
                pid: $stateParams.pid
            }).then(function (rs){
                $scope.picCommentsInfo = rs.Data;
            }, function (err){
                alert(err.data.data.errMsg);
            });
        }

        init();

        $scope.zanCai = function (type, ev){
            if(ev){
                ev.stopPropagation();
            }
            if(type === 1 && $scope.picCommentsInfo.isCai){
                alert('您已赞过！');
                return;
            }
            if(type === 2 && $scope.picCommentsInfo.isZan){
                alert('您已踩过！');
                return;
            }
            var t = ['点赞','点踩'];
            connector.atlasPicAddZanCai({
                uid: config.uid(),
                pid: $stateParams.pid,
                type: type
            }).then(function (rs){
                if(rs.errMsg){
                    alert(rs.errMsg);
                    return;
                }
                atlasPicCommentsZanCai();
                alert(t[type-1]+'+1');
            }, function (err){
                alert(err.data.data.errMsg);
            });
        };
    });

//精彩图集评论页
angular.module('app').controller(
    'atlasGetPicCommentCtrl',
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
        watchTabfactory
    ) {
        $scope.stateParams = $stateParams;

        $scope.title = $stateParams.title;

        $scope.mainWrapper = $('.photoswipe-comments-main');

        function refresh(){
            watchTabfactory.refresh($scope, 'getAtlasGetPicComment');
        }
        
        refresh();

        $scope.sendComment = function (content){
            if(!content){
                alert('不能为空');
                return;
            }
            connector.atlasPicAddComment({
                uid: config.uid(),
                pid: $stateParams.pid,
                content: content,
            }).then(function (rs){
                $scope.commentContent = '';
                refresh();
            }, function (err){
                console.error(err, 'for audio/comment api error info');
                alert(err.data.data.errMsg);
            });
        };
    });
