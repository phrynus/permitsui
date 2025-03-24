<script lang="ts" setup>
import { ref, onMounted, watch } from "vue";
import Icon from "@/components/Icon.vue";
import { userestStore } from "@/stores/rest";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();
const store: any = userestStore();

const setExplore = (name: string) => {
  store.explore = name;
  store.search = "";
  if (!name) {
    store.tags = "";
    store.areas = "";
  }
  if (route.path !== "/") {
    router.push("/");
  }
};
onMounted(() => {
  console.log(store.explore);
});
</script>
<template>
  <div class="explore_box">
    <el-scrollbar>
      <div class="explore">
        <div class="item index" :class="store.explore == '' ? 'on' : ''">
          <a @click="setExplore('')">
            <Icon name="iconhome-filling" />
            <span>全部</span>
          </a>
        </div>
        <div class="item a" :class="store.explore == 'A' ? 'on' : ''">
          <a @click="setExplore('A')">
            <Icon name="iconsurvey" />
            <span>许可</span>
          </a>
        </div>
        <div class="item b" :class="store.explore == 'B' ? 'on' : ''">
          <a @click="setExplore('B')">
            <Icon name="iconimage-text" />
            <span>受理</span>
          </a>
        </div>
        <div class="item c" :class="store.explore == 'C' ? 'on' : ''">
          <a @click="setExplore('C')">
            <Icon name="iconimage-text" />
            <span>批准</span>
          </a>
        </div>
        <div class="item c">
          <a>
            <Icon name="iconedit" />
            <span>简述</span>
          </a>
        </div>

        <!-- <div class="item wx">
          <a href="https://work.weixin.qq.com/kfid/kfcab32b37de696f61d">
            <Icon name="iconattachment" />
            <span>发布任务</span>
          </a>
        </div> -->
      </div>
    </el-scrollbar>
  </div>
</template>
<style lang="scss" scoped>
.explore_box {
  margin-top: 10px;
}
.explore {
  height: calc(100vh - 92px);
  display: flex;
  flex-direction: column;

  @media screen and (min-width: 1728px) {
    width: 266.66667px;
    margin-left: 16px;
  }
  @media screen and (min-width: 1424px) and (max-width: 1727px) {
    width: calc(-21.33333px + 16.66667vw);
    margin-left: 16px;
  }
  @media screen and (min-width: 1192px) and (max-width: 1423px) {
    width: calc(-16.8px + 20vw);
    margin-left: 12px;
  }
  @media screen and (min-width: 768px) and (max-width: 1191px) {
    width: calc(-18px + 25vw);
    margin-left: 12px;
  }
  @media screen and (max-width: 768px) {
    position: fixed;
    z-index: 2000;
    background-color: #fff;
    height: auto;
    flex-direction: row;
    justify-content: space-around;
    left: 0;
    width: 100%;
    padding: 0 10px;
    bottom: 0;
    box-shadow: rgba(149, 157, 165, 0.3) 0px 8px 24px;
    padding-top: 10px;
    border-top-right-radius: 20px;
    border-top-left-radius: 20px;

    .item {
      &.on {
        background-color: #00000000 !important;
        position: relative;
        &::before {
          content: "";
          position: absolute;
          width: 100%;
          height: 2px;
          background-color: var(--el-color-success);
          border-radius: 100px;
          left: 0;
          bottom: 8px;
        }
      }
      margin-left: 0px !important;
      padding-left: 0px !important;
      a {
        height: 40px;
        svg {
          display: none;
        }
        span {
          margin: 0 12px;
        }
      }
    }
  }
  .item {
    margin-left: -10px;
    padding-left: 10px;
    // background-color: rgba(0, 0, 0, 0.03);
    border-radius: 100px;
    margin-bottom: 8px;
    &.on {
      background-color: #00000008;
    }
    a {
      display: flex;
      width: 100%;
      height: 48px;
      align-items: center;
      cursor: pointer;
      svg {
        font-size: 24px;
      }
      span {
        font-size: 16px;
        font-weight: 600;
        margin-left: 12px;
      }
    }
  }
}
</style>
