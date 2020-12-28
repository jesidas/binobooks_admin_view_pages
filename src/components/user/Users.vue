<template>
  <div>
    <!-- breadcrumbs nav -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- card view -->
    <el-card>
      <!-- search and add user  -->
      <el-row :gutter="20">
        <el-col :span="9">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getUserList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getUserList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true"
            >Add User</el-button
          >
        </el-col>
      </el-row>
      <!-- user table -->
      <el-table :data="userList" stripe border>
        <el-table-column lable="nihao" type="index"></el-table-column>
        <el-table-column label="Name" prop="username"></el-table-column>
        <el-table-column label="Email" prop="email"></el-table-column>
        <el-table-column label="Mobile" prop="mobile"></el-table-column>
        <el-table-column label="Role" prop="role_name"></el-table-column>
        <el-table-column label="State">
          <template v-slot="scope">
            <el-switch
              v-model="scope.row.mg_state"
              @change="userStateChanged(scope.row)"
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
    <!-- add user dialog -->
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
        label-width="80px"
      >
        <el-form-item label="username" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="password" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="email" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="mobile" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- dialog footer -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">CANCEL</el-button>
        <el-button type="primary" @click="addUser">OK</el-button>
      </span>
    </el-dialog>
    <!-- Modify user dialog -->
    <el-dialog
      title="Modify User"
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
        <el-form-item label="username" prop="username">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="email" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="mobile" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">CANCEL</el-button>
        <el-button type="primary" @click="editUserInfo">OK</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    // validate email
    var checkEmail = (rule, value, callback) => {
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) {
        return callback()
      }
      callback(new Error('Input valid email'))
    }
    // validate phone number
    var checkMobile = (rule, value, callback) => {
      const regMobile = /^1[3|4|5|7|8][0-9]{9}$/
      if (regMobile.test(value)) {
        return callback()
      }
      callback(new Error('input valid phone number'))
    }
    return {
      // params used to get user list
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 2,
      },
      userList: [],
      total: 0,
      // control add user dialog
      addDialogVisible: false,
      // add user form
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: '',
      },
      addFormRules: {
        username: [
          {
            required: true,
            message: 'Username cannot be empty',
            trigger: 'blur',
          },
          {
            min: 3,
            max: 10,
            message: 'Length between 3 and 10',
            trigger: 'blur',
          },
        ],
        password: [
          {
            required: true,
            message: 'Password cannot be empty',
            trigger: 'blur',
          },
          {
            min: 6,
            max: 15,
            message: 'Length between 6 and 15',
            trigger: 'blur',
          },
        ],
        email: [
          { required: true, message: 'Email cannot be empty', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' },
        ],
        mobile: [
          { required: true, message: 'Phone cannot be empty', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' },
        ],
      },
      // control edit user dialog
      editDialogVisible: false,
      editForm: {},
      editFormRules: {
        email: [
          { required: true, message: 'Email cannot be empty', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' },
        ],
        mobile: [
          { required: true, message: 'Phone cannot be empty', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' },
        ],
      },
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo,
      })
      if (res.meta.status !== 200)
        return this.$message.error('Fail to get user list')
      this.userList = res.data.users
      this.total = res.data.total
      console.log(res)
    },
    // listen page size change
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    // lisent page number change
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    // listen to switch change
    async userStateChanged(userinfo) {
      const { data: res } = await this.$http.put(
        `users/${userinfo.id}/state/${userinfo.mg_state}`
      )
      if (res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state
        return this.$message.error('Fail to update state')
      }
      this.$message.success('Successfully updated')
      console.log(userinfo)
    },
    // listen to event of closing dialog
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // listen to OK click
    addUser() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.post('users', this.addForm)
        if (res.meta.status !== 201)
          return this.$message.error('Fail to add user')
        this.$message.success('Successfully add user')
        // close the dialog
        this.addDialogVisible = false
        // refresh the user list
        this.getUserList()
      })
    },
    async showEditDialog(id) {
      this.editDialogVisible = true
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200)
        return this.$message.error('Fail to get selected user information')
      this.editForm = res.data
      console.log(this.editForm)
    },
    // rest edit form when close
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // sure to modify
    editUserInfo() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return this.$message.error('Invalid input')
        const { data: res } = await this.$http.put(
          `users/${this.editForm.id}`,
          { email: this.editForm.email, mobile: this.editForm.mobile }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('Fail to update')
        }
        this.editDialogVisible = false
        this.getUserList()
        this.$message.success('Successfully update!')
      })
    },
    // Remove user from list by id
    async removeUserById(id){
      const confirmResult = await this.$confirm('The operation will delete the user forever. Are you sure you want to it?', 'Warning',{
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).catch(err => err)
      if(confirmResult === 'cancel'){
        return this.$message.info('Operation is canceled')
      }
      const {data: res} = await this.$http.delete( `users/${id}`)
      if(res.meta.status !== 200){ return this.$message.error('Fail to delete user')}
      this.$message.success('Successfully delete user!')
      this.getUserList()
    }
  },
}
</script>

<style lang="less" scoped>
</style>