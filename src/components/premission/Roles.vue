<template>
  <div>
    <!-- breadcrumbs nav -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- card view -->
    <el-card>
      <!-- ADD role row -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addDialogVisible = true"
            >ADD ROLE</el-button
          >
        </el-col>
      </el-row>
      <!-- Role Table -->
      <el-table :data="rolesList" border stripe>
        <!-- expand column -->
        <el-table-column type="expand">
          <template v-slot="scope">
            <el-row
              :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']"
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- first level rights -->
              <el-col :span="5">
                <el-tag
                  closable
                  @close="removeRightById(scope.row, item1.id)"
                  >{{ item1.authName }}</el-tag
                >
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- second and third level rights -->
              <el-col :span="19">
                <!-- for loop get to render second level rights -->
                <el-row
                  :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']"
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6"
                    ><el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row, item2.id)"
                      >{{ item2.authName }}</el-tag
                    ><i class="el-icon-caret-right"></i
                  ></el-col>
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightById(scope.row, item3.id)"
                      >{{ item3.authName }}</el-tag
                    >
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="Role Name" prop="roleName"></el-table-column>
        <el-table-column label="Description" prop="roleDesc"></el-table-column>
        <el-table-column label="Operation" width="300px">
          <template v-slot="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
              >Edit</el-button
            >
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeRoleById(scope.row.id)"
              >Delete</el-button
            >
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="showSetRightDialog(scope.row)"
              >Assign</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- add role dialog -->
    <el-dialog
      title="ADD ROLE"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <!-- add role form -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="90px"
      >
        <el-form-item label="Rolename" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="Description" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- dialog footer -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">CANCEL</el-button>
        <el-button type="primary" @click="addRole">OK</el-button>
      </span>
    </el-dialog>
    <!-- edit role dialog -->
    <el-dialog
      title="ADD ROLE"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <!-- add role form -->
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="90px"
      >
        <el-form-item label="Rolename" prop="roleName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="Description" prop="roleDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- dialog footer -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">CANCEL</el-button>
        <el-button type="primary" @click="editRoleInfo">OK</el-button>
      </span>
    </el-dialog>
    <!-- assign rights dialog -->
    <el-dialog
      title="ASSIGN ROLE"
      :visible.sync="setRightDialogVisible"
      @close="setRightDialogClosed"
      width="50%"
    >
      <!-- tree -->
      <el-tree
        :data="rightsList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
        ref="treeRef"
      >
      </el-tree>
      <!-- dialog footer -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">CANCEL</el-button>
        <el-button type="primary" @click="assignRights">OK</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      rolesList: [],
      addDialogVisible: false,
      addForm: {
        roleName: '',
        roleDesc: '',
      },
      addFormRules: {
        roleName: [
          { required: true, message: 'Please input roleName', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: 'Length between 3 and 10',
            trigger: 'blur',
          },
        ],
        roleDesc: [
          { required: true, message: 'Please input email', trigger: 'blur' },
        ],
      },
      editDialogVisible: false,
      editForm: {},
      editFormRules: {
        roleName: [
          { required: true, message: 'Please input roleName', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: 'Length between 3 and 10',
            trigger: 'blur',
          },
        ],
        roleDesc: [
          { required: true, message: 'Please input email', trigger: 'blur' },
        ],
      },
      // rights dialog
      setRightDialogVisible: false,
      rightsList: [],
      treeProps: {
        label: 'authName',
        children: 'children',
      },
      defKeys: [105, 116],
      // the role's id who is gonna assigned rights
      roleId: '',
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('Fail to get rights list')
      }
      this.rolesList = res.data
    },
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    addRole() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.post('roles', this.addForm)
        if (res.meta.status !== 201) {
          return this.$message.error('Fail to add a new role')
        }
        this.$message.success('Successfully add a new role')
        // close the dialog
        this.addDialogVisible = false
        // refresh the user list
        this.getRolesList()
      })
    },

    async showEditDialog(id) {
      this.editDialogVisible = true
      const { data: res } = await this.$http.get(`roles/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('Fail to retract information')
      }
      this.$message.success('Successfully retract information')
      this.editForm = res.data
    },

    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },

    editRoleInfo() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return this.$message.error('Invalid input')
        const { data: res } = await this.$http.put(
          `roles/${this.editForm.roleId}`,
          {
            roleName: this.editForm.roleName,
            roleDesc: this.editForm.roleDesc,
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('Fail to update')
        }
        this.editDialogVisible = false
        this.getRolesList()
        this.$message.success('Successfully update!')
      })
    },

    async removeRoleById(id) {
      const confirmResult = await this.$confirm(
        'The operation will delete the role forever, are you sure you want to it?',
        'WARNING',
        {
          confirmButtonText: 'OK',
          cancelButtonText: 'CANCEL',
          type: 'warning',
        }
      ).catch((err) => err)
      if (confirmResult === 'cancel') {
        return this.$message.info('Operation is canceled')
      }
      const { data: res } = await this.$http.delete(`roles/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('Fail to delete the role')
      }
      this.$message.success('Successfully delete the role!')
      this.getRolesList()
    },
    // remove right by id
    async removeRightById(role, rightId) {
      // message box alert user
      const confirmResult = await this.$confirm(
        'Are you sure you want to it?',
        'WARNING',
        {
          confirmButtonText: 'OK',
          cancelButtonText: 'CANCEL',
          type: 'warning',
        }
      ).catch((err) => err)
      if (confirmResult === 'cancel') {
        return this.$message.info('Cancel successfully')
      }
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      )

      if (res.meta.status !== 200) {
        return this.$message.error('Fail to delete right')
      }
      role.children = res.data
    },
    // asign right dialog
    async showSetRightDialog(role) {
      this.roleId = role.id
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('Fail to get rights information')
      }
      this.rightsList = res.data
      this.getLeafKeys(role, this.defKeys)
      this.setRightDialogVisible = true
      console.log(this.rightsList)
    },
    // get third level rights recursively
    getLeafKeys(node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach((item) => {
        this.getLeafKeys(item, arr)
      })
    },
    // listen to close set rights dialog
    setRightDialogClosed() {
      this.defKeys = []
    },
    // assign right
    async assignRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys(),
      ]
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('Fail to assign rights')
      }
      this.$message.success('Successfully assign rights')
      this.getRolesList()
      this.setRightDialogVisible = false
    },
  },
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}

// vertically align center
.vcenter {
  display: flex;
  align-items: center;
}
</style>
