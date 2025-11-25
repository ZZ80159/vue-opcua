<script setup lang="ts">
import PageHeader from '@/components/PageHeader.vue'
import MyMenu from '@/components/MyMenu.vue'
</script>
<template>
  <div class="common-layout">
    <el-container>
      <el-aside width="200px">
        <MyMenu />
      </el-aside>
      <el-container>
        <el-header>
          <PageHeader />
        </el-header>
        <el-main>Main</el-main>
      </el-container>
    </el-container>
  </div>
</template>
