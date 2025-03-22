<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import Icon from "@/components/Icon.vue";
import api from "@/utils/axios";
import { useRouter, useRoute } from "vue-router";
import { ElMessage, ElLoading, ElNotification, ElImage, ElImageViewer, ElRate } from "element-plus";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Navigation, Pagination, Scrollbar, A11y } from "swiper/modules";
import { userestStore } from "@/stores/rest";

const store: any = userestStore();

const isError = ref(false);
const mould: any = ref({});
const modules = [Navigation, Pagination];
const srcList = ref([]);
const imgsBox = ref(false);
const imgsBoxIndex = ref(0);
const rate = ref(5);

// let loading = ElLoading.service({
//   lock: true,
//   text: "Loading",
//   background: "rgba(255, 255, 255, 0.5)"
// });

const router = useRouter();
const route = useRoute();

onMounted(async () => {});
</script>
<template>
  <div style="height: 100%; position: relative">
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>{{ mould?.title || "" }}</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="mould-content">
      <div class="top">
        <div class="images">
          <swiper fit="cover" :navigation="true" :pagination="true" :modules="modules">
            <swiper-slide v-for="(item, index) in mould?.images?.data" :key="index">
              <el-image
                @click="
                  imgsBox = true;
                  imgsBoxIndex = index;
                "
                fit="contain"
                :src="item?.attributes?.url"
                alt=""
              />
            </swiper-slide>
          </swiper>
        </div>
        <!-- <div class="info">
          <el-scrollbar>
            <div class="title">
              <h1>{{ mould?.title || "" }}</h1>
              <div class="flame">
                <Icon name="iconredu" />
              </div>
            </div>
            <div class="o o-text">{{ mould?.describe || "" }}</div>
            <div class="o o-text"><span>页面布局：</span>{{ mould?.layout || "" }}</div>
            <div class="o o-text"><span>页面数量：</span>{{ mould?.pages || "" }}</div>
          </el-scrollbar>
        </div> -->
      </div>
    </div>

    <div class="isError" v-if="isError"></div>
    <el-image-viewer
      v-if="imgsBox"
      :hide-on-click-modal="true"
      :teleported="true"
      @close="imgsBox = false"
      :url-list="srcList"
      :initial-index="imgsBoxIndex"
      :z-index="100000"
    />
  </div>
</template>
<style lang="scss" scoped>
.el-breadcrumb {
  padding: 0 20px;
  margin-bottom: 6px;
  height: 32px;
  border-radius: 16px;
  cursor: pointer;
  line-height: 32px;
  font-size: 14px;
  background-color: #f7f7f7;
  border: 1px solid #00000002;
}
.el-scrollbar {
  width: 100%;
  height: calc(100% - 44px);
  border-radius: 10px;
  overflow: hidden;
}
.isError {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #fff;
  z-index: 999;
}
.mould-content {
  height: calc(100% - 38px);
  padding-bottom: 30px;
  .top {
    // padding: 10px 0;
    display: flex;
    height: 100%;

    .images {
      width: 50%;

      .swiper {
        border-radius: 10px;
        border: 1px solid #00000002;
        overflow: hidden;
        // aspect-ratio: 5/6;
        height: 100%;
        background-color: #f7f7f7;
        .swiper-slide {
          .el-image {
            width: 100%;
            height: 100%;
            cursor: pointer;
          }
          // &:first-child {
          //   img {
          //     object-fit: initial;
          //     height: auto;
          //   }
          // }
        }
      }
    }
    .info {
      flex: 1;
      margin-left: 20px;
      padding-top: 10px;
      .title {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 10px;
        h1 {
          font-size: 28px;
          font-weight: 600;
          margin-bottom: 10px;
        }
      }

      .o {
        margin-bottom: 10px;
        &.o-text {
          margin-right: 10px;
          font-size: 15px;
          color: #666;
        }
      }
    }
  }
}
</style>
