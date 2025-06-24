# GainTrack - GainTrack is a tool that helps you track your gains.

## 🎯 Project Goals

GainTrack 是一個全棧 Web3 應用程式，旨在幫助用戶追蹤加密資產投資組合並優化 DeFi 收益策略。這個專案展示了現代 Web3 開發的最佳實踐，包括區塊鏈整合、即時數據處理和用戶體驗設計。

## ✨ Core Features

### 📊 Asset Tracking Dashboard
- **Multi-chain Integration**: 支援 Ethereum, Arbitrum One 資產查詢
- **Real-time Data & Cost Tracking**: 整合 Moralis API 獲取實時價格數據，手動記錄購入成本計算盈虧
- **Visual Analytics**: 視覺化顯示資產分佈，預測 Aave 和 Compound 的 APY 和線圖

### 🏦 DeFi Strategy Management
- **Multi-protocol Support**: 整合 Aave 和 Compound 協議
- **Yield Comparison**: 即時顯示不同穩定幣的供應和借貸 APY
- **Yield Predictor**: 基於當前 APY 計算預期收益

## 🛠 Technology Stack

### Frontend Framework
- **Next.js 14**: 使用 App Router 和 Server Components
- **React 18**: 現代 React 開發模式
- **TypeScript**: 完整的類型安全

### UI/UX Design
- **Tailwind CSS**: 響應式設計和現代 UI
- **Radix UI**: 無障礙的組件庫
- **Lucide React**: 一致的圖標系統

### Web3 & Blockchain
- **Wagmi + Viem**: React Hooks
- **RainbowKit**: 錢包連接 UI 和用戶體驗
- **Moralis**: 區塊鏈數據 API 和實時價格

### Development & State Management
- **TanStack Query**: 服務器狀態管理和數據緩存
- **React Hook Form**: 表單處理和驗證
- **ESLint + pnpm**: 代碼質量檢查和包管理

## 🚀 Quick Start

### Requirements
- Node.js >= 20.0.0
- pnpm >= 8.0.0

### Installation & Setup

```bash
# Clone project
git clone <repository-url>
cd gaintrack

# Install packages
pnpm install

# Run start
pnpm dev
```

訪問 [http://localhost:3000](http://localhost:3000) 查看應用程式。

### Environment Variables

創建 `.env.local` 文件並添加以下變數：

```env
NEXT_PUBLIC_MORALIS_API_KEY=your_moralis_api_key
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_wallet_connect_project_id
```

## 📱 User Guide

### 1. Connect Wallet
- 點擊右上角的 "Connect Wallet" 按鈕
- 選擇支援的錢包（MetaMask、WalletConnect 等）
- 授權連接以查看資產

### 2. View Asset Dashboard
- 主頁面顯示所有連接錢包中的資產
- 查看代幣餘額、當前價值和成本基礎
- 顏色編碼顯示盈虧狀況（綠色=盈利，紅色=虧損）

### 3. Add Cost Basis
- 點擊 "Add Cost Price" 按鈕
- 輸入代幣地址和購入成本
- 系統將自動計算盈虧

### 4. Explore DeFi Strategies
- 導航到 DeFi 頁面
- 查看 Aave 和 Compound 的當前 APY
- 使用收益預測器計算預期收益
- 比較不同穩定幣的收益策略

## 🏗 Project Architecture

```
src/
├── app/                    # Next.js App Router 頁面
│   ├── dashboard/         # 資產儀表板
│   ├── defi/             # DeFi 策略頁面
│   └── add/              # 添加成本基礎
├── components/            # React 組件
│   ├── ui/               # 基礎 UI 組件
│   └── defi/             # DeFi 相關組件
├── hooks/                # 自定義 React Hooks
├── lib/                  # 工具函數和配置
└── types/                # TypeScript 類型定義
```

## 🔧 Development Highlights

### 1. Modern Architecture
- 使用 Next.js 14 的最新功能
- 完整的 TypeScript 支持
- 模組化組件設計

### 2. Web3 Integration
- 無縫的錢包連接體驗
- 實時區塊鏈數據查詢
- 安全的交易處理

### 3. User Experience
- 響應式設計，支援所有設備
- 直觀的數據視覺化
- 流暢的交互動畫

### 4. Code Quality
- 完整的錯誤處理
- 類型安全的 API 調用
- 可維護的代碼結構

## 🎯 Interview Highlights

這個專案展示了以下關鍵技能：

- **全棧開發**: 從前端 UI 到後端 API 整合
- **Web3 技術**: 區塊鏈整合和智能合約交互
- **現代前端**: React、TypeScript、Next.js
- **API 整合**: 多個第三方服務的整合
- **用戶體驗**: 直觀的界面設計和交互
- **代碼質量**: 類型安全、錯誤處理、可維護性

## 📄 License

MIT License - 詳見 [LICENSE](LICENSE) 文件
