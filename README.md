# GainTrack

> Track your gains — with GainTrack

![GainTrack Screenshot](https://i.imgur.com/your-project-screenshot.png)  <!-- 請替換成你自己的專案截圖 -->

**[➡️ Live Demo](https://gaintrack-am9z.vercel.app/)**

---

## 🚀 About The Project

GainTrack is a modern DeFi (Decentralized Finance) dashboard that allows users to connect their Web3 wallet and get a comprehensive overview of their assets. It aggregates and displays token balances and investment positions across multiple DeFi protocols like Aave, Compound, and Dolomite in a single, intuitive interface.

This project was built to showcase modern full-stack web development skills using the Next.js framework, with a focus on interacting with blockchain data and smart contracts.

## ✨ Key Features

*   **Wallet Connectivity**: Securely connect using popular wallets via RainbowKit.
*   **Aggregated Dashboard**: View all your ERC20 token balances in one place.
*   **Multi-Protocol Tracking**: See your supply positions and assets in major DeFi lending protocols.
*   **Token Swapping**: A simple interface to swap tokens (functionality to be implemented).
*   **Responsive Design**: A clean and modern UI that works seamlessly on both desktop and mobile.

## 🛠️ Built With

This project is built with a modern, type-safe, and performant technology stack:

*   **Framework**: [Next.js](https://nextjs.org/) 14 (with App Router)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **Web3 Connectivity**: [RainbowKit](https://www.rainbowkit.com/), [Wagmi](https://wagmi.sh/), and [Viem](https://viem.sh/)
*   **Data Fetching**: [TanStack Query (React Query)](https://tanstack.com/query/latest) for server-state management.
*   **On-chain Data**: [Moralis API](https://moralis.io/) for fetching token balances and historical data.
*   **Testing**: [Vitest](https://vitest.dev/) for unit and integration testing, with [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/).
*   **Deployment**: [Vercel](https://vercel.com/)

## 🏁 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

*   Node.js (version >= 20.0.0)
*   pnpm (version >= 8.0.0)

### Installation

1.  **Clone the repository**
    ```sh
    git clone https://github.com/your-github-username/gaintrack.git
    ```
2.  **Navigate to the project directory**
    ```sh
    cd gaintrack
    ```
3.  **Install dependencies**
    ```sh
    pnpm install
    ```
4.  **Set up environment variables**
    Create a `.env.local` file in the root of the project and add your API keys:
    ```env
    # Example
    MORALIS_API_KEY=YOUR_MORALIS_API_KEY
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=YOUR_WALLETCONNECT_PROJECT_ID
    ```
5.  **Run the development server**
    ```sh
    pnpm dev
    ```
    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Other Commands

*   **Run tests**:
    ```sh
    pnpm test
    ```
*   **Run linter**:
    ```sh
    pnpm lint
    ```

## 🧠 Challenges & Learnings

*(This is a great section to impress recruiters!)*

During this project, one of the main challenges was... I overcame this by...

I also learned a lot about:
*   ...
*   ...

## 🙏 Acknowledgements

*   [RainbowKit](https://www.rainbowkit.com/)
*   [Moralis](https://moralis.io/)
*   [Vercel](https://vercel.com/)