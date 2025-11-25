<template>
  <el-page-header icon="" class="custom-page-header">
    <template #content>
      <div class="flex flex-col items-center">
        <el-avatar :size="32" class="mb-3" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
        <span class="text-large font-600 mb-1"> Title </span>
        <span class="text-sm mb-2" style="color: var(--el-text-color-regular)"> Sub title </span>
        <el-tag>Default</el-tag>
      </div>
    </template>
  </el-page-header>
</template>

<style scoped>
.custom-page-header {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  min-height: 120px;
  /* 给header一个最小高度，以便更好地展示垂直居中效果 */
}

/* 确保内容区域占满空间并垂直居中 */
:deep(.el-page-header__content) {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>
