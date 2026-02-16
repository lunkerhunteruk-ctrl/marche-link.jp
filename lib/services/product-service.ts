import { getFunctionsInstance, httpsCallable } from "@/lib/firebase";
import type { CategoryOption, UnitOption, Product } from "@/lib/types/product";

/** カテゴリ一覧を取得 */
export async function getCategories(): Promise<CategoryOption[]> {
  const functions = getFunctionsInstance();
  if (!functions) throw new Error("Firebase Functions が利用できません");

  const fn = httpsCallable<void, { categories: CategoryOption[] }>(
    functions,
    "getCategories"
  );
  const result = await fn();
  return result.data.categories;
}

/** カテゴリを追加 */
export async function addCategory(name: string): Promise<CategoryOption> {
  const functions = getFunctionsInstance();
  if (!functions) throw new Error("Firebase Functions が利用できません");

  const fn = httpsCallable<{ name: string }, { category: CategoryOption }>(
    functions,
    "addCategory"
  );
  const result = await fn({ name });
  return result.data.category;
}

/** 単位一覧を取得 */
export async function getUnits(): Promise<UnitOption[]> {
  const functions = getFunctionsInstance();
  if (!functions) throw new Error("Firebase Functions が利用できません");

  const fn = httpsCallable<void, { units: UnitOption[] }>(functions, "getUnits");
  const result = await fn();
  return result.data.units;
}

/** 単位を追加 */
export async function addUnit(name: string): Promise<UnitOption> {
  const functions = getFunctionsInstance();
  if (!functions) throw new Error("Firebase Functions が利用できません");

  const fn = httpsCallable<{ name: string }, { unit: UnitOption }>(
    functions,
    "addUnit"
  );
  const result = await fn({ name });
  return result.data.unit;
}

/** 商品を登録 */
export async function createProduct(
  product: Omit<Product, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const functions = getFunctionsInstance();
  if (!functions) throw new Error("Firebase Functions が利用できません");

  const fn = httpsCallable<
    Omit<Product, "id" | "createdAt" | "updatedAt">,
    { productId: string }
  >(functions, "createProduct");
  const result = await fn(product);
  return result.data.productId;
}
