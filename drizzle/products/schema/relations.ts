import { relations } from "drizzle-orm";
import { categories } from "./categories";
import { categoryWeightDiscounts } from "./category-weight-discounts";
import { products } from "./products";
import { productDiscountPrices } from "./product-discount-prices";
import { productNutrition } from "./product-nutrition";
import { productWeightDiscounts } from "./product-weight-discounts";

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
  weightDiscounts: many(categoryWeightDiscounts),
}));

export const categoryWeightDiscountsRelations = relations(
  categoryWeightDiscounts,
  ({ one, many }) => ({
    category: one(categories, {
      fields: [categoryWeightDiscounts.categoryId],
      references: [categories.id],
    }),
    productDiscountPrices: many(productDiscountPrices),
  }),
);

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  discountPrices: many(productDiscountPrices),
  nutrition: many(productNutrition),
  weightDiscounts: many(productWeightDiscounts),
}));

export const productDiscountPricesRelations = relations(
  productDiscountPrices,
  ({ one }) => ({
    product: one(products, {
      fields: [productDiscountPrices.productId],
      references: [products.id],
    }),
    discount: one(categoryWeightDiscounts, {
      fields: [productDiscountPrices.discountId],
      references: [categoryWeightDiscounts.id],
    }),
  }),
);

export const productNutritionRelations = relations(
  productNutrition,
  ({ one }) => ({
    product: one(products, {
      fields: [productNutrition.productId],
      references: [products.id],
    }),
  }),
);

export const productWeightDiscountsRelations = relations(
  productWeightDiscounts,
  ({ one }) => ({
    product: one(products, {
      fields: [productWeightDiscounts.productId],
      references: [products.id],
    }),
  }),
);
