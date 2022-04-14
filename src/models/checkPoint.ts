import { pageResult, itemResult, listResult } from "./httpResult";

// 字段信息查询的返回结果
export declare type resultPage = Promise<pageResult<checkPointInfo>>;

// 字段信息查询的返回结果
export declare type resultItem = Promise<itemResult<checkPointInfo>>;

// 字段信息查询的返回结果
export declare type resultRuleItem = Promise<itemResult<refRuleInfo>>;

// 根据业务标识查询 返回接入点信息
export declare type resultAll = Promise<listResult<checkPointList>>;

// 查询接入点和规则绑定
export declare type resultAllRule = Promise<listResult<bindRuleListInfo>>;

// 获取规则的信息集合
export declare type ruleInfoList = Promise<listResult<ruleInfo>>;

// ??????
export declare type businessTypeList = {
  businessCode: string;
  pkFieldName: string;
  secondFieldName: string;
  secondFieldValue: string;
};

// 预处理配置
export declare type preActionListType = {
  preAction: string;
  prefix: string;
  targetFields: string;
};

// 接入点信息
export declare type checkPointInfo = {
  businessNo: string;
  businessTypeList: businessTypeList[];
  checkDuplicate: boolean;
  code: string;
  defaultPkFieldName: string;
  label: string;
  memo: string;
  preActionList: preActionListType[];
  syncInstance: string;
};

// 规则修改的历史信息
export declare type ruleHistoryDetailsType = {
  ruleAgenda: string;
  ruleContent: string;
  opDateTime?: string;
  opUserUid?: string;
  opUserName?: string;
};

// 规则信息
export declare type refRuleInfo = {
  code: string; // 关联的接入点标识
  ruleAgenda: string;
  ruleContent: string;
  ruleHistoryDetails: ruleHistoryDetailsType[];
  status: string;
};

// 修改规则信息
export declare type upDateRuleInfo = {
  code: string; // 关联的接入点标识
  ruleAgenda: string;
  ruleContent: string;
  ruleType: string; // 提供类型文字
};

// 规则信息
export declare type addRuleInfo = {
  code: string; // 关联的接入点标识
  ruleContent: string;
  ruleType: string; // 提供类型文字
  ruleStatus: string;
};

// 查询相关规则的详情
export declare type refRuleParam = {
  code: string; // 关联的接入点标识
  ruleType: string; // 提供类型文字
};

// 根据业务标识查询的接入点信息
export declare type checkPointList = checkPointInfo & {
  globalRule: {
    ruleAgenda: string;
    status: string;
  };
  preExecuteRule: {
    ruleAgenda: string;
    status: string;
  };
  routeRule: {
    ruleAgenda: string;
    status: string;
  };
};

// 绑定规则
export declare type bindRuleInfo = {
  bindRuleNos: string[];
  code: string; // 接入点标识
};

// 查询接入点绑定规则情况
// 接入点在绑定规则时， 显示的是规则那些信息？
// 这个接口返回了绑定的和未绑定的，是否考虑添加接口：原因：设计的原则 职责单一
//   a- 接入点能获取的所有规则信息列表
//   b- 接入点绑定的规则信息列表
//   c- 加上现在这个就比较理想。
export declare type ruleInfo = {
  ruleDescription: string;
  ruleNo: string;
};

export declare type bindRuleListInfo = {
  bandRules: ruleInfo[];
  unBindRules: ruleInfo[];
};
