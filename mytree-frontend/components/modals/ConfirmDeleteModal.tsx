import React from "react";
import { Modal, Button, ModalHeader, ModalBody, Spinner } from "flowbite-react";
import { HiOutlineExclamationCircle } from "react-icons/hi";

interface ConfirmDeleteModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  processing?: boolean;
  isDestructive?: boolean;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  show,
  onClose,
  onConfirm,
  title = "ยืนยันการลบ",
  message = "คุณแน่ใจหรือไม่ที่จะลบรายการนี้? การกระทำนี้ไม่สามารถย้อนกลับได้",
  confirmLabel = "ใช่, ลบเลย",
  cancelLabel = "ยกเลิก",
  processing = false,
  isDestructive = true,
}) => {
  return (
    <Modal show={show} size="md" onClose={onClose} popup dismissible className="backdrop-blur-sm">
      <ModalHeader />
      <ModalBody>
        <div className="text-center">
          <HiOutlineExclamationCircle className={`mx-auto mb-4 h-14 w-14 ${isDestructive ? 'text-red-500 dark:text-red-400' : 'text-yellow-500'} animate-bounce-subtle`} />
          <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
            {message}
          </h3>
          <div className="flex justify-center gap-4">
            <Button 
              color={isDestructive ? "failure" : "warning"} 
              onClick={onConfirm}
              disabled={processing}
              className="shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
            >
              {processing ? (
                 <>
                   <Spinner size="sm" className="mr-2" />
                   กำลังดำเนินการ...
                 </>
              ) : confirmLabel}
            </Button>
            <Button color="gray" onClick={onClose} disabled={processing} className="shadow-sm hover:shadow-md transition-all">
              {cancelLabel}
            </Button>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
};
