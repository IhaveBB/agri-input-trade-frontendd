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
    filter: blur(10px) brightness(1.05);
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
        rgba(30, 120, 80, 0.08),
        rgba(248, 251, 245, 0.94),
        rgba(235, 245, 230, 0.90)
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
    backdrop-filter: blur(16px);
    background: rgba(255, 255, 255, 0.75);
    border-bottom: 1px solid rgba(44, 150, 120, 0.1);
    box-shadow: 0 1px 12px rgba(0, 0, 0, 0.03);
}

.logo {
    cursor: pointer;
    font-size: 22px;
    font-weight: 700;
    color: #1e7a56;
    letter-spacing: 2px;
    display: flex;
    align-items: center;
    gap: 10px;
}

.logo i {
    font-size: 26px;
    color: #2c9678;
    transition: all 0.3s ease;
}

.logo:hover i {
    transform: scale(1.1);
    filter: drop-shadow(0 2px 6px rgba(44, 150, 120, 0.3));
}

.home-btn {
    padding: 10px 20px;
    border-radius: 24px;
    font-weight: 500;
    transition: all 0.3s ease;
    background: linear-gradient(135deg, #2c9678, #3aaf8e);
    border: none;
    color: white;
    box-shadow: 0 2px 8px rgba(44, 150, 120, 0.25);
}

.home-btn:hover {
    background: linear-gradient(135deg, #248a6d, #32a07e);
    color: white;
    box-shadow: 0 4px 16px rgba(44, 150, 120, 0.35);
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
    border-radius: 24px;
    overflow: hidden;
    box-shadow: 0 24px 80px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.04);
    background-color: rgba(255, 255, 255, 0.95);
    position: relative;
    backdrop-filter: blur(4px);
}

.auth-card-content {
    width: 50%;
    padding: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    background: transparent;
}

.brand-tagline {
    width: 50%;
    background: linear-gradient(160deg, #1a6b4a 0%, #2c9678 40%, #3aaf8e 100%);
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
        radial-gradient(circle at 15% 85%, rgba(255, 255, 255, 0.08), transparent 45%),
        radial-gradient(circle at 85% 15%, rgba(255, 255, 255, 0.06), transparent 45%),
        repeating-linear-gradient(
            120deg,
            transparent,
            transparent 30px,
            rgba(255, 255, 255, 0.015) 30px,
            rgba(255, 255, 255, 0.015) 60px
        );
    z-index: 0;
}

.brand-tagline::after {
    content: '\e790';
    font-family: element-icons !important;
    position: absolute;
    bottom: -50px;
    right: -50px;
    font-size: 180px;
    opacity: 0.05;
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
    background: rgba(255, 255, 255, 0.15);
    border-radius: 18px;
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    backdrop-filter: blur(4px);
}

.feature-item:hover i {
    background: rgba(255, 255, 255, 0.28);
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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
    color: #5a9a7e;
    font-size: 13px;
    background: rgba(255, 255, 255, 0.65);
    backdrop-filter: blur(10px);
    border-top: 1px solid rgba(44, 150, 120, 0.1);
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