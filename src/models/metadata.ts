import { pageResult, itemResult, listResult } from "./httpResult";

// 字段信息查询的返回结果
export declare type resultPage = Promise<pageResult<metadataInfo>>;

// 字段信息查询的返回结果
export declare type resultList = Promise<listResult<metadataInfo>>;

// 查询详情的返回结果
export declare type detailResult = Promise<itemResult<metadataInfo>>;

// 字段查询参数
export declare type metadataParam = {
  alias: string;
  fieldKey: string;
  fieldName: string;
  pageNum: number;
  pageSize: number;
  tag: string;
};

// 字段信息实体
export declare type metadataInfo = {
  fieldDesc: string;
  fieldKey: string;
  fieldName: string;
  fieldType: string;
  tags: string[];
  aliases: string[];
  nullable?: boolean;
  isDefault?: boolean;
  VeriMode?: string;
  Pattern?: string;
  id?: string;
};
