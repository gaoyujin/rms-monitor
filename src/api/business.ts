import { http } from "../utils/http";
import {
  businessParamType,
  queryParamType,
  resultPage,
  bizTypePage,
  resultItem
} from "../models/business";
import { resultHttp } from "../models/httpResult";

// 创建业务定义
export const createBusiness = (data: businessParamType): resultHttp => {
  return http.request("post", "/business/definition/create", { data });
};

// 删除某个业务类型
export const deleteBusiness = (data: { businessNo: string }): resultHttp => {
  return http.request("post", "/business/definition/delete", { data });
};

// 修改业务类型信息
export const updateBusiness = (data: businessParamType): resultHttp => {
  return http.request("post", "/business/definition/update", { data });
};

// 业务实体查询的返回结果
export const queryBusiness = (data: queryParamType): resultPage => {
  return http.request("post", "/business/definition/pageQry", { data });
};

// 查看业务的具体信息
export const getBusinessInfo = (data: { businessNo: string }): resultItem => {
  return http.request("get", "/business/definition/detail", { data });
};

// 查询所有的业务类型
export const getBizType = (): bizTypePage => {
  return http.request("get", "/business/definition/type", {});
};
