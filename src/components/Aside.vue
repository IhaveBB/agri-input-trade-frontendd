<script setup>
import '../assets/iconfont.css';

</script>
<template>
    <div>

        <!-- <span
            style="height: 60px;display: flex;flex-direction: row;justify-content: center;align-items: center;text-align: center;font-weight: bolder;color: green;font-size:20px;">农资采销系统</span> -->
        <el-menu
            :default-active="$route.path"
            class="el-menu-vertical"
            router
            :collapse-transition="false"
            background-color="transparent"
            text-color="rgba(255, 255, 255, 0.7)">

            <div v-for="item in userMenuList" :key="item.id">
                <div v-if="item.path">
                    <div v-if="!item.pid">
                        <el-menu-item :index="item.path">
                            <i :class="item.icon"></i>
                            <span>{{ item.name }}</span>
                        </el-menu-item>
                    </div>
                </div>
                <div v-else>
                    <el-submenu :index="item.id + ''">
                        <template slot="title">
                            <i :class="item.icon"></i>
                            <span>{{ item.name }}</span>
                        </template>
                        <div v-for="subItem in item.children" :key="subItem.id">
                            <el-menu-item :index="subItem.path">
                                <i :class="subItem.icon"></i>
                                <span>{{ subItem.name }}</span>
                            </el-menu-item>
                        </div>
                    </el-submenu>
                </div>

            </div>

        </el-menu>

    </div>
</template>

<script>


import {setRoutes} from "@/router";
import Request from '../utils/request.js'
export default {
    name: 'Aside',
    components: {},
    // 用户信息
    userInfo: {},
    created() {
        let userMenuListStr = localStorage.getItem("userMenuList")
        this.userMenuList = userMenuListStr ? JSON.parse(userMenuListStr) : [];
        this.userInfo = localStorage.getItem("backUser") ? JSON.parse(localStorage.getItem("backUser")) : {};
        console.log("userMenuList:" + userMenuListStr);
    },
    data() {
        return {
          
            userMenuList: [
                {
                    name: 'Dashboard',
                    path: 'dashboard',
                    icon: 'el-icon-menu'
                },
                {
                    name: 'Reports',
                    path: 'reports',
                    icon: 'el-icon-document',
                    children: [
                        {
                            name: 'Report 1',
                            path: 'report1',
                            icon: 'el-icon-document'
                        },
                        {
                            name: 'Report 2',
                            path: 'report2',
                            icon: 'el-icon-document'
                        }
                    ]
                },
                // 更多静态菜单项...
            ],
            user: {},
            path: this.$route.path
        }
    },
    methods: {
        printMenu(menu) {
            console.log("Submenu:" + menu)
        },
        refreshMenu(){
            Request.get("/menu/getMenuTree/"+this.userInfo.id).then(response => {
                if (response.code === '0') {
                    localStorage.setItem("userMenuList", JSON.stringify(response.data))
                    setRoutes();
         
                } else {
                    this.$message({
                        type: 'error',
                        message: response.msg
                    })
                }
            })
        }

    }
}
</script>

<style scoped>
.el-menu {
    border-right: none;
    padding: 18px 8px 12px;
    background-color: transparent;
}

.el-menu-item {
    height: 42px;
    line-height: 42px;
    border-radius: 8px;
    margin-bottom: 2px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 14px;
    padding-left: 20px !important;
    transition: all 0.2s ease;

    &:hover {
        color: #fff;
        background-color: rgba(255, 255, 255, 0.08) !important;
    }

    &.is-active {
        color: #fff;
        background: linear-gradient(135deg, #2c9678, #35b08e) !important;
        font-weight: 500;
        box-shadow: 0 2px 10px rgba(44, 150, 120, 0.4);
    }
}

.el-submenu ::v-deep .el-submenu__title {
    height: 42px;
    line-height: 42px;
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 14px;
    padding-left: 20px !important;

    &:hover {
        color: #fff;
        background-color: rgba(255, 255, 255, 0.08) !important;
    }
}

.el-submenu ::v-deep .el-menu--inline {
    padding-left: 0;
    background-color: transparent !important;

    .el-menu-item {
        height: 40px;
        line-height: 40px;
        padding-left: 40px !important;
        background-color: transparent;
        border-radius: 6px;
        font-size: 13px;

        &:hover {
            color: #fff;
            background-color: rgba(255, 255, 255, 0.06) !important;
        }

        &.is-active {
            color: #4dd9a5;
            background-color: rgba(44, 150, 120, 0.15) !important;
            font-weight: 600;
            box-shadow: none;
        }
    }
}

.el-menu-item [class^="el-icon-"],
.el-submenu [class^="el-icon-"] {
    font-size: 17px;
    margin-right: 10px;
    color: rgba(255, 255, 255, 0.45);
}

.el-menu-item.is-active [class^="el-icon-"],
.el-submenu.is-active [class^="el-icon-"] {
    color: #fff;
}

.el-submenu .el-menu-item.is-active [class^="el-icon-"] {
    color: #4dd9a5;
}

/* Submenu arrow color */
::v-deep .el-submenu__title .el-submenu__icon-arrow {
    color: rgba(255, 255, 255, 0.45);
}

::v-deep .el-menu--inline {
    background-color: transparent !important;
}
</style>