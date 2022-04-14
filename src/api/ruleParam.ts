import { http } from "../utils/http";
import { resultRuleItem, ruleInfo } from "../models/rules";
import { resultHttp } from "../models/httpResult";

// 创建参数校验规则
export const createParamRule = (data: ruleInfo): resultHttp => {
  return http.request("post", "/rule/param/create", { data });
};

// 查询参数校验规则明细
export const qryParamRule = (data: { ruleNo: string }): resultRuleItem => {
  return http.request("post", "/rule/param/detail", { data });
};

// 修改参数校验规则
export const updateParamRule = (data: ruleInfo): resultHttp => {
  return http.request("post", "/rule/param/update", { data });
};
