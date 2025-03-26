<script setup lang="ts">
// ============== 依赖导入 ==============
// Vue 核心功能
import { ref, onMounted, watch } from "vue";
// 查询字符串处理库
import qs from "qs";
// 自定义图标组件
import Icon from "@/components/Icon.vue";
// Pinia 状态管理
import { userestStore } from "@/stores/rest";
import { watermarkTextStore } from "@/stores/watermarkText";
// HTTP 请求库
import axios from "axios";
// Element Plus 组件
import { ElMessage, ElLoading, ElMessageBox } from "element-plus";
// 瀑布流布局组件
import "wc-waterfall";
// 自定义画布组件（用于打码区域编辑）
import DrawCanvas from "@/components/DrawCanvas.vue";
import UploadPermit from "@/components/UploadPermit.vue";

// ============== 状态初始化 ==============
// 获取筛选条件存储实例
const store: any = userestStore();
// 获取水印配置存储实例
const watermarkText: any = watermarkTextStore();
// 许可证数据列表
const moulds: any = ref([]);
// 瀑布流列数（响应式）
const waterCol = ref(4);
// 滚动条组件引用
const scrollbar = ref();
// 筛选框DOM引用
const screenBox: any = ref(false);

// 可选的许可证类型标签
const tags: any = ref(["ICP", "EDI", "ISP", "IDC", "CDN", "SP", "多方通讯", "呼叫中心业务"]);

// 可选地区列表
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

// 分页相关
const page = ref(1); // 当前页码
const pageSize = ref(24); // 每页数量
const isApiGo = ref(false); // 防止重复请求标志
const notHave = ref(false); // 是否还有更多数据

// 图片查看器相关状态
const imageViewerIndex = ref(0); // 当前查看图片索引
const imageViewerShow = ref(false); // 查看器显示状态
const imageViewerList = ref([]); // 查看器图片列表
const imageViewerId = ref(); // 当前查看许可证ID
const imageViewerMould = ref(); // 当前查看许可证数据

// 水印输入框禁用状态（防止频繁操作）
const imgTextDisabled = ref(false);

// 打码画布相关状态
const drawCanvasShow = ref(false); // 画布显示状态
const drawCanvasWidth = ref(100); // 画布宽度
const drawCanvasHeight = ref(100); // 画布高度
const drawCanvasRectangles = ref<
  {
    // 打码区域坐标
    x: number;
    y: number;
    width: number;
    height: number;
  }[]
>([]);

const uploadPermitSwitch = ref(false);

// ============== 核心功能方法 ==============

/**
 * 筛选框展开/收起切换
 */
const screen = () => {
  if (screenBox.value.clientHeight > 50) {
    // 收起筛选框
    screenBox.value.style.height = "30px";
  } else {
    // 展开筛选框（自适应高度）
    screenBox.value.style.height = screenBox.value.scrollHeight + "px";
  }
};

/**
 * 构建Strapi查询参数
 * @returns {string} 序列化后的查询字符串
 */
const getQuery = () => {
  // 构建过滤条件
  let filters: any = {
    $and: [
      { types: { $contains: store.tags } }, // 类型筛选
      { area: { $contains: store.areas } }, // 地区筛选
      { type: { $contains: store.explore } }, // 探索类型筛选
      { company: { $contains: store.search } } // 公司名称搜索
    ]
  };

  // 序列化为查询字符串
  return qs.stringify(
    {
      filters,
      populate: "imgs", // 关联图片数据
      sort: "createdAt:desc", // 按创建时间降序
      pagination: {
        page: page.value,
        pageSize: pageSize.value
      }
    },
    { encodeValuesOnly: true } // 保持URL整洁
  );
};

/**
 * 获取许可证数据
 * @param {boolean} load - 是否显示加载动画
 */
const apiGo = async (load = true) => {
  // 防止重复请求
  if (isApiGo.value) return;
  isApiGo.value = true;

  let loading;
  // 显示加载动画
  if (load) {
    loading = ElLoading.service({
      lock: true,
      text: "Loading",
      background: "rgba(255, 255, 255, 0.5)"
    });
  }

  try {
    // 发起API请求
    await axios
      .get(`https://strapi.gommd.com/api/permits?${getQuery()}`, {
        headers: {
          Authorization: `Bearer ${store.token}` // 携带认证token
        }
      })
      .then((res: any) => {
        // 更新数据列表（分页加载或重置）
        if (load) {
          moulds.value = res.data.data;
        } else {
          moulds.value = [...moulds.value, ...res.data.data];
        }
        if (res.data.data.length == 0) {
          notHave.value = true;
          throw "到达底部";
        }
      });

    page.value++; // 页码自增

    // 关闭加载动画
    if (load && loading) {
      loading.close();
    }

    // 显示成功提示
    ElMessage.success({
      message: "加载成功",
      duration: 800
    });
    isApiGo.value = false;
  } catch (error: any) {
    // 错误处理
    console.error(error);
    ElMessage.error({
      message: error.toString(),
      duration: 1500 // 持续显示
    });
  }
};

/**
 * 滚动事件处理（无限加载）
 * @param {Object} e - 滚动事件对象
 */
const scroll = async (e: any) => {
  // 判断是否滚动到底部阈值
  if (scrollbar.value.wrapRef.scrollHeight - scrollbar.value.wrapRef.clientHeight - e.scrollTop < 600) {
    // 防止重复请求或数据不足
    if (isApiGo.value || moulds.value.length < pageSize.value || notHave.value) return;

    isApiGo.value = false;
    screenBox.value.style.height = "30px"; // 收起筛选框
    apiGo(false); // 加载更多数据
  }
};

/**
 * 响应式调整瀑布流列数
 */
const resize = () => {
  // 根据视口宽度动态调整列数
  if (document.body.clientWidth < 992) {
    waterCol.value = 2; // 小屏：2列
    pageSize.value = 12; // 小屏：每页12条数据
  } else if (document.body.clientWidth < 1200) {
    waterCol.value = 3; // 中屏：3列
  } else {
    waterCol.value = 4; // 大屏：4列
  }
};

/**
 * 查看许可证详情
 * @param {string} id - 许可证ID
 */
const goMoulds = async (id: any) => {
  // 显示加载动画
  let loading = ElLoading.service({
    lock: true,
    text: "Loading",
    background: "rgba(255, 255, 255, 0.5)"
  });

  try {
    // 获取当前许可证数据
    let mould = moulds.value.filter((item: any) => item.documentId === id)[0];
    let imgs = mould.imgs.map((item: any) => item.url);
    imageViewerMould.value = mould;

    // 为每张图片添加水印
    for (const img of imgs) {
      let w = await watermark(watermarkText.text, img);
      imgs[imgs.indexOf(img)] = w;
    }

    // 显示图片查看器
    imageViewerShow.value = true;
    imageViewerList.value = imgs;
    imageViewerId.value = id;
    imageViewerIndex.value = 0;
  } finally {
    loading.close(); // 关闭加载动画
  }
};

/**
 * 图片水印处理
 * @param {string} text - 水印文字
 * @param {string} blob - 图片URL
 * @returns {Promise<string>} 带水印的图片Base64
 */
const watermark = (text: string, blob: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    // 无水印且不打码时直接返回原图
    if (!watermarkText.watermark && !watermarkText.mosaic) {
      resolve(blob);
      return;
    }

    const img = new Image();
    img.crossOrigin = "Anonymous"; // 解决跨域问题

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", { willReadFrequently: true });

      if (!ctx) {
        resolve(blob);
        return;
      }

      // 设置画布尺寸与图片一致
      canvas.width = img.width;
      canvas.height = img.height;

      // 绘制原图
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // 添加文字水印
      if (watermarkText.watermark) {
        const fontSize = Math.max(canvas.width, canvas.height) / 60;
        ctx.font = `${fontSize}px ZCOOL KuaiLe`;
        ctx.fillStyle = "rgba(0, 0, 0, 0.09)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // 计算水印平铺密度
        const textWidth = ctx.measureText(text).width;
        const textHeight = fontSize;
        const x = 1 * (1.7 - text.length / 10);
        const spacingX = textWidth * (x < 0.4 ? 0.4 + text.length / 10 : x);
        const spacingY = textHeight * 3 * 1.5;

        // 平铺旋转水印
        for (let x = -1; x < canvas.width; x += spacingX) {
          for (let y = -1; y < canvas.height; y += spacingY) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate((-45 * Math.PI) / 180); // -45度旋转
            ctx.fillText(text, 0, 0);
            ctx.restore();
          }
        }
      }

      // 添加打码区域
      if (imageViewerMould.value.mosaic && imageViewerMould.value.mosaic.length > 0 && watermarkText.mosaic) {
        pixelateRegion(ctx, imageViewerMould.value.mosaic);
      }

      // 导出为JPEG格式
      resolve(canvas.toDataURL("image/jpeg"));
    };

    img.onerror = () => {
      reject(new Error("图片加载失败"));
    };

    img.src = blob;
  });
};

/**
 * 防抖函数
 * @param {Function} fn - 要执行的函数
 * @param {number} wait - 等待时间(ms)
 * @returns {Function} 防抖处理后的函数
 */
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

/**
 * 区域像素化处理（打码）
 * @param {CanvasRenderingContext2D} ctx - 画布上下文
 * @param {Array} regions - 打码区域数组
 */
function pixelateRegion(ctx: any, regions: any) {
  const canvasWidth = ctx.canvas.width;
  const canvasHeight = ctx.canvas.height;

  regions.forEach((region: any) => {
    // 计算实际像素坐标
    const x = Math.floor(region.x * canvasWidth);
    const y = Math.floor(region.y * canvasHeight);
    const width = Math.floor(region.width * canvasWidth);
    const height = Math.floor(region.height * canvasHeight);

    // 创建临时画布处理模糊效果
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext("2d") as CanvasRenderingContext2D;

    // 拷贝区域到临时画布
    tempCtx.drawImage(ctx.canvas, x, y, width, height, 0, 0, width, height);

    // 应用多重模糊效果
    for (let i = 1; i <= 5; i++) {
      tempCtx.filter = `blur(${i}px)`;
      tempCtx.drawImage(tempCanvas, 0, 0);
    }

    // 将处理后的区域绘制回原画布
    ctx.drawImage(tempCanvas, 0, 0, width, height, x, y, width, height);
  });
}

/**
 * 水印变化监听（防抖处理）
 */
const watermarkTextWatch = debounce(async () => {
  if (imageViewerShow.value) {
    imgTextDisabled.value = true; // 禁用输入框

    try {
      // 重新生成带水印的图片
      let mould = moulds.value.filter((item: any) => item.documentId === imageViewerId.value)[0];
      let imgs = mould.imgs.map((item: any) => item.url);

      for (const img of imgs) {
        let w = await watermark(watermarkText.text, img);
        imgs[imgs.indexOf(img)] = w;
      }

      imageViewerList.value = imgs; // 更新查看器图片
    } finally {
      imgTextDisabled.value = false; // 启用输入框
    }
  }
}, 500);

/**
 * 下载当前查看的图片
 * @param {number} index - 图片索引
 */
const download = (index: number) => {
  const url = imageViewerList.value[index] as string;

  // 生成文件名：地区_公司名_序号
  let filename =
    imageViewerMould.value.area.replace(/^[\s\S]{4}/, "") + "_" + imageViewerMould.value.company + "_" + index;

  // 补充文件扩展名
  if (url[0] == "h") {
    filename += url.slice(url.lastIndexOf("."));
  } else {
    filename += ".jpeg";
  }

  // 创建下载链接
  fetch(url)
    .then((response) => response.blob())
    .then((blob) => {
      const blobUrl = URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      URL.revokeObjectURL(blobUrl); // 释放内存
      link.remove();
    });
};

// ============== 长按处理逻辑 ==============
const isLongPress = ref(false);
let pressTimer: any = null;

/**
 * 取消长按计时器
 */
const cancelPress = () => {
  if (pressTimer) {
    clearTimeout(pressTimer);
    pressTimer = null;
  }
};

/**
 * 开始长按计时
 */
const startPress = () => {
  isLongPress.value = false;
  pressTimer = setTimeout(() => {
    isLongPress.value = true;

    // 长按触发打码编辑模式
    if (imageViewerShow.value) {
      ElMessage({
        message: "点击范围外退出"
      });

      // 初始化画布尺寸
      let img = document.querySelectorAll(".home .el-image-viewer__canvas img")[imageViewerIndex.value];
      drawCanvasWidth.value = img.clientWidth;
      drawCanvasHeight.value = img.clientHeight;

      // 加载现有打码区域
      drawCanvasRectangles.value = imageViewerMould.value.mosaic || [];
      drawCanvasShow.value = true; // 显示画布
    }
  }, 300); // 300ms长按阈值
};

/**
 * 点击事件处理
 * @param {Event} event - 点击事件对象
 */
const handleClick = (event: any) => {
  if (isLongPress.value) {
    event.preventDefault(); // 阻止长按后的点击事件
    return;
  }

  // 切换打码显示状态
  watermarkText.mosaic = !watermarkText.mosaic;
};

/**
 * 保存打码区域
 * @param {Array} list - 打码区域坐标数组
 */
const drawCanvasClose = (list: { x: number; y: number; width: number; height: number }[]) => {
  drawCanvasShow.value = false; // 关闭画布

  if (imageViewerId.value) {
    // 更新后端数据
    axios.put(
      `https://strapi.gommd.com/api/permits/${imageViewerId.value}`,
      {
        data: { mosaic: list }
      },
      {
        headers: {
          Authorization: `Bearer ${store.token}`
        }
      }
    );

    // 更新前端状态
    let mould = moulds.value.filter((item: any) => item.documentId === imageViewerId.value)[0];
    mould.mosaic = list;
    imageViewerMould.value.mosaic = list;

    // 刷新水印显示
    watermarkTextWatch();
  }
};

//  uploadPermitClose
const uploadPermitClose = () => {};

// ============== 生命周期钩子 ==============
onMounted(async () => {
  // 初始化筛选框高度
  screenBox.value.style.height = "30px";

  // Token验证（未登录时弹出输入框）
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
      store.token = value; // 保存Token
    });
  }

  // 初始化瀑布流列数
  resize();

  // 监听窗口大小变化
  window.addEventListener("resize", resize);

  // 初始数据加载
  await apiGo();

  // ============== 状态监听 ==============
  // 筛选条件变化时重新加载数据
  watch(store, async () => {
    isApiGo.value = false;
    screenBox.value.style.height = "30px";
    page.value = 1;
    await apiGo();
  });

  // 水印配置变化时更新图片显示
  watch(watermarkText, () => {
    watermarkTextWatch();
  });
});
</script>

<template>
  <!-- 主滚动容器 -->
  <el-scrollbar @scroll="scroll" class="home" ref="scrollbar">
    <!-- 筛选框 -->
    <div class="screenBox" ref="screenBox">
      <!-- 筛选按钮 -->
      <div class="screenBtn" @click="screen()">
        <Icon name="iconedit" />
        <span>筛选</span>
      </div>

      <!-- 许可证类型筛选 -->
      <div class="tagsBox">
        <div :class="{ on: store.tags === '' }" @click="store['tags'] = ''">全部类型</div>
        <div v-for="tag in tags" :key="tag" :class="{ on: tag == store.tags }" @click="store['tags'] = tag">
          <span>{{ tag }}</span>
        </div>
      </div>

      <!-- 地区筛选 -->
      <div class="tagsBox">
        <div :class="{ on: store.areas === '' }" @click="store['areas'] = ''">全部地区</div>
        <div v-for="area in areas" :key="area" :class="{ on: area == store.areas }" @click="store['areas'] = area">
          <span>{{ area }}</span>
        </div>
      </div>
    </div>

    <!-- 瀑布流布局 -->
    <wc-waterfall :gap="16" :cols="waterCol">
      <!-- 许可证卡片循环 -->
      <div class="moulds" v-for="item in moulds" :key="item.documentId">
        <a @click="goMoulds(item.documentId)">
          <!-- 缩略图 -->
          <div class="img">
            <el-image :src="item.imgs[0]?.formats.small.url" />
          </div>

          <!-- 卡片底部信息 -->
          <div class="mold-footer">
            <div class="title" v-text="item.company"></div>
            <div class="info"></div>
            <div class="tags">
              <div class="tag">
                <!-- 地区标签 -->
                <a class="tag-link" :class="{ on: item.area.replace(/[\s\S]{4}/, '') == store.areas }">
                  {{ item.area.replace(/[\s\S]{4}/, "") }}
                </a>

                <!-- 许可证类型标签 -->
                <a v-for="tag in item.types" class="tag-link" :class="{ on: tag == store.tags }">
                  {{ tag }}
                </a>
              </div>
            </div>
          </div>
        </a>
      </div>
    </wc-waterfall>
    <!-- 图片查看器 -->
    <el-image-viewer
      v-if="imageViewerShow"
      @close="imageViewerShow = false"
      :url-list="imageViewerList"
      show-progress
      hide-on-click-modal
      @switch="(i: number) => imageViewerIndex = i"
    >
      <!-- 自定义工具栏 -->
      <template #toolbar="{ activeIndex }">
        <!-- 水印文字输入 -->
        <el-input
          class="imageViewerInput"
          :disabled="imgTextDisabled"
          v-model="watermarkText.text"
          style="width: 240px"
        />

        <Icon
          @click="watermarkText.watermark = !watermarkText.watermark"
          :name="watermarkText.watermark ? 'iconwenzixiaoguo-copy' : 'iconwenzixiaoguo'"
        />

        <Icon
          @mousedown="startPress"
          @mouseup="cancelPress"
          @mouseleave="cancelPress"
          @touchstart="startPress"
          @touchend="cancelPress"
          @touchcancel="cancelPress"
          @click="handleClick"
          :name="watermarkText.mosaic ? 'iconicomosaic' : 'iconicomosaic-ash'"
        />

        <!-- 下载按钮 -->
        <Icon @click="download(activeIndex)" name="icondownload" />
      </template>
    </el-image-viewer>
  </el-scrollbar>

  <!-- 打码区域编辑画布 -->
  <DrawCanvas
    v-if="drawCanvasShow"
    @close="drawCanvasClose"
    :width="drawCanvasWidth"
    :height="drawCanvasHeight"
    :rectangles="drawCanvasRectangles"
  />
  <UploadPermit :switch="uploadPermitSwitch" @close="uploadPermitClose" />
</template>

<style lang="scss" scoped>
.box-item * {
  outline: initial;
}
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
        padding: 0 6px !important;
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
      padding: 0 16px;
      width: max-content;
      height: 30px;
      border-radius: 16px;
      cursor: pointer;
      line-height: 30px;
      font-size: 15px;
      background-color: var(--el-color-success);
      // font-weight: bold;
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
  box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;
  .icon {
    fill: #333;
  }
}
</style>
