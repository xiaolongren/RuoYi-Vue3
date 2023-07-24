<template>
  <div class="image-list" :style="{ width: width + 'px' }">
    <div v-for="(image, index) in images" :key="index" class="image-item">
      <img :src="image" alt="Image" class="image" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'ImageList',
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

.image {
  width: 100%;
  height: auto;
  object-fit: cover;
}
</style>
