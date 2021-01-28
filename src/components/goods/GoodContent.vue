<template>
<div>
  <el-breadcrumb separator=">">
        <el-breadcrumb-item :to="{ path: '/welcome' }">welcome</el-breadcrumb-item>
        <el-breadcrumb-item><a href="/goods">Goods</a></el-breadcrumb-item>
        <el-breadcrumb-item><a href="/goodContent">Content</a></el-breadcrumb-item>
      </el-breadcrumb>
      <el-card>
        <h2>{{bookInfo.name}}</h2>
        <el-button type="success" @click="AddListRow()" round>Add a Page</el-button>
        <!-- user table -->
      <el-table :data="customizableList" stripe border>
        <el-table-column lable="#" type="index"></el-table-column>
        <el-table-column label="Name" prop="book_name"></el-table-column>
        <el-table-column
          label="Category"
          prop="book_category"
        >
        <el-input></el-input>
        </el-table-column>
        <el-table-column label="Page" prop="book_price"></el-table-column>

      </el-table>
      </el-card>
</div>
</template>


<script>
export default {
  data(){
    return{
      bookInfo:{},
      customizableList:[]

    }
  },
  created(){
    this.getParams()
  },
  methods:{
    getParams(){
      this.bookInfo = this.$route.query
    },
    // add a new row
    AddListRow(){
      this.customizableList.push({
        a:"",
        b:"",
      })
      console.log(this.customizableList)
    }
  }
  
}
</script>


<style lang="less" scoped>

</style>