<template>
    <div class="register-container">
        <h2 class="register-title">加入农资采销系统</h2>
        <p class="register-subtitle">开启您的采购新体验</p>

        <el-form ref="registerForm" :model="registerForm" :rules="rules" class="register-form">
            <div class="form-content">
                <el-form-item prop="username">
                    <el-input 
                        v-model="registerForm.username" 
                        placeholder="请输入用户名"
                        prefix-icon="el-icon-user">
                    </el-input>
                </el-form-item>

                <el-form-item prop="password">
                    <el-input 
                        type="password" 
                        v-model="registerForm.password" 
                        placeholder="请设置密码"
                        prefix-icon="el-icon-lock">
                    </el-input>
                </el-form-item>

                <el-form-item prop="name">
                    <el-input 
                        v-model="registerForm.name" 
                        placeholder="请输入真实姓名"
                        prefix-icon="el-icon-user">
                    </el-input>
                </el-form-item>

                <el-form-item prop="email">
                    <el-input 
                        v-model="registerForm.email" 
                        placeholder="请输入邮箱"
                        prefix-icon="el-icon-message">
                    </el-input>
                </el-form-item>

                <el-form-item prop="code">
                    <div class="validate-container">
                        <el-input 
                            v-model="registerForm.code" 
                            placeholder="请输入验证码"
                            prefix-icon="el-icon-chat-line-round">
                        </el-input>
                        <el-button 
                            type="success" 
                            :disabled="disabled"
                            class="validate-btn"
                            @click="sendVerificationCode">
                            {{ buttonContent }}
                        </el-button>
                    </div>
                </el-form-item>

                <el-form-item prop="role">
                    <el-select
                        v-model="registerForm.role"
                        placeholder="请选择用户角色"
                        class="role-select">
                        <el-option label="普通用户" value="USER"></el-option>
                        <el-option label="商户" value="MERCHANT"></el-option>
                        <el-option label="管理员" value="ADMIN"></el-option>
                    </el-select>
                </el-form-item>

                <!-- 普通用户/商户显示地理位置选择 -->
                <el-form-item v-if="registerForm.role === 'USER' || registerForm.role === 'MERCHANT'" label="所在省份">
                    <el-select
                        v-model="registerForm.province"
                        placeholder="请选择所在省份（可选）"
                        clearable
                        style="width: 100%">
                        <el-option-group v-for="group in provinceGroups" :key="group.region" :label="group.region">
                            <el-option v-for="p in group.provinces" :key="p" :label="p" :value="p"></el-option>
                        </el-option-group>
                    </el-select>
                    <div class="form-tip">填写省份可帮助系统为您推荐当地适用的农资商品</div>
                </el-form-item>

                <!-- 普通用户显示感兴趣作物选择 -->
                <el-form-item v-if="registerForm.role === 'USER'" label="感兴趣作物">
                    <el-cascader
                        v-model="registerForm.interestedCropIds"
                        :options="cropTree"
                        :props="{ value: 'id', label: 'name', children: 'children', multiple: true, emitPath: false }"
                        placeholder="请选择您种植或感兴趣的作物（可选）"
                        clearable
                        style="width: 100%">
                    </el-cascader>
                    <div class="form-tip">选择作物可帮助我们为您推荐更精准的农资商品</div>
                </el-form-item>

                <el-form-item prop="invitationCode" v-if="registerForm.role === 'ADMIN'">
                    <el-input 
                        v-model="registerForm.invitationCode" 
                        placeholder="请输入管理员邀请码"
                        prefix-icon="el-icon-key">
                        <template slot="append">
                            <el-tooltip content="请联系超级管理员获取邀请码" placement="top">
                                <i class="el-icon-question"></i>
                            </el-tooltip>
                        </template>
                    </el-input>
                </el-form-item>

                <el-form-item>
                    <el-button 
                        type="success" 
                        class="register-button"
                        @click="onRegister">
                        <i class="el-icon-check"></i>
                        立即注册
                    </el-button>
                </el-form-item>

                <div class="register-actions">
                    <el-link type="success" @click="$router.push('/login')">
                        <i class="el-icon-arrow-left"></i> 返回登录
                    </el-link>
                </div>
            </div>
        </el-form>
    </div>
</template>

<script>
import request from "@/utils/request";

export default {
    name: 'Register',
    data() {
        // 验证邀请码
        const validateInvitationCode = (rule, value, callback) => {
            if (this.registerForm.role === 'ADMIN') {
                if (!value) {
                    callback(new Error('请输入管理员邀请码'));
                } else if (value !== 'ADMIN666') { // 邀请码写死为ADMIN666
                    callback(new Error('邀请码不正确'));
                } else {
                    callback();
                }
            } else {
                callback();
            }
        };

        return {
            countdown: 0,
            disabled: false,
            timer: null,
            buttonContent: '发送验证码',
            registerForm: {
                username: '',
                password: '',
                name: '',
                email: '',
                code: '',
                role: 'USER',
                status: 1,
                invitationCode: '', // 添加邀请码字段
                interestedCropIds: [], // 感兴趣作物ID列表
                province: '' // 所在省份
            },
            cropTree: [], // 作物分类树
            provinceGroups: [
                { region: '华北', provinces: ['北京', '天津', '河北', '山西', '内蒙古'] },
                { region: '东北', provinces: ['辽宁', '吉林', '黑龙江'] },
                { region: '华东', provinces: ['上海', '江苏', '浙江', '安徽', '福建', '江西', '山东'] },
                { region: '华中', provinces: ['河南', '湖北', '湖南'] },
                { region: '华南', provinces: ['广东', '广西', '海南'] },
                { region: '西南', provinces: ['重庆', '四川', '贵州', '云南', '西藏'] },
                { region: '西北', provinces: ['陕西', '甘肃', '青海', '宁夏', '新疆'] }
            ],
            rules: {
                username: [
                    { required: true, message: '请输入用户名', trigger: 'blur' },
                    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: '请输入密码', trigger: 'blur' },
                    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
                ],
                name: [
                    { required: true, message: '请输入真实姓名', trigger: 'blur' }
                ],
                email: [
                    { required: true, message: '请输入邮箱', trigger: 'blur' },
                    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
                ],
                code: [
                    { required: true, message: '请输入验证码', trigger: 'blur' }
                ],
                role: [
                    { required: true, message: '请选择用户角色', trigger: 'change' }
                ],
                invitationCode: [
                    { validator: validateInvitationCode, trigger: 'blur' }
                ]
            }
        };
    },
    created() {
        this.loadCropTree();
    },
    methods: {
        // 加载作物分类树（种子分类下的四级分类）
        async loadCropTree() {
            try {
                // 获取分类树，然后提取种子分类（id=1）下的子分类
                const res = await request.get('/category/tree');
                if (res.code === '0' && res.data) {
                    const seedCategory = res.data.find(c => c.id === 1);
                    if (seedCategory && seedCategory.children) {
                        // 只取种子分类下的子分类作为作物选项
                        this.cropTree = seedCategory.children;
                    }
                }
            } catch (error) {
                console.error('加载作物分类失败:', error);
            }
        },
        sendVerificationCode() {
            if (this.disabled) return;

            if (!this.registerForm.email) {
                this.$message.error('请先输入邮箱地址');
                return;
            }

            request.get(`/email/sendEmail/${this.registerForm.email}`).then(res => {
                if (res.code === '0') {
                    this.$message({
                        type: 'success',
                        message: "验证码已发送到您的邮箱,请查收"
                    });
                    this.startCountdown();
                } else {
                    this.$message({
                        type: 'error',
                        message: res.msg
                    });
                }
            });
        },
        
        startCountdown() {
            this.countdown = 60;
            this.disabled = true;
            this.buttonContent = `${this.countdown}秒后重试`;

            this.timer = setInterval(() => {
                if (this.countdown > 0) {
                    this.countdown--;
                    this.buttonContent = `${this.countdown}秒后重试`;
                } else {
                    clearInterval(this.timer);
                    this.disabled = false;
                    this.buttonContent = '发送验证码';
                }
            }, 1000);
        },

        onRegister() {
            this.$refs.registerForm.validate((valid) => {
                if (valid) {
                    // 如果是管理员注册，验证邀请码
                    if (this.registerForm.role === 'ADMIN' &&
                        this.registerForm.invitationCode !== 'ADMIN666') {
                        this.$message({
                            type: 'error',
                            message: '管理员邀请码不正确'
                        });
                        return;
                    }

                    // 构建提交数据，转换感兴趣作物为逗号分隔字符串
                    const submitData = { ...this.registerForm };
                    if (submitData.interestedCropIds && submitData.interestedCropIds.length > 0) {
                        submitData.interestedCrops = submitData.interestedCropIds.join(',');
                    }
                    delete submitData.interestedCropIds; // 删除临时字段
                    // 将省份转换为 location 字段格式（省份-省会城市）
                    if (submitData.province) {
                        submitData.location = submitData.province;
                    }
                    delete submitData.province; // 删除临时字段

                    // 注册请求，传递验证码参数
                    request.post("/user/add", submitData, {
                        params: { code: this.registerForm.code }
                    }).then(res => {
                        if (res.code === '0') {
                            this.$message({
                                type: 'success',
                                message: "注册成功，请登录"
                            });
                            this.$router.push('/login');
                        } else {
                            this.$message({
                                type: 'error',
                                message: res.msg
                            });
                        }
                    });
                }
            });
        }
    },
    beforeDestroy() {
        clearInterval(this.timer);
    }
};
</script>

<style scoped>
.register-container {
    width: 100%;
    max-width: 380px;
    animation: fadeIn 0.6s ease-out;
}

.register-title {
    font-size: 32px;
    color: #2c3e50;
    margin-bottom: 12px;
    text-align: center;
    font-weight: 600;
}

.register-subtitle {
    font-size: 16px;
    color: #7f8c8d;
    margin-bottom: 40px;
    text-align: center;
}

.register-form {
    margin-top: 20px;
}

.form-content {
    width: 85%;
    margin: 0 auto;
}

.form-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 5px;
    line-height: 1.4;
}

.validate-container {
    display: flex;
    gap: 16px;
}

.validate-btn {
    flex-shrink: 0;
    width: 120px;
    height: 42px;
    font-size: 14px;
    border-radius: 8px;
    line-height: 42px;
    padding: 0 15px;
}

.role-select {
    width: 100%;
}

.register-button {
    width: 100%;
    height: 42px;
    font-size: 16px;
    font-weight: 500;
    letter-spacing: 1px;
    margin-top: 20px;
    border-radius: 8px;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
}

.register-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(44, 150, 120, 0.3);
}

.register-actions {
    display: flex;
    justify-content: center;
    margin-top: 24px;
    font-size: 14px;
}

.register-actions .el-link {
    display: flex;
    align-items: center;
    gap: 4px;
}

.el-input-group__append {
    padding: 0 10px;
    cursor: help;
}

.el-input-group__append i {
    font-size: 16px;
    color: #909399;
}

.el-tooltip {
    cursor: help;
}

/* Element UI 组件样式覆盖 */
:deep(.el-input__inner) {
    height: 42px;
    line-height: 42px;
    border-radius: 8px;
    border: 1px solid #dcdfe6;
    transition: all 0.3s ease;
}

:deep(.el-input__inner:focus) {
    border-color: #2c9678;
    box-shadow: 0 0 0 2px rgba(44, 150, 120, 0.2);
}

:deep(.el-form-item) {
    margin-bottom: 24px;
}

:deep(.el-input__prefix) {
    left: 12px;
    top: 0;
    height: 100%;
    display: flex;
    align-items: center;
}

:deep(.el-input__prefix i) {
    font-size: 16px;
    line-height: 1;
    display: flex;
    align-items: center;
}

:deep(.el-input__inner) {
    padding-left: 38px;
}

:deep(.el-select .el-input__inner) {
    padding-left: 15px;
}

:deep(.el-select .el-input__suffix) {
    display: flex;
    align-items: center;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* 响应式调整 */
@media (max-width: 480px) {
    .register-container {
        padding: 0 20px;
    }
    
    .form-content {
        width: 100%;
    }
    
    .validate-container {
        gap: 8px;
    }
    
    .validate-btn {
        width: 110px;
        font-size: 13px;
    }
}

.validate-code {
    flex-shrink: 0;
    width: 120px;
    border-radius: 8px;
    overflow: hidden;
    /* 移除阴影效果 */
    /* box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); */
}
</style>