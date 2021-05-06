<template>
  <div>
    <el-breadcrumb separator=">">
      <el-breadcrumb-item :to="{ path: '/welcome' }"
        >welcome</el-breadcrumb-item
      >
      <el-breadcrumb-item :to="{ path: '/goods' }">Goods</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/goodContent' }"
        >Content</el-breadcrumb-item
      >
    </el-breadcrumb>
    <el-card>
      <h2>{{ bookInfo.name }}</h2>
      <el-button type="success" @click="addPageRow()" round
        >Add a Page</el-button
      >
      <!-- pages table -->
      <!-- row-key: uniquely identify an row  -->
      <!-- expand-row-keys: an array holds row's "row-key" -->
      <el-table
        :data="pageList"
        stripe
        border
        :row-key="getRowKeys"
        :expand-row-keys="expands"
        @expand-change="expandSelect"
      >
        <el-table-column type="expand">
          <!-- expanded table for element -->
          <template v-slot="scope">
            <el-button type="primary" @click="addElementRow(scope)" round
              >Add a Element</el-button
            >

            <el-table ref="elementTable" :data="elementList" stripe border>
              <el-table-column lable="#" type="index"></el-table-column>
              <el-table-column label="Category" prop="category" width="150rpx">
                <template v-slot="scope">
                  <el-cascader
                    v-model="scope.row.category"
                   
                    :options="options"
                    :show-all-levels="false"
                    @change="handleTypeSelected(scope)"
                  ></el-cascader>
                </template>
              </el-table-column>
              <el-table-column label="Text" prop="text">
                <template v-slot="scope">
                  <el-input
                    type="textarea"
                    :disabled="scope.row.category[0] == '2'"
                    :rows="2"
                    :placeholder="scope.row.promptText"
                    v-model="scope.row.text"
                  >
                  </el-input>
                </template>
              </el-table-column>
              <el-table-column label="Upload" width="170rpx" align="center">
                <template v-slot="scope">
                  <el-upload
                    action="http://159.75.20.131:8888/up/files"
                    list-type="picture-card"
                    :data="{bucket: `${bookInfo.name}`, folder: `page${currentPageId}/elements`}"
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
              <el-table-column label="Position" width="150rpx">
                <template v-slot="scope">
                  <el-input
                    v-model="scope.row.positionX"
                    placeholder="X coordinate"
                  ></el-input>
                  <el-input
                    v-model="scope.row.positionY"
                    placeholder="Y coordinate"
                  ></el-input>
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
          </template>
        </el-table-column>
        <el-table-column lable="#" type="index"></el-table-column>
        <el-table-column label="Page id" prop="pageId"></el-table-column>
        <el-table-column label="Page Image" prop="url">
          <template v-slot="scope">
            <el-upload
              action="http://159.75.20.131:8888/up/files"
              list-type="picture-card"
              :class="{ disabled: scope.row.uploadPageImgDisabled }"
              :limit="1"
              :data="{bucket: `${bookInfo.name}`, folder: `pagecover`}"
              :file-list="scope.row.image"
              :on-remove="
                function (file, fileList) {
                  return handlePageImgUploadRemove(file, fileList, scope)
                }
              "
              :on-success="
                function (info) {
                  return handlePageImgUploadSuccess(info, scope)
                }
              "
              :on-change="
                function (file, fileList) {
                  return handlePageImgUploadChange(file, fileList, scope)
                }
              "
            >
              <i class="el-icon-plus"></i>
            </el-upload>
          </template>
        </el-table-column>
        <el-table-column label="Operation" width="100rpx" align="center">
          <template v-slot="scope">
            <el-button
              type="danger"
              icon="el-icon-delete"
              circle
              @click="handleDeletePage(scope)"
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
      pageList: [],
      elementList: [],
      options: [
        {
          value: '1',
          label: 'Text',
        },
        {
          value: '2',
          label: 'Image',
          children: [],
        },
      ],
      // current expand row's key
      expands: [],
      currentPageId: '',
      currentPageIndex: '',
    }
  },
  created() {
    this.getParams()
    this.getPages()
    this.getCharacters()
  },
  methods: {
    // get param passed in from the pervious page
    getParams() {
      this.bookInfo = this.$route.query
    },
    // get current book's page list
    async getPages() {
      this.pageList = []
      const res = await this.$http.get('/page/pages/' + this.bookInfo.id)
      if (res.status !== 200) return this.$message.error('Fail to get pages')
      res.data.forEach((element) => {
        const temp1 = element.url ? [{ url: element.url }] : []
        const temp2 = element.url ? true : false
        this.pageList.push({
          image: temp1,
          uploadPageImgDisabled: temp2,
          pageId: element.page_id,
        })
      })
      // this.$forceUpdate()
    },
    async getCharacters(){
      const res = await this.$http.get('/character/bookId/' + this.bookInfo.id)
      if (res.status !== 200)
        return this.$message.error('Fail to get character list')
      res.data.forEach((element =>{
        this.options[1].children.push(
          {value: element.characters_id, label: element.description}
        )
      }))
      
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
    // add a new page row for the book
    addPageRow() {
      this.pageList.push({
        pageId: '',
        image: [],
        // default upload setting
        uploadPageImgDisabled: false,
      })
    },
    // add a new element row for the page
    addElementRow(scope) {
      const isPageCreated = scope.row.pageId
      this.currentPageIndex = scope.$index+1
      if (!isPageCreated) {
        this.$message.warning('Please Create a Page First!')
      } else {
        this.elementList.push({
          id: '',
          category: '',
          text: '',
          promptText: '',
          upload: [],
          positionX: '',
          positionY: '',
          uploadElementImgDisabled: false,
        })
      }
    },
    // expand row settings
    getRowKeys(row) {
      return row.pageId
    },
    expandSelect(row, expandedRows) {
      var that = this
      if (expandedRows.length) {
        that.expands = []
        if (row) {
          // get expanded page's element information
          this.getElements(row.pageId)
          // that.elementList = []
          that.expands.push(row.pageId)
          this.currentPageId = row.pageId
        }
      } else {
        that.expands = []
        that.elementList = []
      }
    },

    // page image upload
    handlePageImgUploadChange(file, fileList, scope) {
      if (fileList.length >= 1) {
        scope.row.uploadPageImgDisabled = true
      }
    },
    // successfully upload page image
    async handlePageImgUploadSuccess(info, scope) {
      console.log("look at there")
      console.log(scope.$index)
      const pageExist = scope.row.pageId
      scope.row.image.push({ url: info })
      const uploadBody = {
        book_id: this.bookInfo.id,
        url: info,
        page_id: pageExist,
      }
      console.log(uploadBody)
      if (!pageExist) {
        // upload the page to the database right away
        console.log('page does not exist')
        const res = await this.$http.post('/page/save', uploadBody)
        if (res.status !== 200)
          return this.$message.error('Fail to add the page')
        this.$message.success('Successfully created!')
      } else {
        // page already exist
        console.log('page already exist')
        const res = await this.$http.put('/page/update', uploadBody)
        if (res.status !== 200)
          return this.$message.error('Fail to update the element')
        this.$message.success('Edit it successfully!')
      }
      this.getPages()
    },
    // handle remove page image
    async handlePageImgUploadRemove(file, fileList, scope) {
      const inDatabase = scope.row.pageId
      scope.row.uploadPageImgDisabled = false
      // delete image from MINIO
      if (scope.row.image.length) {
        this.deleteImgFromMinio(scope.row.image[0].url)
      }
      if (inDatabase) {
        const uploadBody = {
          page_id: scope.row.pageId,
          book_id: this.bookInfo.id,
          url: '',
        }
        const res2 = await this.$http.put('/page/update', uploadBody)
        if (res2.status !== 200)
          return this.$message.error('Fail to delete the file')
      }
      // delete if from the UI
      scope.row.image = []
    },
   
    // delete entire row of a page
    async handleDeletePage(scope) {
      this.$confirm(
        'The opeartion will delete all element in the page as well, are you sure you want to it?',
        'Warning',
        {
          confirmButtonText: 'Confirm',
          cancelButtonText: 'Cancel',
          type: 'warning',
        }
      )
        .then(async () => {
          const inDatabase = scope.row.pageId
          const withImg = scope.row.image.length
          // remove from the UI
          const index = scope.$index
          this.pageList.splice(index, 1)
          const bucket = this.bookInfo.name
          const file = "page"+this.currentPageId
          const uploadBody = {bucketName: bucket, fileName: file}
          const res = await this.$http.post("/up/deleteFiles", uploadBody)
          // delete the page from the Database
          if (inDatabase) {
            const res = await this.$http.delete(
              '/page/deleteById/' + inDatabase
            )
            if (res.status !== 200)
              return this.$message.error('Fail to delete the page')
          }
          
          this.$message.success('Successfully deleted!')
        })
        .catch(() => {
          this.$message.info('Opeartion canceled!')
        })
    },

    // ------------- Element Method ---------------//
    async getImgElements(pageId) {
      const res = await this.$http.get('/image/images/' + pageId) // image element
      if (res.status !== 200)
        return this.$message.error('Fail to get the image element information')
      res.data.forEach((element) => {
        const temp1 = element.url ? [{ url: element.url }] : []
        const temp2 = element.url ? true : false
        this.elementList.push({
          id: element.img_id,
          category: ['2', element.image_type],
          text: element.description,
          upload: temp1,
          positionX: element.position_x,
          positionY: element.position_y,
          uploadElementImgDisabled: temp2,
        })
      })
    },

    async getTextElements(pageId) {
      const res = await this.$http.get('/text/texts/' + pageId) // text element
      res.data.forEach((element) => {
        this.elementList.push({
          id: element.text_id,
          category: '1',
          text: element.text,
          upload: [],
          positionX: element.position_x,
          positionY: element.position_y,
          uploadElementImgDisabled: true,
        })
      })
    },

    async getElements(pageId) {
      this.elementList = []
      await this.getImgElements(pageId)
      await this.getTextElements(pageId)
    },

    handleTypeSelected(scope) {
      
      const category = scope.row.category[0]
      const isImgUpload = scope.row.upload.length
      const inDatabase = scope.row.id
      scope.row.promptText =
        category == '1'
          ? 'Type text here...realPlaceholder for placeholder'
          : 'Enter the description here...'
      scope.row.uploadElementImgDisabled =
        category == '1' ? true : isImgUpload ? true : false
      if (isImgUpload && category == '1') {
        this.deleteImgFromMinio(scope.row.upload[0].url)
        scope.row.upload = []
      }
    },

    // remove image
    async handleElementImgUploadRemove(file, fileList, scope) {
      const row = scope.row
      const inDatabase = row.id
      scope.row.uploadElementImgDisabled = false
      // delete image from MINIO
      this.deleteImgFromMinio(row.upload[0].url)
      //delete if rom the UI
      scope.row.upload = []
      this.$message.success('Successfully delete it!')
      // delete it if it in the database
      if (inDatabase) {
        const uploadBody = {
          img_id: row.id,
          page_id: this.currentPageId,
          url: '',
          description: row.text,
          position_x: row.positionX,
          position_y: row.positionY,
          image_type: row.category[1],
        }
        const res2 = await this.$http.put('/image/update', uploadBody)
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
      const elementExist = scope.row.id
      const withImg = scope.row.upload.length
      const row = scope.row
      let imgUploadBody = {}
      if (withImg) {
        imgUploadBody = {
          img_id: row.id,
          page_id: this.currentPageId,
          url: row.upload[0].url,
          description: row.text,
          position_x: row.positionX,
          position_y: row.positionY,
          image_type: row.category[1],
        }
      }
      const textUploadBody = {
        text_id: row.id,
        page_id: this.currentPageId,
        text: row.text,
        position_x: row.positionX,
        position_y: row.positionY,
      }
      const uploadBody = row.category[0] == '1' ? textUploadBody : imgUploadBody
      const address = row.category[0] == '1' ? '/text' : '/image'
      // non-exist element, so create a new one
      if (!elementExist) {
        const res = await this.$http.post(`${address}/save`, uploadBody)
        if (res.status !== 200)
          return this.$message.error('Fail to add the element')
        this.$message.success('Save it successfully!')
        console.log(textUploadBody);
      } else {
        // existed one, update it
        console.log('update element')
        const res = await this.$http.put(`${address}/update`, uploadBody)
        if (res.status !== 200)
          return this.$message.error('Fail to update the element')
        this.$message.success('Edit it successfully!')
      }
      this.getElements(this.currentPageId)
    },
    // delete the row of element
    async handleElementDelete(scope) {
      const inDatabase = scope.row.id
      const withImg = scope.row.upload.length
      const isText = scope.row.category[0] == '1'
      // remove from the UI
      const index = scope.$index
      this.elementList.splice(index, 1)
      if (withImg) {
        await this.handleElementImgUploadRemove('', '', scope)
      }
      if (inDatabase && !isText) {
        const res = await this.$http.delete('/image/deleteById/' + inDatabase)
        if (res.status !== 200)
          return this.$message.error('Fail to delete the element')
      }
      if (inDatabase && isText) {
        const res = await this.$http.delete('/text/deleteById/' + inDatabase)
        if (res.status !== 200)
          return this.$message.error('Fail to delete the element')
        this.$message.success('Successfully delete the element')
      }
    },
  },
}
</script>


<style  lang="less" >
.disabled .el-upload--picture-card {
  display: none !important;
}
</style>