# Marlog

#### 项目介绍
一个网页页面显示控制台打印日志,并格式化显示的js库.

很多页面效果和js逻辑,在电脑开发时,正常显示与正常运行,但是到很多手机上就无法支持,开发人员又无法获取报错信息,给移动开发带来了极大的不便.有了Mlog,网页开发可以不用F12, 就可以直接查看控制台打印的日志,大大方便了前端开发和调试,尤其是在无法查看控制台的移动端,微信端.

预览网址:[https://mlog.nongshiye.com](https://mlog.nongshiye.com)
<p>
<img src="https://mlog.nongshiye.com/img/111.jpg" width="300">
</p>
<p>
<img src="https://mlog.nongshiye.com/img/222.jpg" width="300">
</p>
<p>
<img src="https://mlog.nongshiye.com/img/333.jpg" width="300">
</p>
<p>
<img src="https://mlog.nongshiye.com/img/444.jpg" width="300">
</p>

#### 软件架构
软件采用es6开发,gulp 打包


#### 安装教程

1. 暂时只支持html页面直接引入js文件,后续会增加npm,bower等包管理平台
2. 引入很简单,只需3步即可

  ①引入js文件
	<pre>
	<code><script src="https://marlog.nongshiye.com/js/Mlog.min.js"></script></code>
	</pre>	
  ②初始化Mlog
	<pre>
	<code><script>
		window.onload=function(){
			var mlog = new Mlog();
		}		
	</script></code>
	</pre>
    ③在需要显示调试器时调用<code>mlog.show()</code>方法或者<code>getMlog().show()</code>即可
	<pre>
	<code><script>
		window.onload=function(){
			var mlog = new Mlog();
			mlog.show()
		}		
	</script></code>
	</pre>

#### 使用说明
1. Mlog只会初始化一次,重置执行<code>new Mlog();</code>只会实例化一次
2. Mlog实例化之后,可以动过<code>getMlog()</code>方法获得Mlog实例
3. 请尽量避免生产环境使用Mlog打印敏感信息,以防信息泄露;同时,提高<code>.show()</code>方法调用的门槛,防止用户误触发
4. Mlog实例化后提供几个简单API可用调用

	##### ①window.getMlog()
	返回Mlog实例
	##### ②show()
	显示调试器
	##### ③close()
	关闭调试器
	  


