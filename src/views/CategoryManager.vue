<template>
  <div class="category-manager">
    <!-- 页面标题区域 -->
    <div class="page-header">
      <h2>分类管理</h2>
      <el-tag type="info">共 {{ total }} 个分类</el-tag>
    </div>

    <!-- 搜索和操作区域 -->
    <el-card class="operation-area" shadow="hover">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="分类名称">
          <el-input v-model="searchForm.name" placeholder="请输入分类名称" clearable></el-input>
        </el-form-item>
        <el-form-item label="父分类">
          <el-select v-model="searchForm.parentId" placeholder="请选择父分类" clearable>
            <el-option label="顶级分类" :value="0"></el-option>
            <el-option v-for="item in parentCategories" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="层级">
          <el-select v-model="searchForm.level" placeholder="请选择层级" clearable>
            <el-option label="一级分类" :value="1"></el-option>
            <el-option label="二级分类" :value="2"></el-option>
            <el-option label="三级分类" :value="3"></el-option>
            <el-option label="四级分类" :value="4"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="启用" :value="1"></el-option>
            <el-option label="禁用" :value="0"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button size="medium" plain type="primary" @click="handleSearch">查询</el-button>
          <el-button size="medium" plain @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
      <div class="operation-buttons">

        <el-button plain size="medium" type="primary" icon="el-icon-plus" class="add-button" @click="handleAdd">新增分类</el-button>
        <el-button plain size="medium" icon="el-icon-refresh" @click="getList">刷新</el-button>
      </div>
    </el-card>


    <!-- 分类列表 -->
    <el-card class="table-card" shadow="hover">
      <el-table :data="categories" border style="width: 100%">
        <el-table-column label="层级" width="80">
          <template slot-scope="scope">
            <el-tag size="medium" :type="getLevelType(scope.row.level)">L{{ scope.row.level }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="分类名称"></el-table-column>
        <el-table-column prop="parentId" label="父分类" width="120">
          <template slot-scope="scope">
            {{ getParentName(scope.row.parentId) }}
          </template>
        </el-table-column>
        <el-table-column prop="level" label="层级" width="80">
          <template slot-scope="scope">
            <el-tag size="medium" :type="getLevelType(scope.row.level)">L{{ scope.row.level }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sortOrder" label="排序" width="80"></el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'" size="small">
              {{ scope.row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="isCustom" label="类型" width="100">
          <template slot-scope="scope">
            <el-tag :type="scope.row.isCustom === 1 ? 'warning' : 'info'" size="small">
              {{ scope.row.isCustom === 1 ? '自定义' : '系统' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" show-overflow-tooltip></el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180"></el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="small" icon="el-icon-edit" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="text" size="small" icon="el-icon-delete" class="delete-btn" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <pagination v-show="total > 0" :total="total" :page.sync="queryParams.currentPage" :limit.sync="queryParams.size" @pagination="getList" />
    </el-card>

    <!-- 分类表单对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="500px">
      <el-form :model="form" :rules="rules" ref="form" label-width="100px">
        <el-form-item label="父分类" prop="parentId">
          <el-cascader
            v-model="form.parentId"
            :options="categoryTree"
            :props="{ value: 'id', label: 'name', children: 'children', checkStrictly: true, emitPath: false }"
            placeholder="请选择父分类（不选则为顶级分类）"
            clearable
            @change="handleParentChange"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入分类名称"></el-input>
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="form.sortOrder" :min="0" :max="9999"></el-input-number>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input type="textarea" v-model="form.description" :rows="4" placeholder="请输入分类描述"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Request from '@/utils/request'
import Pagination from '@/components/Pagination/index.vue'

export default {
  name: 'CategoryManager',
  components: {
    Pagination
  },
  data() {
    return {
      // 搜索表单
      searchForm: {
        name: '',
        parentId: '',
        level: '',
        status: ''
      },
      // 父分类列表（用于下拉选择）
      parentCategories: [],
      // 分类树（用于级联选择器）
      categoryTree: [],
      // 查询参数
      queryParams: {
        currentPage: 1,
        size: 10
      },
      // 分类列表
      categories: [],
      // 总数
      total: 0,
      // 对话框显示
      dialogVisible: false,
      // 对话框标题
      dialogTitle: '',
      // 表单数据
      form: {
        id: undefined,
        name: '',
        parentId: 0,
        level: 1,
        sortOrder: 0,
        status: 1,
        description: ''
      },
      // 表单校验规则
      rules: {
        name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getList()
    this.loadCategoryTree()
    this.loadParentCategories()
  },
  methods: {
    // 获取父分类名称
    getParentName(parentId) {
      if (!parentId || parentId === 0) return '顶级分类'
      const findParent = (items, id) => {
        for (const item of items) {
          if (item.id === id) return item.name
          if (item.children && item.children.length > 0) {
            const found = findParent(item.children, id)
            if (found) return found
          }
        }
        return null
      }
      return findParent(this.categoryTree, parentId) || '顶级分类'
    },
    // 获取层级标签类型
    getLevelType(level) {
      const types = {
        1: '',
        2: 'success',
        3: 'warning',
        4: 'danger'
      }
      return types[level] || ''
    },
    // 加载分类树
    async loadCategoryTree() {
      try {
        const res = await Request.get('/category/tree')
        if (res.code === '0') {
          this.categoryTree = res.data
        } else {
          // 如果tree接口失败，尝试使用all接口并转换为树形结构
          await this.loadCategoryTreeFallback()
        }
      } catch (error) {
        console.error('获取分类树失败:', error)
        // 尝试使用备选方案
        await this.loadCategoryTreeFallback()
      }
    },
    // 备选方案：从平铺数据构建树形结构
    async loadCategoryTreeFallback() {
      try {
        const res = await Request.get('/category/all')
        if (res.code === '0') {
          this.categoryTree = this.buildTree(res.data)
        }
      } catch (error) {
        console.error('获取分类列表失败:', error)
      }
    },
    // 构建树形结构
    buildTree(flatList) {
      const map = {}
      const roots = []
      // 先创建所有节点的映射
      flatList.forEach(item => {
        map[item.id] = { ...item, children: [] }
      })
      // 然后构建树
      flatList.forEach(item => {
        if (item.parentId === 0 || !item.parentId) {
          roots.push(map[item.id])
        } else if (map[item.parentId]) {
          map[item.parentId].children.push(map[item.id])
        }
      })
      return roots
    },
    // 加载父分类列表
    async loadParentCategories() {
      try {
        const res = await Request.get('/category/top')
        if (res.code === '0') {
          this.parentCategories = res.data
        } else {
          // 备选：使用all接口
          await this.loadParentCategoriesFallback()
        }
      } catch (error) {
        console.error('获取父分类失败:', error)
        await this.loadParentCategoriesFallback()
      }
    },
    // 加载父分类列表备选方案
    async loadParentCategoriesFallback() {
      try {
        const res = await Request.get('/category/all')
        if (res.code === '0') {
          // 只取一级分类（parentId为0或没有parentId的）
          this.parentCategories = res.data.filter(item =>
            !item.parentId || item.parentId === 0
          )
        }
      } catch (error) {
        console.error('获取分类列表失败:', error)
      }
    },
    // 父分类选择变化
    handleParentChange(value) {
      if (value) {
        // 获取选中父分类的层级，加1就是当前分类的层级
        const findLevel = (items, id, level = 0) => {
          for (const item of items) {
            if (item.id === id) return level + 1
            if (item.children && item.children.length > 0) {
              const found = findLevel(item.children, id, level + 1)
              if (found) return found
            }
          }
          return null
        }
        const newLevel = findLevel(this.categoryTree, value)
        if (newLevel && newLevel < 4) {
          this.form.level = newLevel
        } else {
          this.form.level = 1
        }
      } else {
        this.form.level = 1
        this.form.parentId = 0
      }
    },
    // 获取分类列表
    async getList() {
      try {
        // 构造查询参数
        const params = {
          ...this.queryParams,
          name: this.searchForm.name || undefined,
          status: this.searchForm.status || undefined
        }

        // 同时支持父分类和层级的组合查询
        // 例如：父分类=种子，层级=2 → 查询种子下的二级分类
        if (this.searchForm.parentId) {
          params.parentId = this.searchForm.parentId
        }
        if (this.searchForm.level) {
          params.level = this.searchForm.level
        }

        const res = await Request.get('/category/page', { params })
        if (res.code === '0') {
          this.categories = res.data.records.map(item => ({
            ...item,
            createdAt: new Date(item.createdAt).toLocaleString('zh-CN', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false
            }).replace(/\//g, '-')
          }))
          this.total = res.data.total
        }
      } catch (error) {
        console.error('获取分类列表失败:', error)
      }
    },
    // 搜索
    handleSearch() {
      this.queryParams.currentPage = 1
      this.getList()
    },
    // 重置搜索
    resetSearch() {
      this.searchForm = {
        name: ''
      }
      this.handleSearch()
    },
    // 确保分类树已加载
    ensureCategoryTree() {
      if (!this.categoryTree || this.categoryTree.length === 0) {
        this.loadCategoryTree()
      }
      if (!this.parentCategories || this.parentCategories.length === 0) {
        this.loadParentCategories()
      }
    },
    // 新增分类
    handleAdd() {
      this.ensureCategoryTree()
      this.dialogTitle = '新增分类'
      this.form = {
        name: '',
        parentId: 0,
        level: 1,
        sortOrder: 0,
        status: 1,
        description: ''
      }
      this.dialogVisible = true
    },
    // 编辑分类
    handleEdit(row) {
      this.ensureCategoryTree()
      this.dialogTitle = '编辑分类'
      this.form = {
        ...row,
        parentId: row.parentId || 0
      }
      this.dialogVisible = true
    },
    // 删除分类
    handleDelete(row) {
      this.$confirm('确认删除该分类?', '提示', {
        type: 'warning'
      }).then(async () => {
        try {
          const res = await Request.delete(`/category/${row.id}`)
          if (res.code === '0') {
            this.$message.success('删除成功')
            this.getList()
          } else {
            this.$message.error(res.msg || '删除失败')
          }
        } catch (error) {
          console.error('删除分类失败:', error)
          this.$message.error('删除分类失败')
        }
      }).catch(() => {})
    },
    // 提交表单
    submitForm() {
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          try {
            // 过滤掉不需要的字段（createdAt, updatedAt等）
            const submitData = {
              name: this.form.name,
              parentId: this.form.parentId,
              level: this.form.level,
              sortOrder: this.form.sortOrder,
              status: this.form.status,
              description: this.form.description
            }
            const method = this.form.id ? 'put' : 'post'
            const url = this.form.id ? `/category/${this.form.id}` : '/category'
            const res = await Request[method](url, submitData)
            if (res.code === '0') {
              this.$message.success(`${this.form.id ? '更新' : '添加'}成功`)
              this.dialogVisible = false
              this.getList()
            }
          } catch (error) {
            console.error('提交表单失败:', error)
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.category-manager {
  padding: 24px;
  background-color: #f0f2f5;
  min-height: calc(100vh - 60px);
}

.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h2 {
  font-size: 24px;
  font-weight: 500;
  color: #1f2f3d;
  margin: 0;
  margin-right: 15px;
}

.operation-area {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;
}

.table-card {
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.operation-buttons {
  margin-top: 20px;
  display: flex;
  gap: 12px;
}

/* 美化表格 */
:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: none;
}

:deep(.el-table th) {
  background-color: #fafafa;
  font-weight: 500;
  color: #1f2f3d;
  padding: 12px 0;
}

:deep(.el-table td) {
  padding: 12px 0;
}

:deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background-color: #fafcff;
}

/* 美化对话框 */
:deep(.el-dialog) {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

:deep(.el-dialog__header) {
  padding: 24px;
  border-bottom: 1px solid #ebeef5;
  margin: 0;
}

:deep(.el-dialog__title) {
  font-size: 18px;
  font-weight: 500;
  color: #1f2f3d;
}

:deep(.el-dialog__body) {
  padding: 32px 24px;
}

:deep(.el-dialog__footer) {
  padding: 16px 24px;
  border-top: 1px solid #ebeef5;
}

/* 美化表单 */
:deep(.el-form-item__label) {
  font-weight: 500;
  color: #1f2f3d;
}

:deep(.el-input__inner) {
  border-radius: 6px;
}

.delete-btn {
  color: #f56c6c;
  margin-left: 12px;
}

.delete-btn:hover {
  color: #ff4949;
}
</style> 