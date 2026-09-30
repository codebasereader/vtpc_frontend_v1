import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Eye, Trash2, Check, X, Video, ImageOff, Star } from 'lucide-react'
import { getGiProducts, updateGiProduct, deleteGiProduct } from '../../../../api/giProductsApi'
import { ROUTES } from '../../../../constants/routes'
import { GI_CATEGORIES } from '../../../../constants/giCategories'
import RecordDrawer from '../../../../components/RecordDrawer'
import { SearchInput, NoResults } from '../../../../components/ListFilters'
import { matchesSearch } from '../../../../lib/search'

export default function GIProductsList() {
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [pendingDeleteId, setPendingDeleteId] = useState(null)
  const [viewing, setViewing] = useState(null)
  const [search, setSearch] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [togglingId, setTogglingId] = useState(null)

  useEffect(() => {
    let isMounted = true
    getGiProducts()
      .then((data) => {
        if (isMounted) setProducts(data)
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to load GI products.')
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [])

  const filteredProducts = useMemo(
    () =>
      products
        .filter((p) => categoryFilter === 'all' || p.category === categoryFilter)
        .filter((p) => matchesSearch(p, search)),
    [products, categoryFilter, search],
  )

  async function handleToggleFeatured(product) {
    setTogglingId(product.id)
    try {
      const updated = await updateGiProduct(product.id, {
        nameEn: product.name?.en,
        nameKn: product.name?.kn,
        category: product.category,
        summaryEn: product.summary?.en,
        summaryKn: product.summary?.kn,
        featured: !product.featured,
      })
      setProducts((prev) => prev.map((item) => (item.id === product.id ? updated : item)))
    } catch (err) {
      setError(err.message || 'Failed to update GI product.')
    } finally {
      setTogglingId(null)
    }
  }

  async function handleConfirmDelete(id) {
    setIsDeleting(true)
    try {
      await deleteGiProduct(id)
      setProducts(products.filter((product) => product.id !== id))
      setPendingDeleteId(null)
    } catch (err) {
      setError(err.message || 'Failed to delete GI product.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">GI Products</h1>
          <p className="mt-1 text-sm text-gray-600">
            Geographical Indication products shown under Karnataka GI Treasures, grouped by category.
          </p>
        </div>
        <Link
          to={`${ROUTES.ADMIN_GI_PRODUCTS}/new`}
          className="flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-primary-dark"
        >
          <Plus size={18} strokeWidth={2} />
          Add GI Product
        </Link>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mt-5">
        <SearchInput value={search} onChange={setSearch} placeholder="Search GI products…" />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCategoryFilter('all')}
          className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
            categoryFilter === 'all'
              ? 'bg-brand-navy-dark text-white'
              : 'bg-brand-page text-brand-dark hover:bg-brand-surface'
          }`}
        >
          All ({products.length})
        </button>
        {GI_CATEGORIES.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => setCategoryFilter(category.en)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              categoryFilter === category.en
                ? 'bg-brand-navy-dark text-white'
                : 'bg-brand-page text-brand-dark hover:bg-brand-surface'
            }`}
          >
            {category.en} ({products.filter((p) => p.category === category.en).length})
          </button>
        ))}
      </div>

      {isLoading && <p className="mt-8 text-center text-gray-600">Loading GI products…</p>}

      {!isLoading && search && products.length > 0 && filteredProducts.length === 0 && <NoResults query={search} />}

      {!isLoading && !search && filteredProducts.length === 0 && !error && (
        <p className="mt-8 rounded-xl border border-dashed border-brand-divider p-8 text-center text-gray-600">
          No GI products yet. Add the first one above.
        </p>
      )}

      {!isLoading && filteredProducts.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-2xl border border-brand-divider bg-white">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-brand-divider bg-brand-page">
                <th className="px-4 py-3 text-xs font-bold tracking-wide text-gray-500 uppercase">Image</th>
                <th className="px-4 py-3 text-xs font-bold tracking-wide text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-xs font-bold tracking-wide text-gray-500 uppercase">Category</th>
                <th className="px-4 py-3 text-xs font-bold tracking-wide text-gray-500 uppercase">Featured</th>
                <th className="px-4 py-3 text-xs font-bold tracking-wide text-gray-500 uppercase">Video</th>
                <th className="px-4 py-3 text-right text-xs font-bold tracking-wide text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-divider">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="transition-colors hover:bg-brand-page/60">
                  <td className="px-4 py-3">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt=""
                        className="h-12 w-12 rounded-lg object-cover ring-1 ring-brand-divider"
                      />
                    ) : (
                      <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-page text-gray-400">
                        <ImageOff size={18} aria-hidden="true" />
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-brand-dark">{product.name?.en}</p>
                    {product.name?.kn && <p className="text-sm text-gray-500">{product.name.kn}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-brand-surface px-2.5 py-1 text-xs font-semibold text-brand-primary">
                      {product.category || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleToggleFeatured(product)}
                      disabled={togglingId === product.id}
                      aria-pressed={Boolean(product.featured)}
                      aria-label={`${product.featured ? 'Unmark' : 'Mark'} ${product.name?.en} as featured`}
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors disabled:opacity-60 ${
                        product.featured
                          ? 'bg-brand-gold/20 text-amber-700'
                          : 'bg-brand-page text-gray-400 hover:bg-brand-surface'
                      }`}
                    >
                      <Star size={13} className={product.featured ? 'fill-current' : ''} aria-hidden="true" />
                      {product.featured ? 'Featured' : 'Mark featured'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    {product.video ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-navy">
                        <Video size={14} aria-hidden="true" /> Yes
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {pendingDeleteId === product.id ? (
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-sm text-gray-600">Delete?</span>
                        <button
                          type="button"
                          onClick={() => handleConfirmDelete(product.id)}
                          disabled={isDeleting}
                          aria-label={`Confirm delete ${product.name?.en}`}
                          className="rounded-md bg-red-600 p-1.5 text-white hover:bg-red-700"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setPendingDeleteId(null)}
                          disabled={isDeleting}
                          aria-label="Cancel delete"
                          className="rounded-md border border-brand-divider p-1.5 text-gray-600 hover:bg-gray-50"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setViewing(product)}
                          aria-label="View details"
                          className="rounded-md p-2 text-gray-500 hover:bg-brand-page hover:text-brand-navy"
                        >
                          <Eye size={16} />
                        </button>
                        <Link
                          to={`${ROUTES.ADMIN_GI_PRODUCTS}/${product.id}/edit`}
                          aria-label={`Edit ${product.name?.en}`}
                          className="rounded-md p-2 text-gray-500 hover:bg-brand-page hover:text-brand-navy"
                        >
                          <Pencil size={16} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setPendingDeleteId(product.id)}
                          aria-label={`Delete ${product.name?.en}`}
                          className="rounded-md p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <RecordDrawer
        record={viewing}
        title={viewing ? viewing.name?.en : ''}
        onClose={() => setViewing(null)}
      />
    </div>
  )
}
