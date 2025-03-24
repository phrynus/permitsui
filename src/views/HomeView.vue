<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import qs from "qs";
import Icon from "@/components/Icon.vue";
import { userestStore } from "@/stores/rest";
import { watermarkTextStore } from "@/stores/watermarkText";
import axios from "axios";
import { ElMessage, ElLoading, ElMessageBox, ElNotification, ElIcon } from "element-plus";
import "wc-waterfall";
import { setToken } from "@/utils/axios";

const store: any = userestStore();
const watermarkText: any = watermarkTextStore();
const moulds: any = ref([]);
const waterCol = ref(4);
const scrollbar = ref();
const screenBox: any = ref(false);
const tags: any = ref(["ICP", "EDI", "ISP", "IDC", "CDN", "SP", "多方通讯", "呼叫中心业务"]);
const areas = ref([
  "安徽",
  "北京",
  "重庆",
  "福建",
  "广东",
  "广西",
  "贵州",
  "海南",
  "河北",
  "河南",
  "黑龙江",
  "湖北",
  "湖南",
  "吉林",
  "江苏",
  "江西",
  "辽宁",
  "内蒙古",
  "山东",
  "山西",
  "陕西",
  "上海",
  "四川",
  "天津",
  "云南",
  "浙江"
]);
const page = ref(1);
const pageSize = ref(24);
const isApiGo = ref(false);
const imageViewerShow = ref(false);
const imageViewerList = ref([]);
const imageViewerId = ref();
const imageViewerMould = ref();
const imgTextDisabled = ref(false);

const screen = () => {
  if (screenBox.value.clientHeight > 50) {
    screenBox.value.style.height = "30px";
  } else {
    screenBox.value.style.height = screenBox.value.scrollHeight + "px";
  }
};
const getQuery = () => {
  let filters: any = {};

  filters = {
    $and: [
      {
        types: {
          $contains: store.tags
        }
      },
      {
        area: {
          $contains: store.areas
        }
      },
      {
        type: {
          $contains: store.explore
        }
      },
      {
        company: {
          $contains: store.search
        }
      }
    ]
  };

  let query = qs.stringify(
    {
      filters,
      populate: "imgs",
      sort: "createdAt:desc",
      pagination: {
        page: page.value,
        pageSize: pageSize.value
      }
    },
    {
      encodeValuesOnly: true // prettify URL
    }
  );
  // console.log(query);
  return query;
};
const apiGo = async (load = true) => {
  if (isApiGo.value) return;
  isApiGo.value = true;
  let loading;
  if (load) {
    loading = ElLoading.service({
      lock: true,
      text: "Loading",
      background: "rgba(255, 255, 255, 0.5)"
    });
  }

  try {
    await axios
      .get(`https://strapi.gommd.com/api/permits?${getQuery()}`, {
        headers: {
          Authorization: `Bearer ${store.token}`
        }
      })
      .then((res: any) => {
        if (load) {
          moulds.value = res.data.data;
        } else {
          moulds.value = [...moulds.value, ...res.data.data];
        }
      });
    page.value++;
    if (load && loading) {
      loading.close();
    }
    ElMessage.success({
      message: "加载成功",
      duration: 800
    });
    isApiGo.value = false;
  } catch (error: any) {
    console.log(error);
    ElMessage.error({
      message: error.toString(),
      duration: 0
    });
  }
};
const scroll = async (e: any) => {
  if (scrollbar.value.wrapRef.scrollHeight - scrollbar.value.wrapRef.clientHeight - e.scrollTop < 600) {
    if (isApiGo.value || moulds.value.length < 24) return;
    isApiGo.value = false;
    screenBox.value.style.height = "30px";
    apiGo(false);
  }
};
const resize = () => {
  // 判断屏幕宽度
  if (document.body.clientWidth < 992) {
    waterCol.value = 2;
  } else if (document.body.clientWidth < 1200) {
    waterCol.value = 3;
  } else {
    waterCol.value = 4;
  }
};

const goMoulds = async (id: any) => {
  let loading = ElLoading.service({
    lock: true,
    text: "Loading",
    background: "rgba(255, 255, 255, 0.5)"
  });
  let mould = moulds.value.filter((item: any) => item.documentId === id)[0];
  let imgs = mould.imgs.map((item: any) => item.url);
  for (const img of imgs) {
    let w = await watermark(watermarkText.text, img);
    imgs[imgs.indexOf(img)] = w;
  }
  loading.close();
  imageViewerShow.value = true;
  imageViewerList.value = imgs;
  imageViewerId.value = id;
  imageViewerMould.value = mould;
};

const watermark = (text: string, blob: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (text == "") {
      resolve(blob);
      return;
    }
    // 创建一个Image对象
    const img = new Image();
    img.crossOrigin = "Anonymous"; // 允许跨域
    img.src = blob;

    // 图片加载成功
    img.onload = () => {
      // 创建一个Canvas元素
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        resolve(blob);
        return;
      }

      // 设置Canvas的尺寸与图片一致
      canvas.width = img.width;
      canvas.height = img.height;

      // 将图片绘制到Canvas上
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // 设置水印文本的样式
      const fontSize = Math.max(canvas.width, canvas.height) / 60; // 根据图片尺寸动态调整字体大小
      ctx.font = `${fontSize}px ZCOOL KuaiLe`;
      ctx.fillStyle = "rgba(0, 0, 0, 0.09)"; // 半透明白色
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      // 设置字体

      // 计算水印的平铺密度
      const textWidth = ctx.measureText(text).width;
      const textHeight = fontSize;
      const x = 1 * (1.7 - text.length / 10);
      const spacingX = textWidth * (x < 0.4 ? 0.4 + text.length / 10 : x);

      const spacingY = textHeight * 3 * 1.5; // 垂直间距

      // 平铺水印
      for (let x = -1; x < canvas.width; x += spacingX) {
        for (let y = -1; y < canvas.height; y += spacingY) {
          ctx.save(); // 保存当前Canvas状态
          ctx.translate(x, y); // 移动原点
          ctx.rotate((-45 * Math.PI) / 180); // 旋转水印
          ctx.fillText(text, 0, 0); // 绘制水印
          ctx.restore(); // 恢复Canvas状态
        }
      }

      // 将Canvas转换回Base64编码的图片
      const watermarkedImage = canvas.toDataURL("image/jpeg");
      resolve(watermarkedImage); // 返回带有水印的Base64图片
    };

    // 图片加载失败
    img.onerror = (error) => {
      reject(new Error("Failed to load image."));
    };
  });
};

function debounce(fn: Function, wait: number) {
  let timeout: number | undefined;
  return function (this: any, ...args: any[]) {
    const that = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      timeout = undefined;
      fn.apply(that, args);
    }, wait);
  };
}

const watermarkTextWatch = debounce(async () => {
  if (imageViewerShow.value) {
    imgTextDisabled.value = true;
    let mould = moulds.value.filter((item: any) => item.documentId === imageViewerId.value)[0];
    let imgs = mould.imgs.map((item: any) => item.url);
    for (const img of imgs) {
      let w = await watermark(watermarkText.text, img);
      imgs[imgs.indexOf(img)] = w;
    }
    imageViewerList.value = imgs;
    imgTextDisabled.value = false;
  }
}, 500);

const download = (index: number) => {
  const url = imageViewerList.value[index] as string;
  // 正则替换 imageViewerMould.value.area 前三个字符为空
  let filename =
    imageViewerMould.value.area.replace(/^[\s\S]{4}/, "") + "_" + imageViewerMould.value.company + "_" + index;
  if (url[0] == "h") {
    filename += url.slice(url.lastIndexOf("."));
  } else {
    filename += ".jpeg";
  }

  fetch(url)
    .then((response) => response.blob())
    .then((blob) => {
      const blobUrl = URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      URL.revokeObjectURL(blobUrl);
      link.remove();
    });
};

onMounted(async () => {
  screenBox.value.style.height = "30px";
  if (!store.token) {
    await ElMessageBox.prompt("", "填写 Token", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      showCancelButton: false,
      closeOnPressEscape: false,
      closeOnClickModal: false,
      showClose: false,
      inputPattern: /^[a-z0-9]{256}$/,
      inputErrorMessage: "请输入内容"
    }).then(async ({ value }) => {
      store.token = value;
    });
  }
  resize();
  // 监听屏幕宽度变化
  window.addEventListener("resize", resize);

  // 初始化
  await apiGo();

  watch(store, async (newVal, oldVal) => {
    isApiGo.value = false;
    screenBox.value.style.height = "30px";
    page.value = 1;
    await apiGo();
  });
  watch(watermarkText, async (newVal, oldVal) => {
    watermarkTextWatch();
  });
});
</script>
<template>
  <el-scrollbar @scroll="scroll" class="home" ref="scrollbar">
    <div class="screenBox" ref="screenBox">
      <div class="screenBtn" @click="screen()">
        <Icon name="iconedit-filling" />
        <span>筛选</span>
      </div>
      <div class="tagsBox">
        <div :class="{ on: store.tags === '' }" @click="store['tags'] = ''">全部类型</div>
        <div v-for="tag in tags" :key="tag" :class="{ on: tag == store.tags }" @click="store['tags'] = tag">
          <span>{{ tag }}</span>
        </div>
      </div>
      <div class="tagsBox">
        <div :class="{ on: store.areas === '' }" @click="store['areas'] = ''">全部地区</div>
        <div v-for="area in areas" :key="area" :class="{ on: area == store.areas }" @click="store['areas'] = area">
          <span>{{ area }}</span>
        </div>
      </div>
    </div>
    <wc-waterfall :gap="16" :cols="waterCol">
      <div class="moulds" v-for="item in moulds" :key="item.documentId">
        <a @click="goMoulds(item.documentId)">
          <div class="img">
            <el-image :src="item.imgs[0]?.formats.medium.url" />
          </div>
          <div class="mold-footer">
            <div class="title" v-text="item.company"></div>
            <div class="info">
              <!-- {{ item.attributes.pages + "个页面、" + item.attributes.layout + "。" + item.attributes.describe }} -->
            </div>
            <div class="tags">
              <div class="tag">
                <a class="tag-link" :class="{ on: item.area.replace(/[\s\S]{4}/, '') == store.areas }">
                  {{ item.area.replace(/[\s\S]{4}/, "") }}
                </a>
                <a v-for="tag in item.types" class="tag-link" :class="{ on: tag == store.tags }">
                  {{ tag }}
                </a>
              </div>
              <!-- <div class="price">${{ item.attributes.price }}</div> -->
            </div>
          </div>
        </a>
      </div>
    </wc-waterfall>
    <el-image-viewer
      v-if="imageViewerShow"
      @close="imageViewerShow = false"
      :initial-index="0"
      :url-list="imageViewerList"
      show-progress
      hide-on-click-modal
    >
      <template #toolbar="{ activeIndex }">
        <el-input
          class="imageViewerInput"
          :disabled="imgTextDisabled"
          v-model="watermarkText.text"
          style="width: 240px"
        />
        <Icon @click="download(activeIndex)" name="icondownload" />
      </template>
    </el-image-viewer>
  </el-scrollbar>
</template>

<style lang="scss" scoped>
.home {
  position: relative;
  padding-top: 10px;
  padding-left: 20px;
  width: 100%;
  background-color: #fff;
  .el-scrollbar__bar {
    display: none;
  }
  @media screen and (max-width: 959px) {
    padding-top: 0px;
    padding-left: 0px;
  }
  .screenBox {
    position: relative;
    padding-right: 92px;
    overflow: hidden;
    margin-bottom: 12px;
    transition: 0.3s;

    @media screen and (max-width: 959px) {
      padding-right: 42px;
      .screenBtn {
        padding: 0 8px !important;
        span {
          display: none;
        }
        svg {
          margin-right: 0 !important;
        }
      }
      .tagsBox {
        > div {
          padding: 0 12px !important;
          border-radius: 10px !important;
        }
      }
    }
    .tagsBox {
      margin-bottom: 12px;
      display: flex;
      flex-wrap: wrap;
      &:last-child {
        margin-bottom: 0;
      }
      > div {
        padding: 0 20px;
        margin-bottom: 6px;
        width: max-content;
        height: 30px;
        border-radius: 16px;
        cursor: pointer;
        line-height: 30px;
        font-size: 15px;
        &:hover,
        &.on {
          background-color: #00000008;
          font-weight: bold;
        }
      }
    }
    .screenBtn {
      padding: 0 20px;
      width: max-content;
      height: 30px;
      border-radius: 16px;
      cursor: pointer;
      line-height: 30px;
      font-size: 15px;
      background-color: var(--el-color-success);
      font-weight: bold;
      color: #fff;
      position: absolute;
      right: 0;
      svg {
        margin-right: 4px;
        font-size: 18px;
        line-height: 30px;
        color: #fff;
      }
    }
  }

  wc-waterfall {
    @media screen and (max-width: 959px) {
      padding-bottom: 76px;
    }
    .moulds {
      overflow: hidden;
      border-radius: 10px;
      border: 1px solid #ebebeb;
      background-color: #fff;
      a {
        cursor: pointer;
        .img {
          overflow: hidden;
          img {
            width: 100%;
            position: relative;
          }
        }
        .mold-footer {
          padding: 8px;
          .title {
            margin-bottom: 4px;
            margin-top: 4px;
            font-size: 15px;
            letter-spacing: 1px;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
          }
          .info {
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 3;
            margin-bottom: 8px;
            font-size: 12px;
            color: #777;
          }
          .tags {
            border-top: 1px solid #ebebeb;
            padding-top: 8px;
            display: flex;
            justify-content: space-between;
            .tag {
              display: flex;
              flex-wrap: wrap;
              height: 24px;
              overflow: hidden;

              a {
                display: block;
                margin-right: 4px;
                font-size: 12px;
                padding: 2px 6px;
                border-radius: 6px;
                background-color: var(--el-color-success);
                color: #fff;
                margin-bottom: 4px;
                &.on {
                  background-color: var(--el-color-danger);
                }
              }
            }
            .price {
              color: var(--el-color-danger);
              font-weight: bold;
              margin-left: 4px;
            }
          }
        }
      }
    }
  }
}
</style>
<style lang="scss">
.el-image-viewer__actions {
  background-color: #fff;
  opacity: 1;
  .icon {
    fill: #333;
  }
}
</style>
