<template>
  <div ref="chartRef" style="width:100%;height:300px"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps<{ option: echarts.EChartsOption }>()
const chartRef = ref<HTMLElement | null>(null)
let chart: echarts.ECharts | null = null

onMounted(() => {
  if (chartRef.value) {
    chart = echarts.init(chartRef.value)
    chart.setOption(props.option)
  }
})

watch(() => props.option, (val) => chart?.setOption(val, { notMerge: true }), { deep: true })

function getChart(): echarts.ECharts | null {
  return chart
}

defineExpose({ getChart })
</script>
