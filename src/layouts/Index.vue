<script lang="ts" setup>
import Nav from "~/components/Nav.vue";
import Explore from "~/components/Explore.vue";
</script>
<template>
  <div class="Index">
    <Nav />
    <div class="container">
      <Explore />
      <div class="main">
        <div class="asdasdad"></div>
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.container {
  display: flex;
  .main {
    position: relative;
    flex: 1;
    width: 0;

    height: calc(100vh - 72px);
    @media (max-width: 768px) {
      padding-left: 0;
      padding-top: 0px;
    }
  }
}
</style>
