"use client";

import { useState, useRef, useEffect } from "react";

export interface ComboboxOption {
  id: string;
  name: string;
}

interface ComboboxProps {
  label: string;
  value: string;
  options: ComboboxOption[];
  onChange: (value: string) => void;
  onAddNew?: (name: string) => Promise<ComboboxOption | null>;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

export function Combobox({
  label,
  value,
  options,
  onChange,
  onAddNew,
  placeholder = "選択または入力...",
  required = false,
  disabled = false,
}: ComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [isAdding, setIsAdding] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 外部からvalueが変更されたら入力値も更新
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // 外側クリックで閉じる
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        // 入力値が選択肢にない場合はクリア
        if (!options.some((opt) => opt.name === inputValue)) {
          setInputValue(value);
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [inputValue, value, options]);

  // フィルタリングされたオプション
  const filteredOptions = options.filter((opt) =>
    opt.name.toLowerCase().includes(inputValue.toLowerCase())
  );

  // 新規追加可能かどうか
  const canAddNew =
    onAddNew &&
    inputValue.trim() !== "" &&
    !options.some(
      (opt) => opt.name.toLowerCase() === inputValue.trim().toLowerCase()
    );

  const handleSelect = (option: ComboboxOption) => {
    setInputValue(option.name);
    onChange(option.name);
    setIsOpen(false);
  };

  const handleAddNew = async () => {
    if (!onAddNew || !canAddNew) return;

    setIsAdding(true);
    try {
      const newOption = await onAddNew(inputValue.trim());
      if (newOption) {
        setInputValue(newOption.name);
        onChange(newOption.name);
      }
    } catch (error) {
      console.error("追加に失敗しました:", error);
    } finally {
      setIsAdding(false);
      setIsOpen(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setIsOpen(true);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (canAddNew) {
        handleAddNew();
      } else if (filteredOptions.length === 1) {
        handleSelect(filteredOptions[0]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={containerRef} className="relative max-w-md">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed pr-8"
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
        >
          <svg
            className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredOptions.length > 0 ? (
            <ul className="py-1">
              {filteredOptions.map((option) => (
                <li key={option.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(option)}
                    className={`w-full px-3 py-2 text-left hover:bg-gray-100 ${
                      option.name === value
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-900"
                    }`}
                  >
                    {option.name}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            !canAddNew && (
              <div className="px-3 py-2 text-sm text-gray-500">
                該当する項目がありません
              </div>
            )
          )}

          {canAddNew && (
            <div className="border-t border-gray-200 px-3 py-2 flex items-center justify-between gap-2">
              <span className="text-sm text-gray-600">
                「{inputValue.trim()}」を追加
              </span>
              <button
                type="button"
                onClick={handleAddNew}
                disabled={isAdding}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAdding ? "追加中..." : "追加"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
