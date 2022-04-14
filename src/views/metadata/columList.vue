<script lang="ts">
export default {
  name: "columList"
};
</script>

<script setup lang="ts">
import { ref, reactive, watch } from "vue";
import { Setting } from "@element-plus/icons-vue";
import { ElMessageBox } from "element-plus";

import { metadataInfo } from "/@/models/metadata";
import { referenceQueryParam, metadataParam } from "/@/models/metaReference";
import { businessViewInfo } from "/@/models/business";
import { qryMetadataReferences } from "/@/api/metaReference";
import EditMetaTransfer from "/@/views/metadata/editTransfer.vue";
import ViewMetadata from "/@/views/metadata/viewForm.vue";
import { deleteMetadataReference } from "/@/api/metaReference";
import { SUCCESS, successMessage, errorMessage } from "/@/utils/message/index";

let loading = ref<boolean>(true);
const tableResult: metadataInfo[] = [];

// 父组件的数据
const props = defineProps<{
  viewData: businessViewInfo;
}>();

const refData = reactive({
  tableData: tableResult,
  isShowTransfer: false,
  isShowView: false,
  selectRow: null
});

// 查询引用的元数据字段
const queryTableData = async () => {
  if (!props.viewData || !props.viewData.businessNo) {
    return;
  }

  const param: referenceQueryParam = {
    primary: props.viewData.businessNo,
    primaryType: props.viewData.businessType
  };

  const result = await qryMetadataReferences(param);

  if (result.resultCode.toUpperCase() != SUCCESS) {
    errorMessage("查询引用元数据失败，原因：" + result.errorCodeDes);
    return;
  } else {
    refData.tableData = result.series;
  }
};

// 监控业务信息的变更
watch(
  () => props.viewData,
  () => {
    if (props.viewData) {
      queryTableData();
    }
  }
);

// 配置引用
const onSetting = () => {
  refData.isShowTransfer = true;
};

// 引用设置窗体关闭
const closeTransferDialog = (status: boolean) => {
  refData.isShowTransfer = status;
};

// 引用设置窗体关闭刷新数据
const refreshTransfer = () => {
  queryTableData();
};

// 移除引用
const removeReference = async (row: metadataInfo) => {
  ElMessageBox.confirm("确认要移除该引用字段吗?", "移除确认", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "info"
  }).then(async () => {
    const param: metadataParam = {
      primary: props.viewData.businessNo,
      primaryType: props.viewData.businessType,
      metadataId: row.id
    };

    const result = await deleteMetadataReference(param);

    if (result.resultCode.toUpperCase() != SUCCESS) {
      errorMessage("移除引用元数据字段失败，信息为：" + result.errorCodeDes);
      return;
    } else {
      // 刷新存储数据
      successMessage("移除引用元数据字段成功。");
      // 刷新
      refreshTransfer();
    }
  });
};

// 点击查看
const onViewData = (row: metadataInfo) => {
  refData.selectRow = row;
  refData.isShowView = true;
};

// 关闭查看页面
const closeViewDialog = (status: boolean) => {
  refData.isShowView = status;
};
</script>

<template>
  <el-card>
    <template #header>
      <span>元数据</span>
      <el-button
        key="rule-edit"
        title="配置"
        type="primary"
        @click="onSetting"
        :icon="Setting"
        circle
      />
    </template>
    <el-skeleton animated :rows="2" :loading="loading">
      <template #default>
        <el-table
          border
          :data="refData.tableData"
          max-height="531"
          :header-cell-style="{ background: '#f8f8f9', color: '#606266' }"
        >
          <el-table-column type="index" align="center" label="#" width="50" />
          <el-table-column prop="fieldKey" label="英文名称" width="120" />
          <el-table-column prop="fieldName" label="字段名称" width="150" />
          <el-table-column prop="fieldType" label="类型" width="100" />
          <el-table-column prop="tags" label="标签" />
          <el-table-column prop="aliases" label="别名" />
          <el-table-column label="操作" align="center" width="100">
            <template #default="{ row }">
              <el-button type="text" @click="onViewData(row)">查看</el-button>
              <el-button type="text" @click="removeReference(row)"
                >移除</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </template>
    </el-skeleton>

    <teleport to="body">
      <EditMetaTransfer
        @close-dialog="closeTransferDialog"
        @refresh-list="refreshTransfer"
        :selectOption="refData.tableData"
        :isShow="refData.isShowTransfer"
        :viewData="props.viewData"
      >
      </EditMetaTransfer>
    </teleport>

    <teleport to="body">
      <ViewMetadata
        @close-dialog="closeViewDialog"
        :selectRow="refData.selectRow"
        :isShow="refData.isShowView"
      >
      </ViewMetadata>
    </teleport>
  </el-card>
</template>

<style scoped lang="scss">
.el-table-self--header {
  background: "#f8f8f9";
  color: "#606266";
}
</style>
