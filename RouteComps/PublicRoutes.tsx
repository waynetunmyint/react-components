import { Route } from 'react-router-dom';
import HomePage from '../_Pages/HomePage';
import ContactPage from '../_Pages/ContactPage';
import LoginPage from '../_Pages/LoginPage';
import PricingPage from '../_Pages/PricingPage';
import MainPage from '../_Pages/_Main_CMS_Page';
import ViewPage from '../_Pages/_View_CMS_Page';
import RewardPage from '../_Pages/RewardPage';
import PDFViewPage from '../_Pages/_PDF_ViewPage';
import PlacementTestPage from '../_Pages/PlacementTestPage';
import CertificateSearchPage from '../_Pages/CertificateSearchPage';
import { PAGE_VIEW_STYLE } from '../../../config';
import PrivacyPolicyPage from '../_Pages/PrivacyPage';
import ProductViewPage from '../_Pages/_productViewPage';
import ProductListPage from '../_Pages/ProductListPage';

/**
 * Public routes that don't require authentication.
 * Returns an array of Route elements for use in IonRouterOutlet.
 */
export const getPublicRoutes = () => [

    // Home Routes
    <Route key="home-root" path="/" component={HomePage} exact={true} />,
    <Route key="home" path="/home" component={HomePage} exact={true} />,

    <Route key="privacy" path="/privacy" component={PrivacyPolicyPage} exact={true} />,

    // Contact Routes
    <Route key="about-us" path="/about-us" component={ContactPage} exact={true} />,
    <Route key="contact" path="/contact" component={ContactPage} exact={true} />,
    <Route key="contact-us" path="/contact-us" component={ContactPage} exact={true} />,

    // Book Author Routes
    <Route key="bookAuthor" path="/bookAuthor" exact={true} render={() =>
        <MainPage styleNo={1} dataSource="bookAuthor" headingTitle="Authors" subHeadingTitle="Authors Behind Our Books" />
    } />,
    <Route key="bookAuthor-view" path="/bookAuthor/view/:id" exact={true} render={() =>
        <ViewPage
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

    // Book Routes
    <Route key="book" path="/book" exact={true} render={() =>
        <MainPage styleNo={1} dataSource="book" headingTitle="Books" subHeadingTitle="Discover Our Collection" />
    } />,
    <Route key="book-view" path="/book/view/:id" exact={true} render={() =>
        <ViewPage dataSource="book" styleNo={1} />
    } />,

    // Book Category Routes
    <Route key="bookCategory" path="/bookCategory" exact={true} render={() =>
        <MainPage styleNo={1} dataSource="bookCategory" headingTitle="Categories" subHeadingTitle="Categories of Our Books" />
    } />,
    <Route key="bookCategory-view" path="/bookCategory/view/:id" exact={true} render={() =>
        <ViewPage
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
        <MainPage styleNo={1} dataSource="bookReview" headingTitle="Reviews" subHeadingTitle="Reviews of Our Books" />
    } />,
    <Route key="bookReview-view" path="/bookReview/view/:id" exact={true} render={() =>
        <ViewPage dataSource="bookReview" styleNo={1} />
    } />,
    // Brand Routes
    <Route key="brand" path="/brand" exact={true} render={() =>
        <MainPage styleNo={1} dataSource="brand" headingTitle="Brands" subHeadingTitle="Our Brands" />
    } />,
    <Route key="brand-view" path="/brand/view/:id" exact={true} render={() =>
        <ViewPage
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

    // Country Routes
    <Route key="country" path="/country" exact={true} render={() =>
        <MainPage styleNo={1} dataSource="country" headingTitle="Our Education Partners" subHeadingTitle="View Details of Institutations" />
    } />,
    <Route key="country-view" path="/country/view/:id" exact={true} render={() =>
        <ViewPage
            dataSource="country"
            headingTitle="Country"
            childrenConfigs={[
                {
                    dataSource: "university",
                    sectionTitle: "Universities",
                    apiPattern: "/university/api/byPageId/byCountryId/{PAGE_ID}/{ITEM_ID}"
                },
                // Add more child sections here easily:
                // {
                //     dataSource: "scholarship",
                //     sectionTitle: "Scholarships Available",
                //     apiPattern: "/scholarship/api/byPageId/byCountryId/{PAGE_ID}/{ITEM_ID}"
                // }
            ]}
        />
    } />,

    // Advantage Routes
    <Route key="advantage" path="/advantage" exact={true} render={() =>
        <MainPage styleNo={1} dataSource="advantage" headingTitle="Advantages" subHeadingTitle="Our Advantages" />
    } />,
    <Route key="advantage-view" path="/advantage/view/:id" exact={true} render={() =>
        <ViewPage dataSource="advantage" styleNo={PAGE_VIEW_STYLE} />
    } />,

    // Courses
    <Route key="course" path="/course" exact={true} render={() =>
        <MainPage styleNo={1} dataSource="course" headingTitle="Courses" subHeadingTitle="Our Featured Courses" />
    } />,
    <Route key="course-view" path="/course/view/:id" exact={true} render={() =>
        <ViewPage dataSource="course" styleNo={PAGE_VIEW_STYLE} />
    } />,

    //CourseLevel
    <Route key="course-level" path="/courseLevel" exact={true} render={() =>
        <MainPage styleNo={1} dataSource="courseLevel" headingTitle="Courses" subHeadingTitle="Our Featured Courses" />
    } />,
    <Route key="courseLevel-view" path="/courseLevel/view/:id" exact={true} render={() =>
        <ViewPage
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

    // Blog / Article Routes
    <Route key="article" path="/article" exact={true} render={() =>
        <MainPage styleNo={1} dataSource="article" headingTitle="Blog" subHeadingTitle="Commitment to best Quality" />
    } />,
    <Route key="article-view" path="/article/view/:id" exact={true} render={() =>
        <ViewPage dataSource="article" styleNo={PAGE_VIEW_STYLE} />
    } />,
    <Route key="blog" path="/blog" exact={true} render={() =>
        <MainPage styleNo={1} dataSource="article" headingTitle="Blog" subHeadingTitle="Commitment to best Quality" />
    } />,
    <Route key="blog-view" path="/blog/view/:id" exact={true} render={() =>
        <ViewPage dataSource="article" styleNo={PAGE_VIEW_STYLE} />
    } />,

    // Client / Page Routes
    <Route key="client" path="/client" exact={true} render={() =>
        <MainPage styleNo={1} dataSource="page" headingTitle="Clients" subHeadingTitle="These are our clients/app/website" />
    } />,
    <Route key="client-view" path="/client/view/:id" exact={true} render={() =>
        <ViewPage dataSource="page" styleNo={PAGE_VIEW_STYLE} />
    } />,
    <Route key="page-view" path="/page/view/:id" exact={true} render={() =>
        <ViewPage dataSource="page" styleNo={PAGE_VIEW_STYLE} />
    } />,

    // Project Routes
    <Route key="project" path="/project" exact={true} render={() =>
        <MainPage styleNo={1} dataSource="page" headingTitle="Projects" subHeadingTitle="Our Featured Projects" />
    } />,
    <Route key="project-view" path="/project/view/:id" exact={true} render={() =>
        <ViewPage dataSource="page" styleNo={PAGE_VIEW_STYLE} />
    } />,


    // Page Routes
    <Route key="page" path="/page" exact={true} render={() =>
        <MainPage styleNo={1} dataSource="page" headingTitle="Projects/Clients" subHeadingTitle="Our Valued Clients" />
    } />,
    <Route key="page-view" path="/page/view/:id" exact={true} render={() =>
        <ViewPage dataSource="page" styleNo={PAGE_VIEW_STYLE} />
    } />,



    // Product Routes
    <Route key="product" path="/product" exact={true} render={() =>
        <ProductListPage />
    } />,
    <Route key="product-view" path="/product/view/:id" exact={true} render={() =>
        <ProductViewPage dataSource="product" />
    } />,


    // Package Routes
    <Route key="package" path="/package" exact={true} render={() =>
        <MainPage styleNo={1} dataSource="package" headingTitle="Packages" subHeadingTitle="Discover Our Collection" />
    } />,
    <Route key="package-view" path="/package/view/:id" exact={true} render={() =>
        <ViewPage dataSource="package" styleNo={1} />
    } />,



    // Service Routes
    <Route key="service" path="/service" exact={true} render={() =>
        <MainPage styleNo={1} dataSource="service" headingTitle="Services" subHeadingTitle="Our Services" />
    } />,
    <Route key="service-view" path="/service/view/:id" exact={true} render={() =>
        <ViewPage dataSource="service" styleNo={PAGE_VIEW_STYLE} />
    } />,

    // Testimonial
    <Route key="testimonial" path="/testimonial" exact={true} render={() =>
        <MainPage styleNo={1} dataSource="testimonial" headingTitle="Testimonials" subHeadingTitle="What Our Clients Say" />
    } />,
    <Route key="testimonial-view" path="/testimonial/view/:id" exact={true} render={() =>
        <ViewPage dataSource="testimonial" styleNo={PAGE_VIEW_STYLE} />
    } />,

    // University
    <Route key="university" path="/university" exact={true} render={() =>
        <MainPage styleNo={1} dataSource="university" headingTitle="Universities" subHeadingTitle="Our Partner Universities" />
    } />,
    <Route key="university-view" path="/university/view/:id" exact={true} render={() =>
        <ViewPage dataSource="university" styleNo={PAGE_VIEW_STYLE} />
    } />,

    // Auth & Other
    <Route key="login" path="/login" component={LoginPage} exact={true} />,
    <Route key="pricing" path="/pricing" component={PricingPage} exact={true} />,
    <Route key="reward" path="/reward" component={RewardPage} exact={true} />,

    // PDF Preview
    <Route key="pdf" path="/book-preview-pdf" component={PDFViewPage} exact={true} />,

    // Placement Test
    <Route key="placement-test" path="/placement-test" component={PlacementTestPage} exact={true} />,
    <Route key="assessment" path="/assessment" component={PlacementTestPage} exact={true} />,

    // Certificate Verification
    <Route key="cert-search" path="/certificate-search" component={CertificateSearchPage} exact={true} />,
    <Route key="cert-verify" path="/certificate-verification" component={CertificateSearchPage} exact={true} />,
    <Route key="cert-check" path="/verify-certificate" component={CertificateSearchPage} exact={true} />,
    <Route key="cert-check-alt" path="/check-certificate" component={CertificateSearchPage} exact={true} />,
];

export default getPublicRoutes;
