import { http } from "../utils/http";
import {
  metadataInfo,
  resultList,
  metadataParam,
  resultPage,
  detailResult
} from "../models/metadata";
import { resultHttp } from "../models/httpResult";

// 创建字段定义
export const createMetadata = (data: metadataInfo): resultHttp => {
  return http.request("post", "/metadata/global/create", { data });
};

// 删除某个字段
export const deleteMetadata = (data: { id: string }): resultHttp => {
  return http.request("post", "/metadata/global/delete", { data });
};

// 查询字段的具体信息
export const qryMetadataDetail = (data: { id: string }): detailResult => {
  return http.request("post", "/metadata/global/detail", { data });
};

// 查询不分页的字段信息集合
export const qryMetadatas = (data: {}): resultList => {
  return http.request("post", "/metadata/global/list", { data });
};

// 分页查询字段信息集合
export const pageQryMetadata = (data: metadataParam): resultPage => {
  return http.request("post", "/metadata/global/pageQry", { data });
};

// 修改字段的信息
export const updateMetadata = (data: metadataInfo): resultHttp => {
  return http.request("post", "/metadata/global/update", { data });
};
