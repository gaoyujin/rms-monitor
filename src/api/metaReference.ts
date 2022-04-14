import { http } from "../utils/http";
import {
  referenceQueryParam,
  metadataReferenceParam,
  metadataParam
} from "../models/metaReference";
import { resultList } from "../models/metadata";
import { resultHttp } from "../models/httpResult";

// 查询业务应用的字段信息
export const qryMetadataReferences = (
  data: referenceQueryParam
): resultList => {
  return http.request("post", "/metadata/reference/list", { data });
};

// 全量引用关系提交
export const metadataReference = (data: metadataReferenceParam): resultHttp => {
  return http.request("post", "/metadata/reference", { data });
};

// 单条的引用关系添加
export const addMetadataReference = (data: metadataParam): resultHttp => {
  return http.request("post", "/metadata/reference/add", { data });
};

// 单条的引用关系添加
export const deleteMetadataReference = (data: metadataParam): resultHttp => {
  return http.request("post", "/metadata/reference/delete", { data });
};
