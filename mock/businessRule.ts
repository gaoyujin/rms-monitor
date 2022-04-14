import { MockMethod } from "vite-plugin-mock";
import { Random } from "mockjs";
import {
  ruleInfo,
  RuleBaseInfoData,
  quotaDimensionItem,
  quotaFlowInfo
} from "/@/models/rules";

const httpResult = () => {
  const result = {
    errorCode: "",
    errorCodeDes: "",
    resultCode: "SUCCESS"
  };

  return result;
};

const ruleType: ruleInfo[] = [];

const baseInfoType: RuleBaseInfoData = null;

const tableData = () => {
  const result = {
    errorCode: "",
    errorCodeDes: "",
    resultCode: "SUCCESS",
    series: ruleType
  };

  result.series = [];
  for (let index = 0; index < 6; index++) {
    let typeInfo = "param";
    let statusInfo = "online";

    if (index % 3) {
      typeInfo = "quota";
      statusInfo = "offline";
    } else if (index % 2) {
      typeInfo = "custom";
      statusInfo = "offline";
    }

    const itemInfo = {
      asyncExecute: Random.boolean(),
      ruleDescription: Random.csentence(50),
      ruleNo: Random.word(6),
      ruleType: typeInfo,
      status: statusInfo
    };

    result.series.push(itemInfo);
  }

  return result;
};

const ruleItemResult = () => {
  const result = {
    errorCode: "",
    errorCodeDes: "",
    resultCode: "SUCCESS",
    item: {
      asyncExecute: Random.boolean(),
      ruleDescription: Random.csentence(50),
      ruleNo: Random.word(6),
      ruleType: "param",
      status: "offline",
      // 业务编号
      businessNo: "fdarnqdf",
      // 备注
      memo: Random.csentence(50),
      // 策略等级
      policyLevel: "",
      // 策略分类
      policyTypel: "",
      // 处理类型
      processTypel: "",
      // 规则组
      ruleGroupl: "",
      // 规则名称
      ruleName: Random.word(6),
      // 规则生效开始时间(yyyy-MM-dd)
      startTime: "",
      // 规则标签
      tags: ["转账"]
    }
  };

  return result;
};

const baseInfo = () => {
  const result = {
    errorCode: "",
    errorCodeDes: "",
    resultCode: "SUCCESS",
    item: {
      policyLevelList: [],
      processTypeList: [],
      ruleGroupList: [],
      policyTypeList: [],
      ruleTagList: []
    }
  };

  getLevel(result.item.policyLevelList);

  getProcessType(result.item.processTypeList);

  getRuleGroup(result.item.ruleGroupList);

  getPolicyType(result.item.policyTypeList);

  getTags(result.item.ruleTagList);

  return result;
};

const getLevel = item => {
  const level1 = {
    label: "一级",
    code: "POLICY_LEVEL_1"
  };

  const level2 = {
    label: "二级",
    code: "POLICY_LEVEL_2"
  };
  const level3 = {
    label: "三级",
    code: "POLICY_LEVEL_3"
  };
  const level4 = {
    label: "四级",
    code: "POLICY_LEVEL_4"
  };

  item.push(level1);
  item.push(level2);
  item.push(level3);
  item.push(level4);
};

const getProcessType = item => {
  const process1 = {
    code: "001",
    label: "拦截"
  };

  const process2 = {
    code: "002",
    label: "滞留"
  };
  const process3 = {
    code: "003",
    label: "预警"
  };
  const process4 = {
    code: "004",
    label: "监控"
  };

  item.push(process1);
  item.push(process2);
  item.push(process3);
  item.push(process4);
};

const getRuleGroup = item => {
  const group1 = {
    code: "1",
    label: "合规类"
  };

  const group2 = {
    code: "2",
    label: "限制出款类规则"
  };

  const group3 = {
    code: "3",
    label: "冻结类"
  };

  item.push(group1);
  item.push(group2);
  item.push(group3);
};

const getPolicyType = item => {
  const policy1 = {
    code: "POLICY_TYPE_BANK",
    label: "银行卡/账户盗用"
  };

  const policy2 = {
    code: "POLICY_TYPE_CASH",
    label: "套现/洗钱"
  };

  const policy3 = {
    code: "POLICY_TYPE_CHEAT",
    label: "钓鱼欺诈"
  };

  const policy4 = {
    code: "POLICY_TYPE_MOVE",
    label: "移机/套用MCC"
  };

  const policy5 = {
    code: "POLICY_TYPE_OTHER",
    label: "其他"
  };

  const policy6 = {
    code: "POLICY_TYPE_OTHER-REBACK",
    label: "其它-退货"
  };

  const policy7 = {
    code: "POLICY_TYPE_TRANSFRER",
    label: "特定交易类型"
  };

  item.push(policy1);
  item.push(policy2);
  item.push(policy3);
  item.push(policy4);
  item.push(policy5);
  item.push(policy6);
  item.push(policy7);
};

const getTags = item => {
  const tag1 = {
    label: "入款",
    code: "入款"
  };

  const tag2 = {
    label: "转账",
    code: "转账"
  };

  const tag3 = {
    label: "出款",
    code: "出款"
  };

  const tag4 = {
    label: "商户收单",
    code: "商户收单"
  };

  item.push(tag1);
  item.push(tag2);
  item.push(tag3);
  item.push(tag4);
};

const quotaFlowType: quotaFlowInfo[] = [];
const queryQuotaFlows = () => {
  const result = {
    errorCode: "",
    errorCodeDes: "",
    resultCode: "SUCCESS",
    series: quotaFlowType
  };

  for (let index = 0; index < 7; index++) {
    const itemInfo = {
      flowId: Random.word(6),
      flowName: Random.cword(8),
      dimensions: []
    };

    for (let m = 0; m < 4; m++) {
      const sub = {
        dimension: Random.word(6),
        quotaValue: 0
      };

      itemInfo.dimensions.push(sub);
    }

    result.series.push(itemInfo);
  }

  return result;
};

export default [
  {
    url: "/rule/contentCompile",
    method: "post",
    response: () => {
      return httpResult();
    }
  },
  {
    url: "/rule/list",
    method: "post",
    response: () => {
      return tableData();
    }
  },
  {
    url: "/rule/qryBaseInfo",
    method: "get",
    response: () => {
      return baseInfo();
    }
  },
  {
    url: "/rule/param/detail",
    method: "post",
    response: () => {
      return ruleItemResult();
    }
  },
  {
    url: "/rule/quotaFlows",
    method: "post",
    response: () => {
      return queryQuotaFlows();
    }
  },
  {
    url: "/rule/status/change",
    method: "post",
    response: () => {
      return httpResult();
    }
  }
] as MockMethod[];
