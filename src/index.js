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
