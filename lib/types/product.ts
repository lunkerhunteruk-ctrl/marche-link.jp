/** 商品データ */
export interface Product {
  id?: string;
  name: string;
  category: string;
  unit: string;
  price: number;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/** カテゴリオプション（Combobox用） */
export interface CategoryOption {
  id: string;
  name: string;
}

/** 単位オプション（Combobox用） */
export interface UnitOption {
  id: string;
  name: string;
}

/** 商品登録フォームの入力データ */
export interface ProductFormData {
  name: string;
  category: string;
  unit: string;
  price: string;
  description: string;
}
