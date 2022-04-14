<script lang="ts">
export default {
  name: "ruleList"
};
</script>

<script setup lang="ts">
import { reactive, ref, watch } from "vue";
import { Plus } from "@element-plus/icons-vue";
import { ElMessageBox } from "element-plus";

import { businessViewInfo } from "/@/models/business";
import { ruleInfo, RuleBaseInfoData } from "/@/models/rules";
import EditRule from "/@/views/rules/editForm.vue";
import { SUCCESS, successMessage, errorMessage } from "/@/utils/message/index";
import { qryRules, changeRuleStatus } from "/@/api/businessRule";
import { useRuleStoreHook } from "/@/store/modules/rules";

let loading = ref<boolean>(true);
const tableResult: ruleInfo[] = [];
const ruleBaseInfoType: RuleBaseInfoData = null;

const VAR_ONLINE = "online";
const VAR_ONOFFLINE = "Offline";

// 父组件的数据
const props = defineProps<{
  viewData: businessViewInfo;
}>();

const refData = reactive({
  isEdit: false,
  isShow: false,
  selectRow: null,
  ruleBaseInfo: ruleBaseInfoType,
  tableData: tableResult,
  searchForm: {
    ruleNo: "",
    ruleType: "",
    ruleStatus: ""
  }
});

// 查询相关的规则信息
const queryTableData = async () => {
  if (!props.viewData || !props.viewData.businessNo) {
    return;
  }

  const result = await qryRules({ businessNo: props.viewData.businessNo });

  if (result.resultCode.toUpperCase() != SUCCESS) {
    errorMessage("查询规则信息失败，原因：" + result.errorCodeDes);
    return;
  } else {
    refData.tableData = result.series;
  }
};

// 监控业务信息的变更
watch(
  () => props.viewData,
  async () => {
    if (props.viewData) {
      queryTableData();

      // 获取规则的统配信息
      refData.ruleBaseInfo = await useRuleStoreHook().queryBaseInfoFromCache();
    }
  }
);

// 编辑
const onEdit = (row?: ruleInfo) => {
  refData.isShow = true;
  refData.isEdit = true;
  refData.selectRow = row;
};

// 新增
const onAdd = () => {
  refData.isShow = true;
  refData.isEdit = false;
  refData.selectRow = null;
};

// 上下线的切换
const onChangeStatus = (row, mode) => {
  let opMsg = "下线";
  if (mode === VAR_ONLINE) {
    opMsg = "上线";
  }

  ElMessageBox.confirm("确认要" + opMsg + "该规则吗?", "操作确认", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "info"
  }).then(async () => {
    const result = await changeRuleStatus({ ruleNo: row["ruleNo"] });

    if (result.resultCode.toUpperCase() != SUCCESS) {
      errorMessage(opMsg + "该规则失败，信息为：" + result.errorCodeDes);
      return;
    } else {
      // 刷新存储数据
      successMessage(opMsg + "该规则成功。");
      // 刷新
      refreshList();
    }
  });
};

// 关闭表单编辑状态
const closeFormDialog = (status: boolean) => {
  refData.isShow = status;
};

// 刷新数据
const refreshList = () => {
  queryTableData();
};

// 查询规则信息
const searchData = () => {
  // todo
};
</script>

<template>
  <el-card>
    <template #header>
      <span>规则</span>
      <el-button
        key="rule-edit"
        title="新增"
        type="primary"
        @click="onAdd"
        :icon="Plus"
        circle
      />
    </template>
    <el-skeleton animated :rows="2" :loading="loading">
      <template #default>
        <!-- 工具栏 -->
        <vxe-toolbar v-if="refData.ruleBaseInfo" class-name="el-tools-search">
          <template #buttons>
            <vxe-form :data="refData.searchForm" @submit="() => {}">
              <vxe-form-item title="编号：" field="ruleNo" :item-render="{}">
                <template #default="{ data }">
                  <vxe-input
                    style="width: 270px"
                    v-model="data.ruleNo"
                    placeholder="请输入编号"
                    clearable
                  ></vxe-input>
                </template>
              </vxe-form-item>
              <vxe-form-item title="类型：" field="ruleType" :item-render="{}">
                <template #default="{ data }">
                  <vxe-select
                    v-model="data.ruleType"
                    placeholder="请选择类型"
                    clearable
                  >
                    <vxe-option
                      :key="index + '_' + item.code"
                      v-for="(item, index) in refData.ruleBaseInfo.statusArray"
                      :label="item.label"
                      :value="item.code"
                    ></vxe-option>
                  </vxe-select>
                </template>
              </vxe-form-item>
              <vxe-form-item
                title="状态："
                field="ruleStatus"
                :item-render="{}"
              >
                <template #default="{ data }">
                  <vxe-select
                    v-model="data.ruleStatus"
                    placeholder="请选择状态"
                    clearable
                  >
                    <vxe-option
                      :key="index + '_' + item.code"
                      v-for="(item, index) in refData.ruleBaseInfo.statusType"
                      :label="item.label"
                      :value="item.code"
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
                    @click="searchData"
                  ></vxe-button>
                  <vxe-button type="reset" content="重置"></vxe-button>
                </template>
              </vxe-form-item>
            </vxe-form>
          </template>
        </vxe-toolbar>

        <!-- 列表 -->
        <el-table
          border
          :data="refData.tableData"
          height="355"
          :header-cell-style="{ background: '#f8f8f9', color: '#606266' }"
        >
          <el-table-column type="index" label="#" width="42" />
          <el-table-column prop="ruleNo" label="规则编号" width="140" />
          <el-table-column prop="ruleDescription" label="规则描述" />
          <el-table-column prop="ruleType" label="规则类型" width="95">
            <template #default="{ row }">
              <span v-if="row.ruleType === 'param'">参数校验</span>
              <span v-else-if="row.ruleType === 'blackWhiteList'"
                >黑白名单</span
              >
              <span v-else-if="row.ruleType === 'quota'">限额限次</span>
              <span v-else>规则自定义</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="asyncExecute"
            align="center"
            label="异步执行"
            width="85"
          >
            <template #default="{ row }">
              <span v-if="row.asyncExecute">是</span>
              <span v-else>否</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="status"
            align="center"
            label="是否上线"
            width="100"
          >
            <template #default="{ row }">
              <span style="padding-right: 4px" v-if="row.status === VAR_ONLINE"
                >上线</span
              >
              <span style="padding-right: 4px" v-else>下线</span>
              <el-button
                @click="onChangeStatus(row, VAR_ONOFFLINE)"
                v-if="row.status === VAR_ONLINE"
                type="text"
                >[下线]</el-button
              >
              <el-button
                @click="onChangeStatus(row, VAR_ONLINE)"
                v-else
                type="text"
                >[上线]</el-button
              >
            </template>
          </el-table-column>

          <el-table-column align="center" label="操作" width="70">
            <template #default="{ row }">
              <el-button type="text" @click="onEdit(row)">编辑</el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </el-skeleton>

    <teleport to="body">
      <EditRule
        @close-dialog="closeFormDialog"
        @refresh-list="refreshList"
        :isEdit="refData.isEdit"
        :isShow="refData.isShow"
        :viewData="props.viewData"
        :selectRow="refData.selectRow"
      >
      </EditRule>
    </teleport>
  </el-card>
</template>

<style scoped lang="scss">
.el-table-self--header {
  background: "#f8f8f9";
  color: "#606266";
}
.el-tools-search {
  border: 1px solid #e5e7eb;
  padding-left: 15px;
}
</style>
