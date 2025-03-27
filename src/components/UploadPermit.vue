<script lang="ts" setup>
import { onMounted, ref, defineProps, watch, reactive } from "vue";
import type { DrawerProps } from "element-plus";
const props = defineProps({
  switch: {
    type: Boolean,
    default: false
  },
  onClose: {
    type: Function as any,
    default: (e: any) => {}
  }
});
const Type = ref<string[]>(["A.许可证", "B.受理通知书", "C.批准通知书"]);
const Types = ref<string[]>(["ISP", "IDC", "CDN", "ICP", "EDI", "SP", "多方通讯", "呼叫中心业务"]);
const Area = ref<string[]>([
  "A1.安徽",
  "B1.北京",
  "C1.重庆",
  "F1.福建",
  "G1.甘肃",
  "G2.广东",
  "G3.广西",
  "G4.贵州",
  "H1.海南",
  "H2.河北",
  "H3.河南",
  "H4.黑龙江",
  "H5.湖北",
  "H6.湖南",
  "J1.吉林",
  "J2.江苏",
  "J3.江西",
  "L1.辽宁",
  "N1.内蒙古",
  "Q1.青海",
  "S1.山东",
  "S2.山西",
  "S3.陕西",
  "S4.上海",
  "S5.四川",
  "T1.天津",
  "X1.西藏",
  "Y1.云南",
  "Z1.浙江"
]);
const direction = ref<DrawerProps["direction"]>("rtl");
const form = reactive({
  company: "",
  type: "",
  time: {
    type: Date,
    default: new Date(),
    style: "YYYY-MM-DD"
  },
  imgs: "",
  types: [],
  area: ""
});
</script>
<template>
  <el-drawer v-model="props.switch" :direction="direction" :before-close="props.onClose">
    <template #header>
      <h4>上传资料上传</h4>
    </template>
    <template #default>
      <el-form :model="form" label-width="auto" style="max-width: 600px">
        <el-form-item label="公司名称:">
          <el-input v-model="form.company" placeholder="XXXX有限公司" />
        </el-form-item>
        <el-form-item label="证书类型:">
          <el-select v-model="form.type" placeholder="许可证、受理通知书、批准通知书">
            <el-option v-for="time in Type" :key="time" :label="time.replace(/[\s\S]{2}/, '')" :value="time" />
          </el-select>
        </el-form-item>
        <el-form-item label="业务种类:">
          <el-select v-model="form.types" :multiple="true" placeholder="ICP、EDI" :value-on-clear="Types[0]">
            <el-option v-for="time in Types" :key="time" :label="time" :value="time" />
          </el-select>
        </el-form-item>
        <el-form-item label="地区:">
          <el-select v-model="form.area" placeholder="安徽、北京">
            <el-option v-for="time in Area" :key="time" :label="time.replace(/[\s\S]{4}/, '')" :value="time" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间:">
          <el-date-picker v-model="form.time" type="date" placeholder="发证日期" style="width: 100%" />
        </el-form-item>
      </el-form>
    </template>
    <template #footer>
      <div style="flex: auto">
        <el-button type="primary">提交</el-button>
      </div>
    </template>
  </el-drawer>
</template>
<style lang="scss" scoped></style>
