<template>
  <canvas id="YwHA1IIaUg1hDB94d9cAzbjIe3bYRME4"></canvas>
</template>
<script setup>
import { onMounted } from "vue";

onMounted(() => {
  // 获取 canvas 元素和上下文
  const canvas = document.querySelector("#YwHA1IIaUg1hDB94d9cAzbjIe3bYRME4");
  const ctx = canvas.getContext("2d");

  // 鼠标移动状态
  let mouseMoved = false;

  // 鼠标指针位置
  const pointer = {
    x: 0.5 * window.innerWidth,
    y: 0.5 * window.innerHeight
  };

  // 绘图参数
  const params = {
    pointsNumber: 6,
    widthFactor: 0.1,
    mouseThreshold: 0.4,
    spring: 0.3,
    friction: 0.5
  };

  // 轨迹数组
  const trail = new Array(params.pointsNumber);
  for (let i = 0; i < params.pointsNumber; i++) {
    trail[i] = {
      x: pointer.x,
      y: pointer.y,
      dx: 0,
      dy: 0
    };
  }

  // 更新鼠标位置函数
  function updateMousePosition(eX, eY) {
    pointer.x = eX;
    pointer.y = eY;
  }

  // 设置 canvas 尺寸
  function setupCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  // 动画更新函数
  function update(t) {
    if (!mouseMoved) {
      pointer.x = (0.5 + 0.3 * Math.cos(0.002 * t) * Math.sin(0.005 * t)) * window.innerWidth;
      pointer.y = (0.5 + 0.2 * Math.cos(0.005 * t) + 0.1 * Math.cos(0.01 * t)) * window.innerHeight;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    trail.forEach((p, pIdx) => {
      const prev = pIdx === 0 ? pointer : trail[pIdx - 1];
      const spring = pIdx === 0 ? 0.4 * params.spring : params.spring;
      p.dx += (prev.x - p.x) * spring;
      p.dy += (prev.y - p.y) * spring;
      p.dx *= params.friction;
      p.dy *= params.friction;
      p.x += p.dx;
      p.y += p.dy;
    });

    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(trail[0].x, trail[0].y);

    for (let i = 1; i < trail.length - 1; i++) {
      const xc = 0.5 * (trail[i].x + trail[i + 1].x);
      const yc = 0.5 * (trail[i].y + trail[i + 1].y);
      ctx.quadraticCurveTo(trail[i].x, trail[i].y, xc, yc);
      ctx.lineWidth = params.widthFactor * (params.pointsNumber - i);
      ctx.stroke();
    }
    ctx.lineTo(trail[trail.length - 1].x, trail[trail.length - 1].y);
    ctx.stroke();

    window.requestAnimationFrame(update);
  }

  // 初始化 canvas
  setupCanvas();

  // 触发第一帧动画
  update(0);

  // 鼠标点击事件
  window.addEventListener("click", (e) => {
    updateMousePosition(e.clientX, e.clientY);
  });

  // 鼠标移动事件
  window.addEventListener("mousemove", (e) => {
    mouseMoved = true;
    updateMousePosition(e.clientX, e.clientY);
  });
  // 鼠标移入事件
  document.addEventListener("mouseenter", (e) => {
    mouseMoved = true;
    params.pointsNumber = 20;
    updateMousePosition(e.clientX, e.clientY);
    canvas.style.opacity = 0.1;
  });
  // 鼠标移出事件
  document.addEventListener("mouseleave", (e) => {
    mouseMoved = false;
    params.pointsNumber = 10;
    updateMousePosition(e.clientX, e.clientY);
    canvas.style.opacity = 0;
  });

  // 触摸事件
  window.addEventListener("touchmove", (e) => {
    mouseMoved = true;
    updateMousePosition(e.targetTouches[0].clientX, e.targetTouches[0].clientY);
  });

  // 窗口大小改变时重新设置 canvas 尺寸
  window.addEventListener("resize", setupCanvas);
});
</script>
<style lang="scss" scoped>
#YwHA1IIaUg1hDB94d9cAzbjIe3bYRME4 {
  position: fixed;
  z-index: 9999999999;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  top: 0;
  left: 0;
  opacity: 0;
  transition: 0.8s;
}
</style>
