// src/views/components/ClassDetailModal.tsx
import React, { useState, useEffect } from 'react';
import {
  X,
  Users,
  Copy,
  Share,
  Calendar,
  BookOpen,
  QrCode,
} from 'lucide-react';
import { ClassController, ClassInfo } from '../../controllers/ClassController';
import QRCode from 'qrcode';

interface ClassDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  classInfo: ClassInfo;
  onEnterClass: () => void;
}

export const ClassDetailModal: React.FC<ClassDetailModalProps> = ({
  isOpen,
  onClose,
  classInfo,
  onEnterClass,
}) => {
  const [classController] = useState(() => new ClassController());
  const [participants, setParticipants] = useState<any[]>([]);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [showQR, setShowQR] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && classInfo) {
      loadParticipants();
      generateQRCode();
    }
  }, [isOpen, classInfo]);

  const loadParticipants = async () => {
    setLoading(true);
    try {
      const participantList = await classController.getClassParticipants(
        classInfo.id
      );
      setParticipants(participantList);
    } catch (error) {
      console.error('Error loading participants:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async () => {
    try {
      const shareUrl = classController.generateShareUrl(classInfo.class_code);
      const qrUrl = await QRCode.toDataURL(shareUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#1f2937',
          light: '#ffffff',
        },
      });
      setQrCodeUrl(qrUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
      <div className='bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto'>
        {/* 헤더 */}
        <div className='sticky top-0 bg-white border-b p-6 rounded-t-2xl'>
          <div className='flex items-center justify-between'>
            <h2 className='text-2xl font-bold text-gray-900'>수업 상세 정보</h2>
            <button
              onClick={onClose}
              className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className='p-6 space-y-6'>
          {/* 수업 정보 */}
          <div className='bg-gray-50 rounded-xl p-4'>
            <div className='flex items-start gap-4'>
              <div
                className='w-16 h-16 rounded-lg flex items-center justify-center'
                style={{ backgroundColor: classInfo.background_color }}
              >
                <BookOpen size={24} className='text-gray-600' />
              </div>

              <div className='flex-1'>
                <h3 className='text-xl font-semibold text-gray-900 mb-1'>
                  {classInfo.title}
                </h3>
                {classInfo.description && (
                  <p className='text-gray-600 mb-2'>{classInfo.description}</p>
                )}
                <div className='flex items-center gap-4 text-sm text-gray-500'>
                  <div className='flex items-center gap-1'>
                    <Calendar size={14} />
                    {formatDate(classInfo.created_at)}
                  </div>
                  <div className='flex items-center gap-1'>
                    <Users size={14} />
                    {participants.length}명 참여
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 수업 코드 섹션 */}
          <div className='bg-blue-50 rounded-xl p-6'>
            <h4 className='font-semibold text-blue-900 mb-4'>수업 참여 정보</h4>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {/* 수업 코드 */}
              <div className='bg-white rounded-lg p-4'>
                <div className='text-center'>
                  <p className='text-sm text-gray-600 mb-2'>수업 코드</p>
                  <p className='text-3xl font-mono font-bold text-gray-900 tracking-widest mb-3'>
                    {classInfo.class_code}
                  </p>
                  <div className='flex gap-2'>
                    <button
                      onClick={() =>
                        classController.copyClassCode(classInfo.class_code)
                      }
                      className='flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm'
                    >
                      <Copy size={14} />
                      코드 복사
                    </button>
                    <button
                      onClick={() =>
                        classController.copyShareUrl(classInfo.class_code)
                      }
                      className='flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm'
                    >
                      <Share size={14} />
                      링크 복사
                    </button>
                  </div>
                </div>
              </div>

              {/* QR 코드 */}
              <div className='bg-white rounded-lg p-4'>
                <div className='text-center'>
                  <p className='text-sm text-gray-600 mb-2'>QR 코드</p>
                  {qrCodeUrl ? (
                    <div>
                      <img
                        src={qrCodeUrl}
                        alt='수업 참여 QR 코드'
                        className='w-24 h-24 mx-auto mb-3'
                      />
                      <button
                        onClick={() => setShowQR(!showQR)}
                        className='flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm w-full'
                      >
                        <QrCode size={14} />
                        {showQR ? '숨기기' : '크게 보기'}
                      </button>
                    </div>
                  ) : (
                    <div className='w-24 h-24 mx-auto mb-3 bg-gray-200 rounded flex items-center justify-center'>
                      <QrCode size={24} className='text-gray-400' />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className='mt-4 p-3 bg-blue-100 rounded-lg'>
              <p className='text-blue-800 text-sm'>
                💡 학생들에게 수업 코드를 알려주거나 QR 코드를 스캔하게 하세요!
              </p>
            </div>
          </div>

          {/* 참여자 목록 */}
          <div>
            <h4 className='font-semibold text-gray-900 mb-4 flex items-center gap-2'>
              <Users size={18} />
              참여 학생 ({participants.length}명)
            </h4>

            {loading ? (
              <div className='text-center py-8'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2'></div>
                <p className='text-gray-500 text-sm'>
                  참여자 목록을 불러오는 중...
                </p>
              </div>
            ) : participants.length > 0 ? (
              <div className='bg-gray-50 rounded-lg p-4'>
                <div className='space-y-2'>
                  {participants.map((participant, index) => (
                    <div
                      key={participant.id}
                      className='flex items-center justify-between py-2 px-3 bg-white rounded border'
                    >
                      <div className='flex items-center gap-3'>
                        <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center'>
                          <span className='text-blue-600 font-medium text-sm'>
                            {participant.student_name?.charAt(0) || index + 1}
                          </span>
                        </div>
                        <div>
                          <p className='font-medium text-gray-900'>
                            {participant.student_name || `학생 ${index + 1}`}
                          </p>
                          <p className='text-xs text-gray-500'>
                            {formatDate(participant.joined_at)} 참여
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className='text-center py-8 bg-gray-50 rounded-lg'>
                <Users size={48} className='mx-auto text-gray-400 mb-2' />
                <p className='text-gray-500'>아직 참여한 학생이 없습니다</p>
                <p className='text-gray-400 text-sm'>
                  학생들에게 수업 코드를 공유해보세요
                </p>
              </div>
            )}
          </div>

          {/* 액션 버튼 */}
          <div className='flex gap-3 pt-4 border-t'>
            <button
              onClick={onClose}
              className='flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors'
            >
              닫기
            </button>
            <button
              onClick={onEnterClass}
              className='flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
            >
              수업 입장하기
            </button>
          </div>
        </div>

        {/* QR 코드 확대 모달 */}
        {showQR && qrCodeUrl && (
          <div
            className='fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-10'
            onClick={() => setShowQR(false)}
          >
            <div className='bg-white rounded-2xl p-8 text-center'>
              <h3 className='text-xl font-bold text-gray-900 mb-4'>
                수업 참여 QR 코드
              </h3>
              <img
                src={qrCodeUrl}
                alt='수업 참여 QR 코드'
                className='w-64 h-64 mx-auto mb-4'
              />
              <p className='text-gray-600 mb-2'>
                학생들이 이 QR 코드를 스캔하면
              </p>
              <p className='text-gray-600'>바로 수업에 참여할 수 있습니다</p>
              <button
                onClick={() => setShowQR(false)}
                className='mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors'
              >
                닫기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
