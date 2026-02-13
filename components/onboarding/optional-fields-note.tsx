"use client";

/**
 * 任意項目の前に表示し、記入を促すメッセージ（ステップ1・2・3で共通）
 */
export function OptionalFieldsNote() {
  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50/80 px-3 py-2.5 text-sm text-blue-800">
      <p className="font-medium">
        任意の箇所にもなるべく多く記入していただくと、より理想に近い外観デザインに仕上がります。
      </p>
    </div>
  );
}
