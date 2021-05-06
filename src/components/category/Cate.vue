<template>
  <div>
    <!-- breadcrumbs nav -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">Home</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/categories' }"
        >Categories</el-breadcrumb-item
      >
    </el-breadcrumb>
    <!-- card -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="addCategory"
            >ADD CATEGORY</el-button
          >
        </el-col>
      </el-row>
      <!-- table -->
      <el-table :data="categoryList" border stripe>
        <el-table-column prop="category_id" label="id" align="center">
        </el-table-column>
        <el-table-column prop="category_name" label="name" align="center">
          <template v-slot="scope">
            <el-input v-model="scope.row.category_name"></el-input>
          </template>
        </el-table-column>
        <el-table-column label="Operation" width="180px" align="center">
          <template v-slot="scope">
            <!-- modify btn -->
            <el-button
              type="primary"
              icon="el-icon-check"
              size="mini"
              @click="handleSubmit(scope)"
            ></el-button>
            <!-- delete btn -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              @click="handleRemove(scope)"
              size="mini"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- pagination -->
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5,
      },
      // category list
      categoryList: [],
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const res = await this.$http.get('category/categories')
      if (res.status !== 200) {
        return this.$message.error('Fail to get category information')
      }
      this.categoryList = res.data
    },
    addCategory() {
      this.categoryList.push({ category_id: '', category_name: '' })
    },
    async handleRemove(scope) {
      this.$confirm(
        'The opeartion will result in deletion of customizable image, are you sure you want to it?',
        'Warning',
        {
          confirmButtonText: 'Confirm',
          cancelButtonText: 'Cancel',
          type: 'warning',
        }
      )
        .then(async () => {
          const inDatabase = scope.row.category_id
          if (!inDatabase) {
            const index = scope.$index
            this.categoryList.splice(index, 1)
          } else {
            const res = await this.$http.delete(
              'category/deleteById/' + inDatabase
            )
            if (res.status !== 200) {
              return this.$message.error('Fail to delete the category')
            }
            this.getCateList()
            this.$message.success('Successfully Deleted!')
          }
        })
        .catch(() => {
          this.$message.info('Opeartion canceled!')
        })
    },

    async handleSubmit(scope) {
      const inDatabase = scope.row.category_id
      if (!inDatabase) {
        const res = await this.$http.post('category/save', scope.row)
        if (res.status !== 200) {
          return this.$message.error('Fail to create new category')
        }
        this.getCateList()
        this.$message.success('Successfully Created!')
      } else {
        const res = await this.$http.put('category/update', scope.row)
        if (res.status !== 200) {
          return this.$message.error('Fail to modify the category')
        }
        this.getCateList()
        this.$message.success('Successfully Modified!')
      }
    },
  },
}
</script>

<style lang="less" scoped>
</style>