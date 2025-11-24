import { ref } from 'vue'
import { useI18n } from '../../../../composables/useI18n'

export function useSettings(emit: (event: 'update:wallpaper', url: string) => void) {
  const { t } = useI18n()
  const activeTab = ref('wallpaper')

  const defaultWallpapers = [
    { name: 'Monterey', url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80' },
    { name: 'Big Sur', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80' },
    { name: 'Abstract', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80' },
    { name: 'Desert', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80' },
    { name: 'Mountains', url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80' }
  ]

  const handleFileChange = (event: Event) => {
    const input = event.target as HTMLInputElement
    if (input.files && input.files[0]) {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          emit('update:wallpaper', e.target.result as string)
        }
      }
      reader.readAsDataURL(input.files[0])
    }
  }

  const selectWallpaper = (url: string) => {
    emit('update:wallpaper', url)
  }

  const setActiveTab = (tab: string) => {
    activeTab.value = tab
  }

  return {
    t,
    activeTab,
    setActiveTab,
    defaultWallpapers,
    handleFileChange,
    selectWallpaper
  }
}
