import React, { useState } from 'react';
import { Search, Sparkles, Filter, Grid, Table } from 'lucide-react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';
import { formatCurrency } from '../utils/formatters';

interface ProductCatalogProps {
  products: Product[];
  onAddToCart: (product: Product, customNote?: string) => void;
  onOpenLightbox?: (url: string, title?: string) => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({ products, onAddToCart, onOpenLightbox }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Filter products based on active category & search query
  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.dimensions.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="catalogo" className="py-16 bg-[#0B0D10] border-b border-[#211A0D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#211A0C] border border-[#6B531F] text-[#E2B755] text-xs font-semibold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Catálogo Oficial</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FFF6E5] via-[#E8C56B] to-[#C59B27]">
            Medidas y Servicios Disponibles
          </h2>
          <p className="text-sm sm:text-base text-[#A89878]">
            Selecciona la medida deseada para tu fotografía o cuadro. Todos nuestros precios incluyen restauración digital y enmarcado listo para exhibir.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="mb-8 space-y-4">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#12151B] p-4 rounded-2xl border border-[#3D3016]">
            
            {/* Category Buttons */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#B38F2B] text-[#0B0D10] shadow-md'
                    : 'bg-[#181C24] text-[#A89878] hover:text-[#F3E5C8] border border-[#2D2413]'
                }`}
              >
                Todas las Medidas ({products.length})
              </button>
              <button
                onClick={() => setSelectedCategory('restauracion_enmarcado')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === 'restauracion_enmarcado'
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#B38F2B] text-[#0B0D10] shadow-md'
                    : 'bg-[#181C24] text-[#A89878] hover:text-[#F3E5C8] border border-[#2D2413]'
                }`}
              >
                Restauración + Enmarcado
              </button>
              <button
                onClick={() => setSelectedCategory('recreacion_digital')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === 'recreacion_digital'
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#B38F2B] text-[#0B0D10] shadow-md'
                    : 'bg-[#181C24] text-[#A89878] hover:text-[#F3E5C8] border border-[#2D2413]'
                }`}
              >
                Lienzo Óleo / Recreación
              </button>
            </div>

            {/* Right Tools: Search & View Toggle */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              {/* Search Bar */}
              <div className="relative flex-1 md:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#827258]" />
                <input
                  type="text"
                  placeholder="Buscar por medida (ej: 50x76, 30x40)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#080A0C] border border-[#3D3016] rounded-xl pl-9 pr-4 py-2 text-xs text-[#F3E5C8] placeholder-[#6B5A40] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              {/* View Toggle Buttons */}
              <div className="flex items-center bg-[#080A0C] border border-[#3D3016] rounded-xl p-1 shrink-0">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-all ${
                    viewMode === 'grid' ? 'bg-[#3D3016] text-[#E2B755]' : 'text-[#827258] hover:text-[#F3E5C8]'
                  }`}
                  title="Vista Cuadrícula"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg transition-all ${
                    viewMode === 'table' ? 'bg-[#3D3016] text-[#E2B755]' : 'text-[#827258] hover:text-[#F3E5C8]'
                  }`}
                  title="Vista Tabla de Medidas"
                >
                  <Table className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>

        </div>

        {/* Display Products: Grid vs Table */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-[#12151B] rounded-2xl border border-[#3D3016] space-y-3">
            <Filter className="w-10 h-10 text-[#6B572F] mx-auto" />
            <h3 className="text-lg font-serif font-bold text-[#F3E5C8]">No se encontraron productos</h3>
            <p className="text-xs text-[#A89878]">Intenta cambiando el filtro de categoría o el término de búsqueda.</p>
            <button
              onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
              className="px-4 py-2 rounded-lg bg-[#3D3016] text-[#E2B755] text-xs font-semibold hover:bg-[#52411E]"
            >
              Restablecer Filtros
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
                onOpenLightbox={onOpenLightbox}
              />
            ))}
          </div>
        ) : (
          /* Table View Matching Flyer Design Layout */
          <div className="bg-[#12151B] border-2 border-[#54431B] rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-4 bg-[#211A0C] border-b border-[#3D3016] text-center">
              <span className="font-serif text-lg font-bold text-[#F3E5C8]">
                TABLA DE MEDIDAS DISPONIBLES (RESTAURACIÓN Y ENMARCADO)
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#0B0D10] border-b border-[#3D3016] text-xs font-mono uppercase text-[#A89878]">
                    <th className="py-3 px-4">Servicio / Producto</th>
                    <th className="py-3 px-4">Medidas</th>
                    <th className="py-3 px-4">Precio Regular</th>
                    <th className="py-3 px-4">Precio Descuento</th>
                    <th className="py-3 px-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#262013] text-sm text-[#F3E5C8]">
                  {filteredProducts.map((p) => {
                    const price = p.discountPrice ?? p.originalPrice;
                    return (
                      <tr key={p.id} className="hover:bg-[#181D26] transition-colors">
                        <td className="py-3.5 px-4 font-medium font-serif">{p.name}</td>
                        <td className="py-3.5 px-4 font-mono font-bold text-[#D4AF37]">{p.dimensions}</td>
                        <td className="py-3.5 px-4 font-mono text-[#827258] line-through">
                          {p.discountPrice ? formatCurrency(p.originalPrice) : '-'}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-[#25D366]">
                          {formatCurrency(price)}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => onAddToCart(p)}
                            className="px-3 py-1.5 rounded-lg bg-[#3D3016] text-[#E2B755] border border-[#8A6C28] hover:bg-[#52411E] text-xs font-bold transition-all"
                          >
                            + Agregar
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
