'use client';

import { useState } from 'react';
import { Lightbulb, Send, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface SuggestLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SuggestLessonModal({ isOpen, onClose }: SuggestLessonModalProps) {
  const { user } = useAuth();
  const [topic, setTopic] = useState('');
  const [details, setDetails] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setErrorMessage('กรุณากรอกหัวข้อบทเรียนที่ต้องการเสนอ');
      setStatus('error');
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    try {
      // Send directly via server API route (no Firebase client permissions required!)
      const res = await fetch('/api/suggest-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          details: details.trim(),
          userEmail: user?.email,
          userName: user?.displayName,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus('success');
        setTopic('');
        setDetails('');
      } else {
        setErrorMessage(data.error || 'เกิดข้อผิดพลาดในการส่งข้อมูล');
        setStatus('error');
      }
    } catch (err) {
      console.error('Suggest lesson submit exception:', err);
      setErrorMessage('เกิดข้อผิดพลาดทางเครือข่าย กรุณาลองใหม่อีกครั้ง');
      setStatus('error');
    }
  };

  const handleClose = () => {
    setStatus('idle');
    setErrorMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-lg w-full text-slate-900 shadow-2xl relative overflow-hidden">
        {/* Glow Ambient Highlights */}
        <div className="absolute -top-16 -right-16 w-40 h-40 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {status === 'success' ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-md">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">ได้รับข้อเสนอแนะบทเรียนแล้ว! ✨</h3>
            <p className="text-xs text-slate-600 max-w-xs mx-auto">
              ขอบคุณสำหรับไอเดียบทเรียนดีๆ ทีมงานจะนำข้อเสนอแนะของคุณไปพัฒนาเป็นบทเรียนใหม่ในอัปเดตถัดไปครับ
            </p>
            <button
              type="button"
              onClick={handleClose}
              className="mt-4 px-6 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-md cursor-pointer active:scale-95 transition"
            >
              ตกลง ปิดหน้านี้
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Lightbulb className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">เสนอบทเรียนที่คุณอยากเรียนเพิ่ม 💡</h3>
                <p className="text-xs text-slate-500">
                  บอกเราได้เลยว่าอยากฝึกบทสนทนาภาษาจีนสถานการณ์ไหนเพิ่มอีก
                </p>
              </div>
            </div>

            {status === 'error' && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                หัวข้อบทเรียนที่อยากให้เพิ่ม <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="เช่น สั่งอาหารฮาลาล, ซื้อซิมการ์ดเน็ตจีนที่สนามบิน, เรียกรถ Didi"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                รายละเอียดประโยคที่อยากเรียนเพิ่มเติม (ระบุหรือไม่ก็ได้)
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={3}
                placeholder="เช่น อยากได้ประโยคถามวิธีเปิดใช้งานซิมการ์ด และประโยคถามแพ็กเกจเน็ตคงเหลือ..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition resize-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 via-amber-500 to-rose-600 text-white text-xs font-bold shadow-md shadow-rose-500/20 hover:opacity-95 transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                {status === 'submitting' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>กำลังส่งข้อเสนอ...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>ส่งข้อเสนอแนะ</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
