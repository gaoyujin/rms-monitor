import { defineStore } from "pinia";
import { store } from "/@/store";
import { cloneDeep } from "lodash-unified";
import { qryMetadatas } from "/@/api/metadata";
import { metadataInfo } from "/@/models/metadata";
import { SUCCESS } from "/@/utils/message/index";

const metadataType: metadataInfo[] = [];

export const useMetadataStore = defineStore({
  id: "rms-metadata",
  state: () => ({
    metadataList: metadataType
  }),
  actions: {
    SET_METADATA(data) {
      this.metadataList = data;
    },
    // 新增、修改、删除等操作需要更新数据
    async refreshMetadata() {
      this.SET_METADATA(await this.queryAllMetadata());
    },
    // 获取所有的公用元数据信息
    async queryAllMetadata(): Promise<metadataInfo[]> {
      return new Promise<metadataInfo[]>((resolve, reject) => {
        qryMetadatas({})
          .then(result => {
            let list: metadataInfo[] = [];
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
    // 通过存储获取
    async queryMetadata() {
      if (!this.metadataList || this.metadataList.length < 1) {
        this.SET_METADATA(await this.queryAllMetadata());
      }
      return cloneDeep<metadataInfo[]>(this.metadataList);
    },
    // 分离那些被引用的元数据
    async filterMetadata(bizMetaData: metadataInfo[]): Promise<metadataInfo[]> {
      const allBusiness = await this.queryMetadata();
      const result: metadataInfo[] = null;

      if (!allBusiness || !allBusiness.length) {
        return result;
      }

      // 循环顶层的数据，找到当前操作的业务类型
      for (let i = 0; i < allBusiness.length; i++) {
        const item = allBusiness[i];

        const exist = bizMetaData.some(
          element => element.fieldKey === item.fieldKey
        );

        // 没有被选择
        if (!exist) {
          result.push(item);
        }
      }
      return result;
    }
  }
});

export function useMetadataStoreHook() {
  return useMetadataStore(store);
}
