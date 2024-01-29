import { PrismaClient } from '.prisma/client'
const prisma = new PrismaClient()

async function main() {
  const count = await prisma.product.count();
  if (count === 0) {
    const products = await prisma.product.createMany({
      data: [
        {
          name: '小米手机',
          cover: 'https://img.yzcdn.cn/vant/ipad.jpeg',
          price: 1
        },
        {
          name: '华为手机',
          cover: 'https://img.yzcdn.cn/vant/ipad.jpeg',
          price: 2
        },
        {
          name: '苹果手机',
          cover: 'https://img.yzcdn.cn/vant/ipad.jpeg',
          price: 3
        },
      ]
    })
    console.log(products)
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })