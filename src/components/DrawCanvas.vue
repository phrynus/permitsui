<script lang="ts" setup>
import { onMounted, ref, defineProps, watch } from "vue";
const drawCanvas = ref<HTMLCanvasElement | null>(null);

// 接收传递的参数 添加事件
const props = defineProps({
  width: {
    type: Number,
    default: 800
  },
  height: {
    type: Number,
    default: 600
  },
  rectangles: {
    type: Array as any,
    default: () => []
  },
  // 添加事件 close
  onClose: {
    type: Function as any,
    default: (e: any) => {}
  }
});

let ctx: any;
let canvas: any;
const state: {
  isDrawing: boolean;
  start: { x: number; y: number };
  current: { x: number; y: number };
  rectangles: { x: number; y: number; width: number; height: number }[];
} = {
  isDrawing: false,
  start: {
    x: 0,
    y: 0
  },
  current: {
    x: 0,
    y: 0
  },
  rectangles: props.rectangles || []
};

const getRatioPos = (e: any) => {
  const { left, top, width, height } = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - left) / width,
    y: (e.clientY - top) / height
  };
};
// 将比例位置转换为 canvas 内实际绘制时的像素坐标
const ratioToAbs = (pos: { x: number; y: number }) => ({
  x: pos.x * canvas.width,
  y: pos.y * canvas.height
});
// 重绘函数：绘制已保存的矩形和当前绘制的矩形
const redraw = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 绘制已保存的矩形（转换为绝对坐标绘制）
  state.rectangles.forEach(({ x, y, width, height }) => {
    const absX = x * canvas.width,
      absY = y * canvas.height,
      absW = width * canvas.width,
      absH = height * canvas.height;
    ctx.strokeRect(absX, absY, absW, absH);
    ctx.fillStyle = "rgba(52, 152, 219, 0.1)";
    ctx.fillRect(absX, absY, absW, absH);
  });

  // 绘制当前矩形
  if (state.isDrawing) {
    const absStart = ratioToAbs(state.start),
      absCurrent = ratioToAbs(state.current),
      w = absCurrent.x - absStart.x,
      h = absCurrent.y - absStart.y;
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = "#3498db";
    ctx.strokeRect(absStart.x, absStart.y, w, h);
    ctx.fillStyle = "rgba(52, 152, 219, 0.1)";
    ctx.fillRect(absStart.x, absStart.y, w, h);
    ctx.setLineDash([]);
  }
};

const startDrawing = (e: any) => {
  if (e.touches) e.preventDefault();
  const pos = getRatioPos(e.touches ? e.touches[0] : e);
  state.isDrawing = true;
  state.start = pos;
  state.current = { ...pos };
  redraw();
};

const moveDrawing = (e: any) => {
  if (!state.isDrawing) return;
  if (e.touches) e.preventDefault();
  state.current = getRatioPos(e.touches ? e.touches[0] : e);
  redraw();
};

const endDrawing = () => {
  if (!state.isDrawing) return;
  // 将比例位置转换为实际像素后再判断绘制阈值
  const absStart = ratioToAbs(state.start),
    absCurrent = ratioToAbs(state.current),
    w = Math.abs(absCurrent.x - absStart.x),
    h = Math.abs(absCurrent.y - absStart.y);
  // 只保存大于 5px 的矩形
  if (w > 5 && h > 5) {
    state.rectangles.push({
      x: Math.min(state.start.x, state.current.x),
      y: Math.min(state.start.y, state.current.y),
      width: Math.abs(state.current.x - state.start.x),
      height: Math.abs(state.current.y - state.start.y)
    });
  }
  state.isDrawing = false;
  redraw();
};

// 初始化画布
const initCanvas = () => {
  canvas.width = props.width - 2;
  canvas.height = props.height - 2;
  canvas.style.top = window.innerHeight / 2 - canvas.height / 2 - 2 + "px";
  canvas.style.left = window.innerWidth / 2 - canvas.width / 2 - 2 + "px";
  redraw();
};

onMounted(() => {
  canvas = drawCanvas.value as HTMLCanvasElement;
  ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

  ["mousedown", "touchstart"].forEach((evt) => canvas.addEventListener(evt, startDrawing));
  ["mousemove", "touchmove"].forEach((evt) => canvas.addEventListener(evt, moveDrawing));
  ["mouseup", "mouseout", "touchend"].forEach((evt) => canvas.addEventListener(evt, endDrawing));
  // 监听右键事件
  canvas.addEventListener("contextmenu", (e: any) => {
    e.preventDefault();
    if (state.rectangles?.length > 0) {
      state.rectangles.pop();
      redraw();
    }
  });

  watch(props, () => {
    initCanvas();
  });
  initCanvas();
});
</script>
<template>
  <div class="draw-canvas-box">
    <canvas ref="drawCanvas"></canvas>
    <div
      @click="props.onClose(state.rectangles)"
      @contextmenu="
        (e:any) => {
          e.preventDefault();
          props.onClose(state.rectangles);
        }
      "
      class="bg"
    ></div>
  </div>
</template>
<style lang="scss" scoped>
.draw-canvas-box {
  position: fixed;
  z-index: 3000;
  left: 0px;
  top: 0px;
  width: 100%;
  height: 100%;
}
canvas {
  border: 2px dashed red;
  background: #0000;
  cursor: crosshair;
  position: absolute;
  z-index: 2;
}
.bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  background-color: #0000;
}
</style>
