<template>
  <el-container class="home-container">
    <!-- header -->
    <el-header>
      <div>
        <img src="" alt="Binobooks logo" />
        <span>Binobooks Management System</span>
      </div>
      <el-button type="info" @click="logout">Log Out</el-button>
    </el-header>
    <!-- main content -->
    <el-container>
      <!-- aside -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <!-- side bar menue -->
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409eff"
          unique-opened
          :collapse="isCollapse"
          :collapse-transition="false"
          :router="true"
          :default-active="activePath"
        >
          <el-menu-item
            :index="'/goods'"
            :key="1"
            @click="saveNavState('/goods')"
          >
            <template slot="title">
              <!-- icon -->
              <i class="el-icon-menu"></i>
              <!-- text -->
              <span>Goods Management</span>
            </template>
          </el-menu-item>
          <el-menu-item
            :index="'/category'"
            :key="2"
            @click="saveNavState('/category')"
          >
            <template slot="title">
              <!-- icon -->
              <i class="el-icon-menu"></i>
              <!-- text -->
              <span>Categories Management</span>
            </template>
          </el-menu-item>
          <!-- element category management -->
          <el-menu-item
            :index="'/elementCategory'"
            :key="3"
            @click="saveNavState('/elementCategory')"
          >
            <template slot="title">
              <!-- icon -->
              <i class="el-icon-menu"></i>
              <!-- text -->
              <span>Element Categories</span>
            </template>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <!-- right-hand content -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      // aside menu
      menuList: [],
      iconsObj: {
        125: 'iconfont icon-user',
        103: 'iconfont icon-cube',
        101: 'iconfont icon-shangpingouwudai2',
        102: 'iconfont icon-danju-tianchong',
        145: 'iconfont icon-baobiao',
      },
      isCollapse: false,
      // actived path
      activePath: '',
    }
  },
  created() {
    // this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    logout() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },

    // collapse side bar
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },
    saveNavState(activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    },
  },
}
</script>

<style lang="less" scoped>
.home-container {
  height: 100%;
}
.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
  color: #fff;
  font-size: 20px;
  > div {
    display: flex;
    align-items: center;
    span {
      margin-left: 15px;
    }
  }
}
.el-aside {
  background-color: #333744;
  .el-menu {
    border-right: none;
  }
}
.el-main {
  background-color: #eaedf1;
}
.toggle-button {
  background-color: #4a5064;
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
}
</style>
