<script lang="ts">
export default {
  name: "viewDetail"
};
</script>

<script setup lang="ts">
import { watch, reactive, ref, computed } from "vue";
import { ArrowRight } from "@element-plus/icons-vue";
import { useRoute, useRouter } from "vue-router";

import { getBusinessInfo } from "/@/api/business";
import PageLayout from "/@/layout/listPage/PageLayout.vue";
import PointList from "/@/views/checkPoint/pointList.vue";
import RuleList from "/@/views/rules/ruleList.vue";
import ColumList from "/@/views/metadata/columList.vue";

import { businessViewInfo, businessInfo } from "/@/models/business";
import { useBusinessStoreHook } from "/@/store/modules/business";
import { useMultiTagsStoreHook } from "/@/store/modules/multiTags";
import { SUCCESS, errorMessage } from "/@/utils/message/index";

const route = useRoute();
const router = useRouter();

let loading = ref<boolean>(true);
const viewType: businessViewInfo = null;
const pathType: businessInfo[] = [];
const selectType: businessInfo = null;

// 表单的数据信息
const refData = reactive({
  selectRow: selectType,
  viewTitle: "业务配置",
  businessDesc: "",
  businessNo: "",
  viewInfo: viewType,
  itemPath: pathType,
  isEdit: false,
  isShow: false
});

// 超长的时候，添加...
const businessDescFilter = computed(() => {
  let resultVal = "";
  if (refData.businessDesc && refData.businessDesc.length > 300) {
    resultVal = refData.businessDesc.slice(0, 300) + "...";
  } else {
    resultVal = refData.businessDesc;
  }
  return resultVal;
});

// 获取业务的路径信息
const getItemPath = async (businessNo: string, allItem: businessInfo[]) => {
  const item = await useBusinessStoreHook().computeParentPath(businessNo);
  refData.itemPath = [];
  const actionItem = allItem.find(element => element.businessNo === businessNo);
  setItemPath(actionItem, allItem);

  // 删除当前的业务类型
  if (refData.itemPath && refData.itemPath.length > 0) {
    refData.itemPath.shift();
  }

  refData.itemPath.reverse();
};

// 数据扁平化
const getItemArray = (item: businessInfo, allItem: businessInfo[]): void => {
  if (item) {
    allItem.push(item);
  }

  if (item && item.children) {
    item.children.forEach(element => {
      getItemArray(element, allItem);
    });
  }
};

// Path信息获取
const setItemPath = (item: businessInfo, allItem: businessInfo[]) => {
  if (!item) {
    return;
  }

  refData.itemPath.push(item);
  if (item.parentBusinessNo) {
    const actionItem = allItem.find(
      element => element.businessNo === item.parentBusinessNo
    );

    setItemPath(actionItem, allItem);
  }
};

// 父组件传递的信息响应
watch(
  () => route.query,
  async () => {
    if (route.query && route.query["id"]) {
      const parentInfo = await useBusinessStoreHook().getBusinessInfo(
        route.query["id"].toString()
      );

      if (parentInfo && parentInfo.businessNo) {
        // 扁平化
        let allItem: businessInfo[] = [];
        getItemArray(parentInfo, allItem);

        const findItems = allItem.filter(
          item => item.businessNo === route.query["id"]
        );

        if (findItems && findItems.length > 0) {
          refData.selectRow = findItems[0];
          refData.viewTitle = refData.selectRow.businessName;
          refData.businessDesc = refData.selectRow.businessDesc;
          refData.businessNo = refData.selectRow.businessNo;
          if (refData.businessNo && refData.businessNo.length > 0) {
            getItemPath(refData.businessNo, allItem);
          }
        }
      }
    }
  },
  { immediate: true }
);

// 获取业务类型的相关信息
const getViewInfo = async () => {
  const result = await getBusinessInfo({ businessNo: refData.businessNo });

  if (result.resultCode.toUpperCase() != SUCCESS) {
    errorMessage("查询业务信息失败，原因：" + result.errorCodeDes);
    return;
  } else {
    refData.viewInfo = result.item;
  }
};

getViewInfo();

// 查看业务类型
const viewClick = (row: businessInfo) => {
  useMultiTagsStoreHook().handleTags("push", {
    path: `/business/viewDetail`,
    parentPath: `/business/index`,
    name: "viewDetail",
    query: { id: String(row.businessNo) },
    meta: {
      title: "【配置】" + row.businessName,
      showLink: false,
      keepAlive: true,
      i18n: false,
      dynamicLevel: 3
    }
  });
  router.push({
    name: "viewDetail",
    query: { id: String(row.businessNo) }
  });
};
</script>

<template>
  <page-layout :currentShowHeader="false" page-title="">
    <el-row style="margin: 0px" :gutter="24">
      <!-- 业务描述 -->
      <el-col
        style="margin-bottom: 20px"
        v-motion
        :initial="{
          opacity: 0,
          y: 100
        }"
        :enter="{
          opacity: 1,
          y: 0,
          transition: {
            delay: 200
          }
        }"
      >
        <el-card>
          <template #header>
            <span>业务描述</span>
          </template>
          <el-skeleton animated :rows="2" :loading="loading">
            <template #default>
              <el-row class="row-bg">
                <el-col :span="24">
                  <div class="divDesc">上层业务：</div>
                  <el-breadcrumb :separator-icon="ArrowRight">
                    <template
                      v-if="refData.itemPath && refData.itemPath.length > 0"
                    >
                      <el-breadcrumb-item
                        :key="item.businessNo"
                        v-for="item in refData.itemPath"
                        @click="viewClick(item)"
                        ><span style="cursor: pointer">{{
                          item.businessName
                        }}</span></el-breadcrumb-item
                      >
                    </template>
                    <template v-else>
                      <el-breadcrumb-item title="无响应事件"
                        >已是顶层</el-breadcrumb-item
                      >
                    </template>
                  </el-breadcrumb>
                </el-col>
              </el-row>
              <el-row class="row-bg">
                <el-col :span="24">
                  <div class="divDesc">说明：</div>
                  <span class="divSpan" :title="refData.businessDesc">
                    {{ businessDescFilter }}
                  </span>
                </el-col>
              </el-row>
            </template>
          </el-skeleton>
        </el-card>
      </el-col>

      <!-- 关联接入点 -->
      <el-col
        style="margin-bottom: 20px"
        v-motion
        :initial="{
          opacity: 0,
          y: 100
        }"
        :enter="{
          opacity: 1,
          y: 0,
          transition: {
            delay: 200
          }
        }"
      >
        <PointList :viewData="refData.viewInfo"></PointList>
      </el-col>

      <!-- 关联规则 -->
      <el-col
        style="margin-bottom: 20px"
        v-motion
        :initial="{
          opacity: 0,
          y: 100
        }"
        :enter="{
          opacity: 1,
          y: 0,
          transition: {
            delay: 200
          }
        }"
      >
        <RuleList :viewData="refData.viewInfo"></RuleList>
      </el-col>

      <!-- 关联元数据 -->
      <el-col
        style="margin-bottom: 20px"
        v-motion
        :initial="{
          opacity: 0,
          y: 100
        }"
        :enter="{
          opacity: 1,
          y: 0,
          transition: {
            delay: 200
          }
        }"
      >
        <ColumList :viewData="refData.viewInfo"></ColumList>
      </el-col>
    </el-row>
  </page-layout>
</template>

<style scoped>
.divDesc {
  width: 90px;
  float: left;
  text-align: right;
}

.divSpan {
  font-size: 14px;
  color: var(--el-table-text-color);
}

.row-bg {
  padding: 5px 0;
}

.row-bg /deep/ .el-breadcrumb__item {
  padding-top: 6px !important;
}

.el-card /deep/ .el-card__body {
  padding: 10px !important;
}

.el-card /deep/ .el-card__header {
  padding-top: 8px !important;
  padding-left: 10px !important;
  padding-right: 10px !important;
  padding-bottom: 15px !important;
}

.el-card /deep/ .el-card__header > span {
  font-weight: bold !important;
  font-size: 16px;
  padding-left: 17px;
}

.el-card /deep/ .el-card__header button {
  float: right;
}

.el-card /deep/ .el-card__header .el-row {
  float: right;
}

.el-card /deep/ .el-card__header > span:before {
  position: absolute;
  content: " ";
  width: 3px;
  background-color: #4a90e2 !important;
  background-color: var(--color-primary);
  border-radius: 2px;
  overflow: hidden;
  height: 4px;
  width: 14px;
  left: 18px;
  margin-top: 5px;
}
</style>
