<script lang="ts" setup>
import { ref, onMounted, watch } from "vue";
import { ElMessage } from "element-plus";

import { userestStore } from "@/stores/rest";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();
const store: any = userestStore();

const input = ref();
const btn = ref();
const name = ref("许可证库");
const searchgo = ref(false);
const searchgo2 = ref(false);
const uploadPermitSwitch = ref(false);

const mobileSearch = (text: string) => {
  if (text !== "") {
    store.search = text;
    store.explore = "";
    store.tag = "";

    if (route.path !== "/") {
      router.push("/");
    }
  } else {
    ElMessage.warning({
      message: "请输入公司名称",
      plain: true
    });
  }
};
const btnSousuo = () => {
  if (document.body.clientWidth < 768) {
    if (searchgo2.value) {
      mobileSearch(input.value.value);
    } else {
      searchgo.value = true;
      searchgo2.value = true;
      input.value.focus();
    }
  } else {
    mobileSearch(input.value.value);
  }
};
//  uploadPermitClose
const uploadPermitClose = () => {
  uploadPermitSwitch.value = false;
};
// input监听焦点，失去时隐藏搜索框
onMounted(() => {
  input.value.addEventListener("blur", () => {
    searchgo.value = false;
    setTimeout(() => {
      searchgo2.value = false;
    }, 100);
  });
  input.value.addEventListener("keydown", (e: any) => {
    if (e.keyCode == 13) {
      mobileSearch(input.value.value);
    }
  });
});
</script>
<template>
  <div class="nav">
    <div class="container">
      <div class="logo">
        <a href="/">
          {{ name }}
        </a>
      </div>
      <div class="search" :class="searchgo ? 'on' : ''">
        <input type="text" name="key" id="" placeholder="公司名称" :value="store.search" ref="input" />
        <div class="btn" ref="btn">
          <Icon v-if="!store.search" @click="btnSousuo" name="iconsousuo" />
          <Icon v-else name="iconclose" @click="store.search = ''" />
        </div>
      </div>
      <div class="link">
        <a href="javascript:;" @click="uploadPermitSwitch = true" class="wx">
          <Icon name="iconshangchuan" />
          <span>上传</span>
        </a>
      </div>
    </div>
  </div>
  <UploadPermit :switch="uploadPermitSwitch" @close="uploadPermitClose" />
</template>
<style lang="scss" scoped>
.nav {
  width: 100%;
  margin: auto;
  background-color: #fff;
  .container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px 0 24px;
    height: 72px;
    @media (max-width: 695px) {
      padding: 0 16px;
    }
  }
  .logo {
    a {
      font-size: 32px;
      font-weight: 900;
      letter-spacing: 4px;
      padding-right: 10px;
      color: var(--el-color-success);
      font-family: "ZCOOL KuaiLe";
    }
  }
  .search {
    display: flex;
    height: 40px;
    position: relative;
    border-radius: 20px;
    background-color: #00000008;
    transition: 0.3s;
    &.on {
      flex: 1;
      background-color: #00000008;
      input {
        @media screen and (max-width: 695px) {
          padding-left: 16px;
          padding-right: 40px;
          width: 100%;
        }
      }
    }
    @media screen and (min-width: 1728px) {
      width: 533.33333px;
    }
    @media screen and (min-width: 1424px) and (max-width: 1727px) {
      width: calc(-42.66667px + 33.33333vw);
    }

    @media screen and (min-width: 1192px) and (max-width: 1423px) {
      width: calc(-33.6px + 35vw);
    }

    @media screen and (min-width: 960px) and (max-width: 1191px) {
      width: calc(-36px + 40vw);
    }

    @media screen and (min-width: 696px) and (max-width: 959px) {
      width: calc(-40px + 46.66667vw);
    }

    @media screen and (max-width: 695px) {
      width: 40px;
      background-color: #00000000;
      margin-left: auto;
    }
    input {
      padding: 0 84px 0 16px;
      width: 100%;
      height: 100%;
      font-size: 16px;
      line-height: 120%;
      border-radius: 0;
      border: 1px solid #00000000;
      border-radius: 20px;
      background-color: #00000000;
      outline: none;
      transition: 0.3s;
      color: #303133;
      @media screen and (max-width: 695px) {
        padding: 0;
        width: 0px;
      }
      &::placeholder {
        color: #aaa;
      }
    }
    .btn {
      width: 40px;
      height: 40px;
      position: absolute;
      right: 0;
      top: 0;
      cursor: pointer;
      border: 0px;
      border-radius: 0;
      background-color: #00000000;
      .icon {
        font-size: 24px;
        margin-top: 8px;
        margin-left: 8px;
        line-height: 40px;
        color: #999;
      }
    }
  }
  .link {
    display: flex;
    align-items: center;
    padding-left: 10px;
    a {
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 16px;
      height: 35px;
      min-width: 35px;
      @media screen and (max-width: 695px) {
        padding: 0 0px;
      }
      .icon {
        font-size: 35px;
        // margin-left: 10px;
      }
      &.wx {
        background-color: var(--el-color-success);
        border-radius: 20px;
        .icon {
          color: #fff;
          border-radius: 50%;
          font-size: 20px;
          margin-right: 4px;
          @media screen and (max-width: 695px) {
            margin-right: 0px;
          }
        }
        span {
          color: #fff;
          font-size: 14px;
          @media screen and (max-width: 695px) {
            display: none;
          }
        }
      }
    }
  }
}
</style>
