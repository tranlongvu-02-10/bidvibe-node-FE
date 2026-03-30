import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Upload, X, ChevronRight, ChevronLeft, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import { itemApi } from '../api/itemApi'
import { supabase } from '../lib/supabase'
import type { ItemRarity } from '../types'

const rarityOptions: { value: ItemRarity; label: string; desc: string }[] = [
  { value: 'COMMON',    label: 'Phổ thông',   desc: 'Vật phẩm thông thường'       },
  { value: 'RARE',      label: 'Hiếm',         desc: 'Vật phẩm khó tìm'            },
  { value: 'LEGENDARY', label: 'Huyền thoại', desc: 'Vật phẩm cực kỳ độc đáo'    },
]

const STEPS = ['Hình ảnh', 'Thông tin', 'Xem lại']

export const SubmitItemPage = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [uploading, setUploading] = useState(false)

  const [form, setForm] = useState({
    name:        '',
    description: '',
    tags:        [] as string[],
    rarity:      'COMMON' as ItemRarity,
    imageUrls:   [] as string[],
  })
  const [tagInput, setTagInput] = useState('')
  const [previews, setPreviews] = useState<string[]>([])

  // Upload ảnh lên Supabase Storage
  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true)
    try {
      const urls: string[] = []
      const prevs: string[] = []

      for (const file of Array.from(files)) {
        // Preview local
        const localUrl = URL.createObjectURL(file)
        prevs.push(localUrl)

        // Upload Supabase Storage
        const ext      = file.name.split('.').pop()
        const filename = `items/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error } = await supabase.storage
          .from('bidvibe-items')
          .upload(filename, file, { cacheControl: '3600', upsert: false })

        if (!error) {
          const { data: { publicUrl } } = supabase.storage
            .from('bidvibe-items')
            .getPublicUrl(filename)
          urls.push(publicUrl)
        }
      }

      setForm(prev => ({ ...prev, imageUrls: [...prev.imageUrls, ...urls] }))
      setPreviews(prev => [...prev, ...prevs])
      toast.success(`Đã tải lên ${urls.length} ảnh`)
    } catch {
      toast.error('Upload ảnh thất bại')
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (index: number) => {
    setForm(prev => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index),
    }))
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase()
    if (!tag || form.tags.includes(tag)) return
    setForm(prev => ({ ...prev, tags: [...prev.tags, tag] }))
    setTagInput('')
  }

  const removeTag = (tag: string) => {
    setForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))
  }

  const submitMutation = useMutation({
    mutationFn: () => itemApi.submitItem(form),
    onSuccess: () => {
      toast.success('Đã gửi vật phẩm, đang chờ duyệt!')
      navigate('/me/inventory')
    },
    onError: () => toast.error('Gửi thất bại, thử lại'),
  })

  const canNext = () => {
    if (step === 0) return form.imageUrls.length > 0
    if (step === 1) return form.name.trim().length > 0
    return true
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-medium text-gray-900 dark:text-white mb-2">Ký gửi vật phẩm</h1>
      <p className="text-sm text-gray-400 mb-8">
        Gửi vật phẩm để Admin thẩm định và xếp vào phiên đấu giá
      </p>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
              i < step  ? 'bg-purple-600 text-white' :
              i === step ? 'bg-purple-600 text-white' :
                           'bg-gray-100 dark:bg-gray-800 text-gray-400'
            }`}>
              {i < step ? <Check size={13} /> : i + 1}
            </div>
            <span className={`text-sm ${i === step ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-400'}`}>
              {s}
            </span>
            {i < STEPS.length - 1 && (
              <ChevronRight size={14} className="text-gray-300 dark:text-gray-700" />
            )}
          </div>
        ))}
      </div>

      {/* Step 0 — Upload ảnh */}
      {step === 0 && (
        <div>
          <h2 className="text-base font-medium text-gray-900 dark:text-white mb-4">
            Tải ảnh vật phẩm
          </h2>

          {/* Upload zone */}
          <label className={`block border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${
            uploading
              ? 'border-purple-400 bg-purple-50 dark:bg-purple-900/10'
              : 'border-gray-200 dark:border-gray-700 hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/10'
          }`}>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleImageUpload(e.target.files)}
              disabled={uploading}
            />
            <Upload size={28} className="mx-auto mb-2 text-gray-400" />
            {uploading ? (
              <p className="text-sm text-purple-600 font-medium">Đang tải lên...</p>
            ) : (
              <>
                <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                  Kéo thả hoặc click để chọn ảnh
                </p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG — tối đa 10MB mỗi ảnh</p>
              </>
            )}
          </label>

          {/* Previews */}
          {previews.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mt-4">
              {previews.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black/80"
                  >
                    <X size={11} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-gray-400 mt-3">
            Đã chọn {form.imageUrls.length} ảnh. Ít nhất 1 ảnh rõ nét.
          </p>
        </div>
      )}

      {/* Step 1 — Thông tin */}
      {step === 1 && (
        <div className="space-y-5">
          <h2 className="text-base font-medium text-gray-900 dark:text-white">
            Thông tin vật phẩm
          </h2>

          {/* Name */}
          <div>
            <label className="text-xs text-gray-400 mb-1 block">
              Tên vật phẩm <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="VD: Air Jordan 1 Chicago 1985"
              className="w-full px-3 py-2.5 text-sm bg-gray-100 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Mô tả chi tiết</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Mô tả tình trạng, xuất xứ, lý do bán..."
              rows={4}
              className="w-full px-3 py-2.5 text-sm bg-gray-100 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Tags phân loại</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="sneaker, vintage, jordan..."
                className="flex-1 px-3 py-2.5 text-sm bg-gray-100 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={addTag}
                className="px-4 py-2.5 text-sm bg-purple-600 text-white rounded-xl hover:bg-purple-700"
              >
                Thêm
              </button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {form.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 rounded-full"
                  >
                    {tag}
                    <button onClick={() => removeTag(tag)}>
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Rarity */}
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Độ hiếm (Admin có thể thay đổi)</label>
            <div className="grid grid-cols-3 gap-3">
              {rarityOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setForm(prev => ({ ...prev, rarity: opt.value }))}
                  className={`p-3 rounded-xl border text-left transition-colors ${
                    form.rarity === opt.value
                      ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{opt.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 2 — Review */}
      {step === 2 && (
        <div>
          <h2 className="text-base font-medium text-gray-900 dark:text-white mb-4">
            Xem lại trước khi gửi
          </h2>

          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 space-y-4">
            {/* Images preview */}
            {previews.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {previews.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt=""
                    className="w-20 h-20 object-cover rounded-xl flex-shrink-0"
                  />
                ))}
              </div>
            )}

            <div className="space-y-3 pt-1">
              <div>
                <p className="text-xs text-gray-400">Tên vật phẩm</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">{form.name}</p>
              </div>

              {form.description && (
                <div>
                  <p className="text-xs text-gray-400">Mô tả</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5 line-clamp-3">{form.description}</p>
                </div>
              )}

              <div className="flex gap-6">
                <div>
                  <p className="text-xs text-gray-400">Độ hiếm</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">
                    {rarityOptions.find(r => r.value === form.rarity)?.label}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Tags</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">
                    {form.tags.length > 0 ? form.tags.join(', ') : 'Không có'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Sau khi gửi, Admin sẽ thẩm định vật phẩm trong 1-3 ngày. Nếu bị từ chối, bạn cần tạo yêu cầu mới.
            </p>
          </div>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex gap-3 mt-8">
        {step > 0 && (
          <button
            onClick={() => setStep(prev => prev - 1)}
            className="flex items-center gap-1.5 px-5 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <ChevronLeft size={14} />
            Quay lại
          </button>
        )}

        {step < STEPS.length - 1 ? (
          <button
            onClick={() => setStep(prev => prev + 1)}
            disabled={!canNext()}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Tiếp theo
            <ChevronRight size={14} />
          </button>
        ) : (
          <button
            onClick={() => submitMutation.mutate()}
            disabled={submitMutation.isPending}
            className="flex-1 py-2.5 text-sm bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50"
          >
            {submitMutation.isPending ? 'Đang gửi...' : 'Gửi vật phẩm'}
          </button>
        )}
      </div>
    </div>
  )
}