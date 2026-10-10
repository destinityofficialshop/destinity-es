'use client';

import { useState, useEffect } from 'react';
import { StoreService } from '@/lib/data/store-service';
import { StoreSettings } from '@/types/database.types';
import { Save, CheckCircle2, Building, Receipt, Truck, Shield } from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<StoreSettings>(StoreService.getSettings());
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');

  useEffect(() => {
    setSettings(StoreService.getSettings());
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: name.includes('rate') || name.includes('threshold') || name.includes('cost')
        ? parseFloat(value) || 0
        : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const updated = StoreService.saveSettings(settings);
    setSettings(updated);
    setSaving(false);
    setSavedMessage('Configuración fiscal y de tienda actualizada con éxito.');
    setTimeout(() => setSavedMessage(''), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="font-heading text-2xl font-extrabold text-obsidian-950">
          Configuración Fiscal y Parámetros de Tienda
        </h1>
        <p className="text-xs text-obsidian-500 mt-1">
          Ajusta los datos societarios para facturas oficiales en España, tipos de IVA y condiciones de transporte.
        </p>
      </div>

      {savedMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{savedMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* 1. Datos Fiscales de la Empresa */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-black/5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-black/5">
            <Building className="w-4 h-4 text-brand-600" />
            <h2 className="font-heading text-sm font-bold text-obsidian-950">
              Datos Societarios y Fiscales (Emisor en Facturas)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-obsidian-700 font-semibold mb-1">Nombre Comercial de la Marca</label>
              <input
                type="text"
                name="store_name"
                required
                value={settings.store_name}
                onChange={handleChange}
                className="w-full bg-[#fafaf9] border border-black/10 rounded-xl p-2.5 text-obsidian-900"
              />
            </div>

            <div>
              <label className="block text-obsidian-700 font-semibold mb-1">Razón Social Legal (Sociedad) *</label>
              <input
                type="text"
                name="legal_name"
                required
                value={settings.legal_name}
                onChange={handleChange}
                className="w-full bg-[#fafaf9] border border-black/10 rounded-xl p-2.5 text-obsidian-900"
              />
            </div>

            <div>
              <label className="block text-obsidian-700 font-semibold mb-1">CIF / NIF Oficial de la Empresa *</label>
              <input
                type="text"
                name="cif_nif"
                required
                value={settings.cif_nif}
                onChange={handleChange}
                className="w-full bg-[#fafaf9] border border-black/10 rounded-xl p-2.5 text-obsidian-900 font-mono uppercase"
              />
            </div>

            <div>
              <label className="block text-obsidian-700 font-semibold mb-1">Email de Contacto Fiscal</label>
              <input
                type="email"
                name="email"
                required
                value={settings.email}
                onChange={handleChange}
                className="w-full bg-[#fafaf9] border border-black/10 rounded-xl p-2.5 text-obsidian-900"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-obsidian-700 font-semibold mb-1">Domicilio Fiscal Completo *</label>
              <input
                type="text"
                name="fiscal_address"
                required
                value={settings.fiscal_address}
                onChange={handleChange}
                className="w-full bg-[#fafaf9] border border-black/10 rounded-xl p-2.5 text-obsidian-900"
              />
            </div>

            <div>
              <label className="block text-obsidian-700 font-semibold mb-1">Ciudad / Municipio</label>
              <input
                type="text"
                name="city"
                required
                value={settings.city}
                onChange={handleChange}
                className="w-full bg-[#fafaf9] border border-black/10 rounded-xl p-2.5 text-obsidian-900"
              />
            </div>

            <div>
              <label className="block text-obsidian-700 font-semibold mb-1">Código Postal</label>
              <input
                type="text"
                name="postal_code"
                required
                value={settings.postal_code}
                onChange={handleChange}
                className="w-full bg-[#fafaf9] border border-black/10 rounded-xl p-2.5 text-obsidian-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-obsidian-700 font-semibold mb-1">Provincia</label>
              <input
                type="text"
                name="province"
                required
                value={settings.province}
                onChange={handleChange}
                className="w-full bg-[#fafaf9] border border-black/10 rounded-xl p-2.5 text-obsidian-900"
              />
            </div>

            <div>
              <label className="block text-obsidian-700 font-semibold mb-1">Teléfono Centralita</label>
              <input
                type="text"
                name="phone"
                value={settings.phone}
                onChange={handleChange}
                className="w-full bg-[#fafaf9] border border-black/10 rounded-xl p-2.5 text-obsidian-900"
              />
            </div>
          </div>
        </div>

        {/* 2. Facturación e IVA */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-black/5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-black/5">
            <Receipt className="w-4 h-4 text-brand-600" />
            <h2 className="font-heading text-sm font-bold text-obsidian-950">
              Régimen de IVA y Facturación Oficial (PDF)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-obsidian-700 font-semibold mb-1">Tipo Impositivo de IVA (%) *</label>
              <input
                type="number"
                step="0.1"
                name="tax_rate"
                required
                value={settings.tax_rate}
                onChange={handleChange}
                className="w-full bg-[#fafaf9] border border-black/10 rounded-xl p-2.5 text-obsidian-900 font-mono"
              />
              <span className="text-[10px] text-obsidian-400 mt-1 block">España: 21.00% Régimen General</span>
            </div>

            <div>
              <label className="block text-obsidian-700 font-semibold mb-1">Prefijo de Factura Oficial *</label>
              <input
                type="text"
                name="invoice_prefix"
                required
                value={settings.invoice_prefix}
                onChange={handleChange}
                className="w-full bg-[#fafaf9] border border-black/10 rounded-xl p-2.5 text-obsidian-900 font-mono uppercase"
              />
              <span className="text-[10px] text-obsidian-400 mt-1 block">Formato resultante: INV-2026-XXXX</span>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-obsidian-700 font-semibold mb-1">Leyenda / Pie Legal de Factura</label>
              <textarea
                name="invoice_footer_note"
                rows={2}
                value={settings.invoice_footer_note}
                onChange={handleChange}
                className="w-full bg-[#fafaf9] border border-black/10 rounded-xl p-2.5 text-obsidian-900 resize-none"
              />
              <span className="text-[10px] text-obsidian-400 mt-1 block">
                Aparece impreso al final del PDF oficial generado para el cliente.
              </span>
            </div>
          </div>
        </div>

        {/* 3. Condiciones de Transporte y Envíos */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-black/5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-black/5">
            <Truck className="w-4 h-4 text-brand-600" />
            <h2 className="font-heading text-sm font-bold text-obsidian-950">
              Gastos de Envío y Umbrales
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-obsidian-700 font-semibold mb-1">Coste Estándar de Envío Peninsular (€)</label>
              <input
                type="number"
                step="0.01"
                name="standard_shipping_cost"
                required
                value={settings.standard_shipping_cost}
                onChange={handleChange}
                className="w-full bg-[#fafaf9] border border-black/10 rounded-xl p-2.5 text-obsidian-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-obsidian-700 font-semibold mb-1">Importe Mínimo para Envío Gratuito (€)</label>
              <input
                type="number"
                step="1"
                name="free_shipping_threshold"
                required
                value={settings.free_shipping_threshold}
                onChange={handleChange}
                className="w-full bg-[#fafaf9] border border-black/10 rounded-xl p-2.5 text-obsidian-900 font-mono"
              />
              <span className="text-[10px] text-obsidian-400 mt-1 block">
                Sincronizado con la barra de progreso del carrito lateral
              </span>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-obsidian-950 text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Guardando...' : 'Guardar Todos los Ajustes'}
          </button>
        </div>
      </form>
    </div>
  );
}
