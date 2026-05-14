'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import Button from '@/components/ui/Button'

export interface GameSelectionModalProps {
  isOpen: boolean
  onSelect: (gameType: 'ular-tangga' | 'nusa-card') => void
  onClose: () => void
}

export default function GameSelectionModal({
  isOpen,
  onSelect,
  onClose,
}: GameSelectionModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col gap-6 p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold text-center">Pilih Jenis Game</h2>
        <p className="text-center text-gray-600">
          Pilih permainan yang ingin kamu mainkan
        </p>

        <div className="flex flex-col gap-4">
          {/* Ular Tangga */}
          <button
            onClick={() => onSelect('ular-tangga')}
            className="p-6 border-2 border-primary rounded-lg hover:bg-primary hover:bg-opacity-10 transition-all"
          >
            <div className="text-4xl mb-2">🎲</div>
            <h3 className="font-bold text-lg">Ular Tangga</h3>
            <p className="text-sm text-gray-600">
              Permainan klasik dengan dadu dan pertanyaan
            </p>
          </button>

          {/* Nusa Card */}
          <button
            onClick={() => onSelect('nusa-card')}
            className="p-6 border-2 border-secondary rounded-lg hover:bg-secondary hover:bg-opacity-10 transition-all"
          >
            <div className="text-4xl mb-2">🃏</div>
            <h3 className="font-bold text-lg">Nusa Card</h3>
            <p className="text-sm text-gray-600">
              Permainan kartu dengan strategi dan pengetahuan
            </p>
          </button>
        </div>

        <Button
          variant="secondary"
          onClick={onClose}
          className="w-full"
        >
          Batal
        </Button>
      </div>
    </Modal>
  )
}
