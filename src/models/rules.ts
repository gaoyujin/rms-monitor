import { itemResult, listResult } from "./httpResult";

// 业务阶段下的规则信息集合
export declare type resultList = Promise<listResult<ruleInfo>>;

// 相关的流量信息集合
export declare type resultFlowList = Promise<listResult<quotaFlowInfo>>;

// 获取规则详情信息
export declare type resultRuleItem = Promise<itemResult<ruleInfo>>;

// 查询规则基础信息
export declare type resultRuleBaseInfo = Promise<itemResult<RuleBaseInfoData>>;

// 字典类型的通用实体对象
export declare type dicCommonType = {
  code: string;
  label: string;
};

// 规则基础信息
export declare type RuleBaseInfoData = {
  // 策略等级
  policyLevelList: dicCommonType[];
  // 策略分类
  policyTypeList: dicCommonType[];
  // 处理类型
  processTypeList: dicCommonType[];
  // 规则组
  ruleGroupList: dicCommonType[];
  // 规则标签
  ruleTagList: dicCommonType[];
  // 规则类型
  statusArray?: dicCommonType[];
  // 规则状态
  statusType?: dicCommonType[];
};

// 参数校验模式的相关信息
export declare type metadataItem = {
  // 元数据字段id
  metadataId: string;
  // 是否可以为空
  nullable: boolean;
};

// 限额限次的流量信息
export declare type quotaFlowInfo = {
  // 流量标识
  flowId: string;
  // 流量名称
  flowName: string;
  // 维度相关的信息
  dimensions?: quotaDimensionItem[];
};

// 限额限次的流量下的相关维度信息
export declare type quotaDimensionItem = {
  // 维度key
  dimension: string;
  // 阈值
  quotaValue: number;
};

// 通用的规则信息
export declare type ruleInfo = {
  // 是否异步执行
  asyncExecute: boolean;
  // 业务编号
  businessNo?: string;
  // 规则生效结束时间(yyyy-MM-dd)
  endTime?: string;
  // 备注
  memo?: string;
  // 策略等级
  policyLevel?: string;
  // 策略分类
  policyType?: string;
  // 处理类型
  processType?: string;
  // 规则描述
  ruleDescription: string;
  // 规则组
  ruleGroup?: string;
  // 规则名称
  ruleName?: string;
  // 规则编号
  ruleNo: string;
  // 规则种类(限额限次/黑白名单/自定义) [ param, quota, blackWhiteList, custom ]
  ruleType: string;
  // 规则生效开始时间(yyyy-MM-dd)
  startTime?: string;
  // 规则状态(online/offline)
  status: string;
  // 规则标签
  tags?: string[];

  // 限额限次的风控流量服务流量编号
  flowNo?: string;
  // 限额限次的规则设定
  quotaDimensions?: quotaDimensionItem[];

  // 参数校验字段列表
  metadatas?: metadataItem[];

  // 规则内容(自定义规则时必填)
  ruleContent?: string;
};
