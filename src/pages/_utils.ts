

/**
 * 计算元素文本的折行信息
 * @param pElement 目标元素
 * @returns 行数、总高度与最后一行宽度
 */
export function getLineCountAndLastLineWidth(pElement:Element) {
    const range = document.createRange();
    range.selectNodeContents(pElement);
    const rects = range.getClientRects();
    const lineCount = rects.length; // 折行次数即为行数
    console.log(rects);
    // 获取最后一行的宽度
    const lastLineWidth = rects[lineCount - 1].width;
    // 获取整体元素的高度
    const totalHeight = Array.from(rects).reduce((pre, cur) => pre + cur.height, 0);
    console.log(totalHeight);
    return {
        lineCount,
        totalHeight,
        lastLineWidth
    };
}


// export function debounce(fn:() => void, wait:number) {
//     let timeout;
//     return function(...args) {
//         let _that = this;
//         timeout && clearTimeout(timeout);
//         timeout = setTimeout(() => {
//             fn.apply(_that, args);
//         }, wait);
//     };
// }
