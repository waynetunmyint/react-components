import ProtectedRoute from './RouteProtectorComp';
import AdminPage from '../_Pages/_admin/AdminPage';
import AdminBookOrderPage from '../_Pages/_admin/AdminBookOrderPage';
import AdminProductOrderPage from '../_Pages/_admin/AdminProductOrderPage';
import AdminContactPage from '../_Pages/_admin/AdminContactPage';
import GenericAdminPage from '../_Pages/_admin/_AdminPage';
import AdminSchoolBillPage from '../_Pages/_admin/AdminSchoolBillPage';
import PrintInvoicePage from '../_Pages/_admin/PrintInvoicePage';
import PrintReceiptPage from '../_Pages/_admin/PrintReceiptPage';
import { ADMIN_PAGE_CONFIGS } from './adminConfigs';

/**
 * Protected routes that require authentication.
 * Returns an array of ProtectedRoute elements for use in IonRouterOutlet.
 */
export const getProtectedRoutes = () => [
    // Main Admin
    <ProtectedRoute key="admin" exact path="/admin" component={AdminPage} />,

    // Book Module
    <ProtectedRoute key="admin-book" exact path="/admin/book" component={() => <GenericAdminPage {...ADMIN_PAGE_CONFIGS.book} />} />,
    <ProtectedRoute key="admin-bookAuthor" exact path="/admin/bookAuthor" component={() => <GenericAdminPage {...ADMIN_PAGE_CONFIGS.bookAuthor} />} />,
    <ProtectedRoute key="admin-bookCategory" exact path="/admin/bookCategory" component={() => <GenericAdminPage {...ADMIN_PAGE_CONFIGS.bookCategory} />} />,
    <ProtectedRoute key="admin-bookReview" exact path="/admin/bookReview" component={() => <GenericAdminPage {...ADMIN_PAGE_CONFIGS.bookReview} />} />,


    // Course/School Module
    <ProtectedRoute key="admin-course" exact path="/admin/course" component={() => <GenericAdminPage {...ADMIN_PAGE_CONFIGS.course} />} />,
    <ProtectedRoute key="admin-courseBatch" exact path="/admin/courseBatch" component={() => <GenericAdminPage {...ADMIN_PAGE_CONFIGS.courseBatch} />} />,
    <ProtectedRoute key="admin-school" exact path="/admin/school" component={() => <GenericAdminPage {...ADMIN_PAGE_CONFIGS.school} />} />,
    <ProtectedRoute key="admin-student" exact path="/admin/student" component={() => <GenericAdminPage {...ADMIN_PAGE_CONFIGS.student} />} />,
    <ProtectedRoute key="admin-guardian" exact path="/admin/guardian" component={() => <GenericAdminPage {...ADMIN_PAGE_CONFIGS.guardian} />} />,

    // Course Levels
    <ProtectedRoute key="admin-course-level" exact path="/admin/courseLevel" component={() => <GenericAdminPage {...ADMIN_PAGE_CONFIGS.courseLevel} />} />,



    // CustomSlider
    <ProtectedRoute key="admin-custom-slider" exact path="/admin/customSlider" component={() => <GenericAdminPage {...ADMIN_PAGE_CONFIGS.customSlider} />} />,
    <ProtectedRoute key="admin-custom-slider-2" exact path="/admin/customSlider2" component={() => <GenericAdminPage {...ADMIN_PAGE_CONFIGS.customSlider2} />} />,


    // Bill Module - List and Print Pages
    <ProtectedRoute key="admin-page-bill" exact path="/admin/pageBill" component={() => <GenericAdminPage {...ADMIN_PAGE_CONFIGS.pageBill} />} />,
    <ProtectedRoute key="admin-print-invoice" exact path="/admin/pageBill/print/invoice/:id" component={PrintInvoicePage} />,
    <ProtectedRoute key="admin-print-receipt" exact path="/admin/pageBill/print/receipt/:id" component={PrintReceiptPage} />,


    // General Modules
    <ProtectedRoute key="admin-address" exact path="/admin/address" component={() => <GenericAdminPage {...ADMIN_PAGE_CONFIGS.address} />} />,
    <ProtectedRoute key="admin-advantage" exact path="/admin/advantage" component={() => <GenericAdminPage {...ADMIN_PAGE_CONFIGS.advantage} />} />,
    <ProtectedRoute key="admin-article" exact path="/admin/article" component={AdminPage} />,
    <ProtectedRoute key="admin-brand" exact path="/admin/brand" component={() => <GenericAdminPage {...ADMIN_PAGE_CONFIGS.brand} />} />,
    <ProtectedRoute key="admin-client" exact path="/admin/client" component={() => <GenericAdminPage {...ADMIN_PAGE_CONFIGS.client} />} />,
    <ProtectedRoute key="admin-package" exact path="/admin/package" component={() => <GenericAdminPage {...ADMIN_PAGE_CONFIGS.package} />} />,
    <ProtectedRoute key="admin-product" exact path="/admin/product" component={() => <GenericAdminPage {...ADMIN_PAGE_CONFIGS.product} />} />,
    <ProtectedRoute key="admin-project" exact path="/admin/project" component={() => <GenericAdminPage {...ADMIN_PAGE_CONFIGS.project} />} />,
    <ProtectedRoute key="admin-service" exact path="/admin/service" component={() => <GenericAdminPage {...ADMIN_PAGE_CONFIGS.service} />} />,
    <ProtectedRoute key="admin-slider" exact path="/admin/slider" component={() => <GenericAdminPage {...ADMIN_PAGE_CONFIGS.slider} />} />,
    <ProtectedRoute key="admin-testimonial" exact path="/admin/testimonial" component={() => <GenericAdminPage {...ADMIN_PAGE_CONFIGS.testimonial} />} />,
    <ProtectedRoute key="admin-certificate" exact path="/admin/certificate" component={() => <GenericAdminPage {...ADMIN_PAGE_CONFIGS.certificate} />} />,
    <ProtectedRoute key="admin-country" exact path="/admin/country" component={() => <GenericAdminPage {...ADMIN_PAGE_CONFIGS.country} />} />,
    <ProtectedRoute key="admin-contactInfo" exact path="/admin/contactInfo" component={() => <GenericAdminPage {...ADMIN_PAGE_CONFIGS.contactInfo} />} />,
    <ProtectedRoute key="admin-university" exact path="/admin/university" component={() => <GenericAdminPage {...ADMIN_PAGE_CONFIGS.university} />} />,

    // Special Pages
    <ProtectedRoute key="admin-contact" exact path="/admin/contact" component={AdminContactPage} />,
    <ProtectedRoute key="contactInfo" exact path="/contactInfo" component={AdminContactPage} />,
    <ProtectedRoute key="admin-schoolBill" exact path="/admin/schoolBill" component={AdminSchoolBillPage} />,
    <ProtectedRoute key="admin-bookOrder" exact path="/admin/bookOrder" component={AdminBookOrderPage} />,
    <ProtectedRoute key="admin-productOrder" exact path="/admin/productOrder" component={AdminProductOrderPage} />,
];

export default getProtectedRoutes;
