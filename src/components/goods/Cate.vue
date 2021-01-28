<template>
  <div>
    <h1>hello world</h1>
    <!-- breadcrumbs nav -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- card -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary">ADD CATEGORY</el-button>
        </el-col>
      </el-row>
      <!-- table -->
      <!-- upload -->
      <el-upload
  class="upload-demo"
  action="https://jsonplaceholder.typicode.com/posts/"
  :on-preview="handlePreview"
  :on-remove="handleRemove"
  :file-list="fileList"
  list-type="picture">
  <el-button size="small" type="primary">点击上传</el-button>
  <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
</el-upload>

      <!-- pagination -->
    </el-card>
  </div>
</template>

<script>
export default {
  data(){
    return{
      queryInfo:{
        type:3,
        pagenum: 1,
        pagesize: 5
      },
      // category list
      cateList:[],
      total: 0
    }
  },
  created(){
    this.getCateList()
  },
  methods:{
    async getCateList(){
      const {data: res} = await this.$http.get('categories', {params: this.queryInfo})
      if(res.meta.status !== 200){return this.$message.error('Fail to get category information')}
      this.cateList = res.data.result
      this.total = res.data.total
      // console.log(res.data)
    },
    handleRemove(file, fileList) {
        console.log(file, fileList);
      },
      handlePreview(file) {
        console.log(file);
      }
  }
  
}
</script>

<style lang="less" scoped>

</style>