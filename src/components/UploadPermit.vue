<script lang="ts" setup>
import { onMounted, ref, defineProps, watch, reactive } from 'vue';
import type { DrawerProps, UploadProps, UploadRequestOptions, UploadProgressEvent } from 'element-plus';
import { userestStore } from '@/stores/rest';
import { useSiliconFlowStore, modelOptions } from '@/stores/siliconflow';
// Element Plus 组件
import { ElMessage, ElLoading, ElMessageBox } from 'element-plus';
// HTTP 请求库
import axios from 'axios';
import type { AxiosProgressEvent } from 'axios';
// 自定义图标组件
import Icon from '@/components/Icon.vue';
const store: any = userestStore();
const siliconFlowStore = useSiliconFlowStore();
const props = defineProps({
  switch: {
    type: Boolean,
    default: false,
  },
  onClose: {
    type: Function as any,
    default: (e: any) => {},
  },
});
const Type = ref<string[]>(['A.许可证', 'B.受理通知书', 'C.批准通知书']);
const Types = ref([
  {
    name: 'ICP',
    info: 'ICP-信息服务业务(仅限互联网)',
  },
  {
    name: 'EDI',
    info: 'EDI-在线数据处理(不含互联网)',
  },
  {
    name: 'ISP',
    info: 'ISP-互联网接入服务业务',
  },
  {
    name: 'IDC',
    info: 'IDC-互联网数据中心业务',
  },
  {
    name: 'CDN',
    info: 'CDN-内容分发网络业务',
  },
  {
    name: 'VPN',
    info: 'VPN-虚拟专用网络业务',
  },
  {
    name: 'SP',
    info: 'SP-信息服务业务(不含互联网)',
  },
  {
    name: '多方通信',
    info: '多方通信',
  },
  {
    name: '呼叫中心业务',
    info: '呼叫中心业务',
  },
  {
    name: '文网文',
    info: '文网文',
  },
  {
    name: '变更',
    info: '变更',
  },
]);
const Area = ref<string[]>([
  'A1.安徽',
  'B1.北京',
  'C1.重庆',
  'F1.福建',
  'G1.甘肃',
  'G2.广东',
  'G3.广西',
  'G4.贵州',
  'H1.海南',
  'H2.河北',
  'H3.河南',
  'H4.黑龙江',
  'H5.湖北',
  'H6.湖南',
  'J1.吉林',
  'J2.江苏',
  'J3.江西',
  'L1.辽宁',
  'N1.内蒙古',
  'Q1.青海',
  'S1.山东',
  'S2.山西',
  'S3.陕西',
  'S4.上海',
  'S5.四川',
  'T1.天津',
  'X1.西藏',
  'Y1.云南',
  'Z1.浙江',
]);
const cityRegexList = ref<[string, RegExp][]>([
  ['安徽', /(?:安徽|合肥|芜湖|蚌埠|淮南|马鞍山|淮北|铜陵|安庆|黄山|滁州|阜阳|宿州|六安|亳州|池州|宣城)[省市]?/],
  ['北京', /(?:北京)[省市]?/],
  ['重庆', /(?:重庆)[省市]?/],
  ['福建', /(?:福建|福州|厦门|莆田|三明| 泉州|漳州|南平|龙岩|宁德)[省市]?/],
  ['甘肃', /(?:甘肃|兰州|嘉峪关|金昌|白银|天水|武威|张掖|平凉|酒泉|庆阳|定西|陇南)[省市]?/],
  ['广东', /(?:广东|广州|韶关|深圳|珠海|汕头|佛山|江门|湛江|茂名|肇庆|惠州|梅州|汕尾|河源|阳江|清远|东莞|中山|潮州|揭阳|云浮)[省市]?/],
  ['广西', /(?:广西|南宁|柳州|桂林|梧州|北海|防城港|钦州|贵港|玉林|百色|贺州|河池|来宾|崇左)[省市]?/],
  ['贵州', /(?:贵州|贵阳|六盘水|遵义|安顺|毕节|铜仁)[省市]?/],
  ['海南', /(?:海南|海口|三亚|三沙|儋州|五指山|琼海|文昌|万宁|东方)[省市]?/],
  ['河北', /(?:河北|石家庄|唐山|秦皇岛|邯郸|邢台|保定|张家口|承德|沧州|廊坊|衡水)[省市]?/],
  ['河南', /(?:河南|郑州|开封|洛阳|平顶山|安阳|鹤壁|新乡|焦作|濮阳|许昌|漯河|三门峡|南阳|商丘|信阳|周口|驻马店|济源)[省市]?/],
  ['黑龙江', /(?:黑龙江|哈尔滨|齐齐哈尔|鸡西|鹤岗|双鸭山|大庆|伊春|佳木斯|七台河|牡丹江|黑河|绥化)[省市]?/],
  ['湖北', /(?:湖北|武汉|黄石|十堰|宜昌|襄阳|鄂州|荆门|孝感|荆州|黄冈|咸宁|随州|仙桃|潜江|天门)[省市]?/],
  ['湖南', /(?:湖南|长沙|株洲|湘潭|衡阳|邵阳|岳阳|常德|张家界|益阳|郴州|永州|怀化|娄底)[省市]?/],
  ['吉林', /(?:长春|吉林|四平|辽源|通化|白山|松原|白城)[省市]?/],
  ['江苏', /(?:江苏|南京|无锡|徐州|常州|苏州|南通|连云港|淮安|盐城|扬州|镇江|泰州|宿迁)[省市]?/],
  ['江西', /(?:江西|南昌|景德镇|萍乡|九江|新余|鹰潭|赣州|吉安|宜春|抚州|上饶)[省市]?/],
  ['辽宁', /(?:辽宁|沈阳|大连|鞍山|抚顺|本溪|丹东|锦州|营口|阜新|辽阳|盘锦|铁岭|朝阳|葫芦岛)[省市]?/],
  ['内蒙古', /(?:内蒙古|呼和浩特|包头|乌海|赤峰|通辽|鄂尔多斯|呼伦贝尔|巴彦淖尔|乌兰察布)[省市]?/],
  ['青海', /(?:青海|西宁|海东)[省市]?/],
  ['山东', /(?:山东|临清|济南|青岛|淄博|枣庄|东营|烟台|潍坊|济宁|泰安|威海|日照|临沂|德州|聊城|滨州|菏泽)[省市]?/],
  ['山西', /(?:山西|太原|大同|阳泉|长治|晋城|朔州|晋中|运城|忻州|临汾|吕梁)[省市]?/],
  ['陕西', /(?:陕西|西安|铜川|宝鸡|咸阳|渭南|延安|汉中|榆林|安康|商洛)[省市]?/],
  ['上海', /(?:上海)[省市]?/],
  ['四川', /(?:四川|成都|自贡|攀枝花|泸州|德阳|绵阳|广元|遂宁|内江|乐山|南充|眉山|宜宾|广安|达州|雅安|巴中|资阳)[省市]?/],
  ['天津', /(?:天津)[省市]?/],
  ['西藏', /(?:西藏|拉萨|日喀则|昌都|林芝|山南|那曲)[省市]?/],
  ['云南', /(?:云南|昆明|曲靖|玉溪|保山|昭通|丽江|普洱|临沧)[省市]?/],
  ['浙江', /(?:浙江|杭州|宁波|温州|嘉兴|湖州|绍兴|金华|衢州|舟山|台州|丽水)[省市]?/],
]);

const cueWord = `
##要求
提取公司名称、发证时间、许可证编号
判断业务是否包含：ICP、EDI、IDC、CDN、ISP、多方通信
判断类型是否是：许可证、受理通知书、批准通知书
##输出格式JSON；限制只输出json；
{
"corporate": "{{公司名称}}",
"ref": "{{编号（{{地区短标识}} [年份]{{编号}}号）}}",
"type": "{{类型}}",
"issuance": "{{发证时间(注意区分提交时间和发证时间，发证时间一般在最后)}}",
"business": [{{业务代号}}]
}
##备注
####类型对应输出数字
许可证：1
受理通知书：2
批准通知书：3
####业务代号
信息服务业务(仅限互联网信息服务)：ICP
在线数据处理与交易处理业务：EDI
互联网数据中心业务:IDC
内容分发网络业务：CDN
互联网接入服务业务：ISP
多方通信服务业：多方通信
`;
const direction = ref<DrawerProps['direction']>('rtl');
const drawerSize = ref('30%');
const fileList = ref<any>([]); // 选择的文件列表
const fileCurrent = ref<any>({}); // 当前选择的文件
const company = ref<string>('');
const time = ref<Date>();
const form = ref({
  type: '',
  imgs: '',
  types: [],
  area: '',
  ref: '',
});

// 图片选择变化时触发
const handleImageRemove = (file: any, files: any) => {
  if (files.length == 0) {
    fileCurrent.value = undefined;
    resetForm(); // 当移除所有图片时清空表单
  }
};
const handleImageSuccess = async (response: any, file: any, fileList: any) => {
  if (!siliconFlowStore.apiKey) {
    return;
  }
  console.log(response);
  fileCurrent.value = response[0] || response;

  // 获取上传图片的URL
  const imageUrl = `https://strapi.phrynus.cn${fileCurrent.value.url}`;

  try {
    // 调用硅基流动API进行图片识别
    const result = await callSiliconFlowAPI(imageUrl);
    if (result) {
      // 根据API返回结果自动填充表单
      autoFillForm(result);
    }
  } catch (error) {
    console.error('图片识别失败:', error);
    ElMessage({
      message: '图片识别失败',
      type: 'warning',
      plain: true,
    });
  }
};

const uploadImage = (option: UploadRequestOptions) => {
  const { onSuccess, onError, file, onProgress, data, headers } = option;
  const fmData = new FormData();
  fmData.append(option.filename, file, file.name);
  axios
    .post('https://strapi.phrynus.cn/api/upload', fmData, {
      headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${store.token}` },
      onUploadProgress: (event: AxiosProgressEvent) => {
        if (event.total) {
          let percent = Math.floor((event.loaded / event.total) * 100);
          onProgress({ percent } as UploadProgressEvent);
        }
      },
    })
    .then((res) => {
      onSuccess(res.data[0]);
    })
    .catch((err) => {
      console.log(err);
      onError(err);
    });
};

// 调用硅基流动API进行图片识别
// 清空表单
const resetForm = () => {
  form.value = {
    type: '',
    imgs: '',
    types: [],
    area: '',
    ref: '',
  };
  company.value = '';
  time.value = undefined;
};

const callSiliconFlowAPI = async (imageUrl: string): Promise<any> => {
  const loading = ElLoading.service({
    lock: true,
    text: '正在识别图片...',
    background: 'rgba(255, 255, 255, 0.5)',
  });

  // 在发送前清空表单
  resetForm();

  try {
    const response = await axios.post(
      'https://api.siliconflow.cn/v1/chat/completions',
      {
        model: siliconFlowStore.currentModel,
        messages: [
          {
            role: 'system',
            content: cueWord,
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `请分析这张图片中的许可证信息;日期不可能超过${new Date().getFullYear()}年${new Date().getMonth() + 1}月${new Date().getDate()}号`,
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl,
                },
              },
            ],
          },
        ],
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${siliconFlowStore.apiKey || import.meta.env.VITE_SILICONFLOW_API_KEY || ''}`,
        },
      }
    );

    loading.close();

    console.log('硅基流动API返回:', response.data);

    if (response.data && response.data.choices && response.data.choices.length > 0) {
      const content = response.data.choices[0].message.content;
      // 尝试解析JSON响应
      try {
        // 处理可能的Markdown格式
        let jsonStr = '';

        // 尝试匹配Markdown代码块格式 ```json {...} ```
        const mdMatch = content.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
        if (mdMatch && mdMatch[1]) {
          jsonStr = mdMatch[1].trim();
        } else {
          // 如果不是Markdown格式，尝试直接匹配JSON对象
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            jsonStr = jsonMatch[0];
          }
        }

        if (jsonStr) {
          const result = JSON.parse(jsonStr);
          return result;
        }
      } catch (error) {
        console.error('解析JSON失败:', error, content);
        ElMessage({
          message: '无法解析识别结果',
          type: 'warning',
          plain: true,
        });
      }
    }
    return null;
  } catch (error) {
    console.error('调用硅基流动API失败:', error);
    loading.close();
    throw error;
  }
};

// 重新识别图片
const reidentifyImage = async () => {
  if (!fileCurrent.value || !fileCurrent.value.url) {
    ElMessage({
      message: '请先上传图片',
      type: 'warning',
      plain: true,
    });
    return;
  }

  try {
    const imageUrl = `https://strapi.phrynus.cn${fileCurrent.value.url}`;
    const result = await callSiliconFlowAPI(imageUrl);
    if (result) {
      autoFillForm(result);
    }
  } catch (error) {
    console.error('图片重新识别失败:', error);
    ElMessage({
      message: '图片重新识别失败',
      type: 'error',
      plain: true,
    });
  }
};

// 根据API返回结果自动填充表单
const autoFillForm = (result: any) => {
  if (!result) {
    ElMessage({
      message: '无法解析识别结果',
      type: 'warning',
      plain: true,
    });
    return;
  }

  try {
    // 填充公司名称
    if (result.corporate) {
      company.value = result.corporate;
    }

    // 填充许可证编号
    if (result.ref) {
      form.value.ref = result.ref;
    }

    // 填充证书类型
    if (result.type) {
      let typeNum = parseInt(result.type);
      if (typeNum === 1) {
        form.value.type = Type.value[0]; // 许可证
      } else if (typeNum === 2) {
        form.value.type = Type.value[1]; // 受理通知书
      } else if (typeNum === 3) {
        form.value.type = Type.value[2]; // 批准通知书
      }
    }

    // 填充业务类型
    if (result.business && Array.isArray(result.business) && result.business.length > 0) {
      // 处理业务类型映射表（数字编号到业务名称的映射）
      const businessCodeMap: { [key: string]: string } = {
        '1': 'ICP',
        '2': 'EDI',
        '3': 'ISP',
        '4': 'IDC',
        '5': 'CDN',
        '6': 'VPN',
        '7': 'SP',
        '8': '多方通讯',
        '9': '呼叫中心业务',
        '10': '文网文',
        '11': '变更',
      };

      // 将业务数组转换为业务名称数组
      const businessNames = result.business
        .map((business: string | number) => {
          // 如果是数字或数字字符串，尝试从映射表中获取对应的业务名称
          if (typeof business === 'number' || !isNaN(Number(business))) {
            return businessCodeMap[business.toString()] || '';
          }
          // 如果是字符串，直接使用
          return business;
        })
        .filter(Boolean); // 过滤掉空字符串

      // 将名称数组与Types数组匹配，只选择有效的业务类型
      form.value.types = businessNames.filter((businessName: string) => {
        return Types.value.some((type) => type.name === businessName);
      });
    }

    // 填充发证时间
    if (result.issuance) {
      try {
        // 检查是否是中文日期格式（如：2025年07月07日）
        if (typeof result.issuance === 'string' && result.issuance.includes('年') && result.issuance.includes('月') && result.issuance.includes('日')) {
          // 解析中文日期格式
          const dateMatch = result.issuance.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
          if (dateMatch) {
            const [_, year, month, day] = dateMatch;
            // JavaScript月份是0-11，所以要减1
            const issuanceDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            if (!isNaN(issuanceDate.getTime())) {
              time.value = issuanceDate;
            }
          }
        } else {
          // 尝试标准日期格式解析
          const issuanceDate = new Date(result.issuance);
          if (!isNaN(issuanceDate.getTime())) {
            time.value = issuanceDate;
          }
        }
      } catch (e) {
        console.error('解析日期失败:', e, result.issuance);
      }
    }

    ElMessage({
      message: '已自动填充识别到的信息',
      type: 'success',
      plain: true,
    });
  } catch (error) {
    console.error('自动填充表单失败:', error);
    ElMessage({
      message: '自动填充表单失败',
      type: 'error',
      plain: true,
    });
  }
};

// 提交
const onSubmit = async () => {
  if (!company.value) {
    ElMessage({
      message: '请输入公司名称',
      type: 'error',
      plain: true,
    });
    return false;
  }
  if (!form.value.type) {
    ElMessage({
      message: '请选择证书类型',
      type: 'error',
      plain: true,
    });
    return false;
  }
  if (form.value.types.length < 1) {
    ElMessage({
      message: '请选择业务种类',
      type: 'error',
      plain: true,
    });
    return false;
  }
  if (!form.value.area) {
    ElMessage({
      message: '请选择地区',
      type: 'error',
      plain: true,
    });
    return false;
  }
  if (!time.value) {
    ElMessage({
      message: '请选择时间',
      type: 'error',
      plain: true,
    });
    return false;
  }
  if (!fileCurrent.value) {
    ElMessage({
      message: '等待图片上传',
      type: 'error',
      plain: true,
    });
    return false;
  }
  const loading = ElLoading.service({
    lock: true,
    text: 'Loading',
    background: 'rgba(255, 255, 255, 0.5)',
  });
  // 将form.value.time时间格式转为 yyyy-MM-dd
  const dataTime = new Date((time.value || new Date()).valueOf() + 8 * 60 * 60 * 1000).toISOString().split('T')[0];
  await axios
    .post(
      'https://strapi.phrynus.cn/api/permits',
      {
        data: {
          company: company.value,
          type: form.value.type,
          img: fileCurrent.value.id,
          types: form.value.types,
          area: form.value.area,
          time: dataTime,
          ref: form.value.ref,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${store.token}`,
        },
      }
    )
    .catch((err) => {
      loading.close();
      ElMessage({
        message: err.response.data.message,
        type: 'error',
        plain: true,
      });
    })
    .then(() => {
      loading.close();
      ElMessage({
        message: '提交成功',
        type: 'success',
        plain: true,
      });
      store.refresh = !store.refresh;
      props.onClose();
      // 清空表单
      resetForm();
      fileCurrent.value = undefined;
      fileList.value = [];
    });
};
onMounted(() => {
  if (document.body.clientWidth < 992) {
    direction.value = 'btt';
    drawerSize.value = '90%';
  }

  watch(company, () => {
    let i = 0;
    for (const [city, regex] of cityRegexList.value) {
      i++;
      if (regex.test(company.value)) {
        form.value.area = Area.value[i - 1];
        break;
      }
    }
  });
});
</script>
<template>
  <el-drawer v-model="props.switch" :size="drawerSize" :direction="direction" :before-close="props.onClose">
    <template #header>
      <h4>上传资料上传</h4>
    </template>
    <template #default>
      <el-form :model="form" label-width="auto" style="max-width: 600px">
        <el-form-item label="公司名称:">
          <el-input v-model="company" placeholder="XXXX有限公司" />
        </el-form-item>
        <el-form-item label="证书编号:">
          <el-input v-model="form.ref" placeholder="许可证编号" />
        </el-form-item>
        <el-form-item label="证书类型:">
          <el-select placement="left" v-model="form.type" placeholder="许可证、受理通知书、批准通知书">
            <el-option v-for="time in Type" :key="time" :label="time.replace(/[\s\S]{2}/, '')" :value="time" />
          </el-select>
        </el-form-item>
        <el-form-item label="业务种类:">
          <el-select placement="left" v-model="form.types" :multiple="true" placeholder="ICP、EDI">
            <el-option v-for="time in Types" :key="time.name" :label="time.info" :value="time.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="地区:">
          <el-select placement="left" v-model="form.area" placeholder="安徽、北京">
            <el-option v-for="time in Area" :key="time" :label="time.replace(/[\s\S]{3}/, '')" :value="time" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间:">
          <el-date-picker placement="left" v-model="time" format="YYYY-MM-DD" type="date" placeholder="发证日期" style="width: 100%" />
        </el-form-item>
        <el-form-item label="图片:">
          <div class="image-selector">
            <!-- 图片选择器 -->
            <el-upload
              action="https://strapi.phrynus.cn/api/upload"
              list-type="picture"
              :on-remove="handleImageRemove"
              :on-success="handleImageSuccess"
              :on-error="
                () => {
                  ElMessage({
                    message: '上传失败',
                    type: 'error',
                    plain: true,
                  });
                }
              "
              :file-list="fileList"
              accept="image/*"
              :multiple="false"
              :limit="1"
              :drag="true"
              name="files"
              :http-request="uploadImage"
            >
              <div v-if="!fileCurrent || !fileCurrent.url" class="icoBox">
                <Icon name="iconshangchuan" />
              </div>
            </el-upload>
          </div>
        </el-form-item>

        <el-form-item label="硅基流动:">
          <el-input v-model="siliconFlowStore.apiKey" placeholder="请输入硅基流动API密钥" type="password" show-password />
          <div class="api-key-note">
            <small>上传图片后将自动识别许可证信息</small>
          </div>
        </el-form-item>

        <el-form-item label="模型选择:">
          <el-select v-model="siliconFlowStore.currentModel" placeholder="请选择模型" style="width: 100%">
            <el-option v-for="option in modelOptions" :key="option.value" :label="`${option.name} (${option.price})`" :value="option.value" />
          </el-select>
        </el-form-item>

        <el-form-item v-if="fileCurrent && fileCurrent.url">
          <el-button @click="reidentifyImage" type="primary" plain style="width: 100%">
            <Icon name="iconshangchuan" style="margin-right: 5px" />
            重新识别图片
          </el-button>
        </el-form-item>
      </el-form>
    </template>
    <template #footer>
      <div style="flex: auto">
        <el-button @click="onSubmit" type="primary">提交</el-button>
      </div>
    </template>
  </el-drawer>
</template>
<style lang="scss" scoped>
.image-selector {
  width: 100%;
  .icoBox {
    height: 120px;
    text-align: center;
    line-height: 120px;
    .icon {
      font-size: 28px;
      color: #8c939d;
    }
  }
}

.api-key-note {
  margin-top: 5px;
  color: #909399;
}
</style>
<style>
.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}
.el-upload-dragger {
  padding: 0;
}
</style>
