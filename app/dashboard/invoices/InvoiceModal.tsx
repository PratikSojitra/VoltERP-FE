import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

interface InvoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function InvoiceModal({ isOpen, onClose }: InvoiceModalProps) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Create New Invoice"
            maxWidth="sm:max-w-3xl"
            footer={
                <Button onClick={onClose}>
                    Close
                </Button>
            }
        >
            <div className="py-4">
                <div className="text-sm text-yellow-600 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    Invoice creation form will be fully integrated next.
                </div>
            </div>
        </Modal>
    );
}
