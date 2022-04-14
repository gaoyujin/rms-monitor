<script lang="ts">
export default {
  name: "editPointRule"
};
</script>

<script setup lang="ts">
import { reactive, defineProps, watch, computed, nextTick } from "vue";
import * as monaco from "monaco-editor";

import {
  checkPointList,
  refRuleParam,
  ruleHistoryDetailsType,
  addRuleInfo
} from "/@/models/checkPoint";
import {
  qryCheckPointGenericRuleDetail,
  createOrUpdateCheckPointGenericRule
} from "/@/api/checkPoint";
import { SUCCESS, successMessage, errorMessage } from "/@/utils/message/index";
import { contentCompile } from "/@/api/businessRule";
import { buildShortUUID } from "/@/utils/uuid";

const GLOBAL_RULE = "global";
const PREEXECUTE_RULE = "preExecute";
const ROUTE_RULE = "route";
const statusData = ["Online", "Offline"];

// 父组件的数据
const props = defineProps<{
  actionType: string; // globalRule、preExecuteRule、routeRule
  selectRow: checkPointList; // 接入点信息
  isShow: boolean;
  isEdit: boolean;
}>();

const ruleHistoryType: ruleHistoryDetailsType[] = [];
const monacoID = "ruleContainer" + buildShortUUID();
const monacoDiffID = "ruleDiffContainer" + buildShortUUID();
let addEdit = false;
let monacoEditor = null;
let addDiff = false;
let diffEditor = null;

const refData = reactive({
  show: false,
  showDiff: false,
  oldData: "",
  formData: {
    code: "",
    ruleAgenda: "",
    ruleContent: "",
    ruleHistoryDetails: ruleHistoryType,
    status: "下线"
  }
});

// 控制窗口的隐藏和显示
watch(
  () => props.isShow,
  () => {
    if (props.isShow) {
      refData.show = true;

      if (props.isEdit) {
        // 获取相关规则数据
        getPointRule();
      } else {
        refData.oldData = "";
        refData.formData = {
          code: props.selectRow.code,
          ruleAgenda: "",
          ruleContent: "",
          ruleHistoryDetails: [],
          status: "下线"
        };
      }

      // 规则编辑器的设置
      controlMonaco();
    }
  }
);

// 规则编辑器的设置
const controlMonaco = () => {
  // 加载规则内容编辑器
  setTimeout(() => {
    loadMonaco();
    loadDiffMonaco();
  }, 200);

  if (props.isEdit) {
    // 等编辑器加载完成后，赋值
    setTimeout(() => {
      // 编辑器赋值
      if (monacoEditor) {
        monacoEditor.setValue(refData.formData.ruleContent);
      }
    }, 500);
  } else {
    // 编辑器赋值
    if (monacoEditor) {
      monacoEditor.setValue(refData.formData.ruleContent);
      // 清除比对信息
      onDiffChange();
    }
  }

  // 设置归位
  setTimeout(() => {
    if (refData.showDiff) {
      document.getElementById(monacoDiffID).style.display = "";
    } else {
      document.getElementById(monacoDiffID).style.display = "none";
    }
  }, 200);
};

// 获取规则信息
const getPointRule = async () => {
  try {
    const param: refRuleParam = {
      code: props.selectRow.code,
      ruleType: props.actionType
    };

    // 获取规则详情
    const ruleDetail = await qryCheckPointGenericRuleDetail(param);
    if (ruleDetail.resultCode.toUpperCase() != SUCCESS) {
      errorMessage("获取规则详情失败，信息为：" + ruleDetail.errorCodeDes);
      return;
    } else {
      refData.formData = ruleDetail.item;
      refData.formData.code = props.selectRow.code;
      refData.oldData = refData.formData.ruleContent;
    }
  } catch (err) {
    errorMessage("获取规则详情失败，请联系管理员。");
    throw err;
  }
};

// 获取窗口标题
const getTtile = computed(() => {
  let title = "无标题";
  if (props.actionType === GLOBAL_RULE) {
    title = "全局规则配置";
  } else if (props.actionType === PREEXECUTE_RULE) {
    title = "预处理规则配置";
  } else if (props.actionType === ROUTE_RULE) {
    title = "路由规则配置";
  }
  return title;
});

// 加载编辑器
const loadMonaco = () => {
  if (addEdit || !document.getElementById(monacoID)) {
    return;
  }
  nextTick(() => {
    monaco.editor.defineTheme("BlackTheme", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "custom-info", foreground: "a3a7a9", background: "ffffff" },
        { token: "custom-notice", foreground: "1055af" },
        { token: "custom-date", foreground: "20aa20" }
      ],
      colors: {
        "editor.background": "#3e414a" //背景色
      }
    });
    //设置自定义主题
    monaco.editor.setTheme("BlackTheme");

    monacoEditor = monaco.editor.create(document.getElementById(monacoID), {
      value: "",
      language: "java"
    });

    addEdit = true;
  });
};

// 内容比较的UI创建
const loadDiffMonaco = () => {
  if (addDiff || !document.getElementById(monacoDiffID)) {
    return;
  }

  nextTick(() => {
    diffEditor = monaco.editor.createDiffEditor(
      document.getElementById(monacoDiffID),
      {
        theme: "vs-dark",
        readOnly: true
      }
    );
    // 隐藏
    document.getElementById(monacoDiffID).style.display = "none";
    addDiff = true;
  });
};

// 比对内容
const onDiffChange = () => {
  if (refData.showDiff) {
    document.getElementById(monacoDiffID).style.display = "";
    loadDiffMonaco();
    setTimeout(() => {
      if (diffEditor) {
        diffEditor.setModel({
          original: monaco.editor.createModel(refData.oldData, "java"),
          modified: monaco.editor.createModel(monacoEditor.getValue(), "java")
        });
      }
    }, 300);
  } else {
    document.getElementById(monacoDiffID).style.display = "none";
  }
};

// 验证规则内容
const testRuleContent = async (showMsg: boolean) => {
  const result = await contentCompile({ ruleContent: monacoEditor.getValue() });

  if (result.resultCode.toUpperCase() != SUCCESS) {
    errorMessage("测试规则内容未通过。");
    return false;
  } else {
    if (showMsg) {
      successMessage("测试规则内容通过。");
    }
    return true;
  }
};

const emit = defineEmits(["closeDialog", "refreshList"]);
// 关闭窗体
const closeDialog = () => {
  emit("closeDialog", false);
  refData.show = false;
  refData.showDiff = false;
};

// 提交验证
const submitForm = async () => {
  try {
    // 提交前验证规则内容
    const testContent = testRuleContent(false);
    if (!testContent) {
      return;
    }

    const data = getSubmitData();
    const result = await createOrUpdateCheckPointGenericRule(data);
    if (props.isEdit) {
      if (result.resultCode.toUpperCase() != SUCCESS) {
        errorMessage("信息编辑失败，信息为：" + result.errorCodeDes);
        return;
      } else {
        successMessage("信息编辑成功。");
      }
    } else {
      if (result.resultCode.toUpperCase() != SUCCESS) {
        errorMessage("创建信息失败，信息为：" + result.errorCodeDes);
        return;
      } else {
        successMessage("创建信息成功。");
      }
    }

    // 刷新并关闭
    emit("refreshList");
    closeDialog();
  } catch (err) {
    errorMessage("接口请求异常，请联系管理员。");
    throw err;
  }
};

// 收集提交的数据信息
const getSubmitData = (): addRuleInfo => {
  const data: addRuleInfo = {
    code: props.selectRow.code,
    ruleContent: monacoEditor.getValue(),
    ruleType: props.actionType,
    ruleStatus: refData.formData.status
  };

  return data;
};
</script>

<template>
  <el-dialog
    v-model="refData.show"
    :title="getTtile"
    top="5vh"
    width="88%"
    @closed="closeDialog"
  >
    <el-form ref="xForm" :model="refData.formData" label-width="110px">
      <el-row>
        <el-col :span="12">
          <el-form-item label="阶段标识" prop="code">
            <div class="div-view-setting">{{ refData.formData.code }}</div>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="阶段名称" prop="label">
            <div class="div-view-setting">
              {{
                props.selectRow && props.selectRow.label
                  ? props.selectRow.label
                  : ""
              }}
            </div>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="编码规范">
        <div class="div-view-setting">
          package命名规则: CPXXX, 编号与接入点一致; 如: CPl001
        </div>
      </el-form-item>
      <el-form-item label="规则内容">
        <div
          v-show="!refData.showDiff"
          :id="monacoID"
          style="width: 100%; height: 380px"
        ></div>
        <div :id="monacoDiffID" style="width: 100%; height: 380px"></div>
      </el-form-item>
      <el-row>
        <el-col :span="12"
          ><el-form-item label="内容比对">
            <el-switch
              @change="onDiffChange()"
              v-model="refData.showDiff" /></el-form-item
        ></el-col>
        <el-col :span="12">
          <el-form-item label="内容测试">
            <el-button @click="testRuleContent(true)">测试</el-button
            ><span style="padding-left: 12px"
              >注：提交会默认进行内容测试，不通过不能提交。</span
            >
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item prop="status" label="在线状态">
        <el-select
          v-model="refData.formData.status"
          placeholder="请选择在线状态"
        >
          <el-option
            v-for="item in statusData"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
      </el-form-item>

      <el-row
        style="width: 100%"
        v-if="
          refData.formData.ruleHistoryDetails &&
          refData.formData.ruleHistoryDetails.length > 0
        "
      >
        <el-col :span="24"
          ><el-form-item prop="ruleHistoryDetails" label="修改历史">
            <vxe-table
              style="width: 100%"
              border
              :data="refData.formData.ruleHistoryDetails"
              :expand-config="{ labelField: 'ruleAgenda', expandAll: false }"
            >
              <vxe-column type="seq" width="60"></vxe-column>
              <vxe-column type="expand" title="规则内容（展开查看）">
                <template #content="{ row }">
                  <vxe-textarea
                    v-model="row.ruleContent"
                    :autosize="{ minRows: 6, maxRows: 10 }"
                    :readonly="true"
                  ></vxe-textarea>
                </template>
              </vxe-column>
              <vxe-column
                field="opUserName"
                width="150px"
                title="操作人"
              ></vxe-column>
              <vxe-column
                field="opDateTime"
                width="180px"
                title="操作时间"
              ></vxe-column>
            </vxe-table> </el-form-item
        ></el-col>
      </el-row>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="submitForm()">确认</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style scoped>
.div-view-setting {
  border: 1px solid #e5e7eb;
  border-radius: 5px;
  width: 100%;
  padding-left: 8px;
}
</style>
