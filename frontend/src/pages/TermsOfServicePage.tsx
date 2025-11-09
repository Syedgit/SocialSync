export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">SocialSync Terms of Service</h1>
      <p className="text-gray-600 mb-6">Effective as of {new Date().getFullYear()}</p>
      <div className="space-y-5 text-gray-700 leading-relaxed">
        <p>
          Welcome to SocialSync. By accessing or using our services you agree to be bound by these Terms of Service. If
          you do not agree with any part of these terms you must not use SocialSync.
        </p>
        <h2 className="text-xl font-semibold text-gray-900">Use of the Service</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>You must provide accurate registration information and keep your account credentials secure.</li>
          <li>
            You are responsible for any content scheduled or published through SocialSync and must ensure you have the
            rights to distribute such content.
          </li>
          <li>
            You agree not to misuse the service, attempt to bypass security controls, or disrupt SocialSync’s
            infrastructure.
          </li>
        </ul>
        <h2 className="text-xl font-semibold text-gray-900">Third-Party Platforms</h2>
        <p>
          SocialSync connects to third-party social media platforms. Your use of those platforms remains subject to
          their respective terms and policies. We may suspend or terminate access if a platform revokes our integration
          privileges or if you violate those platform terms.
        </p>
        <h2 className="text-xl font-semibold text-gray-900">Service Availability</h2>
        <p>
          We aim to keep SocialSync highly available, however the service is provided on an “as-is” and “as-available”
          basis. We reserve the right to modify, suspend, or discontinue features at any time without liability.
        </p>
        <h2 className="text-xl font-semibold text-gray-900">Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, SocialSync and its operators shall not be liable for any indirect or
          consequential damages arising from the use of the service. Our total liability will not exceed the fees paid
          for the service in the preceding three months.
        </p>
        <h2 className="text-xl font-semibold text-gray-900">Changes to these Terms</h2>
        <p>
          We may update these Terms of Service from time to time. Material changes will be communicated via email or by
          posting a notice within the application. Continued use of SocialSync after the changes become effective
          constitutes acceptance of the revised terms.
        </p>
        <h2 className="text-xl font-semibold text-gray-900">Contact</h2>
        <p>
          Questions about these terms can be directed to{' '}
          <a className="text-indigo-600 hover:text-indigo-700" href="mailto:support@socialsync.com">
            support@socialsync.com
          </a>
          .
        </p>
      </div>
    </div>
  );
}
