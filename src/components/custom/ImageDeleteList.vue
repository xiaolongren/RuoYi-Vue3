<template>
  <div class="image-list" :style="{ width: width + 'px',maxWidth: width + 'px'}">
    <div v-for="(image, index) in images" :key="index" class="image-item">
      <div style="display: flex; flex-direction: row; align-items: center;">
        <img :src="image.url" alt="Image" class="image" />
        <div style="width: 16px;">  </div>
        <el-button @click="handleDeleteImage(index)">无效删除</el-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ImageDeleteList',
  props: {
    images: {
      type: Array,
      required: true,
    },
    width: {
      type: Number,
      required: true,
    },
  },
  methods: {
    handleDeleteImage(index) {
      // 触发自定义事件并传递数据
      this.$emit('delete-image', index);
    },
    mounted(){
      this.images.forEach(element => {
        console.log('循环'+element.url);
      });
    }
  },
};
</script>
<style>
.image-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: flex-start;
}

.image-item {
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
}

.image-container {
  width: 100%;
  max-width: 200px; /* 设置图片容器的固定宽度 */
  height: auto;
}

.image {
  width: 100%;
  height: 100%;
  object-fit: contain; /* 图片按比例缩放以适应容器的宽度 */
}
</style>







