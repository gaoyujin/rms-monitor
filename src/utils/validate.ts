// 接入点标识验证
const validateBizNO = (rule: any, value: any, callback: any) => {
  if (value === "") {
    callback(new Error("请输入相关信息"));
  } else {
    const pattern = /^[a-zA-Z][a-zA-Z0-9_]{3,25}$/;
    const test = pattern.test(value);
    if (!test) {
      callback(
        new Error("只能输入：字母开头，允许4-26字节，允许字母数字下划线。")
      );
    }
    callback();
  }
};

export { validateBizNO };
