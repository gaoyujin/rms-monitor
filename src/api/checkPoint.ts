import { http } from "../utils/http";
import {
  checkPointInfo,
  resultItem,
  addRuleInfo,
  resultRuleItem,
  upDateRuleInfo,
  resultAll,
  bindRuleInfo,
  resultAllRule,
  ruleInfoList,
  refRuleParam
} from "../models/checkPoint";
import { resultHttp } from "../models/httpResult";

// 创建业务接入点
export const createCheckPoint = (data: checkPointInfo): resultHttp => {
  return http.request("post", "/checkPoint/create", { data });
};

// 删除业务接入点
export const deleteCheckPoint = (data: { code: string }): resultHttp => {
  return http.request("post", "/checkPoint/delete", { data });
};

// 查询业务接入点明细
export const qryCheckPointDetail = (data: { code: string }): resultItem => {
  return http.request("post", "/checkPoint/detail", { data });
};

// 创建业务接入点通用规则
export const createCheckPointGenericRule = (data: addRuleInfo): resultHttp => {
  return http.request("post", "/checkPoint/generic/rule/create", { data });
};

// 业务接入点通用规则明细
export const qryCheckPointGenericRuleDetail = (
  data: refRuleParam
): resultRuleItem => {
  return http.request("post", "/checkPoint/generic/rule/detail", { data });
};

// 修改业务接入点通用规则
export const updateCheckPointGenericRule = (
  data: upDateRuleInfo
): resultHttp => {
  return http.request("post", "/checkPoint/generic/rule/update", { data });
};

// 查询业务接入点列表
export const qryCheckPoints = (data: { businessNo: string }): resultAll => {
  return http.request("post", "/checkPoint/list", { data });
};

// 接入点和规则绑定
export const checkPointRuleBind = (data: bindRuleInfo): resultHttp => {
  return http.request("post", "/checkPoint/rule/bind", { data });
};

// 查询接入点和规则绑定
export const qryCheckPointRuleBind = (data: {
  code: string;
}): resultAllRule => {
  return http.request("post", "/checkPoint/rule/bind/qry", { data });
};

// 查询所有的规则信息
export const qryAllRule = (data: { code: string }): ruleInfoList => {
  return http.request("post", "/checkPoint/allRules", { data });
};

// 查询绑定的规则信息
export const qryBindRuleBind = (data: { code: string }): ruleInfoList => {
  return http.request("post", "/checkPoint/rule/bind/qry", { data });
};

// 修改业务接入点
export const updateCheckPoint = (data: checkPointInfo): resultHttp => {
  return http.request("post", "/checkPoint/update", { data });
};

// 创建or修改业务接入点通用规则
export const createOrUpdateCheckPointGenericRule = (
  data: addRuleInfo
): resultHttp => {
  return http.request("post", "/checkPoint/generic/rule/createOrUpdate", {
    data
  });
};
