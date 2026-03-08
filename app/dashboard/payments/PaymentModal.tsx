import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function PaymentModal({ isOpen, onClose }: PaymentModalProps) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Record Incoming Payment"
            footer={
                <Button onClick={onClose}>
                    Close
                </Button>
            }
        >
            <div className="py-4">
                <div className="text-sm text-yellow-600 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    Payment creation form will be fully integrated next.
                </div>
            </div>
        </Modal>
    );
}
