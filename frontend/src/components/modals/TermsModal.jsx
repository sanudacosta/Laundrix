import React from 'react';
import Modal from '../ui/Modal';

const TermsModal = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Terms of Service" size="lg">
      <div className="prose prose-sm max-w-none text-gray-600">
        <p className="text-sm text-gray-500 mb-4">Last updated: January 13, 2026</p>
        
        <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">1. Acceptance of Terms</h3>
        <p>
          By accessing and using Laundrix ("Service"), you accept and agree to be bound by the terms and provision of this agreement.
        </p>

        <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">2. Use License</h3>
        <p>
          Permission is granted to temporarily use the Service for personal or commercial laundry management purposes. This is the grant of a license, not a transfer of title, and under this license you may not:
        </p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li>Modify or copy the materials</li>
          <li>Use the materials for any commercial purpose without authorization</li>
          <li>Attempt to decompile or reverse engineer any software contained in the Service</li>
          <li>Remove any copyright or other proprietary notations from the materials</li>
        </ul>

        <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">3. User Account</h3>
        <p>
          You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
        </p>

        <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">4. Service Description</h3>
        <p>
          Laundrix provides a comprehensive laundry and suit rental management system including:
        </p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li>Order management and tracking</li>
          <li>Inventory management</li>
          <li>Payment processing</li>
          <li>Customer notifications</li>
          <li>Business analytics and reporting</li>
        </ul>

        <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">5. Payment Terms</h3>
        <p>
          Certain features may require payment. You agree to provide current, complete, and accurate purchase and account information for all purchases made via the Service.
        </p>

        <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">6. Limitation of Liability</h3>
        <p>
          In no event shall Laundrix or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit) arising out of the use or inability to use the Service.
        </p>

        <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">7. Termination</h3>
        <p>
          We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever.
        </p>

        <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">8. Changes to Terms</h3>
        <p>
          We reserve the right to modify these terms at any time. We will provide notice of significant changes by posting the new Terms of Service on this page.
        </p>

        <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">9. Contact Information</h3>
        <p>
          If you have any questions about these Terms, please contact us at:
        </p>
        <p className="mt-2">
          <strong>Email:</strong> support@laundrix.com<br />
          <strong>Phone:</strong> +1 (555) 123-4567
        </p>
      </div>
    </Modal>
  );
};

export default TermsModal;
