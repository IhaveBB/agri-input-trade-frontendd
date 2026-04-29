<template>
    <div class="forget-container">
        <h2 class="forget-title">重设安全密钥</h2>
        <p class="forget-subtitle">请输入您的身份凭证接收验证</p>

        <el-form ref="resetForm" :model="resetForm" :rules="rules" class="forget-form">
            <div class="form-content">
                <el-form-item prop="email">
                    <el-input 
                        v-model="resetForm.email" 
                        placeholder="请输入邮箱"
                        prefix-icon="el-icon-message">
                    </el-input>
                </el-form-item>

                <el-form-item prop="code">
                    <div class="validate-container">
                        <el-input 
                            v-model="resetForm.code" 
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

                <el-form-item prop="newPassword">
                    <el-input 
                        type="password" 
                        v-model="resetForm.newPassword" 
                        placeholder="请设置新密码"
                        prefix-icon="el-icon-lock">
                    </el-input>
                </el-form-item>

                <el-form-item>
                    <el-button 
                        type="success" 
                        class="submit-button"
                        @click="onResetPassword">
                        重置密码
                    </el-button>
                </el-form-item>

                <div class="form-footer">
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
    name: 'ResetPassword',
    data() {
        return {
            countdown: 0,
            disabled: false,
            timer: null,
            buttonContent: '发送验证码',
            resetForm: {
                email: '',
                code: '',
                newPassword: '',
            },
            rules: {
                email: [
                    { required: true, message: '请输入邮箱', trigger: 'blur' },
                    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
                ],
                code: [
                    { required: true, message: '请输入验证码', trigger: 'blur' }
                ],
                newPassword: [
                    { required: true, message: '请输入新密码', trigger: 'blur' },
                    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
                ]
            }
        };
    },
    methods: {
        sendVerificationCode() {
            if (this.disabled) return;

            if (!this.resetForm.email) {
                this.$message.error('请先输入邮箱地址');
                return;
            }

            request.get(`/email/findByEmail/${this.resetForm.email}`)
                .then(res => {
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
            this.buttonContent = `${this.countdown}秒后可重发`;

            this.timer = setInterval(() => {
                if (this.countdown > 0) {
                    this.countdown--;
                    this.buttonContent = `${this.countdown}秒后可重发`;
                } else {
                    clearInterval(this.timer);
                    this.disabled = false;
                    this.buttonContent = '发送验证码';
                }
            }, 1000);
        },
    onResetPassword() {
        this.$refs.resetForm.validate((valid) => {
            if (valid) {
                // 发送重置密码请求到后端，后端会验证验证码
                request.post("/user/forget", null, {
                    params: {
                        email: this.resetForm.email,
                        code: this.resetForm.code,
                        newPassword: this.resetForm.newPassword,
                    },
                }).then(res => {
                    if (res.code === '0') {
                        this.$message({
                            type: 'success',
                            message: "密码重置成功"
                        });
                        this.$router.push("/login");
                    } else {
                        this.$message({
                            type: 'error',
                            message: res.msg
                        });
                    }
                });
            } else {
                return false;
            }
        });
    }
},
beforeDestroy() {
    clearInterval(this.timer);
},
  };
</script>

<style scoped>
.forget-container {
    width: 100%;
    max-width: 380px;
    animation: fadeIn 0.6s ease-out;
}

.forget-title {
    font-size: 32px;
    color: #2c3e50;
    margin-bottom: 12px;
    text-align: center;
    font-weight: 600;
}

.forget-subtitle {
    font-size: 16px;
    color: #7f8c8d;
    margin-bottom: 40px;
    text-align: center;
}

.forget-form {
    margin-top: 20px;
}

.form-content {
    width: 85%;
    margin: 0 auto;
}

.validate-container {
    display: flex;
    gap: 16px;
}

.validate-btn {
    flex-shrink: 0;
    width: 120px;
    height: 44px;
    font-size: 14px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 15px;
}

.submit-button {
    width: 100%;
    height: 44px;
    font-size: 16px;
    font-weight: 500;
    letter-spacing: 2px;
    margin-top: 20px;
    border-radius: 10px;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    background: linear-gradient(135deg, #2c9678, #3aaf8e);
    border: none;
}

.submit-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(44, 150, 120, 0.35);
}

.form-footer {
    display: flex;
    justify-content: center;
    margin-top: 24px;
    font-size: 14px;
}

.form-footer .el-link {
    display: flex;
    align-items: center;
    gap: 4px;
}

/* Element UI 组件样式覆盖 */
:deep(.el-input__inner) {
    height: 44px;
    line-height: 44px;
    border-radius: 10px;
    border: 1.5px solid #e4e7ed;
    transition: all 0.3s ease;
    background: rgba(255, 255, 255, 0.8);
}

:deep(.el-input__inner:focus) {
    border-color: #2c9678;
    box-shadow: 0 0 0 3px rgba(44, 150, 120, 0.12);
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
    .forget-container {
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
</style>