import React, { useState } from 'react';
import { CustomButton, CustomInput, CustomSelect, CustomTextarea, CustomTable } from '../../utilities';

const Demo: React.FC = () => {
  const [inputText, setInputText] = useState('OmniERP Design System');
  const [selectVal, setSelectVal] = useState('option2');

  const sampleColumns = [
    { header: 'Component', key: 'name' },
    { header: 'Category', key: 'category' },
    { header: 'Status', render: (r: any) => (
      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        {r.status}
      </span>
    )},
    { header: 'Inter Font Weight', key: 'weight' },
  ];

  const sampleData = [
    { name: 'CustomButton', category: 'Action', status: 'Production', weight: 'SemiBold (600)' },
    { name: 'CustomInput', category: 'Form', status: 'Production', weight: 'Regular (400)' },
    { name: 'CustomTable', category: 'Data Display', status: 'Production', weight: 'Medium (500)' },
    { name: 'Inter Variable Font', category: 'Typography', status: 'Loaded (wght 100-900)', weight: 'Dynamic' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">UI Component Showcase</h1>
        <p className="text-sm text-slate-500 mt-1">
          Explore the design system built with Tailwind CSS and Inter Variable Typography
        </p>
      </div>

      {/* Font Verification Banner */}
      <div className="bg-indigo-900 text-white rounded-2xl p-6 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs uppercase tracking-wider font-semibold text-indigo-300">
            Active Typography: Inter Variable Font
          </span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-700/80 text-indigo-200">
            /Inter/Inter-VariableFont_opsz,wght.ttf
          </span>
        </div>
        <p className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          The quick brown fox jumps over the lazy dog.
        </p>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-indigo-200 pt-3 border-t border-indigo-800">
          <div><span className="font-thin">Inter Thin (100)</span></div>
          <div><span className="font-light">Inter Light (300)</span></div>
          <div><span className="font-normal">Inter Regular (400)</span></div>
          <div><span className="font-medium">Inter Medium (500)</span></div>
          <div><span className="font-semibold">Inter SemiBold (600)</span></div>
          <div><span className="font-bold">Inter Bold (700)</span></div>
          <div><span className="font-extrabold">Inter ExtraBold (800)</span></div>
          <div><span className="font-black">Inter Black (900)</span></div>
        </div>
      </div>

      {/* Buttons Showcase */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <h2 className="text-base font-semibold text-slate-800 mb-4">Button Variants &amp; Sizes</h2>
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <CustomButton name="Primary" variant="primary" />
            <CustomButton name="Secondary" variant="secondary" />
            <CustomButton name="Success" variant="success" />
            <CustomButton name="Danger" variant="danger" />
            <CustomButton name="Outline" variant="outline" />
            <CustomButton name="Ghost" variant="ghost" />
            <CustomButton name="Disabled" disabled />
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100">
            <CustomButton name="Small Button" size="sm" />
            <CustomButton name="Medium Button" size="md" />
            <CustomButton name="Large Button" size="lg" />
          </div>
        </div>
      </div>

      {/* Form Controls Showcase */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <h2 className="text-base font-semibold text-slate-800 mb-4">Interactive Form Inputs</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              CustomInput
            </label>
            <CustomInput
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type something..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              CustomSelect
            </label>
            <CustomSelect
              value={selectVal}
              onChange={(e) => setSelectVal(e.target.value)}
              options={[
                { value: 'option1', label: 'Option 1 - Enterprise' },
                { value: 'option2', label: 'Option 2 - Cloud Pro' },
                { value: 'option3', label: 'Option 3 - Developer Tier' },
              ]}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              CustomTextarea
            </label>
            <CustomTextarea
              rows={2}
              placeholder="Multi-line description..."
              defaultValue="Standardized input styles with focus ring and smooth transition."
            />
          </div>
        </div>
      </div>

      {/* Table Showcase */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <h2 className="text-base font-semibold text-slate-800 mb-4">CustomTable Component</h2>
        <CustomTable
          columns={sampleColumns}
          data={sampleData}
          keyExtractor={(row) => row.name}
        />
      </div>
    </div>
  );
};

export default Demo;
