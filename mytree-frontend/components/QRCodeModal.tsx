"use client";

import React, { useRef } from "react";
import { Modal, Button, ModalHeader, ModalBody } from "flowbite-react";
import { QRCodeCanvas } from "qrcode.react";
import { HiDownload } from "react-icons/hi";
import { Tree } from "../app/types";

interface QRCodeModalProps {
  show: boolean;
  onClose: () => void;
  tree: Tree | null;
}

export function QRCodeModal({ show, onClose, tree }: QRCodeModalProps) {
  const qrRef = useRef<HTMLCanvasElement>(null);

  if (!tree) return null;

  const publicUrl = `${window.location.origin}/tree/${tree.id}`;

  const downloadQRCode = () => {
    if (!qrRef.current) return;
    const canvas = qrRef.current;
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = `qrcode-${tree.code || tree.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Modal show={show} onClose={onClose} size="md" popup>
      <ModalHeader />
      <ModalBody>
        <div className="text-center">
          <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
            QR Code สำหรับต้นไม้: <span className="font-bold text-gray-900 dark:text-white">{tree.nickname || tree.strain?.name}</span>
          </h3>
          
          <div className="flex justify-center mb-6 p-4 bg-white rounded-xl shadow-inner inline-block mx-auto">
            <QRCodeCanvas
              ref={qrRef}
              value={publicUrl}
              size={200}
              level={"H"}
              includeMargin={true}
              imageSettings={{
                src: "/favicon.ico",
                x: undefined,
                y: undefined,
                height: 24,
                width: 24,
                excavate: true,
              }}
            />
          </div>
          
          <p className="text-sm text-gray-500 mb-6">
            สแกนเพื่อดูข้อมูลต้นไม้นี้
            <br />
            <span className="text-xs text-gray-400">{publicUrl}</span>
          </p>

          <div className="flex justify-center gap-4">
            <Button color="success" onClick={downloadQRCode}>
              <HiDownload className="mr-2 h-5 w-5" />
              ดาวน์โหลด
            </Button>
            <Button color="gray" onClick={onClose}>
              ปิด
            </Button>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
}
