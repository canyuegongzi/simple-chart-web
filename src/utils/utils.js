export const compare = (property,desc) => {
    return function (a, b) {
        const value1 = a[property];
        const value2 = b[property];
        if(desc==true){
            // 升序排列
            return value1 - value2;
        }else{
            // 降序排列
            return value2 - value1;
        }
    }
}
