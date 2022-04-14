<script lang="ts">
export default {
  name: "pointList"
};
</script>

<script setup lang="ts">
import { defineProps, reactive, watch, ref, defineAsyncComponent } from "vue";
import { Plus } from "@element-plus/icons-vue";
import { ElMessageBox } from "element-plus";

import { businessViewInfo } from "/@/models/business";
import { checkPointList } from "/@/models/checkPoint";
import { qryCheckPoints, deleteCheckPoint } from "/@/api/checkPoint";
import { SUCCESS, successMessage, errorMessage } from "/@/utils/message/index";

//import EditCheckPoint from "/@/views/checkPoint/editForm.vue";
//import SettingRuleVue from "/@/views/checkPoint/settingRule.vue";
//import EditPointRule from "/@/views/checkPoint/editPointRule.vue";
const EditCheckPoint = defineAsyncComponent(
  () => import("/@/views/checkPoint/editForm.vue")
);
const SettingRuleVue = defineAsyncComponent(
  () => import("/@/views/checkPoint/settingRule.vue")
);
const EditPointRule = defineAsyncComponent(
  () => import("/@/views/checkPoint/editPointRule.vue")
);

const viewType: businessViewInfo = null;
let loading = ref<boolean>(true);
const checkPointListType: checkPointList[] = [];

const props = defineProps<{
  viewData: businessViewInfo;
}>();

// 响应的数据信息
const refData = reactive({
  parentData: viewType,
  tableData: checkPointListType,
  isEdit: false,
  isShow: false,
  selectRow: null,
  isSettingShow: false,
  isPointShow: false,
  actionType: "",
  isRuleEdit: false
});

// 父组件传递的信息响应
watch(
  () => props.viewData,
  () => {
    refData.parentData = props.viewData;
    queryTableData();
  }
);

// 新增
const onAdd = () => {
  refData.isShow = true;
  refData.isEdit = false;
  refData.selectRow = null;
};

// 编辑
const onEdit = (row?: checkPointList) => {
  refData.selectRow = row;
  refData.isShow = true;
  refData.isEdit = true;
};

// 删除
const onRemove = (row?: checkPointList) => {
  ElMessageBox.confirm("确认要删除该业务阶段吗?", "删除确认", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "info"
  }).then(async () => {
    try {
      const result = await deleteCheckPoint({ code: row.code });

      if (result.resultCode.toUpperCase() != SUCCESS) {
        errorMessage("删除该业务阶段失败，信息为：" + result.errorCodeDes);
        return;
      } else {
        // 刷新存储数据
        successMessage("删除该业务阶段成功。");
        // 刷新
        refreshList();
      }
    } catch (err) {
      errorMessage("接口请求异常，请联系管理员。");
      throw err;
    }
  });
};

// 关闭表单编辑状态
const closeFormDialog = (status: boolean) => {
  refData.isShow = status;
  refData.isSettingShow = status;
  refData.isPointShow = status;
};

// 获取业务绑定的接入点信息列表
const queryTableData = async () => {
  try {
    const result = await qryCheckPoints({
      businessNo: props.viewData.businessNo
    });
    if (result.resultCode.toUpperCase() != SUCCESS) {
      errorMessage("查询业务关联阶段信息失败，信息为：" + result.errorCodeDes);
      return;
    } else {
      refData.tableData = result.series;
    }
  } catch (err) {
    errorMessage("查询业务信息失败，请联系管理员。");
    throw err;
  }
};

// 刷新数据
const refreshList = () => {
  queryTableData();
};

// 设置规则
const onSettingRule = (row: checkPointList) => {
  refData.isSettingShow = true;
  refData.selectRow = row;
};

// 设置接入点规则
const onPointRule = (
  row: checkPointList,
  actionType: string,
  opMode: string
) => {
  refData.isPointShow = true;
  refData.selectRow = row;
  refData.actionType = actionType;

  if (opMode === "edit") {
    refData.isRuleEdit = true;
  } else {
    refData.isRuleEdit = false;
  }
};
</script>

<template>
  <el-card>
    <template #header>
      <span>业务阶段</span>
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
        <el-table
          border
          :data="refData.tableData"
          height="355"
          style="width: 100%"
          :header-cell-style="{ background: '#f8f8f9', color: '#606266' }"
        >
          <el-table-column type="index" align="center" label="#" width="48" />
          <el-table-column prop="label" label="阶段名称" width="180" />
          <el-table-column prop="code" label="阶段标识" width="180" />
          <el-table-column prop="memo" label="描述" />
          <el-table-column
            align="center"
            prop="preExecuteRule"
            label="预处理规则"
            width="100"
          >
            <template #default="scope">
              <el-button
                v-if="scope.row.preExecuteRule.ruleAgenda != ''"
                type="text"
                @click="onPointRule(scope.row, 'preExecute', 'edit')"
                >编辑</el-button
              >
              <span
                class="span-btn-space-setting"
                v-if="
                  scope.row.preExecuteRule.ruleAgenda != '' &&
                  scope.row.preExecuteRule.status === 'Online'
                "
                >上线</span
              >
              <span
                class="span-btn-space-setting"
                v-if="
                  scope.row.preExecuteRule.ruleAgenda != '' &&
                  scope.row.preExecuteRule.status != 'Online'
                "
                >下线</span
              >
              <el-button
                v-if="scope.row.preExecuteRule.ruleAgenda == ''"
                type="text"
                @click="onPointRule(scope.row, 'preExecute', 'add')"
                >新增</el-button
              >
            </template>
          </el-table-column>
          <el-table-column
            align="center"
            prop="routeRule"
            label="路由规则"
            width="100"
          >
            <template #default="scope">
              <el-button
                v-if="scope.row.routeRule.ruleAgenda != ''"
                type="text"
                @click="onPointRule(scope.row, 'route', 'edit')"
                >编辑</el-button
              >
              <span
                class="span-btn-space-setting"
                v-if="
                  scope.row.routeRule.ruleAgenda != '' &&
                  scope.row.routeRule.status === 'Online'
                "
                >上线</span
              >
              <span
                class="span-btn-space-setting"
                v-if="
                  scope.row.routeRule.ruleAgenda != '' &&
                  scope.row.routeRule.status != 'Online'
                "
                >下线</span
              >
              <el-button
                v-if="scope.row.routeRule.ruleAgenda == ''"
                type="text"
                @click="onPointRule(scope.row, 'route', 'add')"
                >新增</el-button
              >
            </template>
          </el-table-column>
          <el-table-column
            align="center"
            prop="globalRule"
            label="全局规则"
            width="100"
          >
            <template #default="scope">
              <el-button
                v-if="scope.row.globalRule.ruleAgenda != ''"
                type="text"
                @click="onPointRule(scope.row, 'global', 'edit')"
                >编辑</el-button
              >
              <span
                class="span-btn-space-setting"
                v-if="
                  scope.row.globalRule.ruleAgenda != '' &&
                  scope.row.globalRule.status === 'Online'
                "
                >上线</span
              >
              <span
                class="span-btn-space-setting"
                v-if="
                  scope.row.globalRule.ruleAgenda != '' &&
                  scope.row.globalRule.status != 'Online'
                "
                >下线</span
              >
              <el-button
                v-if="scope.row.globalRule.ruleAgenda == ''"
                type="text"
                @click="onPointRule(scope.row, 'global', 'add')"
                >新增</el-button
              >
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="145">
            <template #default="{ row }">
              <el-button type="text" @click="onEdit(row)">编辑</el-button>
              <el-button type="text" @click="onSettingRule(row)"
                >规则</el-button
              >
              <el-button type="text" @click="onRemove(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </el-skeleton>
    <teleport to="body">
      <EditCheckPoint
        @close-dialog="closeFormDialog"
        @refresh-list="refreshList"
        :viewBusuness="props.viewData"
        :isEdit="refData.isEdit"
        :isShow="refData.isShow"
        :selectRow="refData.selectRow"
      >
      </EditCheckPoint>
    </teleport>

    <teleport to="body">
      <SettingRuleVue
        @close-dialog="closeFormDialog"
        :viewBusuness="props.viewData"
        :isShow="refData.isSettingShow"
        :selectRow="refData.selectRow"
      >
      </SettingRuleVue>
    </teleport>

    <teleport to="body">
      <EditPointRule
        :actionType="refData.actionType"
        :selectRow="refData.selectRow"
        :isShow="refData.isPointShow"
        :isEdit="refData.isRuleEdit"
        @close-dialog="closeFormDialog"
        @refresh-list="refreshList"
      >
      </EditPointRule>
    </teleport>
  </el-card>
</template>

<style scoped lang="scss">
.el-table-self--header {
  background: "#f8f8f9";
  color: "#606266";
}

.span-btn-space-setting {
  padding-left: 10px;
}
</style>
