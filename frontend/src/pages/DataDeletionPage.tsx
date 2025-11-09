export default function DataDeletionPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">SocialSync Data Deletion Policy</h1>
      <p className="text-gray-600 mb-6">We respect your right to have your data removed from our systems.</p>
      <div className="space-y-5 text-gray-700 leading-relaxed">
        <h2 className="text-xl font-semibold text-gray-900">How to Request Deletion</h2>
        <ol className="list-decimal pl-6 space-y-2">
          <li>Email <a className="text-indigo-600 hover:text-indigo-700" href="mailto:support@socialsync.com">support@socialsync.com</a>.</li>
          <li>Use the subject line “SocialSync Data Deletion Request”.</li>
          <li>Include the email address associated with your SocialSync account.</li>
        </ol>
        <p>
          Once your request is verified, we will permanently delete your account, connected social media credentials,
          scheduled content, and associated analytics within 30 days. A confirmation email will be sent when the process
          is complete.
        </p>
        <h2 className="text-xl font-semibold text-gray-900">Third-Party Platforms</h2>
        <p>
          If you have authorised SocialSync to publish to third-party social networks, deleting your SocialSync account
          revokes those tokens. However, previously published posts remain on the respective platforms and must be
          removed directly from those services.
        </p>
        <h2 className="text-xl font-semibold text-gray-900">Questions</h2>
        <p>
          If you have any questions about data retention or deletion, please reach out to{' '}
          <a className="text-indigo-600 hover:text-indigo-700" href="mailto:support@socialsync.com">support@socialsync.com</a>.
        </p>
      </div>
    </div>
  );
}
