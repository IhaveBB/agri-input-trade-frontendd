<template>
    <div class="auth-container">
        <div class="bg-image"></div>
        <div class="bg-overlay"></div>
        <div class="auth-header">
            <div class="logo" @click="goToHome">
                <i class="el-icon-shopping-cart-2"></i>
                <span class="brand-name">农资采销</span>
            </div>
            <el-button type="success" class="home-btn" @click="goToHome">
                <i class="el-icon-s-home"></i> 返回首页
            </el-button>
        </div>
        
        <div class="auth-content">
            <div class="auth-card">
                <div class="brand-tagline">
                    <div class="tagline-content">
                        <h2>优质农资 • 精心采购</h2>
                        <div class="features">
                            <div class="feature-item">
                                <i class="el-icon-shopping-cart-2"></i>
                                <span>品类齐全</span>
                            </div>
                            <div class="feature-item">
                                <i class="el-icon-box"></i>
                                <span>品质保障</span>
                            </div>
                            <div class="feature-item">
                                <i class="el-icon-truck"></i>
                                <span>快速配送</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="auth-card-content">
                    <router-view />
                </div>
            </div>
        </div>
        <div class="auth-footer">
            <p>© 2026 农资采销系统</p>
        </div>
    </div>
</template>

<script>
export default {
    name: 'LRLayout',
    methods: {
        goToHome() {
            this.$router.push('/')
        }
    }
}
</script>

<style scoped>
.auth-container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
}

.bg-image {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url('@/assets/imgs/loginBg.jpeg');
    background-size: cover;
    background-position: center;
    filter: blur(8px);
    transform: scale(1.1);
    z-index: 0;
}

.bg-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg,
        rgba(74, 140, 56, 0.06),
        rgba(248, 251, 240, 0.92),
        rgba(240, 248, 230, 0.88)
    );
    z-index: 1;
}

.auth-header {
    position: relative;
    z-index: 2;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 48px;
    backdrop-filter: blur(12px);
    background: rgba(255, 255, 255, 0.85);
    border-bottom: 1px solid rgba(74, 140, 56, 0.08);
}

.logo {
    cursor: pointer;
    font-size: 22px;
    font-weight: 700;
    color: #3a7029;
    letter-spacing: 2px;
    display: flex;
    align-items: center;
    gap: 10px;
}

.logo i {
    font-size: 26px;
    color: #4a8c38;
    transition: all 0.3s ease;
}

.logo:hover i {
    transform: scale(1.1);
    filter: drop-shadow(0 2px 6px rgba(74, 140, 56, 0.25));
}

.home-btn {
    padding: 10px 20px;
    border-radius: 24px;
    font-weight: 500;
    transition: all 0.3s ease;
    background: #4a8c38;
    border: none;
    color: white;
    box-shadow: 0 2px 8px rgba(74, 140, 56, 0.2);
}

.home-btn:hover {
    background: #3a7029;
    color: white;
    box-shadow: 0 4px 14px rgba(74, 140, 56, 0.35);
    transform: translateY(-1px);
}

.home-btn i {
    margin-right: 6px;
    font-size: 16px;
}

.auth-content {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 48px 24px;
    position: relative;
    z-index: 2;
}

.auth-card {
    display: flex;
    width: 920px;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.05);
    background-color: white;
    position: relative;
}

.auth-card-content {
    width: 50%;
    padding: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    background: white;
}

.brand-tagline {
    width: 50%;
    background: linear-gradient(160deg, #2d6e1e 0%, #4a8c38 50%, #5da842 100%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
}

.brand-tagline::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image:
        repeating-linear-gradient(
            120deg,
            transparent,
            transparent 30px,
            rgba(255, 255, 255, 0.015) 30px,
            rgba(255, 255, 255, 0.015) 60px
        ),
        radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.06), transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.04), transparent 50%);
    z-index: 0;
}

.brand-tagline::after {
    content: '\e790';
    font-family: element-icons !important;
    position: absolute;
    bottom: -50px;
    right: -50px;
    font-size: 180px;
    opacity: 0.04;
    transform: rotate(-15deg);
    z-index: 0;
}

.tagline-content {
    position: relative;
    z-index: 1;
    padding: 60px 40px;
    text-align: center;
}

.tagline-content h2 {
    font-size: 26px;
    font-weight: 600;
    margin-bottom: 36px;
    letter-spacing: 2px;
    position: relative;
    display: inline-block;
}

.tagline-content h2::after {
    content: '';
    position: absolute;
    bottom: -12px;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 3px;
    background-color: rgba(255, 255, 255, 0.4);
    border-radius: 3px;
}

.features {
    display: flex;
    justify-content: center;
    gap: 28px;
    margin-top: 36px;
}

.feature-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
}

.feature-item i {
    font-size: 28px;
    background: rgba(255, 255, 255, 0.12);
    border-radius: 16px;
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
}

.feature-item:hover i {
    background: rgba(255, 255, 255, 0.22);
    transform: translateY(-3px);
}

.feature-item span {
    font-size: 15px;
    font-weight: 500;
    letter-spacing: 1px;
}

.auth-footer {
    position: relative;
    z-index: 2;
    padding: 18px 0;
    text-align: center;
    color: #6b8f5b;
    font-size: 13px;
    background: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(8px);
    border-top: 1px solid rgba(74, 140, 56, 0.08);
}

@media (max-width: 992px) {
    .auth-card {
        width: 100%;
        flex-direction: column;
    }

    .auth-card-content,
    .brand-tagline {
        width: 100%;
    }

    .brand-tagline {
        order: -1;
        padding: 30px 0;
    }

    .tagline-content {
        padding: 30px 20px;
    }

    .features {
        gap: 20px;
    }

    .feature-item i {
        width: 50px;
        height: 50px;
        font-size: 24px;
    }
}

@media (max-width: 576px) {
    .auth-header {
        padding: 16px 24px;
    }

    .logo {
        font-size: 18px;
    }

    .logo:hover {
        opacity: 0.9;
    }

    .home-btn {
        padding: 8px 14px;
        font-size: 13px;
    }

    .auth-content {
        padding: 24px 16px;
    }

    .auth-card-content {
        padding: 30px 20px;
    }

    .features {
        flex-direction: column;
        gap: 15px;
    }

    .feature-item {
        flex-direction: row;
        justify-content: center;
    }

    .feature-item i {
        width: 40px;
        height: 40px;
        font-size: 20px;
        margin-right: 10px;
    }

    .logo i {
        font-size: 20px;
    }
}
</style>