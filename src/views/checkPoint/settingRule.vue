<script lang="ts">
export default {
  name: "settingRule"
};
</script>

<script setup lang="ts">
import { reactive, defineProps, watch, defineEmits } from "vue";

import { ruleInfo, bindRuleInfo, checkPointList } from "/@/models/checkPoint";
import {
  qryAllRule,
  qryBindRuleBind,
  checkPointRuleBind
} from "/@/api/checkPoint";
import { businessViewInfo } from "/@/models/business";
import { SUCCESS, successMessage, errorMessage } from "/@/utils/message/index";

// 父组件的数据
const props = defineProps<{
  viewBusuness: businessViewInfo; // 相关业务
  selectRow: checkPointList; // 相关业务阶段
  isShow: boolean;
}>();

interface Option {
  seq: number;
  key: string;
  label: string;
  disabled: boolean;
}

// 表单的数据信息
const ruleType: ruleInfo[] = [];
const noeType: Option[] = [];
const refData = reactive({
  show: false,
  allRule: ruleType,
  bindRule: ruleType,
  tableData: noeType,
  selectVal: []
});

// 控制窗口的隐藏和显示
watch(
  () => props.isShow,
  () => {
    if (props.isShow) {
      refData.show = true;
      // 获取相关规则数据
      queryRuleInfo();
    }
  }
);

// 查询所有的相关规则
const queryRuleInfo = async () => {
  try {
    // 根据业务标识查询所有关联规则
    const resultAllRule = await qryAllRule({
      code: props.selectRow.businessNo
    });

    if (resultAllRule.resultCode.toUpperCase() != SUCCESS) {
      errorMessage(
        "获取业务阶段的规则失败，信息为：" + resultAllRule.errorCodeDes
      );
      return;
    } else {
      // 所有的规则信息
      refData.allRule = resultAllRule.series;

      // 根据接入点查询所有绑定的规则信息
      const resultBindRule = await qryBindRuleBind({
        code: props.selectRow.code
      });

      if (resultBindRule.resultCode.toUpperCase() != SUCCESS) {
        errorMessage(
          "获取绑定的规则失败，信息为：" + resultBindRule.errorCodeDes
        );
        return;
      } else {
        refData.bindRule = resultBindRule.series;
        // 整理相关数据
        refData.tableData = processData();
      }
    }
  } catch (err) {
    errorMessage("相关规则信息获取失败，请联系管理员。");
    throw err;
  }
};

// 控件的数据源处理
const processData = (): Option[] => {
  const resultData: Option[] = [];
  let seq = 1;
  refData.allRule.forEach(item => {
    // 显示内容的组装
    const label = item.ruleDescription;
    const relItem: Option = {
      seq: seq,
      key: item.ruleNo,
      label: label,
      disabled: false
    };
    resultData.push(relItem);
    seq = seq + 1;

    // 引用内容的设置
    const exist = refData.bindRule.some(
      element => element.ruleNo === item.ruleNo
    );
    if (exist) {
      refData.selectVal.push(item.ruleNo);
    }
  });

  return resultData;
};

const emit = defineEmits(["closeDialog"]);
// 关闭窗体
const closeDialog = () => {
  emit("closeDialog", false);
  refData.show = false;
};

// 提交配置
const submitForm = async () => {
  // 绑定的参数
  const param: bindRuleInfo = {
    bindRuleNos: [...refData.selectVal],
    code: props.selectRow.code
  };
  try {
    const result = await checkPointRuleBind(param);
    if (result.resultCode.toUpperCase() != SUCCESS) {
      errorMessage("规则绑定失败，信息为：" + result.errorCodeDes);
      return;
    } else {
      successMessage("规则绑定成功。");
    }
    closeDialog();
  } catch (err) {
    errorMessage("提交绑定失败，请联系管理员。");
    throw err;
  }
};
</script>

<template>
  <el-dialog
    v-model="refData.show"
    title="配置业务阶段的规则"
    width="880px"
    @closed="closeDialog"
  >
    <p style="margin: 0 0 20px; padding-left: 20px">
      说明：显示内容为 => 如果需要，则在这里说明规则显示格式化
    </p>
    <div style="text-align: center">
      <el-transfer
        v-model="refData.selectVal"
        style="text-align: left; display: inline-block"
        filterable
        :titles="['业务阶段可以使用的规则', '已经引用的规则']"
        :format="{
          noChecked: '${total}',
          hasChecked: '${checked}/${total}'
        }"
        :data="refData.tableData"
      >
        <template #default="{ option }">
          <el-tooltip
            class="box-item"
            effect="dark"
            :content="option.label"
            placement="top"
          >
            <span>{{ option.seq }} - {{ option.label }}</span>
          </el-tooltip>
        </template>
      </el-transfer>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="submitForm()">确认</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style scoped>
.el-dialog /deep/ .el-dialog__body {
  padding-top: 10px !important;
}

.transfer-footer {
  margin-left: 15px;
  padding: 6px 5px;
}

.el-transfer /deep/ .el-transfer-panel {
  width: 330px;
}
</style>
