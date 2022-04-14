import { metadataInfo } from "/@/models/metadata";

// 引用查询参数
export declare type referenceQueryParam = {
  primary: string;
  primaryType: string;
};

// 字段全量引用参数
export declare type metadataReferenceParam = {
  metadataIds: string[];
  primary: string;
  primaryType: string;
};

// 字段添加/删除单条参数
export declare type metadataParam = {
  metadataId: string;
  primary: string;
  primaryType: string;
};

// 引用的实体
export declare type optionType = metadataInfo & {
  label: string;
};
