import { defineStore } from "pinia";
import { store } from "/@/store";
import { cloneDeep } from "lodash-unified";
import { queryParamType, businessInfo, bizType } from "/@/models/business";
import { RuleBaseInfoData } from "/@/models/rules";
import { queryBusiness, getBizType } from "/@/api/business";
import { convertBusinessInfo } from "/@/views/business/logic/convertModel";
import { SUCCESS } from "/@/utils/message/index";

const businessType: businessInfo[] = [];
const typeList: bizType[] = [];
const ruleBaseInfoType: RuleBaseInfoData = null;

export const useBusinessStore = defineStore({
  id: "rms-business",
  state: () => ({
    businessList: businessType,
    bizTypeList: typeList,
    ruleBaseInfo: ruleBaseInfoType
  }),
  actions: {
    SET_BUSINESSDATA(data) {
      this.businessList = data;
    },
    SET_BIZTYPE(data) {
      this.bizTypeList = data;
    },
    // 新增、修改、删除等操作需要更新数据
    async refreshBusinessData() {
      this.SET_BUSINESSDATA(await this.queryBusinessData());
    },
    // 获取所有的业务类型的相关数据
    async queryBusinessData(): Promise<businessInfo[]> {
      const queryParam: queryParamType = {
        pageNum: 1,
        pageSize: 5000,
        businessName: "",
        businessType: ""
      };

      return new Promise<businessInfo[]>((resolve, reject) => {
        queryBusiness(queryParam)
          .then(result => {
            let list: businessInfo[] = [];
            if (result.resultCode.toUpperCase() != SUCCESS) {
              console.error(result.errorCodeDes);
            } else {
              list = convertBusinessInfo(result.series);
            }
            resolve(list);
          })
          .catch(error => {
            reject(error);
          });
      });
    },
    // 查询相关的业务类型
    async queryBusiness(businessName?: string, businessType?: string) {
      if (!this.businessList || this.businessList.length < 1) {
        this.SET_BUSINESSDATA(await this.queryBusinessData());
      }
      let filterResult: businessInfo[] = [];

      // 根据名称查询
      if (businessName) {
        filterResult = this.businessList.filter(item =>
          item.businessName.includes(businessName)
        );
      } else {
        filterResult = cloneDeep<businessInfo[]>(this.businessList);
      }
      // 根据类型查询
      if (businessType) {
        filterResult = filterResult.filter(
          item => item.businessType == businessType
        );
      }

      return filterResult;
    },
    // 获取所有的业务类型数据
    queryAllType(): Promise<bizType[]> {
      return new Promise<bizType[]>((resolve, reject) => {
        getBizType()
          .then(result => {
            let list: bizType[] = [];
            if (result.resultCode.toUpperCase() != SUCCESS) {
              console.error(result.errorCodeDes);
            } else {
              list = result.series;
            }
            resolve(list);
          })
          .catch(error => {
            reject(error);
          });
      });
    },
    // 查询相关的业务类型
    async queryBizType() {
      if (!this.bizTypeList || this.bizTypeList.length < 1) {
        const result = await this.queryAllType();
        this.SET_BIZTYPE(result);
      }
      return this.bizTypeList;
    },
    // 获取某个业务类型的信息
    async getBusinessInfo(businessNo: string): Promise<businessInfo> {
      const allBusiness = await this.queryBusiness();
      let result: businessInfo = null;

      if (!allBusiness || !allBusiness.length) {
        return result;
      }

      // 循环顶层的数据，找到当前操作的业务类型
      for (let i = 0; i < allBusiness.length; i++) {
        const item = allBusiness[i];
        const exist = this.getInfoByNO(item, businessNo);
        if (exist) {
          result = item;
          break;
        }
      }
      return result;
    },
    // 计算上层路径
    async computeParentPath(businessNo: string): Promise<businessInfo> {
      const allBusiness = await this.queryBusiness();
      let result: businessInfo = null;

      if (!allBusiness || !allBusiness.length) {
        return result;
      }

      // 循环顶层的数据，找到当前操作的业务类型
      for (let i = 0; i < allBusiness.length; i++) {
        const item = allBusiness[i];
        const exist = this.getPathByNO(item, businessNo);
        if (exist) {
          result = item;
          break;
        }
      }
      return result;
    },
    // 获取数据的路径
    getPathByNO(actionItem: businessInfo, businessNo: string): boolean {
      if (actionItem.businessNo === businessNo) {
        return true;
      }

      let flag = false;
      if (actionItem.children && actionItem.children.length > 0) {
        const actionList = actionItem.children;

        for (let i = 0; i < actionList.length; i++) {
          const item = actionList[i];
          const exist = this.getPathByNO(item, businessNo);
          if (exist) {
            flag = exist;
            break;
          }
        }
      }
      return flag;
    },
    // 获取某个业务信息
    getInfoByNO(actionItem: businessInfo, businessNo: string): businessInfo {
      if (actionItem.businessNo === businessNo) {
        return actionItem;
      }

      let result: businessInfo = null;
      if (actionItem.children && actionItem.children.length > 0) {
        const actionList = actionItem.children;

        for (let i = 0; i < actionList.length; i++) {
          const item = actionList[i];
          const objItem = this.getInfoByNO(item, businessNo);
          if (objItem) {
            result = objItem;
            break;
          }
        }
      }
      return result;
    }
  }
});

export function useBusinessStoreHook() {
  return useBusinessStore(store);
}
