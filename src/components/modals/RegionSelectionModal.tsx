'use client'

import { useEffect, useState } from 'react'
import { Modal } from '@/src/components/ui/Modal'
import Button from '@/src/components/ui/Button'
import { getRegions } from '@/src/features/destination/services/regions.service'
import { Region } from '@/src/types/firestore'

export interface RegionSelectionModalProps {
  isOpen: boolean
  onSelect: (region: Region) => void
  onClose: () => void
  isLoading?: boolean
}

export default function RegionSelectionModal({
  isOpen,
  onSelect,
  onClose,
  isLoading = false,
}: RegionSelectionModalProps) {
  const [regions, setRegions] = useState<Region[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      loadRegions()
    }
  }, [isOpen])

  const loadRegions = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getRegions()
      setRegions(data)
    } catch (err) {
      setError('Gagal memuat provinsi. Coba lagi.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col gap-4 p-6 max-w-md w-full max-h-96">
        <h2 className="text-2xl font-bold">Pilih Provinsi</h2>

        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin text-2xl">⏳</div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 overflow-y-auto max-h-64">
            {regions.map((region) => (
              <button
                key={region.regionId}
                onClick={() => onSelect(region)}
                disabled={isLoading}
                className="p-3 border border-gray-300 rounded-lg hover:bg-primary hover:bg-opacity-10 hover:border-primary transition-all disabled:opacity-50 text-sm font-medium"
              >
                {region.name}
              </button>
            ))}
          </div>
        )}

        <Button
          variant="secondary"
          onClick={onClose}
          disabled={loading || isLoading}
          className="w-full"
        >
          Batal
        </Button>
      </div>
    </Modal>
  )
}
