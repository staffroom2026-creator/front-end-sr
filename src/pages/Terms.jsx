import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const sections = [
    {
        title: 'About Staffroom',
        paragraphs: [
            'Staffroom is an education recruitment platform designed to connect qualified teachers with private schools seeking teaching staff.',
            'Teachers may use Staffroom to create professional profiles, discover teaching opportunities, submit applications, upload relevant professional documents, and track application activity. Schools may use Staffroom to create school profiles, publish teaching vacancies, review applicants, access teacher profiles, manage recruitment activities, and communicate recruitment decisions through supported platform features.',
            'Staffroom provides the technology and marketplace infrastructure that facilitates these interactions. Staffroom is not the employer of teachers listed on the platform and is not a recruitment agent for any particular school unless expressly stated otherwise.',
        ],
    },
    {
        title: 'Eligibility',
        paragraphs: ['You must meet the applicable legal requirements to use Staffroom. By using Staffroom, you represent that:'],
        bullets: [
            'You are providing accurate and truthful information.',
            'You have the legal capacity to enter into these Terms.',
            'You will use the platform for legitimate education recruitment and career-related purposes.',
            'If you create an account on behalf of a school, you have the authority to represent that school and use the platform for its recruitment activities.',
            'Teachers provide accurate information about qualifications, experience, teaching subjects, certifications, availability, and other submitted information.',
            'Schools provide accurate information about their institution, vacancies, requirements, compensation where applicable, and recruitment process.',
        ],
        closing: 'Staffroom may restrict access where we reasonably believe an account does not meet our eligibility or safety requirements.',
    },
    {
        title: 'Staffroom Accounts',
        paragraphs: ['Certain features require an account. You are responsible for:'],
        bullets: [
            'Keeping your login credentials confidential.',
            'Providing accurate account information.',
            'Maintaining the security of your account.',
            'Updating information when it becomes inaccurate or outdated.',
        ],
        closing: 'You must not share your account, create an account using another person\'s identity, impersonate another person, create multiple accounts to manipulate the platform, or use another person\'s account without permission. You are responsible for activity carried out through your account unless you promptly report unauthorized access to Staffroom.',
    },
    {
        title: 'Teacher Accounts',
        paragraphs: ['Teachers may create professional profiles containing information such as:'],
        bullets: ['Name', 'Profile photograph', 'Location', 'Professional title', 'Teaching subjects and levels', 'Education and teaching experience', 'Availability', 'CV or resume', 'TRCN certification information', 'Other information voluntarily provided as part of the teacher profile'],
        closing: 'All information submitted must be accurate, current, and not misleading. You must not submit fake qualifications, misrepresent experience, upload another person\'s CV, submit a fraudulent TRCN certificate, use false identity information, or make misleading claims. Staffroom may request additional information or documentation where reasonably necessary to verify submitted information.',
    },
    {
        title: 'School Accounts',
        paragraphs: ['School administrators may create school profiles containing information such as:'],
        bullets: ['School name', 'School location', 'School type and description', 'Contact details', 'School logo', 'Recruitment information', 'Job vacancies'],
        closing: 'Schools are responsible for ensuring that information published through their accounts is accurate and lawful. You must not create an account for an institution you are not authorized to represent. Staffroom may request information reasonably necessary to confirm the legitimacy of a school or administrator account.',
    },
    {
        title: 'Job Listings',
        paragraphs: ['Schools may publish teaching vacancies through Staffroom. Job listings should contain accurate information relevant to the role, including where applicable:'],
        bullets: ['Position', 'Subject and teaching level', 'Employment type', 'Location', 'Salary or compensation', 'Responsibilities', 'Qualifications and experience requirements', 'Application deadline', 'Other relevant role information'],
        closing: 'Schools must not publish misleading, discriminatory, fraudulent, unlawful, or deceptive listings, or use listings to request inappropriate fees, deposits, personal financial information, or unrelated services. Staffroom may remove or restrict listings that violate these Terms or applicable law.',
    },
    {
        title: 'Applying for Jobs',
        paragraphs: ['Teachers may submit applications to job listings available through Staffroom. By submitting an application, you confirm that the information provided is accurate to the best of your knowledge. An application does not guarantee an interview, shortlisting, employment, an offer, or acceptance by the school. Schools independently determine which applicants they review, shortlist, interview, or hire.'],
    },
    {
        title: 'Application Statuses',
        paragraphs: ['Staffroom may allow schools to move applications through different recruitment stages, including:'],
        bullets: ['Applied', 'Under Review', 'Shortlisted', 'Phone Screening', 'Virtual Interview', 'In-Person Interview', 'Demo Lesson', 'Document Verification', 'Reference Check', 'Final Interview', 'Offer Stage', 'Hired', 'Rejected'],
        closing: 'The exact stages available may change as Staffroom develops. An application status represents information provided by the relevant school and is not a guarantee of employment.',
    },
    {
        title: 'School Recruitment Decisions',
        paragraphs: ['Schools are solely responsible for their recruitment decisions, including evaluating applicants, checking qualifications, conducting interviews and reference checks, verifying documents, complying with employment and anti-discrimination laws, determining employment terms, and making final hiring decisions. Staffroom does not decide which teacher a school should hire and does not guarantee that a particular teacher will be suitable for a position.'],
    },
    {
        title: 'Teacher Verification and TRCN Information',
        paragraphs: ['Staffroom may allow teachers to submit TRCN certification information and supporting documents for verification. Where Staffroom provides a verification feature, a Verified status means that Staffroom has completed the verification process applicable to that specific document or credential.'],
        closing: 'Verification is not a guarantee of employment, teaching quality, professional conduct, or the accuracy of all information provided. Schools remain responsible for additional checks they consider appropriate. Staffroom may suspend or remove verification status where information is inaccurate, fraudulent, expired, or otherwise unreliable.',
    },
    {
        title: 'CVs, Cover Letters, and Other User Content',
        paragraphs: ['Users may upload or submit CVs, cover letters, professional biographies, school descriptions, job descriptions, certificates, images, and other recruitment-related material. You retain ownership of content you submit, subject to the rights granted to Staffroom under these Terms.'],
        closing: 'By uploading content, you grant Staffroom a limited, non-exclusive right to host, store, process, display, transmit, and otherwise use that content as reasonably necessary to operate and improve the platform and provide requested services. You represent that you have the right to upload and share the content. You must not upload content that infringes intellectual property rights, contains unlawful material or malicious software, is fraudulent or misleading, or contains information you are not authorized to disclose.',
    },
    {
        title: 'Applicant Information',
        paragraphs: ['Teachers understand that information included in an application may be made available to the school to which the application was submitted. Schools understand that teacher profile information is provided for legitimate recruitment purposes.'],
        closing: 'Users must not use information obtained through Staffroom for spam, harassment, identity theft, fraud, unauthorized marketing, unlawful discrimination, selling or distributing another user\'s personal information, or any other unlawful purpose.',
    },
    {
        title: 'Recruitment Communication',
        paragraphs: ['Staffroom may provide recruitment-related notifications through supported channels, including in-app notifications, email, and other communication methods that Staffroom may introduce. Communications enabled for schools should relate to the relevant recruitment process. Staffroom may limit or disable communication features where they are abused. For the initial MVP, Staffroom may rely primarily on application status updates, in-app notifications, and email notifications rather than an open-ended messaging system.'],
    },
    {
        title: 'Response Templates',
        paragraphs: ['Schools may be permitted to create reusable recruitment response templates. Templates must be used only for legitimate recruitment communication. Schools remain responsible for the content of messages they send. Staffroom may remove templates that are misleading, abusive, discriminatory, spam-like, or otherwise inappropriate.'],
    },
    {
        title: 'User Conduct',
        paragraphs: ['You agree not to use Staffroom to:'],
        bullets: ['Commit fraud or impersonate another person or organization.', 'Post fake job opportunities or submit fraudulent qualifications.', 'Upload malicious files.', 'Harass or threaten other users.', 'Attempt to obtain unauthorized personal information or send spam.', 'Circumvent Staffroom security measures or interfere with platform operation.', 'Scrape or systematically collect platform data without permission.', 'Attempt to access another user\'s account or information.', 'Use Staffroom for unlawful purposes.'],
    },
    {
        title: 'Prohibited Recruitment Practices',
        paragraphs: ['Schools must not use Staffroom to publish roles that are unlawful, misleading, discriminatory, or unrelated to legitimate employment. Teachers must not use Staffroom to seek employment through fraudulent qualifications, impersonation, or misleading representations. Staffroom may remove listings, applications, profiles, or accounts that violate these requirements.'],
    },
    {
        title: 'Intellectual Property',
        paragraphs: ['Staffroom and its underlying technology, branding, interface, designs, logos, software, text, graphics, and other original materials are owned by or licensed to Staffroom and are protected by applicable intellectual property laws. You may use Staffroom only for its intended purpose.'],
        bullets: ['You may not copy Staffroom\'s interface or branding.', 'You may not republish Staffroom content without permission.', 'You may not modify or create derivative works from proprietary materials.', 'You may not reverse engineer or attempt to extract source code where prohibited by law.', 'You may not use Staffroom branding without authorization.'],
    },
    {
        title: 'Third-Party Services',
        paragraphs: ['Staffroom may integrate with email providers, cloud storage services, authentication providers, analytics services, payment providers where applicable, communication services, and other technology providers. Third-party services may have their own terms and privacy policies. Staffroom is not responsible for third-party services outside our reasonable control.'],
    },
    {
        title: 'Availability of the Platform',
        paragraphs: ['We aim to keep Staffroom available and reliable, but we do not guarantee uninterrupted access. The platform may be unavailable because of maintenance, updates, technical failures, security events, third-party service failures, internet or infrastructure problems, or other circumstances outside our reasonable control. We may modify, suspend, or discontinue features as Staffroom develops.'],
    },
    {
        title: 'Beta and Early Access',
        paragraphs: ['If Staffroom operates a beta, pilot, waitlist, or early-access program, access may be limited. Beta features may change without notice, contain bugs or incomplete functionality, be subject to usage limits, or be discontinued or modified before public release. Participation does not guarantee continued access to any feature.'],
    },
    {
        title: 'Fees and Payments',
        paragraphs: ['If Staffroom introduces paid products or services, applicable pricing and payment terms will be presented before the relevant purchase or subscription is completed. Unless otherwise stated, users are responsible for accurate billing information, applicable taxes and charges may apply, subscriptions may automatically renew where clearly disclosed and authorized, and refunds will be governed by the applicable refund policy. For the current MVP, any free feature will be presented as such.'],
    },
    {
        title: 'No Guarantee of Employment or Hiring Outcome',
        paragraphs: ['Staffroom provides a platform for recruitment connections. We do not guarantee that a teacher will receive a job, that a school will find a suitable teacher, that an application will be viewed or shortlisted, that a school will hire a particular applicant, or that a recruitment process will be completed within a particular timeframe. Any employment relationship formed through Staffroom is between the relevant teacher and school.'],
    },
    {
        title: 'User Relationships',
        paragraphs: ['Staffroom is not a party to an employment relationship formed between a school and teacher. Schools and teachers are responsible for agreeing on employment terms, compensation, working hours, responsibilities, benefits, probation, termination, and other employment conditions. Staffroom does not control the employment relationship between users.'],
    },
    {
        title: 'Background Checks and Verification',
        paragraphs: ['Where Staffroom provides verification tools, they are intended to support user trust. Unless expressly stated otherwise, Staffroom does not conduct comprehensive background checks on every user. Schools should conduct checks appropriate to their hiring responsibilities, and teachers should review schools and employment terms carefully before accepting an offer.'],
    },
    {
        title: 'Privacy',
        paragraphs: ['Your use of Staffroom is also governed by our Privacy Policy. The Privacy Policy explains how Staffroom collects, uses, stores, shares, and protects personal information. Because Staffroom processes personal information in Nigeria, the platform should operate its privacy practices consistently with applicable Nigerian data protection requirements. The Terms of Service and Privacy Policy are separate documents.'],
    },
    {
        title: 'User Rights and Personal Information',
        paragraphs: ['Nothing in these Terms is intended to remove or limit rights that cannot lawfully be excluded. Where applicable, users may have rights concerning personal information, including access, rectification, erasure, restriction, objection, portability, or withdrawal of consent, subject to applicable law and lawful exceptions. Requests relating specifically to personal data should be handled through Staffroom\'s privacy process where appropriate.'],
    },
    {
        title: 'Account Suspension and Termination',
        paragraphs: ['Staffroom may suspend, restrict, or terminate an account where we reasonably believe that the user violated these Terms, provided fraudulent information, used the platform unlawfully, attempted to compromise platform security, engaged in harassment, abuse, or fraud, misused another user\'s information, or provided misleading recruitment information. Where reasonably appropriate, Staffroom may provide notice and an opportunity to address the issue. Some restrictions may be imposed immediately to protect users, the platform, or comply with legal obligations.'],
    },
    {
        title: 'Account Deactivation and Deletion',
        paragraphs: ['Users may be able to deactivate or delete accounts through available account settings. Deactivation may temporarily hide an account or professional profile. Deletion may permanently remove an account and associated information, subject to legal, security, dispute-resolution, fraud-prevention, or other legitimate retention requirements. Staffroom may retain information it is legally required or otherwise lawfully permitted to retain.'],
    },
    {
        title: 'Complaints and Disputes Between Users',
        paragraphs: ['Where a dispute arises between a teacher and a school, the parties should attempt to resolve the matter directly. Staffroom may provide reasonable platform support where appropriate but is not necessarily responsible for resolving private employment disputes. Staffroom may investigate reports involving fraud, harassment, platform abuse, fake job listings, fraudulent profiles, unauthorized use of personal information, or other violations of these Terms.'],
    },
    {
        title: 'Disclaimers',
        paragraphs: ['To the fullest extent permitted by applicable law, Staffroom provides its platform on an “as available” and “as is” basis. We do not guarantee that the platform will always be available, information submitted by other users will be completely accurate, every listing will suit every teacher, every profile will suit every school, the platform will operate without errors, or recruitment outcomes will meet a user\'s expectations. Users remain responsible for exercising appropriate judgment when interacting with other users.'],
    },
    {
        title: 'Limitation of Liability',
        paragraphs: ['To the fullest extent permitted by applicable law, Staffroom will not be responsible for indirect, incidental, special, consequential, or punitive losses arising from your use of the platform or interactions with other users. Nothing in these Terms excludes or limits liability that cannot lawfully be excluded or limited under applicable law.'],
    },
    {
        title: 'Indemnity',
        paragraphs: ['To the extent permitted by law, you agree to indemnify and hold harmless Staffroom and its officers, employees, contractors, and affiliates from claims, losses, liabilities, damages, costs, and expenses arising from your violation of these Terms, misuse of the platform, fraudulent or misleading information, violation of another person\'s rights, or unlawful conduct.'],
    },
    {
        title: 'Changes to These Terms',
        paragraphs: ['Staffroom may update these Terms as the platform develops, laws change, or new features are introduced. Where changes are material, Staffroom may provide reasonable notice through the platform, email, or another appropriate communication method. Continued use after the effective date of updated Terms means that you accept them to the extent permitted by law.'],
    },
    {
        title: 'Governing Law',
        paragraphs: ['These Terms shall be governed by and interpreted in accordance with the laws of the Federal Republic of Nigeria, subject to any mandatory legal requirements that apply to a particular dispute. Any dispute concerning these Terms shall be subject to the jurisdiction of the appropriate courts in Nigeria, unless the parties agree to another lawful dispute-resolution mechanism. The precise state or court jurisdiction should be confirmed by Nigerian counsel based on the legal entity’s registered office and intended contractual structure.'],
    },
    {
        title: 'Contact Us',
        paragraphs: ['If you have questions about these Terms, account issues, or Staffroom services, contact us through:'],
        bullets: ['Email: support@staffroomng.com', 'Website: staffroomng.com', 'Support: Support URL', 'Privacy Contact: privacy@staffroomng.com'],
    },
    {
        title: 'Entire Agreement',
        paragraphs: ['These Terms, together with the Privacy Policy and any other policies or terms expressly incorporated by reference, constitute the agreement between you and Staffroom regarding your use of the platform. If any provision is found to be invalid or unenforceable, the remaining provisions will continue to apply to the extent permitted by law.'],
    },
];

export default function Terms() {
    return (
        <div className="terms-page brand-typography min-h-screen">
            <Navbar sticky />

            <main className="terms-main">
                <header className="terms-header">
                    <p className="terms-eyebrow">Staffroom legal</p>
                    <h1>Terms of Service</h1>
                    <p className="terms-intro">Please read these terms carefully before creating an account or using the Staffroom platform.</p>
                    <div className="terms-meta">
                        <span><strong>Effective date:</strong> 19 August 2026</span>
                        <span><strong>Last updated:</strong> 19 August 2026</span>
                    </div>
                </header>

                <article className="terms-document">
                    <p className="terms-welcome">Welcome to Staffroom.</p>
                    <p>These Terms of Service govern your access to and use of the Staffroom website, web application, mobile application, platform, services, and related features operated by Staffroom, referred to in these Terms as “Staffroom,” “we,” “us,” or “our.”</p>
                    <p>By creating an account, accessing the platform, or using any Staffroom service, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree with these Terms, you should not create an account or use Staffroom.</p>

                    {sections.map((section, index) => (
                        <section className="terms-section" key={section.title}>
                            <h2>{index + 1}. {section.title}</h2>
                            {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                            {section.bullets && (
                                <ul>
                                    {section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
                                </ul>
                            )}
                            {section.closing && <p>{section.closing}</p>}
                        </section>
                    ))}
                </article>

                <div className="terms-actions">
                    <Link to="/" className="terms-back">Back to home</Link>
                    <Link to="/signup" className="terms-cta">Create an account</Link>
                </div>
            </main>

            <style>{`
        .terms-page {
          background: #f7faf5;
          color: #263247;
        }

        .terms-main {
          width: min(100% - 32px, 900px);
          margin: 0 auto;
          padding: 72px 0 96px;
        }

        .terms-header {
          padding: 32px 0 48px;
          border-bottom: 1px solid #dce8dc;
        }

        .terms-eyebrow {
          color: #16843d;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: .18em;
          text-transform: uppercase;
          margin: 0 0 16px;
        }

        .terms-header h1 {
          color: #172238;
          font-size: clamp(2.4rem, 6vw, 4.5rem);
          line-height: 1.05;
          margin: 0 0 20px;
        }

        .terms-intro {
          color: #607064;
          font-size: 1.05rem;
          line-height: 1.7;
          max-width: 620px;
          margin: 0 0 24px;
        }

        .terms-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 10px 28px;
          color: #6f7c73;
          font-size: .85rem;
        }

        .terms-meta strong {
          color: #263247;
        }

        .terms-document {
          padding: 52px 0 24px;
          font-size: .98rem;
          line-height: 1.8;
        }

        .terms-document p {
          margin: 0 0 18px;
        }

        .terms-welcome {
          color: #172238;
          font-family: 'Sora', sans-serif;
          font-size: 1.35rem;
          font-weight: 700;
        }

        .terms-section {
          padding: 28px 0 12px;
          border-top: 1px solid #e0e9e0;
        }

        .terms-section h2 {
          color: #172238;
          font-size: 1.18rem;
          line-height: 1.35;
          margin: 0 0 16px;
        }

        .terms-section ul {
          margin: 0 0 18px;
          padding-left: 24px;
        }

        .terms-section li {
          margin: 5px 0;
          padding-left: 4px;
        }

        .terms-actions {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 16px;
          padding-top: 28px;
          border-top: 1px solid #dce8dc;
        }

        .terms-back,
        .terms-cta {
          border-radius: 12px;
          font-weight: 700;
          padding: 12px 20px;
          text-decoration: none;
          transition: transform .2s ease, background-color .2s ease;
        }

        .terms-back {
          color: #16843d;
          border: 1px solid #b9d8bd;
        }

        .terms-cta {
          color: #fff;
          background: #1ccb43;
        }

        .terms-back:hover,
        .terms-cta:hover {
          transform: translateY(-1px);
        }

        .terms-back:hover {
          background: #edf8ee;
        }

        .terms-cta:hover {
          background: #16a336;
        }

        @media (max-width: 640px) {
          .terms-main {
            width: min(100% - 32px, 900px);
            padding: 36px 0 64px;
          }

          .terms-header {
            padding-top: 16px;
          }

          .terms-document {
            padding-top: 34px;
            font-size: .94rem;
          }
        }
      `}</style>
        </div>
    );
}
