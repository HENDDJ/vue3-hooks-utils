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
// 如何使用
// 推荐另一种方法，使用releases-it、changelog管理版本号、上传

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
//         "preset": "angular",
//         "infile": "CHANGELOG.md"
//       }
//     }
//   }


// 默认情况下，release-it是交互式的，允许您在执行每个任务之前进行确认,
// 通过使用--ci选项，该过程完全自动化，无需提示。将执行配置的任务，如上面第一个动画所示。在持续集成（CI）环境中，此非交互模式将自动激活。

// 使用--only-version可以仅使用提示符来确定版本，并自动执行其余操作。

// 正常流程：变更了一部分代码，一般都要先提交 推送到代码服务器，先commit,不要push
// git add .
// git commit -m 'feat: release-it'

// run realease 

// 这里生成了changelog但是没有地方进行记录,于是release-it/conventional-changelog
// 安装release-it/conventional-changelog
// npm i @release-it/conventional-changelog -D