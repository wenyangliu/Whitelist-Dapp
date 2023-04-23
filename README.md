# Hardhat+Ethers.js+Next.js+TailwindCSS 开发Dapp

## 运行项目
根目录创建 `.env` 文件
```sh
ALCHEMY_API_KEY_URL = "xxxx"
SEPOLIA_PRIVATE_KEY = "xxxx"
```
安装
```sh
npm i
npx hardhat run scripts/deploy.js --network sepolia
```
// 如果没有测试网的ETH
领取地址: https://sepoliafaucet.com

得到合约地址
修改`constant.js`的 `WHITELIST_CONTRACT_ADDRESS`
```
cd client
yarn
yarn dev
```
访问 `localhost:3000`