import { LegacyHtmlFragment } from "@/components/site/layout/legacy-html-fragment";

const html = `<style>
    p,ul li{
        font-size:16px !important;
    }
    
    .main-content ul li{
        list-style:disc;
        list-style-position:inside;
        line-height:30px;
    }
    h2{
        margin:15px 0;
        font-size:28px;
    }
</style>

<!-- flat-title -->
<!--<section class="flat-title ">-->
<!--    <div class="tf-container">-->
<!--        <div class="row">-->
<!--            <div class="col-lg-12">-->
<!--                <div class="title-inner ">-->
<!--                    <ul class="breadcrumb">-->
<!--                        <li><a class="home fw-6 text-color-3" href="/">Home</a></li>-->
<!--                        <li>About Us</li>-->
<!--                    </ul>-->
<!--                </div>-->
<!--            </div>-->
<!--        </div>-->
<!--    </div>-->
<!--</section>-->
<!-- /flat-title -->

<div class="main-content">
    <section class="privacy tf-spacing-5">
    <div class="tf-container">
        <h1>Privacy Policy</h1>
        
    <p class="mt-3 mb-3">
        At <strong>Majestan Realty Services Pvt Ltd </strong> (“we,” “us,” or “our”), we are committed
        to protecting the privacy and security of your personal information.
        This Privacy Policy outlines how we collect, use, and safeguard your information
        when you visit our website <a href="" target="_blank">majestanrealty.com</a>
        (“the Site”). By accessing or using our Site, you agree to the terms outlined in this Privacy Policy.
    </p>

    <h2>1. Information We Collect</h2>
    <p class="mt-3 mb-3">
        <strong>Personal Information</strong>When you use our Site, fill out forms, or communicate with us, we may collect
        personal information that you voluntarily provide, such as:
    </p>
    <ul>
        <li>Name</li>
        <li>Email address</li>
        <li>Contact number</li>
        <li>Mailing address</li>
        <li>Preferences and interests related to real estate</li>
        <li>Any additional information you provide</li>
    </ul>
    
    <p class="mt-3 mb-3">
        <strong>Non-Personal Information</strong>We also collect certain non-personal information automatically, such as:
    </p>
    <ul>
        <li>IP address</li>
        <li>Browser type and version</li>
        <li>Operating system</li>
        <li>Pages visited on our Site</li>
        <li>Date and time of your visit</li>
        <li>Referring websites and links clicked</li>
    </ul>

    <h2>2. How We Use Your Information</h2>
    <p class="mt-3 mb-3">We may use the information we collect for purposes that include:</p>
    <ul>
        <li><strong>Providing Services:</strong> To respond to your inquiries and provide information about our real estate projects.</li>
        <li><strong>Improving the Site:</strong> To enhance functionality, performance, and user experience.</li>
        <li><strong>Marketing:</strong> With your consent, to send updates and promotional materials. You may opt out at any time.</li>
        <li><strong>Legal Compliance:</strong> To comply with applicable laws and regulations.</li>
    </ul>

    <h2>3. Sharing Your Information</h2>
    <p class="mt-3 mb-3">
        We respect your privacy and do not sell your personal information.
        We may share information only in the following cases:
    </p>
    <ul>
        <li><strong>Service Providers:</strong> Third-party vendors such as hosting, analytics, and payment services.</li>
        <li><strong>Legal Requirements:</strong> If required by law or government authorities.</li>
        <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets.</li>
    </ul>

    <h2>4. Cookies and Tracking Technologies</h2>
    <p class="mt-3 mb-3">
        We use cookies and similar technologies to analyze traffic and improve user experience.
        You may disable cookies through your browser settings, but some features may not function properly.
    </p>

    <h2>5. Data Security</h2>
    <p class="mt-3 mb-3">
        We implement appropriate technical and organizational measures to protect your data.
        However, no method of transmission over the internet is 100% secure, and absolute security cannot be guaranteed.
    </p>

    <h2>6. Third-Party Links</h2>
    <p class="mt-3 mb-3">
        Our Site may contain links to third-party websites. We are not responsible for their
        privacy practices, and we encourage you to review their privacy policies separately.
    </p>

    <h2>7. Children’s Privacy</h2>
    <p class="mt-3 mb-3">
        Our Site is not intended for children under the age of 13.
        We do not knowingly collect personal information from children.
    </p>

    <h2>8. Your Rights</h2>
    <p class="mt-3 mb-3">
        Depending on your jurisdiction, you may have the following rights:
    </p>
    <ul>
        <li>Access to your personal data</li>
        <li>Correction of inaccurate or incomplete data</li>
        <li>Deletion of your personal data</li>
        <li>Opt-out of marketing communications</li>
    </ul>
    <p class="mt-3 mb-3">
        To exercise these rights, contact us at
        <strong><a href="mailto:info@majestanrealty.com">info@majestanrealty.com</a></strong>.
    </p>

    <h2>9. Updates to This Privacy Policy</h2>
    <p class="mt-3 mb-3">
        We may update this Privacy Policy periodically.
        Any changes will be posted on this page.
        Continued use of the Site indicates acceptance of the updated policy.
    </p>
    </div>
    </section>
</div>`;

export function PrivacyPolicyView(): React.JSX.Element {
  return <LegacyHtmlFragment html={html} />;
}
