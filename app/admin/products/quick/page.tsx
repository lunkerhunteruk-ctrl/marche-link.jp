"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/hooks/use-auth";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import {
  getCategories,
  addCategory,
  getUnits,
  addUnit,
  createProduct,
} from "@/lib/services/product-service";
import type { ProductFormData } from "@/lib/types/product";

export default function QuickProductPage() {
  const { user, loading: authLoading } = useAuth();

  const [categories, setCategories] = useState<ComboboxOption[]>([]);
  const [units, setUnits] = useState<ComboboxOption[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    category: "",
    unit: "",
    price: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // カテゴリと単位を読み込み
  useEffect(() => {
    async function loadData() {
      setLoadingData(true);
      setLoadError(null);

      try {
        const [cats, uts] = await Promise.all([getCategories(), getUnits()]);
        setCategories(cats);
        setUnits(uts);
      } catch (error) {
        console.error("データの読み込みに失敗しました:", error);
        setLoadError(
          "データの読み込みに失敗しました。Cloud Functions が未デプロイの可能性があります。"
        );
        // フォールバック: 空の配列のままにする
      } finally {
        setLoadingData(false);
      }
    }

    if (user) {
      loadData();
    }
  }, [user]);

  const handleAddCategory = async (
    name: string
  ): Promise<ComboboxOption | null> => {
    try {
      const newCategory = await addCategory(name);
      setCategories((prev) => [...prev, newCategory]);
      return newCategory;
    } catch (error) {
      console.error("カテゴリの追加に失敗しました:", error);
      throw error;
    }
  };

  const handleAddUnit = async (name: string): Promise<ComboboxOption | null> => {
    try {
      const newUnit = await addUnit(name);
      setUnits((prev) => [...prev, newUnit]);
      return newUnit;
    } catch (error) {
      console.error("単位の追加に失敗しました:", error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(false);

    // バリデーション
    if (!formData.name.trim()) {
      setSubmitError("商品名を入力してください");
      return;
    }
    if (!formData.category.trim()) {
      setSubmitError("カテゴリを選択または入力してください");
      return;
    }
    if (!formData.unit.trim()) {
      setSubmitError("単位を選択または入力してください");
      return;
    }
    const price = parseFloat(formData.price);
    if (isNaN(price) || price < 0) {
      setSubmitError("有効な価格を入力してください");
      return;
    }

    setIsSubmitting(true);
    try {
      await createProduct({
        name: formData.name.trim(),
        category: formData.category.trim(),
        unit: formData.unit.trim(),
        price,
        description: formData.description.trim() || undefined,
      });

      setSubmitSuccess(true);
      // フォームをリセット
      setFormData({
        name: "",
        category: "",
        unit: "",
        price: "",
        description: "",
      });
    } catch (error) {
      console.error("商品登録に失敗しました:", error);
      setSubmitError(
        "商品登録に失敗しました。Cloud Functions が未デプロイの可能性があります。"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // 認証チェック
  if (authLoading) {
    return (
      <div className="p-4">
        <p className="text-gray-600">読み込み中...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4">
        <p className="text-red-600">ログインが必要です</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-6">商品登録</h2>

      {loadError && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 text-sm">
          {loadError}
        </div>
      )}

      {submitSuccess && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-800 text-sm">
          商品を登録しました
        </div>
      )}

      {submitError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 商品名 */}
        <div className="max-w-md">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            商品名<span className="text-red-500 ml-0.5">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="例: トマト"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isSubmitting}
          />
        </div>

        {/* カテゴリ */}
        <Combobox
          label="カテゴリ"
          value={formData.category}
          options={categories}
          onChange={(value) =>
            setFormData((prev) => ({ ...prev, category: value }))
          }
          onAddNew={handleAddCategory}
          placeholder="選択または入力..."
          required
          disabled={isSubmitting || loadingData}
        />

        {/* 単位 */}
        <Combobox
          label="単位"
          value={formData.unit}
          options={units}
          onChange={(value) =>
            setFormData((prev) => ({ ...prev, unit: value }))
          }
          onAddNew={handleAddUnit}
          placeholder="例: 個, kg, パック..."
          required
          disabled={isSubmitting || loadingData}
        />

        {/* 価格 */}
        <div className="max-w-md">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            価格（税込）<span className="text-red-500 ml-0.5">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              ¥
            </span>
            <input
              type="number"
              value={formData.price}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, price: e.target.value }))
              }
              placeholder="0"
              min="0"
              step="1"
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* 説明 */}
        <div className="max-w-md">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            説明
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            placeholder="商品の説明（任意）"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            disabled={isSubmitting}
          />
        </div>

        {/* 送信ボタン */}
        <div className="max-w-md">
          <button
            type="submit"
            disabled={isSubmitting || loadingData}
            className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "登録中..." : "商品を登録"}
          </button>
        </div>
      </form>
    </div>
  );
}
