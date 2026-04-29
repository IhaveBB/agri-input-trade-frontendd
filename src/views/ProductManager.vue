<template>
  <div class="product-manager">
    <!-- 页面标题区域 -->
    <div class="page-header">
      <h2>商品管理</h2>
      <el-tag type="info">共 {{ total }} 件商品</el-tag>
    </div>

    <!-- 搜索和操作区域 -->
    <el-card class="operation-area" shadow="hover">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="商品名称">
          <el-input v-model="searchForm.name" placeholder="请输入商品名称" clearable></el-input>
        </el-form-item>
        <el-form-item label="商品分类">
          <el-cascader
            v-model="searchForm.categoryId"
            :options="categoryTree"
            :props="{ value: 'id', label: 'name', children: 'children', checkStrictly: true, emitPath: false }"
            placeholder="请选择分类"
            clearable
            @change="handleCategoryChange"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="商品状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="上架" :value="1"></el-option>
            <el-option label="下架" :value="0"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button size="medium" plain type="primary" @click="handleSearch">查询</el-button>
          <el-button size="medium" plain @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
      <div class="operation-buttons">
        <el-button v-if="userInfo.role==='MERCHANT'" plain size="medium" type="primary" icon="el-icon-plus" class="add-button" @click="handleAdd">新增商品</el-button>
        <el-button plain size="medium" icon="el-icon-refresh" @click="getList">刷新</el-button>
      </div>
    </el-card>

    <!-- 数据统计卡片 -->
    <div class="statistics-cards">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <div class="stat-left">
                <div class="stat-icon"><i class="el-icon-goods"></i></div>
                <div class="stat-title">在售商品</div>
              </div>
              <div class="stat-value">{{ getOnSaleCount }}</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <div class="stat-left">
                <div class="stat-icon"><i class="el-icon-sold-out"></i></div>
                <div class="stat-title">已下架</div>
              </div>
              <div class="stat-value">{{ getOffSaleCount }}</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <div class="stat-left">
                <div class="stat-icon"><i class="el-icon-price-tag"></i></div>
                <div class="stat-title">促销商品</div>
              </div>
              <div class="stat-value">{{ getDiscountCount }}</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <div class="stat-left">
                <div class="stat-icon"><i class="el-icon-trophy"></i></div>
                <div class="stat-title">销量最高</div>
              </div>
              <div class="stat-value">{{ topSalesProduct?.name || '-' }}</div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 商品列表 -->
    <el-card class="table-card" shadow="hover">
      <el-table :data="products" border style="width: 100%" :default-sort="{prop: 'id', order: 'ascending'}">
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column label="商品图片" width="120">
          <template slot-scope="scope">
            <el-image :src="getProductImage(scope.row)" :preview-src-list="[getProductImage(scope.row)]" fit="cover" style="width: 80px; height: 80px"></el-image>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="商品名称"></el-table-column>
        <el-table-column prop="price" label="价格" width="120">
          <template slot-scope="scope">
            ¥{{ scope.row.price.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="100"></el-table-column>
        <el-table-column prop="salesCount" label="销量" width="100"></el-table-column>
        <el-table-column prop="category.name" label="分类" width="120"></el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.status" :active-value="1" :inactive-value="0" @change="() => handleStatusChange(scope.row)" active-color="#13ce66"
              inactive-color="#ff4949">
            </el-switch>
          </template>
        </el-table-column>
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

    <!-- 商品表单对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="1200px" :close-on-click-modal="false">
      <el-form :model="form" :rules="rules" ref="form" label-width="100px" class="product-form">
        <!-- 左侧基本信息 -->
        <div class="form-left">
          <el-form-item label="商品分类" prop="categoryId">
            <div class="category-select-wrapper">
              <el-cascader
                v-model="form.categoryId"
                :options="categoryTree"
                :props="{ value: 'id', label: 'name', children: 'children', checkStrictly: true, emitPath: false }"
                placeholder="请选择分类"
                style="flex: 1;"
                @change="handleCategoryChangeForForm"
              ></el-cascader>
              <el-button
                v-if="userInfo.role === 'MERCHANT'"
                type="text"
                icon="el-icon-plus"
                @click="showCategoryApplyDialog"
                style="margin-left: 10px; white-space: nowrap;"
              >申请新分类</el-button>
            </div>
            <div class="category-tips" v-if="userInfo.role === 'MERCHANT'">
              <i class="el-icon-info"></i> 找不到合适的分类？点击右侧"申请新分类"提交申请，审核通过后即可使用
            </div>
          </el-form-item>
          <el-form-item label="商品名称" prop="name">
            <el-input v-model="form.name" placeholder="请输入商品名称"></el-input>
          </el-form-item>
          <el-form-item label="产地" prop="placeOfOrigin">
            <el-input v-model="form.placeOfOrigin" placeholder="请输入商品产地"></el-input>
          </el-form-item>
          <el-form-item label="商品价格" prop="price">
            <el-input-number v-model="form.price" :precision="2" :step="0.1" :min="0" style="width: 100%;"></el-input-number>
          </el-form-item>
          <el-form-item label="商品库存" prop="stock">
            <el-input-number v-model="form.stock" :min="0" :step="1" style="width: 100%;"></el-input-number>
          </el-form-item>
          <el-form-item label="商品图片" prop="imageUrl">
            <el-upload class="avatar-uploader" action="#" :show-file-list="false" :auto-upload="false" :on-change="handleUpload">
              <img v-if="form.imageUrl" :src="'api/'+form.imageUrl" class="avatar">
              <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            </el-upload>
          </el-form-item>
          <el-form-item label="开启折扣" class="discount-switch">
            <el-switch v-model="form.isDiscount" :active-value="1" :inactive-value="0"></el-switch>
          </el-form-item>
          <el-form-item label="折扣价格" v-if="form.isDiscount === 1" prop="discountPrice">
            <el-input-number v-model="form.discountPrice" :precision="2" :step="0.1" :min="0" :max="form.price" style="width: 100%;"></el-input-number>
            <span class="discount-tip">原价: ¥{{ form.price }}</span>
          </el-form-item>
        </div>

        <!-- 右侧商品描述和扩展信息 -->
        <div class="form-right">
          <!-- 扩展字段模块（根据分类动态显示） -->
          <div v-if="currentCategoryLevel === 1" class="ext-fields-section">
            <div class="section-title">
              <i class="el-icon-collection"></i>
              {{ currentCategoryName }}扩展信息
            </div>

            <!-- 种子扩展字段 -->
            <div v-if="currentCategoryId === 1" class="ext-fields">
              <el-form-item label="种子类别" v-if="extFields.seedType">
                <el-select v-model="form.extraAttributes.seedType" placeholder="请选择">
                  <el-option v-for="opt in extFields.seedType.options" :key="opt.value" :label="opt.label" :value="opt.value"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="品种名称" v-if="extFields.varietyName">
                <el-input v-model="form.extraAttributes.varietyName" placeholder="请输入"></el-input>
              </el-form-item>
              <el-form-item label="生产商" v-if="extFields.manufacturer">
                <el-input v-model="form.extraAttributes.manufacturer" placeholder="请输入"></el-input>
              </el-form-item>
              <el-form-item label="进口商/分装单位" v-if="extFields.importer">
                <el-input v-model="form.extraAttributes.importer" placeholder="请输入"></el-input>
              </el-form-item>
              <el-form-item label="质量指标" v-if="extFields.qualityIndicator">
                <el-input type="textarea" v-model="form.extraAttributes.qualityIndicator" :rows="2" placeholder="请输入"></el-input>
              </el-form-item>
              <el-form-item label="品种说明" v-if="extFields.varietyDescription">
                <el-input type="textarea" v-model="form.extraAttributes.varietyDescription" :rows="2" placeholder="请输入"></el-input>
              </el-form-item>
              <el-form-item label="净含量" v-if="extFields.netContent">
                <el-input v-model="form.extraAttributes.netContent" placeholder="如：500g"></el-input>
              </el-form-item>
              <el-form-item label="生产年月" v-if="extFields.productionDate">
                <el-input v-model="form.extraAttributes.productionDate" placeholder="如：2024-01"></el-input>
              </el-form-item>
              <el-form-item label="经营许可证编号" v-if="extFields.seedBusinessLicense">
                <el-input v-model="form.extraAttributes.seedBusinessLicense" placeholder="请输入"></el-input>
              </el-form-item>
              <el-form-item label="是否转基因" v-if="extFields.isGmo">
                <el-select v-model="form.extraAttributes.isGmo" placeholder="请选择">
                  <el-option v-for="opt in extFields.isGmo.options" :key="opt.value" :label="opt.label" :value="opt.value"></el-option>
                </el-select>
              </el-form-item>
            </div>

            <!-- 农药扩展字段 -->
            <div v-if="currentCategoryId === 2" class="ext-fields">
              <el-form-item label="农药登记证号" v-if="extFields.registrationNumber">
                <el-input v-model="form.extraAttributes.registrationNumber" placeholder="请输入"></el-input>
              </el-form-item>
              <el-form-item label="生产许可证号" v-if="extFields.productionLicenseNumber">
                <el-input v-model="form.extraAttributes.productionLicenseNumber" placeholder="请输入"></el-input>
              </el-form-item>
              <el-form-item label="有效成分含量" v-if="extFields.activeIngredientContent">
                <el-input v-model="form.extraAttributes.activeIngredientContent" placeholder="请输入"></el-input>
              </el-form-item>
              <el-form-item label="剂型" v-if="extFields.formulationType">
                <el-input v-model="form.extraAttributes.formulationType" placeholder="如：乳油、粉剂"></el-input>
              </el-form-item>
              <el-form-item label="毒性等级" v-if="extFields.toxicityLevel">
                <el-select v-model="form.extraAttributes.toxicityLevel" placeholder="请选择">
                  <el-option v-for="opt in extFields.toxicityLevel.options" :key="opt.value" :label="opt.label" :value="opt.value"></el-option>
                </el-select>
              </el-form-item>
            </div>

            <!-- 肥料扩展字段 -->
            <div v-if="currentCategoryId === 3" class="ext-fields">
              <el-form-item label="肥料登记证号" v-if="extFields.registrationNumber">
                <el-input v-model="form.extraAttributes.registrationNumber" placeholder="请输入"></el-input>
              </el-form-item>
              <el-form-item label="养分含量" v-if="extFields.nutrientContent">
                <el-input v-model="form.extraAttributes.nutrientContent" placeholder="请输入"></el-input>
              </el-form-item>
              <el-form-item label="适用作物" v-if="extFields.applicableCrops">
                <el-input v-model="form.extraAttributes.applicableCrops" placeholder="请输入"></el-input>
              </el-form-item>
            </div>

            <!-- 饲料扩展字段 -->
            <div v-if="currentCategoryId === 4" class="ext-fields">
              <el-form-item label="产品成分分析保证值" v-if="extFields.compositionAnalysis">
                <el-input type="textarea" v-model="form.extraAttributes.compositionAnalysis" :rows="2" placeholder="请输入"></el-input>
              </el-form-item>
              <el-form-item label="原料组成" v-if="extFields.rawMaterial">
                <el-input type="textarea" v-model="form.extraAttributes.rawMaterial" :rows="2" placeholder="请输入"></el-input>
              </el-form-item>
              <el-form-item label="适用动物" v-if="extFields.applicableAnimals">
                <el-input v-model="form.extraAttributes.applicableAnimals" placeholder="如：猪、鸡、鸭等"></el-input>
              </el-form-item>
              <el-form-item label="保质期" v-if="extFields.shelfLife">
                <el-input v-model="form.extraAttributes.shelfLife" placeholder="如：12个月"></el-input>
              </el-form-item>
            </div>

            <!-- 兽药扩展字段 -->
            <div v-if="currentCategoryId === 5" class="ext-fields">
              <el-form-item label="有效成分" v-if="extFields.activeIngredient">
                <el-input v-model="form.extraAttributes.activeIngredient" placeholder="请输入有效成分"></el-input>
              </el-form-item>
              <el-form-item label="药理作用" v-if="extFields.pharmacologicalEffect">
                <el-input type="textarea" v-model="form.extraAttributes.pharmacologicalEffect" :rows="2" placeholder="请输入"></el-input>
              </el-form-item>
              <el-form-item label="适用症状" v-if="extFields.indications">
                <el-input type="textarea" v-model="form.extraAttributes.indications" :rows="2" placeholder="请输入适用症状"></el-input>
              </el-form-item>
              <el-form-item label="用法用量" v-if="extFields.usageDosage">
                <el-input type="textarea" v-model="form.extraAttributes.usageDosage" :rows="2" placeholder="请输入用法用量"></el-input>
              </el-form-item>
              <el-form-item label="休药期" v-if="extFields.withdrawalPeriod">
                <el-input v-model="form.extraAttributes.withdrawalPeriod" placeholder="如：7天"></el-input>
              </el-form-item>
              <el-form-item label="不良反应" v-if="extFields.adverseReactions">
                <el-input type="textarea" v-model="form.extraAttributes.adverseReactions" :rows="2" placeholder="请输入可能出现的不良反应"></el-input>
              </el-form-item>
              <el-form-item label="保质期" v-if="extFields.shelfLife">
                <el-input v-model="form.extraAttributes.shelfLife" placeholder="如：24个月"></el-input>
              </el-form-item>
              <el-form-item label="注意事项" v-if="extFields.precautions">
                <el-input type="textarea" v-model="form.extraAttributes.precautions" :rows="2" placeholder="请输入注意事项"></el-input>
              </el-form-item>
            </div>

            <!-- 农膜扩展字段 -->
            <div v-if="currentCategoryId === 6" class="ext-fields">
              <el-form-item label="适用范围" v-if="extFields.applicableRange">
                <el-input v-model="form.extraAttributes.applicableRange" placeholder="请输入适用范围"></el-input>
              </el-form-item>
              <el-form-item label="薄膜类别" v-if="extFields.filmType">
                <el-select v-model="form.extraAttributes.filmType" placeholder="请选择">
                  <el-option label="地膜" value="地膜"></el-option>
                  <el-option label="棚膜" value="棚膜"></el-option>
                  <el-option label="遮阳网" value="遮阳网"></el-option>
                  <el-option label="防虫网" value="防虫网"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="厚度" v-if="extFields.thickness">
                <el-input v-model="form.extraAttributes.thickness" placeholder="如：0.02mm"></el-input>
              </el-form-item>
              <el-form-item label="宽度" v-if="extFields.width">
                <el-input v-model="form.extraAttributes.width" placeholder="如：2米"></el-input>
              </el-form-item>
              <el-form-item label="长度" v-if="extFields.length">
                <el-input v-model="form.extraAttributes.length" placeholder="如：100米"></el-input>
              </el-form-item>
              <el-form-item label="颜色" v-if="extFields.color">
                <el-select v-model="form.extraAttributes.color" placeholder="请选择">
                  <el-option label="透明" value="透明"></el-option>
                  <el-option label="黑色" value="黑色"></el-option>
                  <el-option label="白色" value="白色"></el-option>
                  <el-option label="银灰色" value="银灰色"></el-option>
                </el-select>
              </el-form-item>
            </div>

            <!-- 农机扩展字段 -->
            <div v-if="currentCategoryId === 7" class="ext-fields">
              <el-form-item label="用途" v-if="extFields.purpose">
                <el-input v-model="form.extraAttributes.purpose" placeholder="请输入产品用途"></el-input>
              </el-form-item>
              <el-form-item label="产品结构参数" v-if="extFields.structureParams">
                <el-input type="textarea" v-model="form.extraAttributes.structureParams" :rows="2" placeholder="请输入产品结构参数"></el-input>
              </el-form-item>
              <el-form-item label="材质" v-if="extFields.material">
                <el-input v-model="form.extraAttributes.material" placeholder="请输入主要材质"></el-input>
              </el-form-item>
              <el-form-item label="功率" v-if="extFields.power">
                <el-input v-model="form.extraAttributes.power" placeholder="如：5.5kW"></el-input>
              </el-form-item>
              <el-form-item label="型号" v-if="extFields.model">
                <el-input v-model="form.extraAttributes.model" placeholder="请输入型号"></el-input>
              </el-form-item>
              <el-form-item label="品牌" v-if="extFields.brand">
                <el-input v-model="form.extraAttributes.brand" placeholder="请输入品牌"></el-input>
              </el-form-item>
            </div>

            <!-- 种子-区域季节配置 -->
            <div v-if="currentCategoryId === 1" class="region-season-config">
              <div class="subsection-title">适种区域配置</div>
              <el-button size="small" type="primary" plain @click="addRegionBlock" :disabled="hasNationalRegion" style="margin-bottom: 10px;">
                <i class="el-icon-plus"></i> 添加区域
              </el-button>
              <div v-for="(block, index) in form.regionSeasonConfigs" :key="index" class="region-block">
                <el-select v-model="block.regionId" placeholder="选择区域" style="width: 150px;" :disabled="hasNationalRegion && block.regionId !== 8">
                  <el-option v-for="region in regions" :key="region.id" :label="region.name" :value="region.id" :disabled="hasNationalRegion && region.id !== 8"></el-option>
                </el-select>
                <el-checkbox-group v-model="block.seasonIds" style="display: inline-block; margin-left: 10px;">
                  <el-checkbox v-for="season in seasons" :key="season.id" :label="season.id" :disabled="block.seasonIds && block.seasonIds.includes(5) && season.id !== 5">{{ season.name }}</el-checkbox>
                </el-checkbox-group>
                <el-button type="text" size="small" @click="removeRegionBlock(index)" style="margin-left: 10px; color: #f56c6c;">
                  <i class="el-icon-delete"></i>
                </el-button>
              </div>
              <div v-if="form.regionSeasonConfigs.length === 0" class="empty-tip">请添加适种区域</div>
              <div v-if="hasNationalRegion" class="crop-tip">已选择"全国"区域，其他区域不可选；季节仍可多选</div>
            </div>

            <!-- 农药/肥料-适用作物选择 -->
            <div v-if="currentCategoryId === 2 || currentCategoryId === 3" class="crop-config">
              <div class="subsection-title">适用作物选择</div>
              <el-cascader
                v-model="form.cropIds"
                :options="cropTree"
                :props="{ value: 'id', label: 'name', children: 'children', multiple: true, checkStrictly: true }"
                placeholder="请选择适用作物"
                clearable
                style="width: 100%;"
              ></el-cascader>
              <div class="crop-tip">提示：选择作物对应的分类，如需选择具体品种请选择四级分类</div>
            </div>

            <!-- 饲料/兽药-适用动物选择 -->
            <div v-if="currentCategoryId === 4 || currentCategoryId === 5" class="crop-config">
              <div class="subsection-title">适用动物选择</div>
              <el-cascader
                v-model="form.animalIds"
                :options="animalTree"
                :props="{ value: 'id', label: 'name', children: 'children', multiple: true, checkStrictly: true }"
                placeholder="请选择适用动物"
                clearable
                style="width: 100%;"
              ></el-cascader>
              <div class="crop-tip">提示：选择动物对应的分类</div>
            </div>
          </div>

          <!-- 商品描述 -->
          <el-form-item label="商品描述" prop="description" class="description-item">
            <div class="editor-wrapper">
              <Toolbar class="editor-toolbar" :editor="editor" :defaultConfig="toolbarConfig" :mode="mode" />
              <Editor class="editor-content" v-model="form.description" :defaultConfig="editorConfig" :mode="mode" @onCreated="handleCreated"
                @onChange="handleChange" />
            </div>
          </el-form-item>
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 图片裁剪对话框 -->
    <el-dialog title="图片裁剪" :visible.sync="cropperVisible" width="600px" append-to-body :close-on-click-modal="false" :close-on-press-escape="false">
      <div class="cropper-content">
        <vue-cropper ref="cropper" :img="cropImage" :info="true" :autoCrop="true" :autoCropWidth="300" :autoCropHeight="300" :fixedBox="true" :fixed="true"
          :fixedNumber="[1, 1]" :centerBox="true" outputType="png" :full="true" :canMove="true" :canMoveBox="true" :original="false" :enlarge="1"></vue-cropper>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cropperVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleCropUpload">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 申请新分类对话框 -->
    <el-dialog title="申请自定义分类" :visible.sync="categoryApplyDialogVisible" width="500px" append-to-body>
      <el-alert
        type="info"
        description="提交申请后需管理员审核，审核通过后分类将显示在下拉列表中"
        :closable="false"
        style="margin-bottom: 20px;"
      />
      <el-form :model="categoryApplyForm" :rules="categoryApplyRules" ref="categoryApplyForm" label-width="100px">
        <el-form-item label="父分类" prop="parentId">
          <el-cascader
            v-model="categoryApplyForm.parentId"
            :options="categoryTree"
            :props="{ value: 'id', label: 'name', children: 'children', checkStrictly: true, emitPath: false }"
            placeholder="请选择父分类（必选）"
            style="width: 100%;"
          ></el-cascader>
          <div class="form-tip">自定义分类必须选择父级分类，最多支持三级</div>
        </el-form-item>
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="categoryApplyForm.name" placeholder="请输入分类名称"></el-input>
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="categoryApplyForm.sortOrder" :min="0" :max="9999" style="width: 100%;"></el-input-number>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input type="textarea" v-model="categoryApplyForm.description" :rows="3" placeholder="请输入分类描述（可选）"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="categoryApplyDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitCategoryApply" :loading="categoryApplyLoading">提 交 申 请</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Request from '@/utils/request'
import Pagination from '@/components/Pagination/index.vue'
import { VueCropper } from 'vue-cropper'
import '@wangeditor/editor/dist/css/style.css'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import { getProductImageSrc } from '@/utils/productImage'

export default {
  name: 'ProductManager',
  inject: ['userInfo'],
  components: {
    Pagination,
    VueCropper,
    Editor,
    Toolbar
  },
  data() {
    // 折扣价验证规则
    const validateDiscountPrice = (rule, value, callback) => {
      if (this.form.isDiscount === 1) {
        if (!value) {
          callback(new Error('请输入折扣价格'))
        } else if (value >= this.form.price) {
          callback(new Error('折扣价必须低于原价'))
        } else {
          callback()
        }
      } else {
        callback()
      }
    }

    return {
      // 搜索表单
      searchForm: {
        name: '',
        categoryId: '',
        status: ''
      },
      // 查询参数
      queryParams: {
        currentPage: 1,
        size: 10
      },
      // 商品列表
      products: [],
      // 分类列表（平铺）
      categories: [],
      // 分类树（级联选择器用）
      categoryTree: [],
      // 作物树（用于农药/肥料选择适用作物）
      cropTree: [],
      // 动物树（用于饲料/兽药选择适用动物）
      animalTree: [],
      // 区域列表
      regions: [],
      // 季节列表
      seasons: [],
      // 当前选中的一级分类ID
      currentCategoryId: null,
      // 当前选中的一级分类名称
      currentCategoryName: '',
      // 当前是否选中了一级分类
      currentCategoryLevel: null,
      // 扩展字段配置
      extFields: {},
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
        categoryId: '',
        price: 0,
        stock: 0,
        imageUrl: '',
        description: '',
        isDiscount: 0,
        discountPrice: 0,
        placeOfOrigin: '',
        // 扩展字段
        extraAttributes: {},
        // 适用作物（农药/肥料用）
        cropIds: [],
        // 适用动物（饲料/兽药用）
        animalIds: [],
        // 区域-季节配置（种子用）
        regionSeasonConfigs: []
      },
      // 表单校验规则
      rules: {
        name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        categoryId: [
          { required: true, message: '请选择商品分类', trigger: 'change' }
        ],
        price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        stock: [
          { required: true, message: '请输入商品库存', trigger: 'blur' }
        ],
        discountPrice: [
          { validator: validateDiscountPrice, trigger: 'blur' }
        ]
      },
      // 图片裁剪相关
      cropperVisible: false,
      cropImage: '',
      uploadFile: null,
      topSalesProduct: null,
      editor: null,
      mode: 'default', // 或 'simple'
      toolbarConfig: {
        excludeKeys: [
          'group-video'  // 只移除视频功能
        ]
      },
      editorConfig: {
        placeholder: '请输入商品描述...',
        MENU_CONF: {
          uploadImage: {
            // 小于 5M 的图片转为 base64
            base64LimitSize: 5 * 1024 * 1024,
            // 自定义上传
            customUpload: async (file, insertFn) => {
              try {
                // 检查文件类型
                const isImage = file.type.startsWith('image/')
                if (!isImage) {
                  this.$message.error('上传文件只能是图片格式!')
                  return
                }

                // 检查文件大小
                const fileSize = file.size / 1024 / 1024 // 转换为 MB
                if (fileSize > 10) {
                  this.$message.error('图片大小不能超过 5MB!')
                  return
                }

                // 如果图片小于 10MB，编辑器会自动转为 base64
                // 只有大于 10MB 的图片才会走到这里
                // 创建 FormData
                const formData = new FormData()
                formData.append('file', file)

                // 发送请求
                const res = await Request.post('/file/upload/img', formData, {
                  headers: {
                    'Content-Type': 'multipart/form-data',
                    'token': this.userInfo.token
                  }
                })

                if (res.code === '0') {
                  // 上传成功，插入图片
                  insertFn(`/api${res.data}`)
                  this.$message.success('图片上传成功')
                } else {
                  this.$message.error(res.msg || '图片上传失败')
                }
              } catch (error) {
                console.error('上传图片失败:', error)
                this.$message.error('图片上传失败')
              }
            }
          }
        }
      },
      // 分类申请对话框
      categoryApplyDialogVisible: false,
      categoryApplyForm: {
        name: '',
        parentId: null,
        icon: '',
        sortOrder: 0,
        description: ''
      },
      categoryApplyRules: {
        parentId: [{ required: true, message: '请选择父分类', trigger: 'change' }],
        name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
      },
      categoryApplyLoading: false
    }
  },
  created() {
    this.getCategories()
    this.getRegions()
    this.getSeasons()
    this.getCropTree()
    this.getList()
  },
  methods: {
    getProductImage(product) {
      return getProductImageSrc(product)
    },
    // 在树中查找从根到目标节点的路径（用于el-cascader回显）
    findPathInTree(tree, targetId, path = []) {
      for (const node of tree) {
        const currentPath = [...path, node.id]
        if (node.id === targetId) return currentPath
        if (node.children && node.children.length > 0) {
          const found = this.findPathInTree(node.children, targetId, currentPath)
          if (found) return found
        }
      }
      return null
    },
    // 构建树形结构
    buildTree(flatList) {
      const map = {}
      const roots = []
      flatList.forEach(item => {
        map[item.id] = { ...item, children: [] }
      })
      flatList.forEach(item => {
        if (item.parentId === 0 || !item.parentId) {
          roots.push(map[item.id])
        } else if (map[item.parentId]) {
          map[item.parentId].children.push(map[item.id])
        }
      })
      return roots
    },
    // 获取分类列表
    async getCategories() {
      try {
        // 获取平铺列表用于搜索下拉
        const res = await Request.get('/category/all')
        if (res.code === '0') {
          this.categories = res.data
          // 从平铺数据构建树形结构
          this.categoryTree = this.buildTree(res.data)
        }
        // 获取树形结构用于级联选择器
        try {
          const treeRes = await Request.get('/category/tree')
          if (treeRes.code === '0') {
            this.categoryTree = treeRes.data
          }
        } catch (treeError) {
          console.warn('获取分类树失败，使用备选方案:', treeError)
        }
      } catch (error) {
        console.error('获取分类列表失败:', error)
      }
    },
    // 分类选择变化（搜索表单用）
    handleCategoryChange(value) {
      if (value) {
        // 级联选择器返回的是叶子节点的ID，直接用于查询
      }
    },
    // 获取区域列表
    async getRegions() {
      try {
        const res = await Request.get('/region/all')
        if (res.code === '0') {
          this.regions = res.data
        }
      } catch (error) {
        console.error('获取区域列表失败:', error)
      }
    },
    // 获取季节列表
    async getSeasons() {
      try {
        const res = await Request.get('/season/all')
        if (res.code === '0') {
          this.seasons = res.data
        }
      } catch (error) {
        console.error('获取季节列表失败:', error)
      }
    },
    // 获取作物树（用于农药/肥料选择适用作物）
    async getCropTree() {
      try {
        const res = await Request.get('/category/tree')
        if (res.code === '0') {
          // 过滤出种子分类及其子分类
          const seedCategory = res.data.find(c => c.name === '种子')
          if (seedCategory) {
            this.cropTree = [seedCategory]
          } else {
            this.cropTree = res.data
          }
          // 过滤出畜禽分类及其子分类（用于饲料/兽药选择适用动物）
          const animalCategory = res.data.find(c => c.name === '畜禽')
          if (animalCategory) {
            this.animalTree = [animalCategory]
          }
        }
      } catch (error) {
        console.error('获取作物树失败:', error)
      }
    },
    // 获取分类扩展字段配置
    async getExtFields(categoryId) {
      try {
        const res = await Request.get(`/product/ext/fields?categoryId=${categoryId}`)
        if (res.code === '0' && res.data) {
          // 将字段配置转为对象形式方便使用
          const fieldsObj = {}
          res.data.forEach(item => {
            item.fields.forEach(field => {
              fieldsObj[field.key] = field
            })
          })
          this.extFields = fieldsObj
        }
      } catch (error) {
        console.error('获取扩展字段配置失败:', error)
      }
    },
    // 表单中选择分类后触发
    handleCategoryChangeForForm(categoryId) {
      if (!categoryId) {
        this.currentCategoryId = null
        this.currentCategoryLevel = null
        this.currentCategoryName = ''
        this.extFields = {}
        return
      }

      // 查找选中的分类信息
      const findCategory = (items, id, level = 1, parentName = '') => {
        for (const item of items) {
          if (item.id === id) {
            return {
              id: item.id,
              level: level,
              name: item.name,
              parentName: parentName
            }
          }
          if (item.children && item.children.length > 0) {
            const found = findCategory(item.children, id, level + 1, item.name)
            if (found) return found
          }
        }
        return null
      }

      const categoryInfo = findCategory(this.categoryTree, categoryId)

      if (categoryInfo) {
        // 判断是否选择了一级分类
        if (categoryInfo.level === 1) {
          this.currentCategoryId = categoryInfo.id
          this.currentCategoryLevel = categoryInfo.level
          this.currentCategoryName = categoryInfo.name
          // 加载扩展字段配置
          this.getExtFields(categoryInfo.id)
        } else {
          // 如果不是一级分类，查找其一级父分类
          const findParentLevel1 = (items, id, level1Id = null, level1Name = '') => {
            for (const item of items) {
              // 找到了目标分类，返回当前的一级分类信息
              if (item.id === id) {
                return { id: level1Id, name: level1Name }
              }
              // 继续往下查找，传入当前节点作为候选一级分类
              if (item.children && item.children.length > 0) {
                // 当前节点是一级分类时，更新level1信息
                const newLevel1Id = level1Id === null ? item.id : level1Id
                const newLevel1Name = level1Name === '' ? item.name : level1Name
                const found = findParentLevel1(item.children, id, newLevel1Id, newLevel1Name)
                if (found && found.id) return found
              }
            }
            return null
          }
          const parentInfo = findParentLevel1(this.categoryTree, categoryId)
          if (parentInfo && parentInfo.id) {
            this.currentCategoryId = parentInfo.id
            this.currentCategoryLevel = 1
            this.currentCategoryName = parentInfo.name
            this.getExtFields(parentInfo.id)
          }
        }
      }

      // 重置扩展字段数据
      this.form.extraAttributes = {}
      this.form.cropIds = []
      this.form.regionSeasonConfigs = []
    },
    // 添加区域配置块
    addRegionBlock() {
      // 如果已经选择了"全国"，不能再添加
      if (this.hasNationalRegion) {
        this.$message.warning('已选择"全国"区域，无需再添加其他区域')
        return
      }
      this.form.regionSeasonConfigs.push({
        regionId: null,
        seasonIds: []
      })
    },
    // 移除区域配置块
    removeRegionBlock(index) {
      this.form.regionSeasonConfigs.splice(index, 1)
    },
    // 获取商品列表
    async getList() {
      if(this.userInfo.role === 'MERCHANT'){
        this.queryParams.merchantId = this.userInfo.id
      }
      try {
        const params = {
          ...this.queryParams,
          name: this.searchForm.name,
          categoryId: this.searchForm.categoryId,
          status: this.searchForm.status
        }
        const res = await Request.get('/product/page', { params })
        if (res.code === '0') {
          this.products = res.data.records || []
          this.total = res.data.total
          // Update topSalesProduct safely
          this.topSalesProduct = this.products.length > 0 
            ? this.products.reduce((max, current) => 
                (current.salesCount > (max?.salesCount || 0)) ? current : max, null)
            : null
        }
      } catch (error) {
        console.error('获取商品列表失败:', error)
        this.products = [] // Reset to empty array on error
        this.total = 0
        this.topSalesProduct = null
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
        name: '',
        categoryId: '',
        status: ''
      }
      this.handleSearch()
    },
    // 新增商品
    handleAdd() {
      this.dialogTitle = '新增商品'
      this.form = {
        name: '',
        categoryId: '',
        price: 0,
        stock: 0,
        imageUrl: '',
        description: '',
        isDiscount: 0,
        discountPrice: 0,
        placeOfOrigin: '',
        extraAttributes: {},
        cropIds: [],
        animalIds: [],
        regionSeasonConfigs: []
      }
      // 重置扩展字段状态
      this.currentCategoryId = null
      this.currentCategoryLevel = null
      this.currentCategoryName = ''
      this.extFields = {}
      this.dialogVisible = true
    },
    // 编辑商品
    handleEdit(row) {
      this.dialogTitle = '编辑商品'
      // 加载商品的扩展信息
      this.loadProductExtInfo(row.id)
    },
    // 加载商品扩展信息
    async loadProductExtInfo(productId) {
      try {
        const res = await Request.get(`/product/ext/${productId}`)
        if (res.code === '0') {
          const data = res.data
          // 设置基本字段
          this.form = {
            id: data.id,
            name: data.name,
            categoryId: data.categoryId,
            price: data.price,
            stock: data.stock,
            imageUrl: data.imageUrl,
            description: data.description,
            isDiscount: data.isDiscount || 0,
            discountPrice: data.discountPrice || 0,
            placeOfOrigin: data.placeOfOrigin,
            extraAttributes: data.extraAttributes || {},
            cropIds: data.crops ? data.crops.map(c => this.findPathInTree(this.cropTree, c.id)).filter(Boolean) : [],
            animalIds: data.animals ? data.animals.map(a => this.findPathInTree(this.animalTree, a.id)).filter(Boolean) : [],
            regionSeasonConfigs: (data.regionSeasonList || []).reduce((acc, item) => {
              const existing = acc.find(b => b.regionId === item.regionId)
              if (existing) {
                if (!existing.seasonIds.includes(item.seasonId)) {
                  existing.seasonIds.push(item.seasonId)
                }
              } else {
                acc.push({ regionId: item.regionId, seasonIds: [item.seasonId] })
              }
              return acc
            }, [])
          }

          // 根据分类获取扩展字段配置
          // 查找一级分类ID
          const findLevel1Category = (items, id) => {
            for (const item of items) {
              if (item.id === id) {
                return item.id
              }
              if (item.children && item.children.length > 0) {
                const found = findLevel1Category(item.children, id)
                if (found) return found
              }
            }
            return null
          }
          const level1Id = findLevel1Category(this.categoryTree, data.categoryId)
          if (level1Id) {
            this.currentCategoryId = level1Id
            this.currentCategoryLevel = 1
            const category = this.categoryTree.find(c => c.id === level1Id)
            this.currentCategoryName = category ? category.name : ''
            await this.getExtFields(level1Id)
          }
        }
      } catch (error) {
        console.error('获取商品扩展信息失败:', error)
        // 如果获取失败，至少加载基本信息
        this.form = { ...row }
      }
      this.dialogVisible = true
    },
    // 删除商品
    handleDelete(row) {
      this.$confirm('确认删除该商品?', '提示', {
        type: 'warning'
      }).then(async () => {
        try {
          const res = await Request.delete(`/product/${row.id}`)
          if (res.code === '0') {
            this.$message.success('删除成功')
            this.getList()
          }else{
            this.$message({
              message: res.msg,
              type: 'error'
            })
          }
        } catch (error) {
          console.error('删除商品失败:', error)
        }
      }).catch(() => { })
    },
    // 更改商品状态
    async handleStatusChange(row) {
      try {
        const res = await Request.put(`/product/${row.id}/status?status=${row.status}`)
        if (res.code === '0') {
          this.$message.success('状态更新成功')
        } else {
          row.status = row.status === 1 ? 0 : 1
          this.$message.error('状态更新失败')
        }
      } catch (error) {
        row.status = row.status === 1 ? 0 : 1
        console.error('更新商品状态失败:', error)
        this.$message.error('更新失败')
      }
    },
    // 修改 handleUpload 方法
    handleUpload(file) {
      // 检查文件类型和大小
      const isImage = file.raw.type.startsWith('image/')
      const isLt10M = file.raw.size / 1024 / 1024 < 10

      if (!isImage) {
        this.$message.error('上传文件只能是图片格式!')
        return false
      }
      if (!isLt10M) {
        this.$message.error('上传图片大小不能超过 10MB!')
        return false
      }

      // 保存原始文件
      this.uploadFile = file.raw
      // 读取文件并显示裁剪框
      const reader = new FileReader()
      reader.readAsDataURL(file.raw)
      reader.onload = () => {
        this.cropImage = reader.result
        this.cropperVisible = true
      }
      return false // 阻止自动上传
    },
    // 修改 handleCropUpload 方法
    async handleCropUpload() {
      try {
        // 获取裁剪后的 blob 数据
        const blob = await new Promise((resolve) => {
          this.$refs.cropper.getCropBlob((data) => resolve(data))
        })
        // 创建文件对象
        const fileName = `cropped-${Date.now()}.png`
        const file = new File([blob], fileName, { type: 'image/png' })

        // 创建 FormData
        const formData = new FormData()
        formData.append('file', file)

        // 发送上传请求
        const res = await Request.post('/file/upload/img', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'token': this.userInfo.token
          }
        })

        if (res.code === '0') {
          this.form.imageUrl = res.data
          this.$message.success('图片上传成功')
          this.cropperVisible = false
        } else {
          throw new Error(res.msg || '上传失败')
        }
      } catch (error) {
        console.error('图片上传失败:', error)
        this.$message.error(error.message || '图片上传失败')
      }
    },
    // 提交表单
    submitForm() {
      if (this.userInfo.role === 'MERCHANT') {
        this.form.merchantId = this.userInfo.id
      }

      // 验证区域-季节配置（种子类商品）
      if (this.currentCategoryId === 1 && this.form.regionSeasonConfigs.length > 0) {
        const invalidBlocks = this.form.regionSeasonConfigs.filter(
          block => !block.regionId || block.seasonIds.length === 0
        )
        if (invalidBlocks.length > 0) {
          this.$message.warning('请完善区域-季节配置信息')
          return
        }
      }

      this.$refs.form.validate(async (valid) => {
        if (valid) {
          try {
            // 构建提交数据，传入一级分类ID而不是选中的子分类ID
            const submitData = {
              ...this.form,
              // 使用一级分类ID，因为扩展信息只和一级分类有关系
              categoryId: this.currentCategoryId,
              // 处理扩展属性，移除空值
              extraAttributes: this.form.extraAttributes
            }

            // 处理农药/肥料的适用作物（cascader返回路径数组，取最后一级ID）
            if (this.currentCategoryId === 2 || this.currentCategoryId === 3) {
              submitData.categoryIds = this.form.cropIds.map(path => Array.isArray(path) ? path[path.length - 1] : path)
            }

            // 处理饲料/兽药的适用动物（cascader返回路径数组，取最后一级ID）
            if ((this.currentCategoryId === 4 || this.currentCategoryId === 5) && this.form.animalIds.length > 0) {
              submitData.animalIds = this.form.animalIds.map(path => Array.isArray(path) ? path[path.length - 1] : path)
              // 清除 cropIds，避免混淆
              delete submitData.cropIds
            }

            // 处理区域-季节配置
            if (this.form.regionSeasonConfigs.length > 0) {
              submitData.regionSeasonConfigs = this.form.regionSeasonConfigs.map(block => ({
                regionId: block.regionId,
                seasonIds: block.seasonIds
              }))
            }

            const method = this.form.id ? 'put' : 'post'
            const url = this.form.id ? `/product/ext/${this.form.id}` : '/product/ext'
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
    },
    handleCreated(editor) {
      this.editor = Object.seal(editor)
    },
    handleChange(editor) {
      this.form.description = editor.getHtml()
    },
    // 显示分类申请对话框
    showCategoryApplyDialog() {
      this.categoryApplyForm = {
        name: '',
        parentId: null,
        icon: '',
        sortOrder: 0,
        description: ''
      }
      this.categoryApplyDialogVisible = true
    },
    // 提交分类申请
    submitCategoryApply() {
      this.$refs.categoryApplyForm.validate(async valid => {
        if (!valid) return
        this.categoryApplyLoading = true
        try {
          const res = await Request.post('/category/custom', this.categoryApplyForm)
          if (res.code === '0') {
            this.$message.success('申请提交成功，请等待管理员审核')
            this.categoryApplyDialogVisible = false
          } else {
            this.$message.error(res.msg || '提交失败')
          }
        } catch (error) {
          this.$message.error('提交申请失败')
        } finally {
          this.categoryApplyLoading = false
        }
      })
    }
  },
  computed: {
    getOnSaleCount() {
      return this.products ? this.products.filter(p => p.status === 1).length : 0
    },
    getOffSaleCount() {
      return this.products ? this.products.filter(p => p.status === 0).length : 0
    },
    getDiscountCount() {
      return this.products ? this.products.filter(p => p.isDiscount === 1).length : 0
    },
    // 判断是否已选择"全国"区域
    hasNationalRegion() {
      return this.form.regionSeasonConfigs.some(block => block.regionId === 8)
    },
    // 获取"全国"区域的索引
    nationalRegionIndex() {
      return this.form.regionSeasonConfigs.findIndex(block => block.regionId === 8)
    },
    // 判断某个区域块是否选择了"全年"季节（seasonId=5）
    // 返回一个函数，根据block索引判断该块是否选择了"全年"
    checkBlockHasAnnualSeason() {
      return (blockIndex) => {
        const block = this.form.regionSeasonConfigs[blockIndex]
        return block && block.seasonIds && block.seasonIds.includes(5)
      }
    }
  },
  beforeDestroy() {
    if (this.editor) {
      this.editor.destroy()
    }
  },
  mounted() {
    // 移除 addQuillTitle 相关代码
  }
}
</script>

<style scoped>
.product-manager {
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

.statistics-cards {
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 8px;
  transition: all 0.3s;
  border: none;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.stat-content {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-left {
  display: flex;
  flex-direction: column;
  text-align: center;
  width: 100px;
  gap: 4px;
  align-items: flex-start;
}

.stat-icon {
  font-size: 24px;
  color: #409eff;
  opacity: 0.8;
  width: 100%;
  text-align: center;
}

.stat-title {
  font-size: 13px;
  color: #909399;
  width: 100%;
  text-align: center;
}

.stat-value {
  font-size: 22px;
  font-weight: 600;
  color: #1f2f3d;
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

.discount-tip {
  margin-left: 10px;
  color: #909399;
  font-size: 13px;
}

:deep(.el-switch.is-checked .el-switch__core) {
  border-color: #67c23a;
  background-color: #67c23a;
}

/* 修改表单布局样式 */
.product-form {
  display: flex;
  gap: 24px;
}

.form-left {
  width: 380px;
  flex-shrink: 0;
}

.form-right {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.description-item {
  margin-bottom: 0;
}

.editor-wrapper {
  height: 400px;
  display: flex;
  flex-direction: column;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.editor-toolbar {
  border-bottom: 1px solid #dcdfe6;
  background-color: #fff;
  flex-shrink: 0; /* 防止工具栏被压缩 */
}

.editor-content {
  flex: 1;
  overflow-y: auto; /* 添加垂直滚动条 */
}

/* 编辑器相关样式 */
:deep(.w-e-text-container) {
  height: calc(100% - 40px) !important; /* 减去工具栏的高度 */
  overflow-y: auto !important; /* 强制显示滚动条 */
}

:deep(.w-e-scroll) {
  height: 100% !important;
  min-height: unset !important; /* 移除最小高度限制 */
}

/* 调整左侧表单项样式 */
.form-left :deep(.el-form-item) {
  margin-bottom: 22px;
}

.form-left :deep(.el-input-number) {
  width: 100%;
}

.form-left :deep(.el-select) {
  width: 100%;
}

/* 上传图片区域样式 */
.avatar-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 178px;
  height: 178px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.avatar-uploader:hover {
  border-color: #409eff;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}

.avatar {
  width: 178px;
  height: 178px;
  display: block;
  object-fit: cover;
}

/* 编辑器相关样式 */
:deep(.w-e-text-container) {
  height: 100% !important;
}

:deep(.w-e-toolbar) {
  padding: 8px !important;
}

:deep(.w-e-bar-item) {
  padding: 4px 6px !important;
}

:deep(.w-e-bar-item button) {
  padding: 4px 10px !important;
}

:deep(.w-e-text-container) {
  background-color: #fff !important;
}

:deep(.w-e-panel-content-image) {
  max-height: 400px !important;
}

:deep(.w-e-panel-content-image .w-e-image-container) {
  min-height: 100px !important;
}

:deep(.w-e-progress-bar) {
  background-color: #409eff !important;
}

/* 对话框样式优化 */
:deep(.el-dialog__body) {
  padding: 24px;
}

.discount-switch {
  margin-bottom: 16px;
}

/* 优化图片上传相关样式 */
:deep(.w-e-text-container img) {
  max-width: 100%;
  height: auto;
  margin: 8px 0;
  border-radius: 4px;
}

:deep(.w-e-panel-content-image) {
  max-height: 400px !important;
  padding: 16px !important;
}

:deep(.w-e-progress-bar) {
  background-color: #409eff !important;
}

/* 优化图片上传提示 */
:deep(.w-e-panel-content-image .w-e-image-container) {
  min-height: 100px !important;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.w-e-text-placeholder) {
  color: #909399 !important;
}

/* 图片裁剪相关样式 */
.cropper-content {
  height: 400px;
  width: 100%;
}

:deep(.cropper-view-box) {
  border-radius: 4px;
  border: 1px solid #409eff;
}

:deep(.cropper-container) {
  width: 100% !important;
  height: 100% !important;
}

:deep(.vue-cropper) {
  width: 100% !important;
  height: 100% !important;
}

/* 调整裁剪对话框的样式 */
:deep(.el-dialog__body) {
  padding: 10px 20px;
}

.cropper-content {
  background-color: #f5f7fa;
  border-radius: 4px;
}

/* 优化裁剪工具的显示 */
:deep(.cropper-point) {
  background-color: #409eff;
  width: 8px;
  height: 8px;
}

:deep(.cropper-line) {
  background-color: #409eff;
}

:deep(.cropper-face) {
  background-color: inherit;
}

/* 扩展字段区域样式 */
.ext-fields-section {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  max-height: 300px;
  overflow-y: auto;
  flex-shrink: 0;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
}

.section-title i {
  margin-right: 8px;
  color: #409eff;
}

.subsection-title {
  font-size: 14px;
  font-weight: 500;
  color: #606266;
  margin: 16px 0 12px 0;
}

.ext-fields .el-form-item {
  margin-bottom: 12px;
}

.ext-fields .el-form-item__label {
  font-size: 13px;
}

/* 区域-季节配置样式 */
.region-season-config {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px dashed #dcdfe6;
}

.region-block {
  display: flex;
  align-items: center;
  padding: 10px;
  background: #fff;
  border-radius: 4px;
  margin-bottom: 10px;
  border: 1px solid #e4e7ed;
}

.region-block .el-select {
  margin-right: 10px;
}

.empty-tip {
  color: #909399;
  font-size: 13px;
  text-align: center;
  padding: 10px;
}

/* 作物选择样式 */
.crop-config {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px dashed #dcdfe6;
}

.crop-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}

/* 分类选择器样式 */
.category-select-wrapper {
  display: flex;
  align-items: center;
}

.category-tips {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}

.category-tips i {
  color: #409eff;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}
</style> 
