import { defineStore } from "pinia";
import { store } from "/@/store";
import { cloneDeep } from "lodash-unified";
import { RuleBaseInfoData, dicCommonType } from "/@/models/rules";
import { qryRuleBaseInfo } from "/@/api/businessRule";
import { SUCCESS } from "/@/utils/message/index";

const ruleBaseInfoType: RuleBaseInfoData = null;
const statusArray: dicCommonType[] = [
  {
    label: "参数校验",
    code: "param"
  },
  {
    label: "限额限次",
    code: "quota"
  },
  {
    label: "黑白名单",
    code: "blackWhiteList"
  },
  {
    label: "规则自定义",
    code: "custom"
  }
];

const statusType: dicCommonType[] = [
  {
    label: "上线",
    code: "online"
  },
  {
    label: "下线",
    code: "offline"
  }
];

export const useRuleStore = defineStore({
  id: "rms-rules",
  state: () => ({
    ruleBaseInfo: ruleBaseInfoType
  }),
  actions: {
    SET_BASEINFODATA(data) {
      this.ruleBaseInfo = data;
      this.ruleBaseInfo.statusArray = statusArray;
      this.ruleBaseInfo.statusType = statusType;
    },
    // 从数据库中获取规则的统配信息
    async queryBaseInfoData(): Promise<RuleBaseInfoData> {
      return new Promise<RuleBaseInfoData>((resolve, reject) => {
        qryRuleBaseInfo({})
          .then(result => {
            if (result.resultCode.toUpperCase() != SUCCESS) {
              console.error(result.errorCodeDes);
            } else {
              resolve(result.item);
            }
          })
          .catch(error => {
            reject(error);
          });
      });
    },
    // 从缓存中获取规则的统配信息
    async queryBaseInfoFromCache() {
      if (!this.ruleBaseInfo) {
        this.SET_BASEINFODATA(await this.queryBaseInfoData());
      }

      return cloneDeep<RuleBaseInfoData>(this.ruleBaseInfo);
    }
  }
});

export function useRuleStoreHook() {
  return useRuleStore(store);
}
