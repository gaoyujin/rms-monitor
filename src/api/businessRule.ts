import { http } from "../utils/http";
import {
  resultList,
  resultFlowList,
  resultRuleBaseInfo
} from "../models/rules";
import { resultHttp } from "../models/httpResult";

// 规则内容编译
export const contentCompile = (data: { ruleContent: string }): resultHttp => {
  return http.request("post", "/rule/contentCompile", { data });
};

// 删除规则
export const deleteRule = (data: { ruleNo: string }): resultHttp => {
  return http.request("post", "/rule/delete", { data });
};

// 查询业务阶段下面的规则列表信息
export const qryRules = (data: { businessNo: string }): resultList => {
  return http.request("post", "/rule/list", { data });
};

// 查询规则基础信息
export const qryRuleBaseInfo = (data: {}): resultRuleBaseInfo => {
  return http.request("get", "/rule/qryBaseInfo", { data });
};

// 规则上下线
export const changeRuleStatus = (data: { ruleNo: string }): resultHttp => {
  return http.request("post", "/rule/status/change", { data });
};

// 查询限额限次的流量信息
export const qryQuotaFlows = (data: {}): resultFlowList => {
  return http.request("post", "/rule/quotaFlows", { data });
};
