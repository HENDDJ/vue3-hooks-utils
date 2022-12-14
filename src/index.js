// 统一前端DOM事件绑定用法,支持防抖与节流,返回removeEvent用于解绑事件
import { ref, watch, unref } from 'vue';

/**
* @fn : 要执行的函数
* @delay : 执行函数的时间间隔
*/ 
function debounce(fn,delay){
    let timer; // 定时器
    return function(...args){ // 形成闭包     
        // args 为函数调用时传的参数。
        let context = this; 
        timer&&clearTimeout(timer); // 当函数再次执行时，清除定时器，重新开始计时
        // 利用定时器，让指定函数延迟执行。
        timer = setTimeout(function(){
            // 执行传入的指定函数，利用apply更改this绑定和传参
            fn.apply(context,args);
        },delay)
    }
}

/**
* @fn : 要执行的函数
* @delay : 每次函数的时间间隔
*/  
function throttle(fn,delay){
    let timer;    // 定时器
 
    return function(...args){
        let context = this;
        // 如果timer存在，说明函数还未该执行
        if(timer) return;
        timer = setTimeout(function(){
            // 当函数执行时，让timer为null。
            timer = null;
            fn.apply(context,args);
        },delay);
    }
}

export function useEventListener({
    el = window,
    name,
    listener,
    options,
    isDebounce = true,
    wait = 80,
}) {
    let remove = () => { };
    const isAddRef = ref(false);
    if (el) {
        const element = ref(el);
        const handler = isDebounce ? debounce(listener, wait) : throttle(listener, wait);
        const realHandler = wait ? handler : listener;
        const removeEventListener = (e) => {
            isAddRef.value = true;
            e.removeEventListener(name, realHandler, options);
        };
        const addEventListener = (e) => e.addEventListener(name, realHandler, options);
        const removeWatch = watch(
            element,
            (v) => {
                if (v) {
                    !unref(isAddRef) && addEventListener(v);
                }
            },
            { immediate: true },
        );
        remove = () => {
            removeEventListener(element.value);
            removeWatch();
        };
    }
    return { removeEvent: remove };
}
// const { removeEvent } = useEventListener({
//     el: window,
//     name: 'resize',
//     listener: resizeFn,
// });
// removeResizeFn = removeEvent;




// 什么是npm包
// 如何制作npm包
//  新建一个node项目
// 最后发布流程
//     首先得有账号，需要去注册
//     命令行登录 npm login
//     发布 npm publish
//     可能会因为名称重复等原因失败，删除包npm unpublish <报名> -force，重新提交
// 既然我们的项目发布到了node上面，那它的版本维护也就不能忽视了。但根据我查看一些比较知名的库的npm页面来看。npm方面，只能作为简单的记录版本号。
// 记录的信息比较少，所以是不能满足我们的需求的。既然npm不行 ，那我们就转换下思路，在其关联的git仓库实现我们需要的功能。
// 如何使用？
//在上述的流程中，涉及到一个版本号的问题。需要脱离于git，形成一套记录在项目里的版本记录。 一般来说，推荐使用release来记录。
// Release是具有changelogs和二进制文件的一级对象，它可以代表超出Git架构本身的一个特定时间点之前的所有项目历史。
// 也就是通过release，不但能够通过源码体现出项目历史，还能通过已经编译好的二进制文件来进一步描述此时的项目状态。
// 推荐一种方法，使用releases-it、changelog管理版本号、上传

//先简单理解release是什么，在了解这个之前，我们需要先知道tag是什么。
//tag，中文名：标签，    
// tag是git给我们提供的用于管理记录版本的功能。比如，我每次在提交时，需要将其设定一个版本（2.0.0），git tag v1.1.0
//，同时将其记录下来，推送到远程， git push origin --tags 或者 git push origin v1.0.0
//；在我需要翻看之前的记录（1.0.0，。。）的时候，我就都能查看到。
// git show v1.0.0

 // release 则是脱离了git本身概念的功能，可以说是代码托管平台（github等）提供的更高层的服务。一般在提交时，会要求填写 tag 名、分支以及相应的发布说明，还可上传编译好的程序、打包好的文件等。
 //在上述TAG的功能上，它额外的提供添加编译好的二进制文件以及其他更多信息等。可以让用户在托管平台，以可视化的方式，获取
 // 更多的版本信息。比如elementUI的release功能

// npm i -D release-it

// "scripts": {
//     "release": "release-it"
//   }
//   初次运行npm run release, 提示 Not authenticated with npm. Please `npm login` and try again.

//   登录 NPM 需要注意切换 NPM 官方地址，执行命令npm config get registry查看镜像地址，必须是https://registry.npmjs.org/，如果不是请修改npm config set registry https://registry.npmjs.org/

//   默认模式：
//   切换版本（例如package.json中） 
//   Git提交、标记、推送 
//   使用挂接执行任何（测试或构建）命令 
//   在GitHub或GitLab创建发布 
//   生成更改日志 
//   发布到npm
//   管理预发布 
//   使用插件扩展 
//   从任何CI/CD环境中发布


//   release-it 单独配置.release-it.json,比如可以先跳过publish
// {
//     "github": {
//       "release": true
//     },
//     "git": {
//       "commitMessage": "release: v${version}"
//     },
//     "npm": {
//       "publish": false
//     },
//     "hooks": {
//       "after:bump": "echo 更新版本成功"
//     },
//     "plugins": {
//       "@release-it/conventional-changelog": {
//         "preset": "见文件",
//         "infile": "CHANGELOG.md"
//       }
//     }
//   }



// 默认情况下，release-it是交互式的，允许您在执行每个任务之前进行确认,
// 通过使用--ci选项，该过程完全自动化，无需提示。将执行配置的任务，如上面第一个动画所示。在持续集成（CI）环境中，此非交互模式将自动激活。

// 使用--only-version可以仅使用提示符来确定版本，并自动执行其余操作。

// 正常流程：变更了一部分代码，一般都要先提交再推送到代码服务器。但我们这边，先commit,不要push
// git add .
// git commit -m 'feat: release-it'
// 或者安装git-cz，规范commit信息， 执行 npm install git-cz -D ，并修改npm scripts 增加 "commit": "git-cz"
// run release 

// 这里生成了changelog但是没有地方进行记录,于是release-it/conventional-changelog
// 安装release-it/conventional-changelog
// npm i @release-it/conventional-changelog -D

// 最后，简单理解一下，release的源码部分吧
