import { http } from "../utils/http";
import { resultRuleItem, ruleInfo } from "../models/rules";
import { resultHttp } from "../models/httpResult";

// 创建限额限次规则
export const createQuotaRule = (data: ruleInfo): resultHttp => {
  return http.request("post", "/rule/quota/create", { data });
};

// 查询限额限次规则明细
export const qryQuotaRule = (data: { ruleNo: string }): resultRuleItem => {
  return http.request("post", "/rule/quota/detail", { data });
};

// 修改限额限次规则
export const updateQuotaRule = (data: ruleInfo): resultHttp => {
  return http.request("post", "/rule/quota/update", { data });
};
