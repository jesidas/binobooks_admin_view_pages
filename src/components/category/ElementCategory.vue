<template>
  <div>
    <el-breadcrumb separator=">">
      <el-breadcrumb-item :to="{ path: '/welcome' }"
        >welcome</el-breadcrumb-item
      >
      <el-breadcrumb-item
        ><a href="/elementCategory">Element Category</a></el-breadcrumb-item
      >
    </el-breadcrumb>
    <el-card>
      <el-button type="primary" @click="addBasicElementRow()" round
        >Add a type</el-button
      >
      <!-- basic type table -->
      <el-table :data="basicElementList" border>
        <el-table-column lable="#" type="index"></el-table-column>
        <!-- type select column -->
        <el-table-column prop="description" label="description">
          <template v-slot="scope">
            <el-input v-model="scope.row.description"></el-input>
          </template>
        </el-table-column>
        <el-table-column label="Operation" width="170rpx" align="center">
          <template v-slot="scope">
            <el-button
              type="primary"
              icon="el-icon-check"
              circle
              @click="handleElementUpload(scope)"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              circle
              @click="handleElementDelete(scope)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      basicElementList: [],
    }
  },
  created() {
    this.getBasicElement()
  },
  methods: {
    async getBasicElement() {
      const res = await this.$http.get('/imageBasicType/all')
      if (res.status !== 200)
        return this.$message.error('Fail to get user list')
      console.log(res.data)
      this.basicElementList = res.data
    },
    addBasicElementRow() {
      this.basicElementList.push({
        type_id: '',
        description: '',
      })
    },
    async handleElementUpload(scope) {
      const inDatabase = scope.row.type_id ? true : false
      const uploadBody = {
        type_id: scope.row.type_id,
        description: scope.row.description,
      }
      if (!inDatabase) {
        const res = await this.$http.post('/imageBasicType/save', uploadBody)
        if (res.status !== 200)
          return this.$message.error('Fail to save the type')
      } else {
        const res = await this.$http.put('/imageBasicType/update', uploadBody)
        if (res.status !== 200)
          return this.$message.error('Fail to update type list')
      }
      this.getBasicElement()
    },

    async handleElementDelete(scope) {
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
          const res = await this.$http.delete(
            '/imageBasicType/deleteById/' + scope.row.type_id
          )
          if (res.status !== 200) return this.$message.error('Fail to delete')
          this.getBasicElement()
          this.$message.success('Successfully delete it')
        })
        .catch(() => {
          this.$message.info('Opeartion canceled!')
        })
    },
  },
}
</script>


<style lang="less" scoped>
</style>