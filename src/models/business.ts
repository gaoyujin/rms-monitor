import { pageResult, itemResult } from "./httpResult";
import { checkPointInfo } from "./checkPoint";
import { ruleInfo } from "./rules";

// 查看信息的返回结果
export declare type resultItem = Promise<itemResult<businessViewInfo>>;

// 业务实体查询的返回结果
export declare type resultPage = Promise<pageResult<businessInfo>>;

// 类型分类查询的返回结果
export declare type bizTypePage = Promise<pageResult<bizType>>;

// 业务实体参数模型
export declare type businessParamType = {
  businessNo?: string;
  businessName: string;
  businessType: string;
  parentBusinessNo: string;
  businessDesc: string;
};

// 业务实体信息
export declare type businessInfo = {
  businessDesc: string;
  businessName: string;
  businessNo: string;
  parentBusinessNo: string;
  businessType: string;
  businessTypeName?: string;
  createTime?: string;
  operator?: string;
  status?: string;
  updateTime?: string;
  children?: businessInfo[];
};

// 查询的参数模型
export declare type queryParamType = {
  businessName: string;
  businessType: string;
  pageNum: number;
  pageSize?: number;
};

// 类型分类
export declare type bizType = {
  businessType: string;
  description: string;
};

// 业务信息关联信息模型
declare type businessRefInfo = {
  ruleList?: ruleInfo[];
  checkPointList?: checkPointInfo[];
};

// 查看业务信息的模型
export declare type businessViewInfo = businessInfo & businessRefInfo;
