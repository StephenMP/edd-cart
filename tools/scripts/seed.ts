import { Coupon, PrismaClient, Product } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();
async function main() {
  const dataFile = path.join(__dirname, 'data.json');
  const dataJson = fs.readFileSync(dataFile, 'utf8');
  const data = JSON.parse(dataJson) as { products: Product[]; coupons: Coupon[] };

  console.log(`Seeding ${data.products.length} Product records`);

  for (const product of data.products) {
    const { id, created_at, name, price } = product;
    await prisma.product.create({
      data: {
        id,
        created_at,
        name,
        price,
      },
    });
  }

  console.log(`Seeding ${data.coupons.length} Coupon records`);

  for (const coupon of data.coupons) {
    const { id, created_at, code, discount, type, level, is_active, product_id } = coupon;
    await prisma.coupon.create({
      data: {
        id,
        created_at,
        code,
        discount,
        type,
        level,
        is_active,
        product_id,
      },
    });
  }
}

console.log('Seeding complete');

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
