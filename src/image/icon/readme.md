接口文档地址为：http://14.23.49.202:8081/apiHelp.php

具体的接口调用地址为：http://14.23.49.202:8081/api.php/接口名

如接口名为myfriend，则接口地址为：http://14.23.49.202:8081/api.php/myfriend

APP 体验账号

用户名：jt1@6383.com
密码：j123456

http://112.74.192.59/streaming/5amGreMHho.m3u8   直播测试




头条接口

查看新闻详细页 http://m.fc.6383.com/ApiHelp/News_Details
新闻点赞 http://m.fc.6383.com/ApiHelp/News_Praise
新闻点踩  http://m.fc.6383.com/ApiHelp/News_Tread
获取新闻评论列表 http://m.fc.6383.com/ApiHelp/Comment_GetComments
新闻评论接口 http://m.fc.6383.com/ApiHelp/Comment_Comment
获取新闻资讯相关信息接口（赞/踩数量） http://m.fc.6383.com/ApiHelp/News_GetDetails



把头条，推荐，大咖聊，菠萝秀，菠萝盟，盟活动，充值，商城，我的任务，个人指数的页面链接发我一下

项目url格式  -> http://localhost:9010/?uid=330

头条  -> /#/headlines/1

推荐  -> /#/recommend/1

大咖聊  -> /#/

球迷秀  -> /#/pineapple/fansShow/1

盟聊吧  -> /#/pineapple/postBar/1

盟活动  -> /#/pineapple/activity/1

充值  -> /#/recharge

商城  -> /#/mall

用户  -> /#/user

我的任务  -> /#/task

个人指数  -> /#/charm



<script src='//cdn.bootcss.com/socket.io/1.3.7/socket.io.js'></script>
<script src='//cdn.bootcss.com/jquery/1.11.3/jquery.js'></script>
<script src='/Public/ssxxts/notify.js'></script>
<script>

$(document).ready(function () {
  // 连接服务端
  var socket = io('http://14.23.49.202:2120');
  
  socket.on('connect', function(){
    ///socket.emit('login', uid);
    console.log('connetct success');
  });
  // 后端推送来消息时
  socket.on('new_msg', function(msg){
     $('#content').html('收到消息：'+msg);
     $('.notification.sticky').notify();
  });


  $('#push').click(function() {

      socket.emit('new_msg');
  });

});
</script>

返回参数说明
格式  ｛"code":0,"err":"","data":[{"sign":"mid1,mid2"}]｝mid赛事id sign 接口id

1 请求比分   5时请求人数




大咖聊
——关注微信公众号：菠萝球迷圈，原创节目精彩赛事！大咖赔你聊，你与大咖聊！

星拍客（球迷秀）
——关注微信公众号：菠萝球迷圈。传递你身边的足球，传递我身边的快乐！

菠萝盟（盟聊吧）
——关注微信公众号：菠萝球迷圈。你有支持的球队吗？你是真正的球迷吗？一起聊一聊！

盟活动
——关注微信公众号：菠萝球迷圈。这位同志，还没找到组织吗？全城球迷团队都在这喔！

充值/商城/我的任务/个人指数
——采用通用介绍

头条
——关注微信公众号：菠萝球迷圈，获取足坛新鲜热辣快报！

推荐
——关注微信公众号：菠萝球迷圈，大咖名嘴独家点评篇篇精彩！
