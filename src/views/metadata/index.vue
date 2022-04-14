<script lang="ts">
export default {
  name: "metadata"
};
</script>

<script setup lang="ts">
import { reactive, computed } from "vue";
import PageLayout from "/@/layout/listPage/PageLayout.vue";
import Pagination from "/@/layout/listPage/Pagination.vue";
import { Plus } from "@element-plus/icons-vue";
import { ElMessageBox } from "element-plus";

import { metadataInfo, metadataParam } from "/@/models/metadata";
import { pageQryMetadata } from "/@/api/metadata";
import EditMetadata from "./editForm.vue";
import { deleteMetadata } from "/@/api/metadata";
import { useMetadataStoreHook } from "/@/store/modules/metadata";
import { SUCCESS, successMessage, errorMessage } from "/@/utils/message/index";

const tableResult: metadataInfo[] = [];

const refData = reactive({
  total: 0,
  pagination: {
    pageSize: 15,
    currentPage: 1
  },
  tableData: tableResult,
  isEdit: false,
  isShow: false,
  selectRow: null,
  ParentName: "",
  searchForm: {
    fieldName: "",
    fieldKey: "",
    alias: "",
    tag: ""
  }
});

// 查询元数据字段
const queryTableData = async () => {
  const param: metadataParam = {
    alias: refData.searchForm.alias,
    fieldKey: refData.searchForm.fieldKey,
    fieldName: refData.searchForm.fieldName,
    pageNum: refData.pagination.currentPage,
    pageSize: refData.pagination.pageSize,
    tag: refData.searchForm.tag
  };

  const result = await pageQryMetadata(param);
  if (result.resultCode.toUpperCase() != SUCCESS) {
    errorMessage("查询业务元数据失败，原因：" + result.errorCodeDes);
    return;
  } else {
    refData.tableData = result.series;
    refData.total = result.totalCount;
  }
};
queryTableData();

// 触发查询
const searchEvent = () => {
  queryTableData();
};

// 重置查询信息
const resetSearch = () => {
  refData.searchForm.alias = "";
  refData.searchForm.fieldKey = "";
  refData.searchForm.fieldName = "";
  refData.searchForm.tag = "";
};

// 编辑字段
const editHandler = (row?: metadataInfo) => {
  refData.selectRow = row;
  refData.isShow = true;
  refData.isEdit = true;
};

// 删除字段
const deleteHandler = async (row?: metadataInfo) => {
  ElMessageBox.confirm("确认要删除该元数据吗?", "删除确认", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "info"
  }).then(async () => {
    const result = await deleteMetadata({ id: row.id });
    if (result.resultCode.toUpperCase() != SUCCESS) {
      errorMessage("删除元数据字段失败，信息为：" + result.errorCodeDes);
      return;
    } else {
      // 刷新存储数据
      useMetadataStoreHook().refreshMetadata();
      successMessage("删除元数据字段成功。");
      refreshList();
    }
  });
};

// 分页条数变更
const pageSizeChangeHandler = (size: number) => {
  refData.pagination.pageSize = size;
  refreshList();
};

// 分页变更
const currentPageChangeHandler = (page: number) => {
  refData.pagination.currentPage = page;
  refreshList();
};

// 新增
const onAdd = () => {
  refData.isShow = true;
  refData.isEdit = false;
  refData.selectRow = null;
};

// 关闭表单编辑状态
const closeFormDialog = (status: boolean) => {
  refData.isShow = status;
};

// 刷新数据
const refreshList = () => {
  queryTableData();
};

// 设置表格高度
const setTableHeight = computed((): number => {
  console.log("高度：" + (window.innerHeight - 376));
  return window.innerHeight - 376;
});
</script>

<template>
  <page-layout :currentShowHeader="false" page-title="">
    <!-- 查询部分 -->
    <template v-slot:search>
      <el-form :model="refData.searchForm" label-width="120px">
        <el-row class=".el-form--row">
          <el-col :span="12">
            <el-form-item label="英文名称：">
              <el-input v-model="refData.searchForm.fieldKey" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="字段名称：">
              <el-input v-model="refData.searchForm.fieldName" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12"
            ><el-form-item label="标签：">
              <el-input v-model="refData.searchForm.tag" /> </el-form-item
          ></el-col>
          <el-col :span="12">
            <el-form-item label="别名：">
              <el-input v-model="refData.searchForm.alias" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item class="el-row--buttons">
              <el-button type="primary" @click="searchEvent">查询</el-button>
              <el-button @click="resetSearch">重置</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </template>

    <!-- 工具栏 -->
    <vxe-toolbar ref="xToolbar" class="vxe-toolbar--class">
      <template #tools>
        <el-row>
          <el-button
            key="rule-edit"
            title="新增"
            type="primary"
            @click="onAdd"
            :icon="Plus"
            circle
          />
        </el-row>
      </template>
    </vxe-toolbar>
    <!-- 列表 -->
    <el-table
      border
      :height="setTableHeight"
      :data="refData.tableData"
      style="width: 100%"
      :header-cell-style="{ background: '#f8f8f9', color: '#606266' }"
    >
      <el-table-column type="index" align="center" label="#" width="50" />
      <el-table-column prop="fieldKey" label="英文名称" width="180" />
      <el-table-column prop="fieldName" label="字段名称" width="220" />
      <el-table-column prop="fieldType" label="类型" width="100" />
      <el-table-column prop="tags" label="标签" />
      <el-table-column prop="aliases" label="别名" />
      <el-table-column label="操作" align="center" width="100">
        <template #default="{ row }">
          <el-button type="text" @click="editHandler(row)">编辑</el-button>
          <el-button type="text" @click="deleteHandler(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <template v-slot:pagination>
      <Pagination
        :current-page="refData.pagination.currentPage"
        :page-size="refData.pagination.pageSize"
        :total="refData.total"
        @size-change="pageSizeChangeHandler"
        @current-change="currentPageChangeHandler"
      ></Pagination>
    </template>

    <!-- 新增编辑表单 -->
    <EditMetadata
      @close-dialog="closeFormDialog"
      @refresh-list="refreshList"
      :isEdit="refData.isEdit"
      :selectRow="refData.selectRow"
      :isShow="refData.isShow"
      :small="true"
    ></EditMetadata>
  </page-layout>
</template>

<style scoped>
.el-row--buttons /deep/ .el-form-item__content {
  display: flex;
  justify-content: center;
}

.page-main-layout /deep/ .vxe-toolbar {
  background-color: #f0f2f5;
  color: "#606266";
}

.vxe-toolbar--class {
  padding-right: 5px;
  margin-bottom: -5px;
  height: 50px;
  line-height: 50px;
  float: right;
}
</style>
