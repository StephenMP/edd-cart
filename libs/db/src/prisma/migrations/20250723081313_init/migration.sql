-- DropForeignKey
ALTER TABLE "Coupon" DROP CONSTRAINT "Coupon_cart_id_fkey";

-- AlterTable
ALTER TABLE "Coupon" ALTER COLUMN "cart_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Coupon" ADD CONSTRAINT "Coupon_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "Cart"("id") ON DELETE SET NULL ON UPDATE CASCADE;
