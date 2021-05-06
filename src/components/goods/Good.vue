<template>
  <div>
    <el-breadcrumb separator=">">
      <el-breadcrumb-item :to="{ path: '/welcome' }"
        >welcome</el-breadcrumb-item
      >
      <el-breadcrumb-item><a href="/goods">Goods</a></el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- breadcrumb -->

      <!-- search and add book  -->
      <el-row :gutter="20">
        <el-col :span="9">
          <el-input
            placeholder="search by name.."
            v-model="queryInfo.query"
            clearable
            @clear="getGoodsList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="findByName"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true"
            >Add Book</el-button
          >
        </el-col>
      </el-row>
      <!-- user table -->
      <el-table :data="goodsList" stripe border>
        <el-table-column lable="#" type="index"></el-table-column>
        <el-table-column label="Name" prop="book_name"></el-table-column>
        <el-table-column
          label="Category"
          prop="book_category"
        ></el-table-column>
        <el-table-column label="Price" prop="book_price"></el-table-column>
        <!-- <el-table-column label="State" width="100rpx">
          <template v-slot="scope">
            <el-switch
              v-model="scope.row.sale"
              @change="bookStateChanged(scope.row)"
            ></el-switch>
          </template>
        </el-table-column> -->
        <el-table-column label="Operation" width="250rpx">
          <template v-slot="scope">
            <!-- modify btn -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row)"
            ></el-button>
            <!-- set character of the book -->
            <el-tooltip
              effect="dark"
              content="character setting"
              placement="top"
              :enterable="false"
            >
              <el-button
                type="success"
                icon="el-icon-user"
                size="mini"
                @click="setCharacter(scope.row)"
              ></el-button>
            </el-tooltip>
            <!-- set page content -->
            <el-tooltip
              effect="dark"
              content="content setting"
              placement="top"
              :enterable="false"
            >
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="setContent(scope.row)"
              ></el-button>
            </el-tooltip>
            <!-- delete btn -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              @click="removeBookById(scope)"
              size="mini"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- pagination -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pageNum"
        :page-sizes="[5, 10, 20, 30]"
        :page-size="queryInfo.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- add book dialog -->
    <el-dialog
      title="ADD A Book"
      :visible.sync="addDialogVisible"
      @close="addDialogClosed"
      width="50%"
    >
      <!-- dialog main information -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
      >
        <el-form-item label="book name" prop="book_name">
          <el-input v-model="addForm.book_name"></el-input>
        </el-form-item>
        <el-form-item label="category" prop="book_category">
          <el-select v-model="selectedNewBookCateId" placeholder="Select...">
            <el-option
              v-for="item in catesList"
              :key="item.category_id"
              :label="item.category_name"
              :value="item.category_id"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="price" prop="book_price">
          <el-input v-model="addForm.book_price"></el-input>
        </el-form-item>
        <el-form-item label="sale" prop="sale">
          <el-switch v-model="addForm.sale"></el-switch>
        </el-form-item>
        <el-form-item label="Description" prop="book_des">
          <el-input
            type="textarea"
            :rows="3"
            placeholder="Type description..."
            v-model="addForm.book_des"
          >
          </el-input>
        </el-form-item>
        <el-form-item label="coverImg" prop="coverImg">
          <el-upload
            action="http://159.75.20.131:8888/up/files"
            list-type="picture-card"
            :data="{ bucket: `${addForm.book_name}`, folder: `bookcover` }"
            :class="{ disabled: uploadDisabled }"
            :limit="1"
            :on-success="handleAddFormUploadSuccess"
            :on-remove="handleAddFormUploadRemove"
            :on-change="handleAddFormUploadChange"
          >
            <el-button size="small" type="primary">UPLOAD</el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <!-- dialog footer -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">CANCEL</el-button>
        <el-button type="primary" @click="addBook">OK</el-button>
      </span>
    </el-dialog>
    <!-- Modify goods dialog -->
    <el-dialog
      title="Modify Book"
      :visible.sync="editDialogVisible"
      @close="editDialogClosed"
      width="50%"
    >
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="80px"
      >
        <el-form-item label="book" prop="book_name">
          <el-input v-model="editForm.book_name"></el-input>
        </el-form-item>
        <el-form-item label="category" prop="book_category">
          <el-select v-model="selectedNewBookCateId" placeholder="Select...">
            <el-option
              v-for="item in catesList"
              :key="item.category_id"
              :label="item.category_name"
              :value="item.category_id"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="price" prop="book_price">
          <el-input v-model="editForm.book_price"></el-input>
        </el-form-item>
        <el-form-item label="sale" prop="sale">
          <el-switch v-model="editForm.sale"></el-switch>
        </el-form-item>
        <el-form-item>
          <el-upload
            action="http://159.75.20.131:8888/up/files"
            list-type="picture-card"
            :data="{ bucket: `${editForm.book_name}`, folder: `bookcover` }"
            :class="{ disabled: uploadDisabled }"
            :limit="1"
            :file-list="uploadedList"
            :on-success="handleEditFormUploadSuccess"
            :on-change="handleEditFormUploadChange"
            :on-remove="handleEditFormUploadRemove"
          >
            <i class="el-icon-plus"></i>
          </el-upload>
        </el-form-item>
        <el-form-item label="Description" prop="book_des">
          <el-input
            type="textarea"
            :rows="3"
            placeholder="Type description..."
            v-model="editForm.book_des"
          >
          </el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">CANCEL</el-button>
        <el-button type="primary" @click="editBookInfo">OK</el-button>
      </span>
    </el-dialog>
  </div>
</template>


<script>
export default {
  data() {
    return {
      queryInfo: {
        query: '',
        pageNum: 1,
        pageSize: 5,
      },
      goodsList: [],
      catesList: [],
      // total page num
      total: 0,
      addDialogVisible: false,
      // add book form
      addForm: {
        book_name: '',
        book_category: 0,
        book_price: '',
        book_des: '',
        sale: true,
        url: '',
      },
      addFormRules: {
        book_name: [
          {
            required: true,
            message: 'Username cannot be empty',
            trigger: 'blur',
          },
        ],
        book_price: [
          {
            required: true,
            message: 'Password cannot be empty',
            trigger: 'blur',
          },
        ],
      },
      textarea: '',
      selectedNewBookCateId: '',
      // data of editing book dialog
      editDialogVisible: false,
      editForm: {},
      editFormRules: {
        book_name: [
          {
            required: true,
            message: 'Username cannot be empty',
            trigger: 'blur',
          },
        ],
        book_price: [
          {
            required: true,
            message: 'Password cannot be empty',
            trigger: 'blur',
          },
        ],
      },
      // 已上传图片展示
      uploadedList: [],
      uploadDisabled: false,
    }
  },
  async created() {
    await this.getCatesList()
    this.getGoodsList()
  },
  methods: {
    async getGoodsList() {
      const res = await this.$http.get(
        `/book/findAll/${this.queryInfo.pageNum}/${this.queryInfo.pageSize}`
      )
      if (res.status !== 200)
        return this.$message.error('Fail to get goods list')
      this.goodsList = res.data.list
      // this.goodsList = res.data.content
      this.total = res.data.total
      this.goodsList.forEach((element) => {
        element.book_category = this.getCateById(element.book_category)
      })
      console.log(this.goodsList)
    },

    async getCatesList() {
      const res = await this.$http.get('/category/categories')
      if (res.status !== 200)
        return this.$message.error('Fail to get category list')
      this.catesList = res.data
    },

    async findByName() {
      const queryWords = this.queryInfo.query
      if (queryWords) {
        const res = await this.$http.get(`/book/findByName/${queryWords}`)
        if (res.status !== 200)
          return this.$message.error('Fail to get goods list')
        console.log(res.data)
        this.goodsList = res.data

        this.goodsList.forEach((element) => {
          element.book_category = this.getCateById(element.book_category)
        })
      } else {
        this.getGoodsList()
      }
    },

    getCateById(id) {
      let name
      this.catesList.forEach((element) => {
        if (element.category_id === id) {
          name = element.category_name
        }
      })
      return name
    },

    // delete image from the MINIO
    async DeletImgFromMinio(theForm) {
      let url = theForm.url
      let urlTokens = url.split('/').splice(3)
      let bucket = urlTokens[0]
      urlTokens = urlTokens.splice(1)
      let file = urlTokens.join('/')
      const uploadBody = { bucketName: bucket, fileName: file }
      const res = await this.$http.post('/up/deleteFile', uploadBody)
      // console.log(res);
      if (res.status !== 200)
        return this.$message.error('Fail to delete the image')
    },
    // listen page size change
    handleSizeChange(newSize) {
      this.queryInfo.pageSize = newSize
      this.getGoodsList()
    },
    // lisent page number change
    handleCurrentChange(newPage) {
      this.queryInfo.pageNum = newPage
      this.getGoodsList()
    },
    async bookStateChanged(info) {
      //info.sale = !info.sale
      console.log(info)
      const res = await this.$http.put('/book/changeState/' + info.book_id)
    },
    // send request to add a book
    addBook() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return
        this.addForm.book_category = this.selectedNewBookCateId
        const res = await this.$http.post('/book/save', this.addForm)
        if (res.status !== 200)
          return this.$message.error('Fail to add the book')
        this.$message.success('Successfully add the book')
        // close the dialog
        this.addDialogVisible = false
        // refresh the user list
        this.getGoodsList()
      })
    },
    async removeBookById(scope) {
      this.$confirm(
        'The opeartion will delete all element in the book as well, are you sure you want to it?',
        'Warning',
        {
          confirmButtonText: 'Confirm',
          cancelButtonText: 'Cancel',
          type: 'warning',
        }
      )
        .then(async () => {
          const index = scope.$index
          this.goodsList.splice(index, 1)
          const res = await this.$http.delete(
            'book/deleteById/' + scope.row.book_id
          )
          const res2 = await this.$http.delete(
            'up/deleteBucket/' + scope.row.book_name
          )
          if (res.status !== 200 || res2.status !== 200) {
            return this.$message.error('Fail to delete the book')
          }
          this.getGoodsList()
          this.$message.success('Successfully Deleted!')
        })
        .catch(() => {
          this.$message.info('Opeartion canceled!')
        })
    },

    // listen to event of closing add dialog
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
      this.selectedNewBookCateId = ''
    },

    // handle when successfully upload cover image
    async handleAddFormUploadSuccess(info) {
      this.addForm.url = info
    },

    async handleAddFormUploadRemove(file, fileList) {
      this.DeletImgFromMinio(this.addForm)
      this.addForm.url = ''
      this.uploadDisabled = false
    },

    async handleAddFormUploadChange(file, fileList) {
      if (fileList.length >= 1) {
        this.uploadDisabled = true
      }
    },

    // ========= Edit Dialog ==========
    // handle when click modify btn
    async showEditDialog(book_info) {
      this.editDialogVisible = true
      const res = await this.$http.get('/book/findById/' + book_info.book_id)
      if (res.status !== 200)
        return this.$message.error('Fail to get selected book information')
      this.editForm = res.data
      // set the current seleted book's category id
      this.selectedNewBookCateId = res.data.book_category
      // already have image with the book
      if (res.data.url) {
        const url_info = { url: res.data.url }
        this.uploadedList.push(url_info)
        this.uploadDisabled = true
      }
    },
    // reset fileds when edit dialog closed
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
      this.uploadedList.pop()
      this.uploadDisabled = false
    },
    // confirm to modify the current book
    editBookInfo() {
      this.editForm.book_category = this.selectedNewBookCateId
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return

        const res = await this.$http.put('/book/update', this.editForm)
        if (res.status !== 200)
          return this.$message.error('Fail to modify the book')
        this.$message.success('Successfully modify the book')
        // close the dialog
        this.editDialogVisible = false
        // refresh the user list
        this.getGoodsList()
      })
    },
    // remove exist image from selected book
    async handleEditFormUploadRemove(file, fileList) {
      console.log('are you sure you want to delte this file')
      this.DeletImgFromMinio(this.editForm)
      this.editForm.url = ''
      this.uploadDisabled = false
    },
    // change editForm url to the new pic
    handleEditFormUploadSuccess(info) {
      this.editForm.url = info
    },
    handleEditFormUploadChange(file, fileList) {
      if (fileList.length >= 1) {
        this.uploadDisabled = true
      }
    },

    // ===========  SET CONTENT ==================
    setContent(info) {
      this.$router.push({
        path: '/goodContent',
        query: { id: info.book_id, name: info.book_name },
      })
    },
    setCharacter(info) {
      this.$router.push({
        path: '/character',
        query: { id: info.book_id, name: info.book_name },
      })
    },
  },
}
</script>

<style  lang="less" >
.disabled .el-upload--picture-card {
  display: none !important;
}
</style>