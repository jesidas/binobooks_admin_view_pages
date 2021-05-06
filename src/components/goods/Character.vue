<template>
  <div>
    <el-breadcrumb separator=">">
      <el-breadcrumb-item :to="{ path: '/welcome' }"
        >welcome</el-breadcrumb-item
      >
      <el-breadcrumb-item :to="{ path: '/goods' }">Goods</el-breadcrumb-item>
      <el-breadcrumb-item
        ><a href="/Character">Character</a></el-breadcrumb-item
      >
    </el-breadcrumb>
    <el-card>
      <el-button type="success" @click="addElementRow()" round
        >Add a element</el-button
      >
      <!-- main table -->
      <el-table :data="elementList" border>
        <el-table-column lable="#" type="index"></el-table-column>
        <!-- type select column -->
        <el-table-column prop="elementId" label="Basic Type">
          <template v-slot="scope">
            <el-select v-model="scope.row.basicId" placeholder="--choose--">
              <el-option
                v-for="item in basicElementList"
                :key="item.type_id"
                :label="item.description"
                :value="item.type_id"
              >
              </el-option>
            </el-select>
          </template>
        </el-table-column>
        <!-- description column -->
            <el-table-column prop="description" label="description">
              <template v-slot="scope">
                <el-input v-model="scope.row.description" placeholder=""></el-input>
              </template>
            </el-table-column>
        <!-- element upload column -->
        <el-table-column prop="url" label="upload">
          <template v-slot="scope">
            <el-upload
                    action="http://159.75.20.131:8888/up/files"
                    list-type="picture-card"
                    :data="{bucket: `${bookInfo.name}`, folder: `characters`}"
                    :class="{ disabled: scope.row.uploadElementImgDisabled }"
                    :limit="1"
                    :file-list="scope.row.upload"
                    :on-remove="
                      function (file, fileList) {
                        return handleElementImgUploadRemove(
                          file,
                          fileList,
                          scope
                        )
                      }
                    "
                    :on-success="
                      function (info) {
                        return handleElementImgUploadSuccess(info, scope)
                      }
                    "
                    :on-change="
                      function (file, fileList) {
                        return handleElementImgUploadChange(
                          file,
                          fileList,
                          scope
                        )
                      }
                    "
                  >
              <el-button size="small" type="primary">Upload</el-button>
            </el-upload>
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
      bookInfo: {},
      elementList: [],
      basicElementList: [],
    }
  },
  created() {
    this.getParams()
    this.getBasicElement()
    this.getElements()
    
  },
  methods: {
    async getBasicElement() {
      const res = await this.$http.get('/imageBasicType/all')
      if (res.status !== 200)
        return this.$message.error('Fail to get user list')
      this.basicElementList = res.data
    },
    async getElements() {
      this.elementList = []
      const res = await this.$http.get('/character/bookId/'+this.bookInfo.id)
      if (res.status !== 200)
        return this.$message.error('Fail to get character list')
      res.data.forEach((element) =>{
        const temp1 = element.url ? [{ url: element.url }] : []
        const temp2 = element.url ? true : false
        this.elementList.push({
        elementId: element.characters_id,
        basicId: element.basic_id,
        bookId: element.book_id,
        upload: temp1,
        description: element.description,
        uploadElementImgDisabled: temp2,
        })
      })
      
    },
    getParams() {
      this.bookInfo = this.$route.query
    },
    addElementRow() {
      this.elementList.push({
        elementId: '',
        basicId: '',
        bookId: this.bookInfo.id,
        upload: [],
        description: '',
        // default upload setting
        uploadPageImgDisabled: false,
      })
      console.log(this.elementList)
    },

    // delete image from MINIO
    async deleteImgFromMinio(url) {
      let urlTokens = url.split('/').splice(3)
      let bucket = urlTokens[0]
      urlTokens = urlTokens.splice(1)
      let file = urlTokens.join("/")
      const uploadBody = {bucketName: bucket, fileName: file}
      const res = await this.$http.post("/up/deleteFile", uploadBody)
     // console.log(res);
      if (res.status !== 200)
        return this.$message.error('Fail to delete the image')
    },

    // remove image
    async handleElementImgUploadRemove(file, fileList, scope) {
      const row = scope.row
      const inDatabase = row.elementId
      scope.row.uploadElementImgDisabled = false
      // delete image from MINIO
      this.deleteImgFromMinio(row.upload[0].url)

      // delete it rom the UI
      scope.row.upload = []
      this.$message.success('Successfully delete it!')
      //delete it if it in the database
      if (inDatabase) {
        const uploadBody = {
          book_id: this.bookInfo.id,
          characters_id: row.elementId,
          basic_id: row.basicId,
          url: '',
          description: row.description,
        }
        const res2 = await this.$http.put('/character/update', uploadBody)
        if (res2.status !== 200)
          return this.$message.error('Fail to update the element')
      }
      
    },
     // successfully upload image
    async handleElementImgUploadSuccess(info, scope) {
      scope.row.upload.push({ url: info })
    },

    // when upload status change
    handleElementImgUploadChange(file, fileList, scope) {
      if (fileList.length >= 1) {
        scope.row.uploadElementImgDisabled = true
      }
    },
    // upload the row of element
    async handleElementUpload(scope) {
      const elementExist = scope.row.elementId
      console.log(scope.row)
      const row = scope.row
      const uploadBody = {
          characters_id: row.elementId,
          basic_id: row.basicId,
          book_id : this.bookInfo.id,
          description: row.description,
          url: row.upload[0].url,
        }
      // non-exist element, so create a new one
      if (!elementExist) {
        const res = await this.$http.post(`character/save`, uploadBody)
        if (res.status !== 200)
          return this.$message.error('Fail to add the element')
        this.$message.success('Save it successfully!')
        
      } else {
        // existed one, update it
        const res = await this.$http.put(`character/update`, uploadBody)
        if (res.status !== 200)
          return this.$message.error('Fail to update the element')
        this.$message.success('Edit it successfully!')
        console.log(uploadBody)
      }
      this.getElements()
    },

     async handleElementDelete(scope) {
      const inDatabase = scope.row.elementId
      const withImg = scope.row.upload.length
      // remove from the UI
      const index = scope.$index
      this.elementList.splice(index, 1)
      if (withImg) {
        await this.handleElementImgUploadRemove('', '', scope)
      }
      if (inDatabase) {
        const res = await this.$http.delete('/character/deleteById/' + inDatabase)
        if (res.status !== 200)
          return this.$message.error('Fail to delete the element')
      }
      this.getElements()
    },
  },
}
</script>

<style lang="less">

.disabled .el-upload--picture-card {
  display: none !important;
}
</style>