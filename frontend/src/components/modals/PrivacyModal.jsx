import React from 'react';
import Modal from '../ui/Modal';

const PrivacyModal = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Privacy Policy" size="lg">
      <div className="prose prose-sm max-w-none text-gray-600">
        <p className="text-sm text-gray-500 mb-4">Last updated: January 13, 2026</p>
        
        <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">1. Information We Collect</h3>
        <p>
          We collect information you provide directly to us when you:
        </p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li>Create an account</li>
          <li>Place an order or rent a suit</li>
          <li>Make a payment</li>
          <li>Contact customer support</li>
          <li>Participate in surveys or promotions</li>
        </ul>

        <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">2. Personal Information</h3>
        <p>
          The types of personal information we may collect include:
        </p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li>Name and contact information (email, phone number, address)</li>
          <li>Payment information</li>
          <li>Order and rental history</li>
          <li>Account credentials</li>
          <li>Communication preferences</li>
        </ul>

        <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">3. How We Use Your Information</h3>
        <p>
          We use the information we collect to:
        </p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li>Provide, maintain, and improve our services</li>
          <li>Process transactions and send related information</li>
          <li>Send you technical notices and support messages</li>
          <li>Respond to your comments and questions</li>
          <li>Send marketing communications (with your consent)</li>
          <li>Monitor and analyze trends and usage</li>
          <li>Detect, prevent, and address fraud and security issues</li>
        </ul>

        <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">4. Information Sharing</h3>
        <p>
          We do not sell your personal information. We may share your information only in these circumstances:
        </p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li>With your consent</li>
          <li>To comply with legal obligations</li>
          <li>To protect rights and safety</li>
          <li>With service providers who perform services on our behalf</li>
          <li>In connection with a merger, sale, or acquisition</li>
        </ul>

        <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">5. Data Security</h3>
        <p>
          We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These include:
        </p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li>Encryption of data in transit and at rest</li>
          <li>Regular security assessments</li>
          <li>Access controls and authentication</li>
          <li>Employee training on data protection</li>
        </ul>

        <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">6. Your Rights</h3>
        <p>
          You have the right to:
        </p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li>Access your personal information</li>
          <li>Correct inaccurate information</li>
          <li>Request deletion of your information</li>
          <li>Object to processing of your information</li>
          <li>Export your data</li>
          <li>Opt-out of marketing communications</li>
        </ul>

        <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">7. Cookies and Tracking</h3>
        <p>
          We use cookies and similar tracking technologies to track activity on our Service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
        </p>

        <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">8. Data Retention</h3>
        <p>
          We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy unless a longer retention period is required by law.
        </p>

        <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">9. Children's Privacy</h3>
        <p>
          Our Service is not directed to individuals under the age of 13. We do not knowingly collect personal information from children under 13.
        </p>

        <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">10. Changes to Privacy Policy</h3>
        <p>
          We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
        </p>

        <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">11. Contact Us</h3>
        <p>
          If you have any questions about this Privacy Policy, please contact us:
        </p>
        <p className="mt-2">
          <strong>Email:</strong> privacy@laundrix.com<br />
          <strong>Phone:</strong> +1 (555) 123-4567<br />
          <strong>Address:</strong> 123 Laundry Street, Clean City, ST 12345
        </p>
      </div>
    </Modal>
  );
};

export default PrivacyModal;
