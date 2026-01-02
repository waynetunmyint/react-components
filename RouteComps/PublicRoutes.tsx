import { Route } from 'react-router-dom';
import HomePage from '../_Pages/HomePage';
import ContactPage from '../_Pages/ContactPage';
import LoginPage from '../_Pages/LoginPage';
import PricingPage from '../_Pages/PricingPage';
import PageView from '../_Pages/PageView';

import DetailPage from '../_Pages/DetailView';

import RewardPage from '../_Pages/RewardPage';
import PDFViewPage from '../_Pages/_PDF_ViewPage';
import PlacementTestPage from '../_Pages/PlacementTestPage';
import CertificateSearchPage from '../_Pages/CertificateSearchPage';
import { PAGE_VIEW_STYLE } from '@/config';
import PrivacyPolicyPage from '../_Pages/PrivacyPage';
import ProductViewPage from '../_Pages/_productViewPage';
import ProductListPage from '../_Pages/ProductListPage';
import ProfileLoginPage from '../_Pages/ProfileLoginPage';

/**
 * Public routes that don't require authentication.
 * Returns an array of Route elements for use in IonRouterOutlet.
 */
export const getPublicRoutes = () => [

    // Advantage Routes
    <Route key="advantage" path="/advantage" exact={true} render={() =>
        <PageView dataSource="advantage" headingTitle="Advantages" subHeadingTitle="Our Advantages" />
    } />,
    <Route key="advantage-view" path="/advantage/view/:id" exact={true} render={() =>
        <DetailPage dataSource="advantage" styleNo={PAGE_VIEW_STYLE} />
    } />,

    // Blog / Article Routes
    <Route key="article" path="/article" exact={true} render={() =>
        <PageView dataSource="article" headingTitle="Blog" subHeadingTitle="Commitment to best Quality" />
    } />,
    <Route key="article-view" path="/article/view/:id" exact={true} render={() =>
        <DetailPage dataSource="article" styleNo={PAGE_VIEW_STYLE} />
    } />,
    <Route key="blog" path="/blog" exact={true} render={() =>
        <PageView dataSource="article" headingTitle="Blog" subHeadingTitle="Commitment to best Quality" />
    } />,
    <Route key="blog-view" path="/blog/view/:id" exact={true} render={() =>
        <DetailPage dataSource="article" styleNo={PAGE_VIEW_STYLE} />
    } />,

    // Auth & Other
    <Route key="login" path="/login" component={LoginPage} exact={true} />,
    <Route key="profileLogin" path="/profileLogin" component={ProfileLoginPage} exact={true} />,
    <Route key="pricing" path="/pricing" component={PricingPage} exact={true} />,
    <Route key="reward" path="/reward" component={RewardPage} exact={true} />,
    // PDF Preview
    <Route key="pdf" path="/book-preview-pdf" component={PDFViewPage} exact={true} />,

    // Book Routes
    <Route key="book" path="/book" exact={true} render={() =>
        <PageView dataSource="book" headingTitle="Books" subHeadingTitle="Discover Our Collection" />
    } />,
    <Route key="book-view" path="/book/view/:id" exact={true} render={() =>
        <DetailPage dataSource="book" styleNo={1} />
    } />,

    // Book Author Routes
    <Route key="bookAuthor" path="/bookAuthor" exact={true} render={() =>
        <PageView dataSource="bookAuthor" headingTitle="Authors" subHeadingTitle="Authors Behind Our Books" />
    } />,
    <Route key="bookAuthor-view" path="/bookAuthor/view/:id" exact={true} render={() =>
        <DetailPage
            dataSource="bookAuthor"
            headingTitle="Author"
            childrenConfigs={[
                {
                    dataSource: "book",
                    sectionTitle: "Books by this Author",
                    apiPattern: "/book/api/byPageId/byBookAuthorId/{PAGE_ID}/{ITEM_ID}"
                }
            ]}
        />
    } />,

    // Book Category Routes
    <Route key="bookCategory" path="/bookCategory" exact={true} render={() =>
        <PageView dataSource="bookCategory" headingTitle="Categories" subHeadingTitle="Categories of Our Books" />
    } />,
    <Route key="bookCategory-view" path="/bookCategory/view/:id" exact={true} render={() =>
        <DetailPage
            dataSource="bookCategory"
            headingTitle="Category"
            childrenConfigs={[
                {
                    dataSource: "book",
                    sectionTitle: "Books in this Category",
                    apiPattern: "/book/api/byPageId/byBookCategoryId/{PAGE_ID}/{ITEM_ID}"
                }
            ]}
        />
    } />,

    // Book Review Routes
    <Route key="bookReview" path="/bookReview" exact={true} render={() =>
        <PageView dataSource="bookReview" headingTitle="Reviews" subHeadingTitle="Reviews of Our Books" />
    } />,
    <Route key="bookReview-view" path="/bookReview/view/:id" exact={true} render={() =>
        <DetailPage dataSource="bookReview" styleNo={1} />
    } />,

    // Brand Routes
    <Route key="brand" path="/brand" exact={true} render={() =>
        <PageView dataSource="brand" headingTitle="Brands" subHeadingTitle="Our Brands" />
    } />,
    <Route key="brand-view" path="/brand/view/:id" exact={true} render={() =>
        <DetailPage
            dataSource="brand"
            headingTitle="Brand"
            childrenConfigs={[
                {
                    dataSource: "product",
                    sectionTitle: "Products from this Brand",
                    apiPattern: "/product/api/byPageId/byBrandId/{PAGE_ID}/{ITEM_ID}"
                }
            ]}
        />
    } />,

    // Certificate Verification
    <Route key="cert-search" path="/certificate-search" component={CertificateSearchPage} exact={true} />,
    <Route key="cert-verify" path="/certificate-verification" component={CertificateSearchPage} exact={true} />,
    <Route key="cert-check" path="/verify-certificate" component={CertificateSearchPage} exact={true} />,
    <Route key="cert-check-alt" path="/check-certificate" component={CertificateSearchPage} exact={true} />,

    // Client / Page Routes
    <Route key="client" path="/client" exact={true} render={() =>
        <PageView dataSource="page" headingTitle="Clients" subHeadingTitle="These are our clients/app/website" />
    } />,
    <Route key="client-view" path="/client/view/:id" exact={true} render={() =>
        <DetailPage dataSource="page" styleNo={PAGE_VIEW_STYLE} />
    } />,

    // Contact Routes
    <Route key="about-us" path="/about-us" component={ContactPage} exact={true} />,
    <Route key="contact" path="/contact" component={ContactPage} exact={true} />,
    <Route key="contact-us" path="/contact-us" component={ContactPage} exact={true} />,

    // Country Routes
    <Route key="country" path="/country" exact={true} render={() =>
        <PageView dataSource="country" headingTitle="Our Education Partners" subHeadingTitle="View Details of Institutations" />
    } />,
    <Route key="country-view" path="/country/view/:id" exact={true} render={() =>
        <DetailPage
            dataSource="country"
            headingTitle="Country"
            childrenConfigs={[
                {
                    dataSource: "university",
                    sectionTitle: "Universities",
                    apiPattern: "/university/api/byPageId/byCountryId/{PAGE_ID}/{ITEM_ID}"
                },
            ]}
        />
    } />,

    //CourseLevel
    <Route key="course-level" path="/courseLevel" exact={true} render={() =>
        <PageView dataSource="courseLevel" headingTitle="Courses" subHeadingTitle="Our Featured Courses" />
    } />,
    <Route key="courseLevel-view" path="/courseLevel/view/:id" exact={true} render={() =>
        <DetailPage
            dataSource="courseLevel"
            headingTitle="Course Level"
            childrenConfigs={[
                {
                    dataSource: "course",
                    sectionTitle: "Courses in this Level",
                    apiPattern: "/course/api/byPageId/byCourseLevelId/{PAGE_ID}/{ITEM_ID}"
                }
            ]}
        />
    } />,

    // Courses
    <Route key="course" path="/course" exact={true} render={() =>
        <PageView dataSource="course" headingTitle="Courses" subHeadingTitle="Our Featured Courses" />
    } />,
    <Route key="course-view" path="/course/view/:id" exact={true} render={() =>
        <DetailPage dataSource="course" styleNo={PAGE_VIEW_STYLE} />
    } />,






    //Dream Routes
    <Route key="dream" path="/dream" exact={true} render={() =>
        <PageView dataSource="dream" headingTitle="Dreams" subHeadingTitle="Our Featured Dreams" />
    } />,
    <Route key="dream-view" path="/dream/view/:id" exact={true} render={() =>
        <DetailPage dataSource="dream" styleNo={PAGE_VIEW_STYLE} />
    } />,

    //DreamCategory Routes
    <Route key="dreamCategory" path="/dreamCategory" exact={true} render={() =>
        <PageView dataSource="dreamCategory" headingTitle="Dream Categories" subHeadingTitle="Our Featured Dream Categories" />
    } />,
    <Route key="dreamCategory-view" path="/dreamCategory/view/:id" exact={true} render={() =>
        <DetailPage
            dataSource="dreamCategory"
            headingTitle="Dream Category"
            childrenConfigs={[
                {
                    dataSource: "dream",
                    sectionTitle: "Dreams in this Category",
                    apiPattern: "/dream/api/byPageId/byDreamCategoryId/{PAGE_ID}/{ITEM_ID}"
                }
            ]}
            styleNo={PAGE_VIEW_STYLE} />
    } />,

    //DreamNumber Routes
    <Route key="dreamNumber" path="/dreamNumber" exact={true} render={() =>
        <PageView dataSource="dreamNumber" headingTitle="Dream Numbers" subHeadingTitle="Our Featured Dream Numbers" />
    } />,
    <Route key="dreamNumber-view" path="/dreamNumber/view/:id" exact={true} render={() =>
        <DetailPage dataSource="dreamNumber" styleNo={PAGE_VIEW_STYLE} />
    } />,

    //DreamKnowledge Routes
    <Route key="dreamKnowledge" path="/dreamKnowledge" exact={true} render={() =>
        <PageView dataSource="dreamKnowledge" headingTitle="Dream Knowledge" subHeadingTitle="Our Featured Dream Knowledge" />
    } />,
    <Route key="dreamKnowledge-view" path="/dreamKnowledge/view/:id" exact={true} render={() =>
        <DetailPage dataSource="dreamKnowledge" styleNo={PAGE_VIEW_STYLE} />
    } />,









    // Home Routes
    <Route key="home-root" path="/" component={HomePage} exact={true} />,
    <Route key="home" path="/home" component={HomePage} exact={true} />,

    // Package Routes
    <Route key="package" path="/package" exact={true} render={() =>
        <PageView dataSource="package" headingTitle="Packages" subHeadingTitle="Discover Our Collection" />
    } />,
    <Route key="package-view" path="/package/view/:id" exact={true} render={() =>
        <DetailPage dataSource="package" styleNo={1} />
    } />,

    // Page Routes
    <Route key="page" path="/page" exact={true} render={() =>
        <PageView dataSource="page" headingTitle="Projects/Clients" subHeadingTitle="Our Valued Clients" />
    } />,
    <Route key="page-view" path="/page/view/:id" exact={true} render={() =>
        <DetailPage dataSource="page" styleNo={PAGE_VIEW_STYLE} />
    } />,

    // Placement Test
    <Route key="placement-test" path="/placement-test" component={PlacementTestPage} exact={true} />,
    <Route key="assessment" path="/assessment" component={PlacementTestPage} exact={true} />,

    <Route key="privacy" path="/privacy" component={PrivacyPolicyPage} exact={true} />,

    // Product Routes
    <Route key="product" path="/product" exact={true} render={() =>
        <ProductListPage />
    } />,
    <Route key="product-view" path="/product/view/:id" exact={true} render={() =>
        <ProductViewPage dataSource="product" />
    } />,

    // Project Routes
    <Route key="project" path="/project" exact={true} render={() =>
        <PageView dataSource="page" headingTitle="Projects" subHeadingTitle="Our Featured Projects" />
    } />,
    <Route key="project-view" path="/project/view/:id" exact={true} render={() =>
        <DetailPage dataSource="page" styleNo={PAGE_VIEW_STYLE} />
    } />,

    // Service Routes
    <Route key="service" path="/service" exact={true} render={() =>
        <PageView dataSource="service" headingTitle="Services" subHeadingTitle="Our Services" />
    } />,
    <Route key="service-view" path="/service/view/:id" exact={true} render={() =>
        <DetailPage dataSource="service" styleNo={PAGE_VIEW_STYLE} />
    } />,

    // Testimonial
    <Route key="testimonial" path="/testimonial" exact={true} render={() =>
        <PageView dataSource="testimonial" headingTitle="Testimonials" subHeadingTitle="What Our Clients Say" />
    } />,
    <Route key="testimonial-view" path="/testimonial/view/:id" exact={true} render={() =>
        <DetailPage dataSource="testimonial" styleNo={PAGE_VIEW_STYLE} />
    } />,

    // University
    <Route key="university" path="/university" exact={true} render={() =>
        <PageView dataSource="university" headingTitle="Universities" subHeadingTitle="Our Partner Universities" />
    } />,
    <Route key="university-view" path="/university/view/:id" exact={true} render={() =>
        <DetailPage dataSource="university" styleNo={PAGE_VIEW_STYLE} />
    } />,
];

export default getPublicRoutes;
