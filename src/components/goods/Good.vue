<template>
  <div>
    <el-card>
      <!-- search and add user  -->
      <el-row :gutter="20">
        <el-col :span="9">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getGoodsList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getGoodsList"
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
        <el-table-column label="State">
          <template v-slot="scope">
            <el-switch
              v-model="scope.row.sale"
              @change="bookStateChanged(scope.row)"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="Operation" width="180px">
          <template v-slot="scope">
            <!-- modify btn -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
            ></el-button>
            <!-- delete btn -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              @click="removeUserById(scope.row.id)"
              size="mini"
            ></el-button>
            <!-- assign role btn -->
            <el-tooltip
              effect="dark"
              content=" Assign Role"
              placement="top"
              :enterable="false"
            >
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="assignRole(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- pagination -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[2, 4, 8, 16]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- add book dialog -->
    <el-dialog
      title="ADD USER"
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
          <el-switch
            v-model="addForm.sale"
            @change="addBookSaleChange"
          ></el-switch>
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
            action="http://localhost:8888/up/files"         
            :limit="1"
            :on-success="handleSuccess"
          >
            <el-button size="small" type="primary">点击上传</el-button>
            <div slot="tip" class="el-upload__tip">
              只能上传jpg/png文件，且不超过500kb
            </div>
          </el-upload>
        </el-form-item>
      </el-form>
      <!-- dialog footer -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">CANCEL</el-button>
        <el-button type="primary" @click="addBook">OK</el-button>
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
        pagenum: 1,
        pagesize: 2,
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
        url: ""
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
    }
  },
  created() {
    this.getGoodsList()
    this.getCatesList()
  },
  methods: {
    async getGoodsList() {
      const res = await this.$http.get(
        `/book/findAll/${this.queryInfo.pagenum}/${this.queryInfo.pagesize}`
      )
      if (res.status !== 200)
        return this.$message.error('Fail to get user list')
      this.goodsList = res.data.content
      this.total = res.data.totalElements
    },
    async getCatesList() {
      const res = await this.$http.get('/category/categories')
      console.log(res)
      if (res.status !== 200)
        return this.$message.error('Fail to get category list')

      this.catesList = res.data
    },
    // listen page size change
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },
    // lisent page number change
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getGoodsList()
    },
    async bookStateChanged(info) {
      info.sale = !info.sale
      console.log(info)
      const res = await this.$http.put('/changeState', { params: info })
      console.log(res)
    },
    // send request to add a book
    addBook() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return
        this.addForm.book_category = this.selectedNewBookCateId
        const res = await this.$http.post('/book/save', this.addForm)
        console.log(this.addForm)
        if (res.status !== 200)
          return this.$message.error('Fail to add the book')
        this.$message.success('Successfully add the book')
        // close the dialog
        this.addDialogVisible = false
        // refresh the user list
        this.getGoodsList()
      })
    },
    //
    addBookSaleChange() {
      console.log('after: ' + this.addForm.sale)
    },
    // listen to event of closing add dialog
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
      this.selectedNewBookCateId = ''
    },
    printSomething(file, fileList){
      console.log(file)
    },
    // handle when successfully upload cover image
    async handleSuccess(info){
     console.log(info)
     this.addForm.url = info
    }
  },
}
</script>

<style lang="less" scoped>
</style>