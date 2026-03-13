import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { Modal } from "@/components/ui/modal";
import { Loader2 } from "lucide-react";

interface ScannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onScanSuccess: (decodedText: string) => void;
}

export function ScannerModal({ isOpen, onClose, onScanSuccess }: ScannerModalProps) {
    const [isScanning, setIsScanning] = useState(false);
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    useEffect(() => {
        if (isOpen) {
            // Give the modal a brief moment to render the div before initializing scanner
            const timer = setTimeout(() => {
                const scanner = new Html5QrcodeScanner(
                    "reader",
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                        formatsToSupport: [
                            Html5QrcodeSupportedFormats.QR_CODE,
                            Html5QrcodeSupportedFormats.CODE_128,
                            Html5QrcodeSupportedFormats.CODE_39,
                            Html5QrcodeSupportedFormats.EAN_13,
                        ],
                    },
                    /* verbose= */ false
                );

                scannerRef.current = scanner;

                scanner.render((decodedText) => {
                    // Stop scanning to prevent multiple triggers
                    if (scannerRef.current) {
                        try {
                            scannerRef.current.clear();
                        } catch (e) {
                            console.error("Error clearing scanner on success", e);
                        }
                    }
                    onScanSuccess(decodedText);
                }, (errorMessage) => {
                    // This triggers constantly on failed frames, ignore for UI cleanliness
                });
                
                setIsScanning(true);
            }, 100);

            return () => {
                clearTimeout(timer);
                if (scannerRef.current) {
                    try {
                        scannerRef.current.clear();
                    } catch (e) {
                        console.error("Error clearing scanner on unmount", e);
                    }
                }
                setIsScanning(false);
            };
        }
    }, [isOpen, onScanSuccess]);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Scan Serial Number"
            footer={null}
        >
            <div className="flex flex-col items-center justify-center p-4">
                {!isScanning && (
                    <div className="flex flex-col items-center justify-center py-8 gap-4 text-muted-foreground">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <p>Initializing Camera...</p>
                    </div>
                )}
                <div 
                    id="reader" 
                    className="w-full max-w-sm rounded-xl overflow-hidden shadow-sm"
                    style={{ 
                        border: 'none',
                        // Hide html5-qrcode's built-in header/footer elements that are ugly
                        // We achieve this via global css if possible, or just leave it for now
                    }} 
                ></div>
                <p className="text-sm text-muted-foreground mt-4 text-center">
                    Point your camera at a QR code or Barcode to scan the serial number.
                </p>
                
                <style dangerouslySetInnerHTML={{__html: `
                    #reader__dashboard_section_csr span {
                        color: hsl(var(--foreground));
                    }
                    #reader__dashboard_section_swaplink {
                        color: hsl(var(--primary));
                    }
                    #reader button {
                        background-color: hsl(var(--primary)) !important;
                        color: hsl(var(--primary-foreground)) !important;
                        border: none !important;
                        border-radius: 0.5rem !important;
                        padding: 0.5rem 1rem !important;
                        font-weight: 500 !important;
                        font-family: inherit !important;
                        cursor: pointer !important;
                    }
                `}} />
            </div>
        </Modal>
    );
}
