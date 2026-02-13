export interface OnboardingData {
  storeName?: string;
  subdomain?: string;
  description?: string;
  productCategories?: string[];
  concept?: string;
  targetAudience?: string;
  atmosphere?: string;
  locationScale?: string;
  priceRange?: string;
  preferredColors?: string;
  avoidColors?: string;
  referenceImage?: string;
  styleMaterial?: string;
}

/** ショップの外観を決める配色・スタイル（ボタン・ヘッダー・背景・文字） */
export interface ShopTheme {
  /** ボタンやリンクのメイン色 */
  buttonColor?: string;
  /** ヘッダー背景色 */
  headerColor?: string;
  /** ページ背景色 */
  backgroundColor?: string;
  /** 見出し・本文の文字色 */
  textColor?: string;
  /** フォント（sans-serif / serif 等） */
  fontFamily?: string;
  /** 後方互換: primaryColor は buttonColor と同じ扱い */
  primaryColor?: string;
}

export interface DesignPreset {
  id: string;
  name: string;
  description?: string;
  theme: ShopTheme;
}
