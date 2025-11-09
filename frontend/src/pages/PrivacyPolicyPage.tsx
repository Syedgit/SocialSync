export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">SocialSync Privacy Policy</h1>
      <p className="text-gray-600 mb-6">
        Last updated: {new Date().getFullYear()}
      </p>
      <div className="space-y-5 text-gray-700 leading-relaxed">
        <p>
          SocialSync is currently in active development. We take the privacy of our users seriously and are committed to
          protecting any information shared with us during testing and evaluation phases.
        </p>
        <h2 className="text-xl font-semibold text-gray-900">Information We Collect</h2>
        <p>
          When you create an account we collect basic profile details such as name and email address. If you connect
          external social media accounts we store the credentials required to schedule and publish content on your
          behalf. All tokens and secrets are kept encrypted at rest.
        </p>
        <h2 className="text-xl font-semibold text-gray-900">How We Use Your Information</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Authenticate you when you sign in to the SocialSync dashboard.</li>
          <li>Connect to your authorised social media accounts in order to schedule and publish content.</li>
          <li>Provide customer support and communicate important updates regarding the service.</li>
          <li>Monitor platform performance and improve product reliability.</li>
        </ul>
        <h2 className="text-xl font-semibold text-gray-900">Third-Party Services</h2>
        <p>
          SocialSync integrates with external social media APIs (e.g. Meta, LinkedIn, X/Twitter) strictly for the
          purpose of managing scheduled content. We do not sell or rent personal information to third parties.
        </p>
        <h2 className="text-xl font-semibold text-gray-900">Data Security</h2>
        <p>
          We employ industry standard security practices to protect your data, including encrypted storage of access
          tokens and secure transport (HTTPS) for all network traffic. Access to production data is restricted to
          authorised personnel only.
        </p>
        <h2 className="text-xl font-semibold text-gray-900">Your Rights</h2>
        <p>
          You may request access to, correction of, or deletion of your personal information at any time. See our
          <a className="text-indigo-600 hover:text-indigo-700 ml-1" href="/data-deletion">
            Data Deletion Policy
          </a>{' '}
          for instructions on how to request removal of your data.
        </p>
        <h2 className="text-xl font-semibold text-gray-900">Contact Us</h2>
        <p>
          If you have any questions about this policy or the way we handle your data, please contact us at{' '}
          <a className="text-indigo-600 hover:text-indigo-700" href="mailto:support@socialsync.com">
            support@socialsync.com
          </a>
          .
        </p>
      </div>
    </div>
  );
}
