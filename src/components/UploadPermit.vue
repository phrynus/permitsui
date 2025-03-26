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
  "a01.安徽",
  "a02.北京",
  "a03.重庆",
  "a04.福建",
  "a05.广东",
  "a06.广西",
  "a07.贵州",
  "a08.海南",
  "a09.河北",
  "a10.河南",
  "a11.黑龙江",
  "a12.湖北",
  "a13.湖南",
  "a14.吉林",
  "a15.江苏",
  "a16.江西",
  "a17.辽宁",
  "a18.内蒙古",
  "a19.山东",
  "a20.山西",
  "a21.陕西",
  "a22.上海",
  "a23.四川",
  "a24.天津",
  "a25.云南",
  "a26.浙江"
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
