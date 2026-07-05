# Game Flow Guide - Island Interactive Selection

## Overview
Fitur ini memungkinkan user untuk memilih game dan provinsi langsung dari home page dengan interactive island labels yang dapat di-click.

## Flow

```
User clicks Island Label
    ↓
Game Selection Modal Opens
    ↓
User selects Game (Ular Tangga or Nusa Card)
    ↓
Province Selection Modal Opens
    ↓
User selects Province
    ↓
Navigate to Lobby → /lobby/{provinceId}/{gameType}
    ↓
Lobby Page shows available rooms
    ↓
Enter Room → /room/{gameID}/{topicID}/{roomID}
```

## File Structure

### New Directories
```
src/features/home/
├── components/
│   ├── GameSelectionModal.tsx      # Modal untuk memilih game
│   ├── ProvinceSelectionModal.tsx  # Modal untuk memilih provinsi
│   └── InteractiveIslandLabel.tsx  # Komponen label yang interaktif
├── context/
│   └── GameFlowContext.tsx         # Context untuk manage game flow
├── hooks/
│   └── useGameFlow.ts              # Hook untuk manage game state
└── types.ts                         # Type definitions

src/styles/
└── modal-games.css                  # CSS untuk semua modals (responsive)

src/app/(public)/home/
├── HomePageClient.tsx               # Client wrapper dengan modal logic
├── HomePageContent.tsx              # Content komponen (bisa di-render dari client)
└── page.tsx                         # Main entry point
```

### Updated Components
- `src/components/home/HomeIslandLabel.tsx` - Ditambah support untuk `onClick` prop
- `src/app/(public)/home/page.tsx` - Sekarang menggunakan wrapper client

## Component Details

### GameSelectionModal
- Menampilkan 2 pilihan game: Ular Tangga (🎲) dan Nusa Card (🃏)
- Responsive grid layout
- Close button dan overlay click handling

### ProvinceSelectionModal
- Menampilkan daftar semua 34 provinsi Indonesia
- Fitur search/filter untuk menemukan provinsi dengan cepat
- Scrollable list dengan custom scrollbar styling
- Selected game info di subtitle

### useGameFlow Hook
State management untuk:
- Game modal open/close
- Province modal open/close
- Selected game type
- Selected destination/province ID
- Island label untuk context
- Reset flow

### GameFlowContext
Context untuk share game flow functions ke nested components:
- `onIslandClick(label)` - Handle island click untuk open game modal

### InteractiveIslandLabel
- Button-based component yang trigger game modal
- Same styling sebagai HomeIslandLabel
- Mendapat callback dari context

## Styling

### Modal CSS (modal-games.css)
Features:
- **Responsive Design** - Menggunakan `clamp()` untuk fluid typography dan spacing
- **Animations** - Fade in overlay, slide up modal
- **Custom Scrollbar** - Styled scroll untuk province list
- **Gradient Background** - Purple gradient untuk modal container
- **Hover Effects** - Scale dan shadow transformations
- **Mobile Optimized** - Specific breakpoints untuk mobile behavior

Breakpoints:
- Desktop: 768px+
- Tablet: 481px - 767px
- Mobile: 480px ke bawah

## Usage

### Menggunakan InteractiveIslandLabel di Home Page
```tsx
import InteractiveIslandLabel from '../../../features/home/components/InteractiveIslandLabel';

export default function HomePageContent() {
  return (
    <div className="island-item island-tl">
      <img src={islandImage} alt="Island" />
      <InteractiveIslandLabel label="Pulau 1" />
    </div>
  );
}
```

### Setup di Home Page
Home page sudah di-wrap dengan `HomePageClient` yang:
1. Manage game flow state
2. Provide context untuk child components
3. Render modals
4. Handle navigation setelah province selection

## Data

### Games (GAME_TYPES)
```typescript
{
  'ular-tangga': { label: 'Ular Tangga', description: '...' },
  'nusa-card': { label: 'Nusa Card', description: '...' }
}
```

### Provinces (PROVINCES)
Daftar lengkap 34 provinsi Indonesia dengan ID (1-34)

## Navigation Routes

After province selection:
- **From**: `/` (home page)
- **To**: `/lobby/{provinceId}/{gameType}`
- Example: `/lobby/12/nusa-card` → Go to Nusa Card lobby for Jawa Barat

## Type System

### GameFlowState
```typescript
interface GameFlowState {
  isGameModalOpen: boolean;
  isProvinceModalOpen: boolean;
  selectedGame: GameType | null;
  selectedDestinationId: number | null;
  islandLabel: string | null;
}

type GameType = 'ular-tangga' | 'nusa-card';
```

## Accessibility

- All buttons have `aria-label` attributes
- Modals have proper focus management via overlay click handling
- Keyboard navigation support (Enter/Escape)
- Close button easily accessible
- Search input in province modal for better UX

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers
- Responsive dari 320px ke desktop resolutions

## Future Enhancements

1. Add animations untuk modal transitions
2. Implement keyboard shortcuts (Esc untuk close)
3. Remember last selected game/province
4. Add game preview/tutorial
5. Loading state untuk navigation
6. Error boundaries untuk modal components

## Troubleshooting

**Modal tidak muncul?**
- Pastikan HomePageClient wrapper sudah di-import di page.tsx
- Check console untuk errors
- Verify GameFlowContext provider sudah setup

**Search filter tidak bekerja?**
- Verify input onChange handler terikat dengan benar
- Check FilteredProvinces computed value

**Navigation tidak berfungsi?**
- Check route struktur di app/(protected)/lobby
- Verify params diterima dengan benar
- Check router.push() call dengan benar
