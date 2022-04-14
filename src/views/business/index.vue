<script lang="ts">
export default {
  name: "business"
};
</script>

<script setup lang="ts">
import XEUtils from "xe-utils";
import EditBusiness from "./editForm.vue";
import { templateRef } from "@vueuse/core";
import { reactive, nextTick } from "vue";

import { businessInfo, bizType } from "/@/models/business";
import PageLayout from "/@/layout/listPage/PageLayout.vue";
import { useMultiTagsStoreHook } from "/@/store/modules/multiTags";
import { useRouter } from "vue-router";
import { useBusinessStoreHook } from "/@/store/modules/business";
import { errorMessage } from "/@/utils/message";

const tableResult: Array<businessInfo> = [];
const typeInfo: Array<bizType> = [];
const router = useRouter();

const dictData = reactive({
  pageNum: 1,
  pageSize: 5000,
  total: 0,
  businessName: "",
  businessType: "",
  isEdit: false,
  isShow: false,
  isView: false,
  selectRow: null,
  tableData: tableResult,
  typeItems: typeInfo,
  parentNo: "",
  ParentName: "",
  searchForm: {
    businessType: "",
    businessName: ""
  }
});

// 获取业务类型的信息列表
const queryTableData = async (businessName, businessType, callback) => {
  try {
    dictData.tableData = await useBusinessStoreHook().queryBusiness(
      businessName,
      businessType
    );

    // 查询条件存在的情况下
    if (callback && (businessName || businessType)) {
      callback();
    }
  } catch (err) {
    errorMessage("查询业务信息失败，请联系管理员。");
    throw err;
  }
};

queryTableData(
  dictData.searchForm.businessName,
  dictData.searchForm.businessType,
  null
);

// 获取类型信息并多个组件公用
const queryBizType = async () => {
  try {
    dictData.typeItems = await useBusinessStoreHook().queryBizType();
  } catch (err) {
    errorMessage("查询类型失败，请联系管理员。");
    throw err;
  }
};

queryBizType();

const xTree = templateRef<HTMLElement | any>("xTree", null);

// 查询相关类型
const handleSearch = () => {
  queryTableData(
    dictData.searchForm.businessName,
    dictData.searchForm.businessType,
    () => {
      // 搜索之后默认展开所有子节点
      nextTick(() => {
        const $table = xTree.value;
        $table.setAllTreeExpand(true);
      });
    }
  );
};

// 创建一个防防抖函数，调用频率间隔 100 毫秒
const searchEvent = XEUtils.debounce(
  function () {
    handleSearch();
  },
  100,
  { leading: false, trailing: true }
);

// 查看业务类型
const viewItemInfo = (row: businessInfo) => {
  dictData.isShow = true;
  dictData.selectRow = row;
};

// 新增
const onAdd = () => {
  dictData.parentNo = "";
  dictData.ParentName = "";
  dictData.isShow = true;
  dictData.isEdit = false;
  dictData.selectRow = null;
};

// 新增子类型
const onAddChild = (row: businessInfo) => {
  dictData.parentNo = row.businessNo;
  dictData.ParentName = row.businessName;
  dictData.isShow = true;
  dictData.isEdit = false;
  dictData.selectRow = null;
};

// 编辑
const onEdit = (row?: businessInfo) => {
  dictData.parentNo = "";
  dictData.ParentName = "";
  dictData.selectRow = row;
  dictData.isShow = true;
  dictData.isEdit = true;
};

// 关闭表单编辑状态
const closeFormDialog = (status: boolean) => {
  dictData.isShow = status;
  dictData.isView = status;
};

// 刷新数据
const refreshList = () => {
  queryTableData(
    dictData.searchForm.businessName,
    dictData.searchForm.businessType,
    null
  );
};

// 查看业务类型
const onView = (row: businessInfo) => {
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
    <!-- 工具栏 -->
    <vxe-toolbar>
      <template #buttons>
        <vxe-form :data="dictData.searchForm" @submit="searchEvent">
          <vxe-form-item title="名称：" field="businessName" :item-render="{}">
            <template #default="{ data }">
              <vxe-input
                style="width: 270px"
                v-model="data.businessName"
                placeholder="请输入名称"
                clearable
              ></vxe-input>
            </template>
          </vxe-form-item>
          <vxe-form-item title="类型：" field="businessType" :item-render="{}">
            <template #default="{ data }">
              <vxe-select
                v-model="data.businessType"
                placeholder="请选择类型"
                clearable
              >
                <vxe-option
                  :key="index + '_' + item.businessType"
                  v-for="(item, index) in dictData.typeItems"
                  :label="item.description"
                  :value="item.businessType"
                ></vxe-option>
              </vxe-select>
            </template>
          </vxe-form-item>
          <vxe-form-item>
            <template #default>
              <vxe-button
                type="submit"
                status="primary"
                content="查询"
              ></vxe-button>
              <vxe-button type="reset" content="重置"></vxe-button>
            </template>
          </vxe-form-item>
        </vxe-form>
      </template>
      <template #tools>
        <vxe-button icon="fa fa-plus-square-o" status="primary" @click="onAdd"
          >新增</vxe-button
        >
        <vxe-button
          icon="fa fa-folder-open-o"
          status="primary"
          @click="xTree.setAllTreeExpand(true)"
          >全部展开</vxe-button
        >
        <vxe-button
          icon="fa fa-folder-o"
          status="primary"
          @click="xTree.clearTreeExpand()"
          >全部折叠</vxe-button
        >
      </template>
    </vxe-toolbar>

    <!-- 列表 -->
    <vxe-table
      ref="xTree"
      border
      resizable
      :tree-config="{
        children: 'children',
        iconOpen: 'fa fa-caret-up',
        iconClose: 'fa fa-caret-down',
        line: true
      }"
      :data="dictData.tableData"
    >
      <vxe-column type="seq" width="60"></vxe-column>
      <vxe-column field="businessName" title="名称" tree-node>
        <template #default="{ row }">
          <el-tooltip
            effect="dark"
            :content="'点击查看类型详情：' + row.businessName"
            placement="right"
          >
            <span @click="viewItemInfo(row)" class="text-model">{{
              row.businessName
            }}</span>
          </el-tooltip>
        </template>
      </vxe-column>
      <vxe-column field="businessNo" width="140" title="编号"></vxe-column>
      <vxe-column
        field="businessTypeName"
        width="120"
        title="类型"
      ></vxe-column>
      <vxe-column field="createTime" width="170" title="创建时间"></vxe-column>
      <vxe-table-column
        title="操作"
        align="center"
        header-align="center"
        width="220"
        fixed="right"
      >
        <template #default="{ row }">
          <vxe-button
            type="text"
            status="primary"
            @click="onEdit(row)"
            content="编辑"
          ></vxe-button>

          <vxe-button
            type="text"
            status="primary"
            @click="onAddChild(row)"
            content="新增子业务"
          ></vxe-button>

          <vxe-button
            type="text"
            status="primary"
            @click="onView(row)"
            content="配置"
          ></vxe-button>
        </template>
      </vxe-table-column>
    </vxe-table>

    <!-- 新增编辑表单 -->
    <EditBusiness
      @close-dialog="closeFormDialog"
      @refresh-list="refreshList"
      :isEdit="dictData.isEdit"
      :selectRow="dictData.selectRow"
      :parentNo="dictData.parentNo"
      :parentName="dictData.ParentName"
      :isShow="dictData.isShow"
    ></EditBusiness>
  </page-layout>
</template>

<style lang="scss" scoped>
.vxe-input + .vxe-button,
.vxe-input + .vxe-button--dropdown,
.vxe-button + .vxe-button,
.vxe-button + .vxe-button--dropdown {
  margin-left: 0;
}
.vxe-button.type--button:not(.is--round) {
  border-radius: 0;
}
.vxe-toolbar.size--medium {
  padding: 10px;
  border-radius: 5px;
}
.vxe-table--render-default.size--medium {
  margin-top: 12px;
}
.vxe-button.size--medium.type--button {
  margin-right: 0.07em;
}
.text-model {
  &:hover {
    cursor: pointer;
  }
}
.btnIcon {
  display: flex;
}
</style>
